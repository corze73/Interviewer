/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_AVATAR_ENABLED: string
  readonly VITE_AUDIO_ONLY_FALLBACK: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ENABLE_MOCK_AVATAR: string
  readonly VITE_ENABLE_DEMO_MODE: string
  readonly VITE_ENABLE_TELEMETRY: string
  readonly VITE_WEBRTC_STUN_SERVERS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}