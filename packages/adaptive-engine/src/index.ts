export type AdaptiveSignal = {
  recentAccuracy: number;
  recentSpeedEfficiency: number;
  consecutiveErrors: number;
  evidenceCount: number;
  currentDifficulty: number;
};

export type AdaptiveDecision = {
  nextDifficulty: number;
  action: "increase" | "hold" | "decrease" | "learn";
  reason: string;
};

const clampDifficulty = (value: number) => Math.min(7, Math.max(1, value));

export function decideNextDifficulty(signal: AdaptiveSignal): AdaptiveDecision {
  if (signal.consecutiveErrors >= 3 && signal.recentAccuracy < 0.45) {
    return {
      nextDifficulty: clampDifficulty(signal.currentDifficulty - 0.6),
      action: "learn",
      reason: "Repeated errors indicate a likely concept or prerequisite gap.",
    };
  }

  if (signal.evidenceCount < 6) {
    return {
      nextDifficulty: clampDifficulty(
        signal.currentDifficulty + (signal.recentAccuracy >= 0.75 ? 0.25 : -0.1),
      ),
      action: "hold",
      reason: "Low evidence: continue controlled exploration before making a large adjustment.",
    };
  }

  if (signal.recentAccuracy >= 0.82 && signal.recentSpeedEfficiency >= 0.62) {
    return {
      nextDifficulty: clampDifficulty(signal.currentDifficulty + 0.4),
      action: "increase",
      reason: "Strong accuracy with acceptable efficiency supports a higher challenge.",
    };
  }

  if (signal.recentAccuracy >= 0.78 && signal.recentSpeedEfficiency < 0.5) {
    return {
      nextDifficulty: signal.currentDifficulty,
      action: "hold",
      reason: "Accuracy is strong; maintain difficulty and train efficiency.",
    };
  }

  if (signal.recentAccuracy < 0.58) {
    return {
      nextDifficulty: clampDifficulty(signal.currentDifficulty - 0.35),
      action: "decrease",
      reason: "Accuracy is below the reliable training range.",
    };
  }

  return {
    nextDifficulty: signal.currentDifficulty,
    action: "hold",
    reason: "Performance is in the productive training zone.",
  };
}
