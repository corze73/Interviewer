// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  EAR_TO_MOUTH_MAX_MS: 400,
  TTS_START_MAX_MS: 300,
  BARGE_IN_MAX_MS: 150,
  ROUND_TRIP_MAX_MS: 1200,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  MEDIA_STREAM_TIMEOUT_MS: 60 * 1000, // 60 seconds
} as const;

// Default Competencies and Weights
export const DEFAULT_COMPETENCIES = [
  {
    type: 'communication' as const,
    name: 'Communication',
    description: 'Clarity, structure, and engagement in verbal communication',
    weight: 1.0,
  },
  {
    type: 'problem_solving' as const,
    name: 'Problem Solving',
    description: 'Analytical thinking, approach to challenges, and solution development',
    weight: 1.0,
  },
  {
    type: 'ownership' as const,
    name: 'Ownership',
    description: 'Initiative, accountability, and results-driven mindset',
    weight: 1.0,
  },
  {
    type: 'teamwork' as const,
    name: 'Teamwork',
    description: 'Collaboration, leadership, and influence with others',
    weight: 1.0,
  },
  {
    type: 'role_fit' as const,
    name: 'Role Fit',
    description: 'Technical skills, domain knowledge, and role-specific competencies',
    weight: 1.2, // Slightly higher weight for technical alignment
  },
] as const;

// Scoring Rubric
export const SCORING_RUBRIC = {
  1: {
    label: 'Needs Significant Improvement',
    description: 'Response lacks key elements, is unclear, or demonstrates insufficient understanding',
    criteria: [
      'Incomplete or unclear answer',
      'Missing critical details or context',
      'Shows limited understanding of the topic',
      'Poor structure or communication',
    ],
  },
  2: {
    label: 'Below Expectations',
    description: 'Response has some relevant elements but lacks depth or clarity',
    criteria: [
      'Partially addresses the question',
      'Some relevant details but lacks depth',
      'Shows basic understanding',
      'Could improve clarity or structure',
    ],
  },
  3: {
    label: 'Meets Expectations',
    description: 'Response adequately addresses the question with relevant details',
    criteria: [
      'Addresses the main question',
      'Provides relevant examples or details',
      'Shows good understanding',
      'Clear and well-structured response',
    ],
  },
  4: {
    label: 'Exceeds Expectations',
    description: 'Response is comprehensive with strong examples and insights',
    criteria: [
      'Thoroughly addresses the question',
      'Provides strong, specific examples',
      'Shows deep understanding and insight',
      'Excellent structure and communication',
    ],
  },
  5: {
    label: 'Outstanding',
    description: 'Response demonstrates exceptional understanding with compelling examples',
    criteria: [
      'Comprehensive and insightful response',
      'Multiple strong, specific examples',
      'Shows exceptional understanding and reflection',
      'Outstanding communication and structure',
      'Goes beyond expectations with additional insights',
    ],
  },
} as const;

// STAR Method Elements
export const STAR_ELEMENTS = {
  situation: {
    name: 'Situation',
    description: 'Context and background of the scenario',
    prompts: [
      'Can you tell me more about the context?',
      'What was the situation or setting?',
      'Help me understand the background.',
    ],
  },
  task: {
    name: 'Task',
    description: 'Your role and responsibilities in the situation',
    prompts: [
      'What was your specific role or responsibility?',
      'What were you tasked with accomplishing?',
      'What was expected of you?',
    ],
  },
  action: {
    name: 'Action',
    description: 'Specific actions you took to address the situation',
    prompts: [
      'What specific steps did you take?',
      'How did you approach this challenge?',
      'What actions did you personally take?',
    ],
  },
  result: {
    name: 'Result',
    description: 'Outcomes and impact of your actions',
    prompts: [
      'What was the outcome or result?',
      'How did you measure success?',
      'What impact did your actions have?',
    ],
  },
} as const;

// Question Types and Templates
export const QUESTION_TYPES = {
  behavioral: {
    name: 'Behavioral',
    description: 'Questions about past experiences and behaviors',
    templates: [
      'Tell me about a time when you {scenario}',
      'Describe a situation where you had to {challenge}',
      'Can you share an example of when you {behavior}',
    ],
  },
  technical: {
    name: 'Technical',
    description: 'Questions about technical skills and knowledge',
    templates: [
      'How would you approach {technical_problem}?',
      'Explain your understanding of {technical_concept}',
      'Walk me through how you would {technical_task}',
    ],
  },
  situational: {
    name: 'Situational',
    description: 'Hypothetical scenarios and how you would handle them',
    templates: [
      'How would you handle a situation where {scenario}?',
      'If you were faced with {challenge}, what would you do?',
      'Imagine you need to {task}, how would you approach it?',
    ],
  },
  follow_up: {
    name: 'Follow-up',
    description: 'Clarifying questions to gather more detail',
    templates: [
      'Can you be more specific about {topic}?',
      'What metrics did you use to measure {outcome}?',
      'How did you ensure {quality_aspect}?',
    ],
  },
} as const;

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle' as const,
  rtcpMuxPolicy: 'require' as const,
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  constraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000,
      channelCount: 1,
    },
    video: false,
  },
  VAD: {
    threshold: 0.5,
    minSpeechDuration: 250, // ms
    maxSilenceDuration: 1500, // ms
    preSpeechPadding: 100, // ms
    postSpeechPadding: 300, // ms
  },
} as const;

