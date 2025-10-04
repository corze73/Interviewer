import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validateEnv } from '../utils/env';
import { createAuthError, createForbiddenError } from './error';
import { logger } from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

// Authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      throw createAuthError('Access token required');
    }

    const env = validateEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    logger.debug('User authenticated', {
      userId: decoded.userId,
      email: decoded.email,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createAuthError('Invalid access token'));
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(createAuthError('Access token expired'));
    }
    
    next(error);
  }
};

// Optional authentication middleware (doesn't throw if no token)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (token) {
      const env = validateEnv();
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional middleware
    logger.debug('Optional auth failed', { error });
    next();
  }
};

// Admin-only middleware
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First ensure user is authenticated
  if (!req.user) {
    return next(createAuthError('Authentication required'));
  }

  // Check if user has admin privileges
  // This would typically check a database or user roles
  // For now, we'll use a simple email check (you should implement proper role checking)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  
  if (!adminEmails.includes(req.user.email)) {
    return next(createForbiddenError('Admin privileges required'));
  }

  next();
};

// Token generation utilities
export const generateAccessToken = (userId: string, email: string): string => {
  const env = validateEnv();
  
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'interviewer-api',
      audience: 'interviewer-app',
    }
  );
};

export const generateRefreshToken = (userId: string): string => {
  const env = validateEnv();
  
  return jwt.sign(
    { userId, type: 'refresh' },
    env.SESSION_SECRET,
    {
      expiresIn: '7d',
      issuer: 'interviewer-api',
      audience: 'interviewer-app',
    }
  );
};

// Session token for WebRTC/WebSocket connections
export const generateSessionToken = (sessionId: string, userId?: string): string => {
  const env = validateEnv();
  
  return jwt.sign(
    { sessionId, userId, type: 'session' },
    env.SESSION_SECRET,
    {
      expiresIn: '2h', // Sessions are shorter-lived
      issuer: 'interviewer-api',
      audience: 'interviewer-realtime',
    }
  );
};

// Verify session token
export const verifySessionToken = (token: string): { sessionId: string; userId?: string } => {
  const env = validateEnv();
  
  try {
    const decoded = jwt.verify(token, env.SESSION_SECRET) as any;
    
    if (decoded.type !== 'session') {
      throw new Error('Invalid token type');
    }
    
    return {
      sessionId: decoded.sessionId,
      userId: decoded.userId,
    };
  } catch (error) {
    throw createAuthError('Invalid session token');
  }
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Helper function to extract token from request
function extractTokenFromRequest(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check query parameter (for WebSocket connections)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }
  
  // Check cookies (if using cookie-based auth)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  
  return null;
}

// Middleware to add request ID for tracing
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// CORS middleware configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const env = validateEnv();
    const allowedOrigins = env.CORS_ORIGIN.split(',');
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
};