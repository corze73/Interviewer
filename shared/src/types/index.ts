import { z } from 'zod';

// Base Types
export const UUIDSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();

// User Types
export const UserSchema = z.object({
  id: UUIDSchema,
  email: z.string().email(),
  name: z.string(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type User = z.infer<typeof UserSchema>;

// Competency Framework
export const CompetencyTypeSchema = z.enum([
  'communication',
  'problem_solving',
  'ownership',
  'teamwork',
  'role_fit',
  'technical',
  'leadership',
  'adaptability',
]);

export type CompetencyType = z.infer<typeof CompetencyTypeSchema>;

export const CompetencySchema = z.object({
  type: CompetencyTypeSchema,
  name: z.string(),
  description: z.string(),
  weight: z.number().min(0).max(1).default(1),
});

export type Competency = z.infer<typeof CompetencySchema>;

// Job Description and Analysis
export const JobDescriptionSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  department: z.string().optional(),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;

export const JobAnalysisSchema = z.object({
  competencies: z.array(CompetencySchema),
  suggestedQuestions: z.array(z.string()),
  keySkills: z.array(z.string()),
  experienceLevel: z.string(),
  industryContext: z.string().optional(),
});

export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

// Interview Session Types
export const SessionStatusSchema = z.enum([
  'created',
  'in_progress',
  'completed',
  'abandoned',
  'error',
]);

export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const InterviewSessionSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema.optional(),
  jobDescription: JobDescriptionSchema,
  jobAnalysis: JobAnalysisSchema,
  status: SessionStatusSchema,
  startedAt: TimestampSchema.optional(),
  completedAt: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  metadata: z.record(z.any()).optional(),
});

export type InterviewSession = z.infer<typeof InterviewSessionSchema>;

// Interview Turn Types
export const TurnRoleSchema = z.enum(['interviewer', 'candidate', 'system']);
export type TurnRole = z.infer<typeof TurnRoleSchema>;

export const InterviewTurnSchema = z.object({
  id: UUIDSchema,
  sessionId: UUIDSchema,
  role: TurnRoleSchema,
  content: z.string(),
  competency: CompetencyTypeSchema.optional(),
  timestamp: TimestampSchema,
  metadata: z.object({
    audioUrl: z.string().optional(),
    duration: z.number().optional(),
    confidence: z.number().optional(),
    isFollowUp: z.boolean().default(false),
    questionType: z.enum(['behavioral', 'technical', 'situational', 'follow_up']).optional(),
    starElements: z.array(z.enum(['situation', 'task', 'action', 'result'])).optional(),
  }).optional(),
});

export type InterviewTurn = z.infer<typeof InterviewTurnSchema>;

// Scoring Types
export const ScoreSchema = z.object({
  value: z.number().min(1).max(5),
  rationale: z.string(),
  improvementTip: z.string(),
  starCompleteness: z.object({
    situation: z.boolean(),
    task: z.boolean(),
    action: z.boolean(),
    result: z.boolean(),
  }).optional(),
});

export type Score = z.infer<typeof ScoreSchema>;

export const InterviewScoreSchema = z.object({
  id: UUIDSchema,
  sessionId: UUIDSchema,
  turnId: UUIDSchema,
  competency: CompetencyTypeSchema,
  score: ScoreSchema,
  createdAt: TimestampSchema,
});

export type InterviewScore = z.infer<typeof InterviewScoreSchema>;

// Report Types
export const CompetencyAssessmentSchema = z.object({
  competency: CompetencyTypeSchema,
  averageScore: z.number().min(1).max(5),
  scores: z.array(ScoreSchema),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

export type CompetencyAssessment = z.infer<typeof CompetencyAssessmentSchema>;

export const InterviewReportSchema = z.object({
  id: UUIDSchema,
  sessionId: UUIDSchema,
  overallScore: z.number().min(1).max(5),
  overallSummary: z.string(),
  competencyAssessments: z.array(CompetencyAssessmentSchema),
  nextSteps: z.array(z.string()),
  strengths: z.array(z.string()),
  growthAreas: z.array(z.string()),
  recommendedResources: z.array(z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
    type: z.enum(['article', 'book', 'course', 'practice', 'tool']),
  })).optional(),
  createdAt: TimestampSchema,
});

export type InterviewReport = z.infer<typeof InterviewReportSchema>;

// Real-time Communication Types
export const WebRTCStateSchema = z.enum([
  'connecting',
  'connected',
  'disconnected',
  'failed',
  'closed',
]);

export type WebRTCState = z.infer<typeof WebRTCStateSchema>;

export const MediaStreamStateSchema = z.object({
  audio: z.boolean(),
  video: z.boolean(),
  screen: z.boolean().optional(),
});

export type MediaStreamState = z.infer<typeof MediaStreamStateSchema>;

// WebSocket Message Types
export const WSMessageTypeSchema = z.enum([
  'session_start',
  'session_end',
  'audio_chunk',
  'transcript_partial',
  'transcript_final',
  'avatar_speak',
  'avatar_stop',
  'barge_in',
  'turn_complete',
  'error',
  'ping',
  'pong',
]);

export type WSMessageType = z.infer<typeof WSMessageTypeSchema>;

export const WSMessageSchema = z.object({
  type: WSMessageTypeSchema,
  sessionId: UUIDSchema,
  data: z.any(),
  timestamp: TimestampSchema,
});

export type WSMessage = z.infer<typeof WSMessageSchema>;

// Avatar Types
export const AvatarProviderSchema = z.enum(['heygen', 'did', 'synthesia', 'custom']);
export type AvatarProvider = z.infer<typeof AvatarProviderSchema>;

export const AvatarConfigSchema = z.object({
  provider: AvatarProviderSchema,
  avatarId: z.string(),
  voiceId: z.string().optional(),
  language: z.string().default('en-US'),
  style: z.enum(['professional', 'friendly', 'authoritative']).optional(),
});

export type AvatarConfig = z.infer<typeof AvatarConfigSchema>;

export const VisemeSchema = z.object({
  timestamp: z.number(),
  viseme: z.string(),
  duration: z.number(),
});

export type Viseme = z.infer<typeof VisemeSchema>;

// STT/TTS Types
export const STTProviderSchema = z.enum(['azure', 'google', 'aws', 'openai']);
export type STTProvider = z.infer<typeof STTProviderSchema>;

export const TTSProviderSchema = z.enum(['azure', 'google', 'aws', 'elevenlabs']);
export type TTSProvider = z.infer<typeof TTSProviderSchema>;

export const TranscriptResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
});

