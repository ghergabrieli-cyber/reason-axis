import { eq } from "drizzle-orm";
import { getDb } from "./client";
import {
  attempts,
  practiceSessions,
  sessionItems,
  userSkillStates,
} from "./schema";

export type PersistedSkillState = {
  practiceRating: number;
  evidenceCount: number;
  accuracyEma: number;
  speedEma: number;
  consistency: number;
  reliableDifficulty: number;
  difficultyPeak: number;
};

export async function createPracticeSession(input: {
  userId: string;
  mode: "learn" | "train" | "simulation";
  sessionType:
    | "baseline"
    | "practice"
    | "brain_sprint"
    | "simulation"
    | "assessment_tomorrow"
    | "job_track";
  targetId?: string;
  durationSeconds?: number;
  configurationSnapshot?: Record<string, unknown>;
}) {
  const db = getDb();
  const startedAt = new Date();
  const expiresAt =
    input.durationSeconds === undefined
      ? null
      : new Date(startedAt.getTime() + input.durationSeconds * 1000);

  const [session] = await db
    .insert(practiceSessions)
    .values({
      userId: input.userId,
      mode: input.mode,
      sessionType: input.sessionType,
      status: "active",
      targetId: input.targetId,
      configurationSnapshot: input.configurationSnapshot ?? {},
      startedAt,
      expiresAt,
    })
    .returning();

  if (!session) {
    throw new Error("Unable to create practice session.");
  }

  return session;
}

export async function addSessionItem(input: {
  sessionId: string;
  itemVersionId: string;
  position: number;
  presentedDifficulty: number;
}) {
  const db = getDb();

  const [row] = await db
    .insert(sessionItems)
    .values({
      sessionId: input.sessionId,
      itemVersionId: input.itemVersionId,
      position: input.position,
      presentedDifficulty: input.presentedDifficulty,
      presentedAt: new Date(),
    })
    .returning();

  if (!row) {
    throw new Error("Unable to add item to session.");
  }

  return row;
}

export async function persistAttempt(input: {
  userId: string;
  sessionItemId: string;
  answerPayload: Record<string, unknown>;
  score: number;
  correct: boolean;
  responseTimeMs: number;
  skipped?: boolean;
  confidence?: number;
}) {
  const db = getDb();

  const [row] = await db
    .insert(attempts)
    .values({
      userId: input.userId,
      sessionItemId: input.sessionItemId,
      answerPayload: input.answerPayload,
      score: input.score,
      correct: input.correct,
      responseTimeMs: input.responseTimeMs,
      skipped: input.skipped ?? false,
      confidence: input.confidence,
    })
    .returning();

  if (!row) {
    throw new Error("Unable to persist attempt.");
  }

  return row;
}

export async function saveSkillState(input: {
  userId: string;
  skillId: string;
  state: PersistedSkillState;
}) {
  const db = getDb();
  const updatedAt = new Date();

  const [row] = await db
    .insert(userSkillStates)
    .values({
      userId: input.userId,
      skillId: input.skillId,
      ...input.state,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [userSkillStates.userId, userSkillStates.skillId],
      set: {
        ...input.state,
        updatedAt,
      },
    })
    .returning();

  if (!row) {
    throw new Error("Unable to save skill state.");
  }

  return row;
}

export async function completePracticeSession(sessionId: string) {
  const db = getDb();

  const [session] = await db
    .update(practiceSessions)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(practiceSessions.id, sessionId))
    .returning();

  if (!session) {
    throw new Error("Practice session was not found.");
  }

  return session;
}