// Avatar Configuration
export const AVATAR_CONFIG = {
  providers: {
    heygen: {
      name: 'HeyGen',
      supportsRealTime: true,
      supportsBargein: true,
      maxConcurrentSessions: 10,
    },
    did: {
      name: 'D-ID',
      supportsRealTime: true,
      supportsBargein: false,
      maxConcurrentSessions: 5,
    },
    synthesia: {
      name: 'Synthesia',
      supportsRealTime: false,
      supportsBargein: false,
      maxConcurrentSessions: 3,
    },
  },
  fallback: {
    enabled: true,
    mode: 'audio_only' as const,
    placeholder: {
      type: 'image' as const,
      url: '/assets/avatar-placeholder.png',
      alt: 'AI Interviewer',
    },
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Invalid input provided',
  AUTHENTICATION_ERROR: 'Authentication required',
  AUTHORIZATION_ERROR: 'Insufficient permissions',
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  RESOURCE_CONFLICT: 'Resource conflict detected',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  INTERNAL_SERVER_ERROR: 'Internal server error occurred',
  AVATAR_SERVICE_ERROR: 'Avatar service is currently unavailable',
  STT_SERVICE_ERROR: 'Speech recognition service error',
  TTS_SERVICE_ERROR: 'Text-to-speech service error',
  LLM_SERVICE_ERROR: 'AI service temporarily unavailable',
  WEBRTC_CONNECTION_ERROR: 'Failed to establish media connection',
  MEDIA_STREAM_ERROR: 'Unable to access microphone',
  SESSION_EXPIRED: 'Interview session has expired',
  INVALID_SESSION_STATE: 'Invalid session state',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Session Management
  SESSION_START: '/api/session/start',
  SESSION_TOKEN: '/api/session/token',
  SESSION_FINISH: '/api/session/finish',
  SESSION_GET: '/api/session/:id',
  SESSION_LIST: '/api/sessions',
  
  // Real-time Communication
  WEBSOCKET: '/realtime/:sessionId',
  
  // Reports and Analytics
  REPORT_GET: '/api/report/:sessionId',
  REPORT_EXPORT: '/api/report/:sessionId/export',
  ANALYTICS: '/api/analytics',
  
  // User Management
  USER_PROFILE: '/api/user/profile',
  USER_SESSIONS: '/api/user/sessions',
  
  // Admin
  ADMIN_SESSIONS: '/api/admin/sessions',
  ADMIN_METRICS: '/api/admin/metrics',
  ADMIN_CONFIG: '/api/admin/config',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  AVATAR_ENABLED: 'avatar_enabled',
  AUDIO_ONLY_FALLBACK: 'audio_only_fallback',
  VERBOSE_LOGGING: 'verbose_logging',
  ENABLE_METRICS: 'enable_metrics',
  ENABLE_TELEMETRY: 'enable_telemetry',
  ENABLE_CORS: 'enable_cors',
  ENABLE_SWAGGER: 'enable_swagger',
  ENABLE_PLAYGROUND: 'enable_playground',
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  GLOBAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  SESSION_START: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // sessions per minute
  },
  API_CALLS: {
    windowMs: 1000, // 1 second
    max: 10, // requests per second
  },
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['audio/wav', 'audio/mp3', 'audio/webm'],
  MAX_DURATION: 300, // 5 minutes in seconds
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  'en-US': { name: 'English (US)', rtl: false },
  'en-GB': { name: 'English (UK)', rtl: false },
  'es-ES': { name: 'Spanish (Spain)', rtl: false },
  'es-MX': { name: 'Spanish (Mexico)', rtl: false },
  'fr-FR': { name: 'French (France)', rtl: false },
  'de-DE': { name: 'German (Germany)', rtl: false },
  'it-IT': { name: 'Italian (Italy)', rtl: false },
  'pt-BR': { name: 'Portuguese (Brazil)', rtl: false },
  'zh-CN': { name: 'Chinese (Simplified)', rtl: false },
  'ja-JP': { name: 'Japanese (Japan)', rtl: false },
  'ko-KR': { name: 'Korean (Korea)', rtl: false },
} as const;

// Interview Configuration
export const INTERVIEW_CONFIG = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 12,
  DEFAULT_QUESTIONS: 8,
  MAX_FOLLOW_UPS: 3,
  MIN_ANSWER_LENGTH: 50, // characters
  QUESTION_TIMEOUT: 120, // seconds
  FOLLOW_UP_TRIGGERS: {
    SHORT_ANSWER: 100, // characters
    MISSING_STAR: ['situation', 'task', 'action', 'result'],
    LOW_SPECIFICITY: 0.3, // threshold
  },
} as const;

// Accessibility
export const ACCESSIBILITY = {
  KEYBOARD_SHORTCUTS: {
    START_RECORDING: 'Space',
    STOP_RECORDING: 'Space',
    TOGGLE_CAPTIONS: 'c',
    SKIP_QUESTION: 'Escape',
    HELP: '?',
  },
  ARIA_LABELS: {
    RECORDING_BUTTON: 'Start/Stop recording your answer',
    TRANSCRIPT_PANEL: 'Interview transcript',
    AVATAR_VIDEO: 'AI Interviewer avatar',
    CAPTIONS: 'Live captions',
  },
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0,
  },
} as const;