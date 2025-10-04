import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table: any) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Interview sessions table
export const interviewSessions = pgTable('interview_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  jobCompany: varchar('job_company', { length: 255 }),
  jobDescription: text('job_description').notNull(),
  jobAnalysis: jsonb('job_analysis').notNull(), // Stores competencies, questions, etc.
  status: varchar('status', { length: 50 }).notNull().default('created'), // created, in_progress, completed, abandoned, error
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'), // Additional session data
}, (table: any) => ({
  userIdIdx: index('interview_sessions_user_id_idx').on(table.userId),
  statusIdx: index('interview_sessions_status_idx').on(table.status),
  createdAtIdx: index('interview_sessions_created_at_idx').on(table.createdAt),
}));

// Interview turns table
export const interviewTurns = pgTable('interview_turns', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // interviewer, candidate, system
  content: text('content').notNull(),
  competency: varchar('competency', { length: 50 }), // communication, problem_solving, etc.
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata'), // audioUrl, duration, confidence, etc.
}, (table: any) => ({
  sessionIdIdx: index('interview_turns_session_id_idx').on(table.sessionId),
  timestampIdx: index('interview_turns_timestamp_idx').on(table.timestamp),
  roleIdx: index('interview_turns_role_idx').on(table.role),
}));

// Interview scores table
export const interviewScores = pgTable('interview_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id).notNull(),
  turnId: uuid('turn_id').references(() => interviewTurns.id).notNull(),
  competency: varchar('competency', { length: 50 }).notNull(),
  score: integer('score').notNull(), // 1-5 scale
  rationale: text('rationale').notNull(),
  improvementTip: text('improvement_tip').notNull(),
  starCompleteness: jsonb('star_completeness'), // Which STAR elements were present
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table: any) => ({
  sessionIdIdx: index('interview_scores_session_id_idx').on(table.sessionId),
  turnIdIdx: index('interview_scores_turn_id_idx').on(table.turnId),
  competencyIdx: index('interview_scores_competency_idx').on(table.competency),
}));

// Interview reports table
export const interviewReports = pgTable('interview_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id).notNull(),
  overallScore: decimal('overall_score', { precision: 3, scale: 2 }).notNull(),
  overallSummary: text('overall_summary').notNull(),
  competencyAssessments: jsonb('competency_assessments').notNull(),
  nextSteps: jsonb('next_steps').notNull(),
  strengths: jsonb('strengths').notNull(),
  growthAreas: jsonb('growth_areas').notNull(),
  recommendedResources: jsonb('recommended_resources'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table: any) => ({
  sessionIdIdx: index('interview_reports_session_id_idx').on(table.sessionId),
}));

// Session metrics table for performance tracking
export const sessionMetrics = pgTable('session_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // seconds
  turnCount: integer('turn_count').default(0),
  averageLatency: jsonb('average_latency'), // LatencyMetrics object
  peakLatency: jsonb('peak_latency'), // LatencyMetrics object
  errorCount: integer('error_count').default(0),
  completionRate: decimal('completion_rate', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table: any) => ({
  sessionIdIdx: index('session_metrics_session_id_idx').on(table.sessionId),
  startTimeIdx: index('session_metrics_start_time_idx').on(table.startTime),
}));