export type TranscriptResult = z.infer<typeof TranscriptResultSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  metadata: z.object({
    timestamp: TimestampSchema,
    requestId: z.string(),
    latency: z.number().optional(),
  }),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    latency?: number;
  };
};

// Error Types
export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'AUTHENTICATION_ERROR',
  'AUTHORIZATION_ERROR',
  'RESOURCE_NOT_FOUND',
  'RESOURCE_CONFLICT',
  'RATE_LIMIT_EXCEEDED',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_SERVER_ERROR',
  'AVATAR_SERVICE_ERROR',
  'STT_SERVICE_ERROR',
  'TTS_SERVICE_ERROR',
  'LLM_SERVICE_ERROR',
  'WEBRTC_CONNECTION_ERROR',
  'MEDIA_STREAM_ERROR',
  'SESSION_EXPIRED',
  'INVALID_SESSION_STATE',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

// Performance Metrics
export const LatencyMetricsSchema = z.object({
  earToMouth: z.number(),
  sttLatency: z.number(),
  llmLatency: z.number(),
  ttsLatency: z.number(),
  avatarLatency: z.number(),
  bargeInDetection: z.number(),
  totalRoundTrip: z.number(),
});

export type LatencyMetrics = z.infer<typeof LatencyMetricsSchema>;

export const SessionMetricsSchema = z.object({
  sessionId: UUIDSchema,
  startTime: TimestampSchema,
  endTime: TimestampSchema.optional(),
  duration: z.number().optional(),
  turnCount: z.number(),
  averageLatency: LatencyMetricsSchema,
  peakLatency: LatencyMetricsSchema,
  errorCount: z.number(),
  completionRate: z.number().min(0).max(1),
});

export type SessionMetrics = z.infer<typeof SessionMetricsSchema>;