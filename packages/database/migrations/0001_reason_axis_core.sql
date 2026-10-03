-- REASON AXIS core schema
-- Source of truth: packages/database/src/schema.ts
-- Apply to a fresh PostgreSQL database only.

CREATE TYPE "skill_status" AS ENUM ('draft', 'active', 'retired');
CREATE TYPE "skill_relation_type" AS ENUM ('parent_of', 'prerequisite_of', 'related_to', 'transfers_to');
CREATE TYPE "item_status" AS ENUM ('draft', 'internal_review', 'content_qa', 'technical_qa', 'pilot', 'active', 'monitor', 'retired');
CREATE TYPE "session_mode" AS ENUM ('learn', 'train', 'simulation');
CREATE TYPE "session_type" AS ENUM ('baseline', 'practice', 'brain_sprint', 'simulation', 'assessment_tomorrow', 'job_track');
CREATE TYPE "session_status" AS ENUM ('created', 'active', 'completed', 'expired', 'abandoned');
CREATE TYPE "recommendation_status" AS ENUM ('active', 'completed', 'dismissed', 'expired');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "last_active_at" timestamptz
);

CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email");

CREATE TABLE "user_profiles" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "display_name" text,
  "country" text,
  "timezone" text,
  "preferred_locale" text DEFAULT 'en' NOT NULL,
  "accessibility_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL
);

CREATE TABLE "skills" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "domain" text NOT NULL,
  "description" text NOT NULL,
  "status" "skill_status" DEFAULT 'draft' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "skills_slug_idx" ON "skills" ("slug");
CREATE INDEX "skills_domain_idx" ON "skills" ("domain");

CREATE TABLE "skill_relations" (
  "source_skill_id" uuid NOT NULL REFERENCES "skills"("id") ON DELETE cascade,
  "target_skill_id" uuid NOT NULL REFERENCES "skills"("id") ON DELETE cascade,
  "relation_type" "skill_relation_type" NOT NULL,
  "weight" real DEFAULT 1 NOT NULL,
  PRIMARY KEY ("source_skill_id", "target_skill_id", "relation_type")
);

CREATE TABLE "item_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "skill_id" uuid NOT NULL REFERENCES "skills"("id"),
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "item_templates_code_idx" ON "item_templates" ("code");

CREATE TABLE "item_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "template_id" uuid NOT NULL REFERENCES "item_templates"("id") ON DELETE cascade,
  "version" integer NOT NULL,
  "item_type" text NOT NULL,
  "difficulty_author" real NOT NULL,
  "difficulty_empirical" real,
  "expected_time_seconds" integer NOT NULL,
  "language" text NOT NULL,
  "locale" text NOT NULL,
  "prompt_payload" jsonb NOT NULL,
  "response_schema" jsonb NOT NULL,
  "scoring_schema" jsonb NOT NULL,
  "explanation_payload" jsonb NOT NULL,
  "prerequisite_skill_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "adaptive_allowed" boolean DEFAULT true NOT NULL,
  "simulation_allowed" boolean DEFAULT true NOT NULL,
  "provenance" jsonb NOT NULL,
  "status" "item_status" DEFAULT 'draft' NOT NULL,
  "published_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "item_versions_template_version_idx" ON "item_versions" ("template_id", "version");
CREATE INDEX "item_versions_status_idx" ON "item_versions" ("status");

CREATE TABLE "practice_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "session_type" "session_type" NOT NULL,
  "mode" "session_mode" NOT NULL,
  "status" "session_status" DEFAULT 'created' NOT NULL,
  "target_id" uuid,
  "configuration_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "started_at" timestamptz,
  "expires_at" timestamptz,
  "completed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "practice_sessions_user_status_idx" ON "practice_sessions" ("user_id", "status");

CREATE TABLE "session_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "practice_sessions"("id") ON DELETE cascade,
  "item_version_id" uuid NOT NULL REFERENCES "item_versions"("id"),
  "position" integer NOT NULL,
  "presented_difficulty" real NOT NULL,
  "presented_at" timestamptz
);

CREATE UNIQUE INDEX "session_items_session_position_idx" ON "session_items" ("session_id", "position");

CREATE TABLE "attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "session_item_id" uuid NOT NULL REFERENCES "session_items"("id") ON DELETE cascade,
  "answer_payload" jsonb NOT NULL,
  "score" real NOT NULL,
  "correct" boolean NOT NULL,
  "response_time_ms" integer NOT NULL,
  "skipped" boolean DEFAULT false NOT NULL,
  "confidence" integer,
  "submitted_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "attempts_session_item_idx" ON "attempts" ("session_item_id");
CREATE INDEX "attempts_user_submitted_idx" ON "attempts" ("user_id", "submitted_at");

CREATE TABLE "user_skill_states" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "skill_id" uuid NOT NULL REFERENCES "skills"("id") ON DELETE cascade,
  "practice_rating" real DEFAULT 3.5 NOT NULL,
  "evidence_count" integer DEFAULT 0 NOT NULL,
  "accuracy_ema" real DEFAULT 0.5 NOT NULL,
  "speed_ema" real DEFAULT 0.5 NOT NULL,
  "consistency" real DEFAULT 0.5 NOT NULL,
  "reliable_difficulty" real DEFAULT 1 NOT NULL,
  "difficulty_peak" real DEFAULT 1 NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "skill_id")
);

CREATE TABLE "recommendations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "skill_id" uuid REFERENCES "skills"("id"),
  "reason" text NOT NULL,
  "expected_minutes" integer NOT NULL,
  "priority" integer NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" "recommendation_status" DEFAULT 'active' NOT NULL,
  "expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "recommendations_user_status_priority_idx"
  ON "recommendations" ("user_id", "status", "priority");
