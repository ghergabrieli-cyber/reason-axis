import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const skillStatusEnum = pgEnum("skill_status", ["draft", "active", "retired"]);
export const relationTypeEnum = pgEnum("skill_relation_type", [
  "parent_of",
  "prerequisite_of",
  "related_to",
  "transfers_to",
]);
export const itemStatusEnum = pgEnum("item_status", [
  "draft",
  "internal_review",
  "content_qa",
  "technical_qa",
  "pilot",
  "active",
  "monitor",
  "retired",
]);
export const sessionModeEnum = pgEnum("session_mode", ["learn", "train", "simulation"]);
export const sessionTypeEnum = pgEnum("session_type", [
  "baseline",
  "practice",
  "brain_sprint",
  "simulation",
  "assessment_tomorrow",
  "job_track",
]);
export const sessionStatusEnum = pgEnum("session_status", [
  "created",
  "active",
  "completed",
  "expired",
  "abandoned",
]);
export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "active",
  "completed",
  "dismissed",
  "expired",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  country: text("country"),
  timezone: text("timezone"),
  preferredLocale: text("preferred_locale").notNull().default("en"),
  accessibilityPreferences: jsonb("accessibility_preferences").$type<Record<string, unknown>>().notNull().default({}),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  description: text("description").notNull(),
  status: skillStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("skills_slug_idx").on(table.slug),
  domainIdx: index("skills_domain_idx").on(table.domain),
}));

export const skillRelations = pgTable("skill_relations", {
  sourceSkillId: uuid("source_skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  targetSkillId: uuid("target_skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  relationType: relationTypeEnum("relation_type").notNull(),
  weight: real("weight").notNull().default(1),
}, (table) => ({
  pk: primaryKey({ columns: [table.sourceSkillId, table.targetSkillId, table.relationType] }),
}));

export const itemTemplates = pgTable("item_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  skillId: uuid("skill_id").notNull().references(() => skills.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("item_templates_code_idx").on(table.code),
}));

export const itemVersions = pgTable("item_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull().references(() => itemTemplates.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  itemType: text("item_type").notNull(),
  difficultyAuthor: real("difficulty_author").notNull(),
  difficultyEmpirical: real("difficulty_empirical"),
  expectedTimeSeconds: integer("expected_time_seconds").notNull(),
  language: text("language").notNull(),
  locale: text("locale").notNull(),
  promptPayload: jsonb("prompt_payload").$type<Record<string, unknown>>().notNull(),
  responseSchema: jsonb("response_schema").$type<Record<string, unknown>>().notNull(),
  scoringSchema: jsonb("scoring_schema").$type<Record<string, unknown>>().notNull(),
  explanationPayload: jsonb("explanation_payload").$type<Record<string, unknown>>().notNull(),
  prerequisiteSkillIds: jsonb("prerequisite_skill_ids").$type<string[]>().notNull().default([]),
  adaptiveAllowed: boolean("adaptive_allowed").notNull().default(true),
  simulationAllowed: boolean("simulation_allowed").notNull().default(true),
  provenance: jsonb("provenance").$type<Record<string, unknown>>().notNull(),
  status: itemStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  templateVersionIdx: uniqueIndex("item_versions_template_version_idx").on(table.templateId, table.version),
  statusIdx: index("item_versions_status_idx").on(table.status),
}));

export const practiceSessions = pgTable("practice_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionType: sessionTypeEnum("session_type").notNull(),
  mode: sessionModeEnum("mode").notNull(),
  status: sessionStatusEnum("status").notNull().default("created"),
  targetId: uuid("target_id"),
  configurationSnapshot: jsonb("configuration_snapshot").$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userStatusIdx: index("practice_sessions_user_status_idx").on(table.userId, table.status),
}));

export const sessionItems = pgTable("session_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }),
  itemVersionId: uuid("item_version_id").notNull().references(() => itemVersions.id),
  position: integer("position").notNull(),
  presentedDifficulty: real("presented_difficulty").notNull(),
  presentedAt: timestamp("presented_at", { withTimezone: true }),
}, (table) => ({
  sessionPositionIdx: uniqueIndex("session_items_session_position_idx").on(table.sessionId, table.position),
}));

export const attempts = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionItemId: uuid("session_item_id").notNull().references(() => sessionItems.id, { onDelete: "cascade" }),
  answerPayload: jsonb("answer_payload").$type<Record<string, unknown>>().notNull(),
  score: real("score").notNull(),
  correct: boolean("correct").notNull(),
  responseTimeMs: integer("response_time_ms").notNull(),
  skipped: boolean("skipped").notNull().default(false),
  confidence: integer("confidence"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sessionItemIdx: uniqueIndex("attempts_session_item_idx").on(table.sessionItemId),
  userSubmittedIdx: index("attempts_user_submitted_idx").on(table.userId, table.submittedAt),
}));

export const userSkillStates = pgTable("user_skill_states", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  practiceRating: real("practice_rating").notNull().default(3.5),
  evidenceCount: integer("evidence_count").notNull().default(0),
  accuracyEma: real("accuracy_ema").notNull().default(0.5),
  speedEma: real("speed_ema").notNull().default(0.5),
  consistency: real("consistency").notNull().default(0.5),
  reliableDifficulty: real("reliable_difficulty").notNull().default(1),
  difficultyPeak: real("difficulty_peak").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.skillId] }),
}));

export const recommendations = pgTable("recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").references(() => skills.id),
  reason: text("reason").notNull(),
  expectedMinutes: integer("expected_minutes").notNull(),
  priority: integer("priority").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status: recommendationStatusEnum("status").notNull().default("active"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userStatusPriorityIdx: index("recommendations_user_status_priority_idx").on(table.userId, table.status, table.priority),
}));
