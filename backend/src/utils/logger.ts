import winston from 'winston';

// Create logger configuration
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, ...meta } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'interviewer-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : logFormat,
    }),
    
    // File transports for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
      }),
    ] : []),
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    ] : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/rejections.log' })
    ] : []),
  ],
  exitOnError: false,
});

// Create specialized loggers for different contexts
export const createContextLogger = (context: string) => {
  return logger.child({ context });
};

// Structured logging helpers
export const loggers = {
  session: createContextLogger('session'),
  avatar: createContextLogger('avatar'),
  stt: createContextLogger('stt'),
  tts: createContextLogger('tts'),
  llm: createContextLogger('llm'),
  webrtc: createContextLogger('webrtc'),
  websocket: createContextLogger('websocket'),
  database: createContextLogger('database'),
  metrics: createContextLogger('metrics'),
};

// Performance logging helper
export const logPerformance = (
  operation: string,
  startTime: number,
  metadata?: Record<string, any>
) => {
  const duration = Date.now() - startTime;
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata,
  });
  return duration;
};

// Error logging helper
export const logError = (
  error: Error,
  context?: string,
  metadata?: Record<string, any>
) => {
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    ...metadata,
  });
};

// Request logging helper
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, any>
) => {
  logger.info('HTTP Request', {
    method,
    url,
    statusCode,
    duration,
    ...metadata,
  });
};

// WebSocket event logging
export const logWebSocketEvent = (
  event: string,
  sessionId: string,
  metadata?: Record<string, any>
) => {
  loggers.websocket.info('WebSocket event', {
    event,
    sessionId,
    ...metadata,
  });
};

// Create directory for logs if it doesn't exist
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}