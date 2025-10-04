CREATE TABLE IF NOT EXISTS "avatar_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"avatar_id" varchar(255) NOT NULL,
	"voice_id" varchar(255),
	"status" varchar(50) NOT NULL,
	"connection_started" timestamp DEFAULT now(),
	"connection_ended" timestamp,
	"error_message" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"overall_score" numeric(3, 2) NOT NULL,
	"overall_summary" text NOT NULL,
	"competency_assessments" jsonb NOT NULL,
	"next_steps" jsonb NOT NULL,
	"strengths" jsonb NOT NULL,
	"growth_areas" jsonb NOT NULL,
	"recommended_resources" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"turn_id" uuid NOT NULL,
	"competency" varchar(50) NOT NULL,
	"score" integer NOT NULL,
	"rationale" text NOT NULL,
	"improvement_tip" text NOT NULL,
	"star_completeness" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"job_title" varchar(255) NOT NULL,
	"job_company" varchar(255),
	"job_description" text NOT NULL,
	"job_analysis" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'created' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"competency" varchar(50),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"turn_count" integer DEFAULT 0,
	"average_latency" jsonb,
	"peak_latency" jsonb,
	"error_count" integer DEFAULT 0,
	"completion_rate" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"context" varchar(100),
	"session_id" uuid,
	"user_id" uuid,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webrtc_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"peer_id" varchar(255) NOT NULL,
	"connection_state" varchar(50) NOT NULL,
	"ice_connection_state" varchar(50),
	"signaling_state" varchar(50),
	"media_state" jsonb,
	"connection_started" timestamp DEFAULT now(),
	"connection_ended" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "avatar_sessions_session_id_idx" ON "avatar_sessions" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "avatar_sessions_provider_idx" ON "avatar_sessions" ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "avatar_sessions_status_idx" ON "avatar_sessions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_reports_session_id_idx" ON "interview_reports" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_scores_session_id_idx" ON "interview_scores" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_scores_turn_id_idx" ON "interview_scores" ("turn_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_scores_competency_idx" ON "interview_scores" ("competency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_sessions_user_id_idx" ON "interview_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_sessions_status_idx" ON "interview_sessions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_sessions_created_at_idx" ON "interview_sessions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_turns_session_id_idx" ON "interview_turns" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_turns_timestamp_idx" ON "interview_turns" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_turns_role_idx" ON "interview_turns" ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_metrics_session_id_idx" ON "session_metrics" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_metrics_start_time_idx" ON "session_metrics" ("start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_level_idx" ON "system_logs" ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_timestamp_idx" ON "system_logs" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_session_id_idx" ON "system_logs" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_context_idx" ON "system_logs" ("context");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webrtc_sessions_session_id_idx" ON "webrtc_sessions" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webrtc_sessions_peer_id_idx" ON "webrtc_sessions" ("peer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webrtc_sessions_connection_state_idx" ON "webrtc_sessions" ("connection_state");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avatar_sessions" ADD CONSTRAINT "avatar_sessions_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_reports" ADD CONSTRAINT "interview_reports_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_turn_id_interview_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "interview_turns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_turns" ADD CONSTRAINT "interview_turns_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_metrics" ADD CONSTRAINT "session_metrics_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webrtc_sessions" ADD CONSTRAINT "webrtc_sessions_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