// Avatar sessions table for tracking avatar usage
export const avatarSessions = pgTable('avatar_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // heygen, did, etc.
  avatarId: varchar('avatar_id', { length: 255 }).notNull(),
  voiceId: varchar('voice_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(), // connecting, connected, disconnected, failed
  connectionStarted: timestamp('connection_started').defaultNow(),
  connectionEnded: timestamp('connection_ended'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'), // Provider-specific data
}, (table: any) => ({
  sessionIdIdx: index('avatar_sessions_session_id_idx').on(table.sessionId),
  providerIdx: index('avatar_sessions_provider_idx').on(table.provider),
  statusIdx: index('avatar_sessions_status_idx').on(table.status),
}));

// WebRTC sessions table for connection tracking
export const webrtcSessions = pgTable('webrtc_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id).notNull(),
  peerId: varchar('peer_id', { length: 255 }).notNull(),
  connectionState: varchar('connection_state', { length: 50 }).notNull(),
  iceConnectionState: varchar('ice_connection_state', { length: 50 }),
  signalingState: varchar('signaling_state', { length: 50 }),
  mediaState: jsonb('media_state'), // audio/video stream states
  connectionStarted: timestamp('connection_started').defaultNow(),
  connectionEnded: timestamp('connection_ended'),
  metadata: jsonb('metadata'), // Additional connection data
}, (table: any) => ({
  sessionIdIdx: index('webrtc_sessions_session_id_idx').on(table.sessionId),
  peerIdIdx: index('webrtc_sessions_peer_id_idx').on(table.peerId),
  connectionStateIdx: index('webrtc_sessions_connection_state_idx').on(table.connectionState),
}));

// System logs table for audit trail
export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: varchar('level', { length: 10 }).notNull(), // error, warn, info, debug
  message: text('message').notNull(),
  context: varchar('context', { length: 100 }),
  sessionId: uuid('session_id').references(() => interviewSessions.id),
  userId: uuid('user_id').references(() => users.id),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table: any) => ({
  levelIdx: index('system_logs_level_idx').on(table.level),
  timestampIdx: index('system_logs_timestamp_idx').on(table.timestamp),
  sessionIdIdx: index('system_logs_session_id_idx').on(table.sessionId),
  contextIdx: index('system_logs_context_idx').on(table.context),
}));

// Define relationships
export const usersRelations = relations(users, ({ many }: any) => ({
  sessions: many(interviewSessions),
  logs: many(systemLogs),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({ one, many }: any) => ({
  user: one(users, {
    fields: [interviewSessions.userId],
    references: [users.id],
  }),
  turns: many(interviewTurns),
  scores: many(interviewScores),
  report: one(interviewReports),
  metrics: one(sessionMetrics),
  avatarSession: one(avatarSessions),
  webrtcSessions: many(webrtcSessions),
  logs: many(systemLogs),
}));

export const interviewTurnsRelations = relations(interviewTurns, ({ one, many }: any) => ({
  session: one(interviewSessions, {
    fields: [interviewTurns.sessionId],
    references: [interviewSessions.id],
  }),
  scores: many(interviewScores),
}));

export const interviewScoresRelations = relations(interviewScores, ({ one }: any) => ({
  session: one(interviewSessions, {
    fields: [interviewScores.sessionId],
    references: [interviewSessions.id],
  }),
  turn: one(interviewTurns, {
    fields: [interviewScores.turnId],
    references: [interviewTurns.id],
  }),
}));

export const interviewReportsRelations = relations(interviewReports, ({ one }: any) => ({
  session: one(interviewSessions, {
    fields: [interviewReports.sessionId],
    references: [interviewSessions.id],
  }),
}));

export const sessionMetricsRelations = relations(sessionMetrics, ({ one }: any) => ({
  session: one(interviewSessions, {
    fields: [sessionMetrics.sessionId],
    references: [interviewSessions.id],
  }),
}));

export const avatarSessionsRelations = relations(avatarSessions, ({ one }: any) => ({
  session: one(interviewSessions, {
    fields: [avatarSessions.sessionId],
    references: [interviewSessions.id],
  }),
}));

export const webrtcSessionsRelations = relations(webrtcSessions, ({ one }: any) => ({
  session: one(interviewSessions, {
    fields: [webrtcSessions.sessionId],
    references: [interviewSessions.id],
  }),
}));

export const systemLogsRelations = relations(systemLogs, ({ one }: any) => ({
  session: one(interviewSessions, {
    fields: [systemLogs.sessionId],
    references: [interviewSessions.id],
  }),
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
}));