import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),

  // Authentication & Security
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-sonnet-20240229'),

  // Avatar Provider
  HEYGEN_API_KEY: z.string().optional(),
  HEYGEN_AVATAR_ID: z.string().optional(),
  HEYGEN_VOICE_ID: z.string().optional(),
  DID_API_KEY: z.string().optional(),
  DID_PRESENTER_ID: z.string().optional(),

  // Speech Services
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().default('eastus'),
  AZURE_SPEECH_LANGUAGE: z.string().default('en-US'),
  GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  // WebRTC Configuration
  WEBRTC_STUN_SERVERS: z.string().default('stun:stun.l.google.com:19302'),
  WEBRTC_TURN_SERVER: z.string().optional(),
  WEBRTC_TURN_USERNAME: z.string().optional(),
  WEBRTC_TURN_CREDENTIAL: z.string().optional(),

  // File Storage
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_PATH: z.string().default('./uploads'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_BUCKET_NAME: z.string().optional(),

  // Feature Flags
  AVATAR_ENABLED: z.coerce.boolean().default(true),
  AUDIO_ONLY_FALLBACK: z.coerce.boolean().default(true),
  VERBOSE_LOGGING: z.coerce.boolean().default(false),
  ENABLE_METRICS: z.coerce.boolean().default(true),
  ENABLE_TELEMETRY: z.coerce.boolean().default(true),
  ENABLE_CORS: z.coerce.boolean().default(true),
  ENABLE_SWAGGER: z.coerce.boolean().default(false),
  ENABLE_PLAYGROUND: z.coerce.boolean().default(false),

  // Performance & Scaling
  MAX_CONCURRENT_SESSIONS: z.coerce.number().default(50),
  SESSION_TIMEOUT_MINUTES: z.coerce.number().default(30),
  MEDIA_STREAM_TIMEOUT_SECONDS: z.coerce.number().default(60),
  STT_CHUNK_SIZE: z.coerce.number().default(4096),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Monitoring & Observability
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),

  // Email Service
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Testing
  TEST_DATABASE_URL: z.string().url().optional(),
  TEST_TIMEOUT: z.coerce.number().default(30000),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err: any) => `${err.path.join('.')}: ${err.message}`
      );
      
      console.error('❌ Environment validation failed:');
      errorMessages.forEach((msg: string) => console.error(`  - ${msg}`));
      console.error('\nPlease check your .env file and ensure all required variables are set.');
      
      process.exit(1);
    }
    throw error;
  }
}

// Helper functions for common environment checks
export function isDevelopment(): boolean {
  return validateEnv().NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return validateEnv().NODE_ENV === 'production';
}

export function isTest(): boolean {
  return validateEnv().NODE_ENV === 'test';
}

// Get required service configuration
export function getAvatarConfig() {
  const env = validateEnv();
  
  if (env.HEYGEN_API_KEY && env.HEYGEN_AVATAR_ID) {
    return {
      provider: 'heygen' as const,
      apiKey: env.HEYGEN_API_KEY,
      avatarId: env.HEYGEN_AVATAR_ID,
      voiceId: env.HEYGEN_VOICE_ID,
    };
  }
  
  if (env.DID_API_KEY && env.DID_PRESENTER_ID) {
    return {
      provider: 'did' as const,
      apiKey: env.DID_API_KEY,
      presenterId: env.DID_PRESENTER_ID,
    };
  }
  
  throw new Error('No avatar provider configured. Please set either HeyGen or D-ID credentials.');
}

export function getLLMConfig() {
  const env = validateEnv();
  
  if (env.OPENAI_API_KEY) {
    return {
      provider: 'openai' as const,
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    };
  }
  
  if (env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic' as const,
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.ANTHROPIC_MODEL,
    };
  }
  
  throw new Error('No LLM provider configured. Please set either OpenAI or Anthropic API key.');
}

export function getSpeechConfig() {
  const env = validateEnv();
  
  if (env.AZURE_SPEECH_KEY) {
    return {
      provider: 'azure' as const,
      apiKey: env.AZURE_SPEECH_KEY,
      region: env.AZURE_SPEECH_REGION,
      language: env.AZURE_SPEECH_LANGUAGE,
    };
  }
  
  if (env.GOOGLE_CLOUD_PROJECT_ID) {
    return {
      provider: 'google' as const,
      projectId: env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: env.GOOGLE_APPLICATION_CREDENTIALS,
    };
  }
  
  throw new Error('No speech service configured. Please set either Azure or Google Cloud credentials.');
}

export function getStorageConfig() {
  const env = validateEnv();
  
  if (env.STORAGE_TYPE === 's3') {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_BUCKET_NAME) {
      throw new Error('S3 storage selected but AWS credentials are incomplete');
    }
    
    return {
      type: 's3' as const,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucketName: env.AWS_BUCKET_NAME,
    };
  }
  
  return {
    type: 'local' as const,
    path: env.STORAGE_PATH,
  };
}

// Database URL helpers
export function getDatabaseUrl(): string {
  const env = validateEnv();
  return isTest() && env.TEST_DATABASE_URL ? env.TEST_DATABASE_URL : env.DATABASE_URL;
}

// WebRTC configuration helper
export function getWebRTCConfig() {
  const env = validateEnv();
  
  const iceServers: Array<{ urls: string; username?: string; credential?: string }> = [
    ...env.WEBRTC_STUN_SERVERS.split(',').map((url: string) => ({ urls: url.trim() })),
  ];
  
  if (env.WEBRTC_TURN_SERVER && env.WEBRTC_TURN_USERNAME && env.WEBRTC_TURN_CREDENTIAL) {
    iceServers.push({
      urls: env.WEBRTC_TURN_SERVER,
      username: env.WEBRTC_TURN_USERNAME,
      credential: env.WEBRTC_TURN_CREDENTIAL,
    });
  }
  
  return {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as const,
    rtcpMuxPolicy: 'require' as const,
  };
}