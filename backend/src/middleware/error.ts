import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger, logError } from '../utils/logger';
import { isDevelopment } from '../utils/env';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

// Create custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Predefined error creators
export const createValidationError = (message: string) =>
  new CustomError(message, 400, 'VALIDATION_ERROR');

export const createAuthError = (message: string = 'Authentication required') =>
  new CustomError(message, 401, 'AUTHENTICATION_ERROR');

export const createForbiddenError = (message: string = 'Insufficient permissions') =>
  new CustomError(message, 403, 'AUTHORIZATION_ERROR');

export const createNotFoundError = (message: string = 'Resource not found') =>
  new CustomError(message, 404, 'RESOURCE_NOT_FOUND');

export const createConflictError = (message: string) =>
  new CustomError(message, 409, 'RESOURCE_CONFLICT');

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new CustomError(message, 429, 'RATE_LIMIT_EXCEEDED');

export const createServiceError = (message: string, code: string) =>
  new CustomError(message, 503, code);

// Error handler middleware
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error values
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';

  // Log the error
  logError(err, 'ErrorHandler', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
    code,
  });

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: {
      code,
      message: isDevelopment() ? message : getSafeErrorMessage(code),
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  };

  // Include stack trace in development
  if (isDevelopment() && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Include additional error details in development
  if (isDevelopment() && err.name) {
    errorResponse.error.name = err.name;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = createNotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Safe error messages for production
function getSafeErrorMessage(code: string): string {
  const safeMessages: Record<string, string> = {
    VALIDATION_ERROR: 'Invalid input provided',
    AUTHENTICATION_ERROR: 'Authentication required',
    AUTHORIZATION_ERROR: 'Insufficient permissions',
    RESOURCE_NOT_FOUND: 'Resource not found',
    RESOURCE_CONFLICT: 'Resource conflict',
    RATE_LIMIT_EXCEEDED: 'Too many requests',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    AVATAR_SERVICE_ERROR: 'Avatar service unavailable',
    STT_SERVICE_ERROR: 'Speech recognition unavailable',
    TTS_SERVICE_ERROR: 'Text-to-speech unavailable',
    LLM_SERVICE_ERROR: 'AI service unavailable',
    WEBRTC_CONNECTION_ERROR: 'Media connection failed',
    MEDIA_STREAM_ERROR: 'Media access failed',
    SESSION_EXPIRED: 'Session expired',
    INVALID_SESSION_STATE: 'Invalid session state',
    INTERNAL_SERVER_ERROR: 'Internal server error',
  };

  return safeMessages[code] || 'An unexpected error occurred';
}

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
    }));
    
    const validationError = createValidationError('Validation failed');
    (validationError as any).details = errorMessages;
    
    return next(validationError);
  }
  
  next();
};

// Service error handlers
export const handleAvatarServiceError = (error: any): never => {
  logger.error('Avatar service error', { error: error.message });
  throw createServiceError(
    'Avatar service is currently unavailable',
    'AVATAR_SERVICE_ERROR'
  );
};

export const handleSTTServiceError = (error: any): never => {
  logger.error('STT service error', { error: error.message });
  throw createServiceError(
    'Speech recognition service is currently unavailable',
    'STT_SERVICE_ERROR'
  );
};

export const handleTTSServiceError = (error: any): never => {
  logger.error('TTS service error', { error: error.message });
  throw createServiceError(
    'Text-to-speech service is currently unavailable',
    'TTS_SERVICE_ERROR'
  );
};

export const handleLLMServiceError = (error: any): never => {
  logger.error('LLM service error', { error: error.message });
  throw createServiceError(
    'AI service is currently unavailable',
    'LLM_SERVICE_ERROR'
  );
};

export const handleWebRTCError = (error: any): never => {
  logger.error('WebRTC error', { error: error.message });
  throw createServiceError(
    'Failed to establish media connection',
    'WEBRTC_CONNECTION_ERROR'
  );
};

export const handleMediaStreamError = (error: any): never => {
  logger.error('Media stream error', { error: error.message });
  throw createServiceError(
    'Unable to access media stream',
    'MEDIA_STREAM_ERROR'
  );
};