import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { validateEnv } from './utils/env';
import { connectDatabase } from './database';
import { WebSocketManager } from './services/websocket';

// Routes
import sessionRoutes from './routes/session';
import reportRoutes from './routes/report';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import { aiInterviewerRoutes } from './routes/ai-interviewer';

// Load environment variables
dotenv.config();

// Validate environment variables
const env = validateEnv();

// Initialize Sentry for error tracking
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express() }),
    ],
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

class Application {
  public app: express.Application;
  public server: any;
  public io: SocketIOServer;
  private wsManager: WebSocketManager;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.wsManager = new WebSocketManager(this.io);
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Sentry request handler (must be first)
    if (env.SENTRY_DSN) {
      this.app.use(Sentry.Handlers.requestHandler());
      this.app.use(Sentry.Handlers.tracingHandler());
    }

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "wss:"],
          imgSrc: ["'self'", "data:", "https:"],
          mediaSrc: ["'self'", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for WebRTC
    }));

    // CORS configuration
    this.app.use(cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later.',
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Logging
    if (env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
      }));
    }

    // Health check endpoint (before auth)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/session', sessionRoutes);
    this.app.use('/api/report', reportRoutes);
    this.app.use('/api/user', authMiddleware, userRoutes);
    this.app.use('/api/admin', authMiddleware, adminRoutes);
    this.app.use('/api/ai-interviewer', aiInterviewerRoutes);

    // WebSocket endpoint info
    this.app.get('/api/websocket-info', (req, res) => {
      res.json({
        endpoint: '/realtime',
        protocols: ['websocket', 'polling'],
        cors: {
          origin: env.CORS_ORIGIN,
          credentials: true,
        },
      });
    });

    // API documentation (development only)
    if (env.NODE_ENV === 'development' && env.ENABLE_SWAGGER) {
      this.app.get('/api/docs', (req, res) => {
        res.json({
          message: 'API Documentation',
          endpoints: {
            'POST /api/session/start': 'Start a new interview session',
            'POST /api/session/token': 'Get WebRTC tokens',
            'POST /api/session/finish': 'Complete interview session',
            'GET /api/session/:id': 'Get session details',
            'GET /api/report/:sessionId': 'Get interview report',
            'POST /api/report/:sessionId/export': 'Export report',
            'WS /realtime/:sessionId': 'Real-time communication',
          },
        });
      });
    }
  }

  private initializeErrorHandling(): void {
    // Sentry error handler (must be before other error handlers)
    if (env.SENTRY_DSN) {
      this.app.use(Sentry.Handlers.errorHandler());
    }

    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      logger.info('Database connected successfully');

      // Start server
      this.server.listen(env.PORT, env.HOST, () => {
        logger.info(`Server running on http://${env.HOST}:${env.PORT}`);
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`WebSocket endpoint: ws://${env.HOST}:${env.PORT}/realtime`);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    // Stop accepting new connections
    this.server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close WebSocket connections
    this.io.close(() => {
      logger.info('WebSocket server closed');
    });

    // Close database connections
    // TODO: Add database cleanup

    // Exit process
    setTimeout(() => {
      logger.error('Forcefully shutting down');
      process.exit(1);
    }, 10000);

    process.exit(0);
  }
}

// Start the application
const app = new Application();

if (require.main === module) {
  app.start().catch((error) => {
    logger.error('Application startup failed:', error);
    process.exit(1);
  });
}

export default app;