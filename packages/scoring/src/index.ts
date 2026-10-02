export type AttemptMeasurement = {
  correct: boolean;
  partialCredit?: number;
  responseTimeMs: number;
  expectedTimeMs: number;
  difficulty: number;
  skipped?: boolean;
};

export type SkillState = {
  practiceRating: number;
  evidenceCount: number;
  accuracyEma: number;
  speedEma: number;
  consistency: number;
  reliableDifficulty: number;
  difficultyPeak: number;
};

export type ScoredAttempt = {
  score: number;
  accuracy: number;
  speedEfficiency: number;
  difficultyCredit: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function scoreAttempt(input: AttemptMeasurement): ScoredAttempt {
  const accuracy = input.skipped
    ? 0
    : clamp(input.partialCredit ?? (input.correct ? 1 : 0));

  const speedRatio =
    input.responseTimeMs > 0
      ? input.expectedTimeMs / input.responseTimeMs
      : 0;

  const speedEfficiency = input.correct
    ? clamp(speedRatio, 0, 1.25) / 1.25
    : 0;

  const difficultyCredit = clamp((input.difficulty - 1) / 6);

  // Accuracy dominates. Speed cannot rescue an incorrect answer.
  const score =
    accuracy * (0.82 + 0.1 * speedEfficiency + 0.08 * difficultyCredit);

  return {
    score: clamp(score),
    accuracy,
    speedEfficiency: clamp(speedEfficiency),
    difficultyCredit,
  };
}

export function updateSkillState(
  previous: SkillState,
  attempt: AttemptMeasurement,
): SkillState {
  const measured = scoreAttempt(attempt);
  const alpha = previous.evidenceCount < 10 ? 0.24 : 0.12;

  const accuracyEma =
    previous.accuracyEma * (1 - alpha) + measured.accuracy * alpha;

  const speedEma =
    previous.speedEma * (1 - alpha) + measured.speedEfficiency * alpha;

  const successSignal = measured.accuracy >= 0.75 ? 1 : measured.accuracy <= 0.25 ? -1 : 0;
  const challengeGap = attempt.difficulty - previous.practiceRating;
  const ratingDelta = successSignal * (0.13 + Math.max(0, challengeGap) * 0.04);

  const practiceRating = clamp(previous.practiceRating + ratingDelta, 1, 7);
  const evidenceCount = previous.evidenceCount + 1;

  const reliableDifficulty =
    accuracyEma >= 0.72
      ? Math.max(previous.reliableDifficulty, Math.min(attempt.difficulty, practiceRating))
      : previous.reliableDifficulty;

  return {
    practiceRating,
    evidenceCount,
    accuracyEma,
    speedEma,
    consistency: clamp(
      previous.consistency * 0.9 + (1 - Math.abs(measured.accuracy - previous.accuracyEma)) * 0.1,
    ),
    reliableDifficulty,
    difficultyPeak: Math.max(previous.difficultyPeak, attempt.difficulty),
  };
}

export function readinessEvidenceConfidence(input: {
  relevantAttempts: number;
  distinctItems: number;
  simulations: number;
  skillCoverage: number;
  recencyFactor: number;
}): number {
  const evidence =
    Math.min(input.relevantAttempts / 80, 1) * 0.35 +
    Math.min(input.distinctItems / 60, 1) * 0.2 +
    Math.min(input.simulations / 4, 1) * 0.2 +
    clamp(input.skillCoverage) * 0.15 +
    clamp(input.recencyFactor) * 0.1;

  return clamp(evidence);
}

export function shrinkReadiness(rawScore: number, confidence: number, neutral = 50) {
  const safeRaw = Math.min(100, Math.max(0, rawScore));
  const safeConfidence = clamp(confidence);
  return neutral + safeConfidence * (safeRaw - neutral);
}
