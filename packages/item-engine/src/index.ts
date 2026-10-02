export type ItemOption = {
  id: string;
  label: string;
};

type BasePracticeItem = {
  id: string;
  skill: string;
  difficulty: number;
  expectedTimeSeconds: number;
  prompt: string;
  explanation: string;
  strategy?: string;
  commonTrap?: string;
};

export type SingleChoiceItem = BasePracticeItem & {
  type: "single-choice";
  options: ItemOption[];
  correctOptionId: string;
};

export type NumericEntryItem = BasePracticeItem & {
  type: "numeric-entry";
  correctValue: number;
  tolerance?: number;
};

export type PracticeItem = SingleChoiceItem | NumericEntryItem;

export type ItemAnswer =
  | { type: "single-choice"; optionId: string }
  | { type: "numeric-entry"; value: number };

export type EvaluationResult = {
  correct: boolean;
  partialCredit: number;
  feedback: string;
};

export function evaluateAnswer(
  item: PracticeItem,
  answer: ItemAnswer,
): EvaluationResult {
  if (item.type !== answer.type) {
    return {
      correct: false,
      partialCredit: 0,
      feedback: "The submitted answer format does not match this item.",
    };
  }

  if (item.type === "single-choice" && answer.type === "single-choice") {
    const correct = answer.optionId === item.correctOptionId;
    return {
      correct,
      partialCredit: correct ? 1 : 0,
      feedback: correct ? "Correct." : item.explanation,
    };
  }

  if (item.type === "numeric-entry" && answer.type === "numeric-entry") {
    const tolerance = item.tolerance ?? 0;
    const correct = Math.abs(answer.value - item.correctValue) <= tolerance;
    return {
      correct,
      partialCredit: correct ? 1 : 0,
      feedback: correct ? "Correct." : item.explanation,
    };
  }

  return {
    correct: false,
    partialCredit: 0,
    feedback: "Unable to evaluate this answer.",
  };
}
