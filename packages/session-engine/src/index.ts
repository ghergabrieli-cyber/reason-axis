export type SessionClock = {
  startedAt: Date;
  expiresAt: Date | null;
};

export function createSessionClock(input: {
  now?: Date;
  durationSeconds?: number;
}): SessionClock {
  const startedAt = input.now ?? new Date();
  const expiresAt =
    input.durationSeconds === undefined
      ? null
      : new Date(startedAt.getTime() + input.durationSeconds * 1000);

  return { startedAt, expiresAt };
}

export function remainingMilliseconds(clock: SessionClock, now = new Date()) {
  if (!clock.expiresAt) return null;
  return Math.max(0, clock.expiresAt.getTime() - now.getTime());
}

export function sessionExpired(clock: SessionClock, now = new Date()) {
  const remaining = remainingMilliseconds(clock, now);
  return remaining !== null && remaining <= 0;
}

export type CandidateItem = {
  id: string;
  difficulty: number;
  skillId: string;
  quality: number;
  exposureCount: number;
  recentlySeen: boolean;
  adaptiveAllowed: boolean;
};

export type SelectionContext = {
  targetSkillId: string;
  targetDifficulty: number;
  exploration: number;
};

export function rankCandidates(
  candidates: CandidateItem[],
  context: SelectionContext,
) {
  return candidates
    .filter(
      (candidate) =>
        candidate.skillId === context.targetSkillId &&
        candidate.adaptiveAllowed &&
        !candidate.recentlySeen,
    )
    .map((candidate) => {
      const difficultyDistance = Math.abs(
        candidate.difficulty - context.targetDifficulty,
      );
      const suitability =
        candidate.quality * 0.5 +
        (1 - Math.min(difficultyDistance / 3, 1)) * 0.35 +
        (1 - Math.min(candidate.exposureCount / 25, 1)) * 0.15;

      return { candidate, suitability };
    })
    .sort((a, b) => b.suitability - a.suitability);
}
