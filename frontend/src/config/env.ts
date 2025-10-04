// Environment configuration for the frontend
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  avatarEnabled: import.meta.env.VITE_AVATAR_ENABLED === 'true',
  audioOnlyFallback: import.meta.env.VITE_AUDIO_ONLY_FALLBACK === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // App info
  appName: import.meta.env.VITE_APP_NAME || 'AI Interviewer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Full-Realism Human-AI Interviewer',
  
  // Feature flags
  enableMockAvatar: import.meta.env.VITE_ENABLE_MOCK_AVATAR === 'true',
  enableDemoMode: import.meta.env.VITE_ENABLE_DEMO_MODE === 'true',
  enableTelemetry: import.meta.env.VITE_ENABLE_TELEMETRY === 'true',
  
  // WebRTC
  webrtcStunServers: import.meta.env.VITE_WEBRTC_STUN_SERVERS?.split(',') || [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302'
  ],
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL', 'VITE_WS_URL'] as const;

export function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar] && import.meta.env.PROD
  );
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (import.meta.env.PROD) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Frontend Configuration:', config);
}