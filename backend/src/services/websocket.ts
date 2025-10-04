import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifySessionToken } from '../middleware/auth';
import { logger, logWebSocketEvent } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  sessionId?: string;
  userId?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next: any) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const { sessionId, userId } = verifySessionToken(token as string);
        
        socket.sessionId = sessionId;
        socket.userId = userId;
        
        logWebSocketEvent('authentication_success', sessionId, {
          socketId: socket.id,
          userId,
        });
        
        next();
      } catch (error: any) {
        logWebSocketEvent('authentication_failed', 'unknown', {
          socketId: socket.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const { sessionId, userId } = socket;
      
      if (!sessionId) {
        socket.disconnect();
        return;
      }

      logWebSocketEvent('client_connected', sessionId, {
        socketId: socket.id,
        userId,
      });

      socket.join(sessionId);

      socket.on('disconnect', (reason: any) => {
        logWebSocketEvent('client_disconnected', sessionId, {
          socketId: socket.id,
          userId,
          reason,
        });
      });
    });
  }

  public broadcastToSession(sessionId: string, event: string, data: any): void {
    this.io.to(sessionId).emit(event, data);
  }

  public isSessionActive(sessionId: string): boolean {
    return true;
  }
}
