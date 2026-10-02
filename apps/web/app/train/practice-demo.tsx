"use client";

import { useRef, useState } from "react";
import {
  evaluateAnswer,
  type EvaluationResult,
  type SingleChoiceItem,
} from "@reason-axis/item-engine";

const items: SingleChoiceItem[] = [
  {
    id: "nr-percent-001",
    type: "single-choice",
    skill: "numerical.percentages",
    difficulty: 2,
    expectedTimeSeconds: 45,
    prompt:
      "A service team reduced its unresolved cases from 480 to 372. What percentage reduction did the team achieve?",
    options: [
      { id: "a", label: "18.5%" },
      { id: "b", label: "20.5%" },
      { id: "c", label: "22.5%" },
      { id: "d", label: "29.0%" },
    ],
    correctOptionId: "c",
    explanation:
      "The decrease is 108 cases. Divide 108 by the original 480: 108 ÷ 480 = 0.225, or 22.5%.",
    strategy: "Percentage change uses the original value as the denominator.",
    commonTrap: "Dividing the decrease by the new value instead of the original value.",
  },
  {
    id: "nr-ratio-001",
    type: "single-choice",
    skill: "numerical.ratios",
    difficulty: 2.5,
    expectedTimeSeconds: 50,
    prompt:
      "A buyer reviews 84 quotations. The ratio of domestic to international quotations is 4:3. How many are international?",
    options: [
      { id: "a", label: "24" },
      { id: "b", label: "32" },
      { id: "c", label: "36" },
      { id: "d", label: "48" },
    ],
    correctOptionId: "c",
    explanation:
      "There are 7 total ratio parts. 84 ÷ 7 = 12 per part, and international quotations account for 3 parts: 3 × 12 = 36.",
    strategy: "Convert the ratio into total parts before allocating the total.",
  },
  {
    id: "nr-average-001",
    type: "single-choice",
    skill: "numerical.averages",
    difficulty: 3,
    expectedTimeSeconds: 55,
    prompt:
      "Five monthly processing times average 6.4 days. Four of the months were 5.8, 6.1, 6.7 and 7.0 days. What was the fifth month?",
    options: [
      { id: "a", label: "5.9 days" },
      { id: "b", label: "6.2 days" },
      { id: "c", label: "6.4 days" },
      { id: "d", label: "6.8 days" },
    ],
    correctOptionId: "c",
    explanation:
      "Five months at an average of 6.4 total 32.0 days. The four known months total 25.6, leaving 6.4 days.",
    strategy: "Turn the average back into a total first.",
  },
  {
    id: "nr-change-002",
    type: "single-choice",
    skill: "numerical.percentage-change",
    difficulty: 3.5,
    expectedTimeSeconds: 65,
    prompt:
      "A budget rises by 12% and is then reduced by 10% from the new amount. Compared with the original budget, what is the final change?",
    options: [
      { id: "a", label: "2.0% increase" },
      { id: "b", label: "0.8% increase" },
      { id: "c", label: "0.8% decrease" },
      { id: "d", label: "2.0% decrease" },
    ],
    correctOptionId: "b",
    explanation:
      "Use a base of 100. After +12% it becomes 112. Reducing 112 by 10% gives 100.8, which is 0.8% above the original.",
    commonTrap: "Subtracting 10 from 12 as if sequential percentages shared the same base.",
  },
  {
    id: "nr-rate-001",
    type: "single-choice",
    skill: "numerical.rates",
    difficulty: 4,
    expectedTimeSeconds: 75,
    prompt:
      "A team processes 126 records in 3.5 hours. At the same average rate, how many records should it process in 5 hours?",
    options: [
      { id: "a", label: "168" },
      { id: "b", label: "175" },
      { id: "c", label: "180" },
      { id: "d", label: "189" },
    ],
    correctOptionId: "c",
    explanation:
      "The rate is 126 ÷ 3.5 = 36 records per hour. Over 5 hours: 36 × 5 = 180.",
    strategy: "Find the unit rate first, then scale.",
  },
];

type AttemptSummary = {
  itemId: string;
  correct: boolean;
  responseTimeMs: number;
};

export function PracticeDemo() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const startedAt = useRef(Date.now());

  const item = items[index];
  const finished = index >= items.length;

  if (finished) {
    const correctCount = attempts.filter((attempt) => attempt.correct).length;
    const accuracy = Math.round((correctCount / attempts.length) * 100);
    const averageSeconds =
      attempts.length === 0
        ? 0
        : Math.round(
            attempts.reduce((sum, attempt) => sum + attempt.responseTimeMs, 0) /
              attempts.length /
              1000,
          );

    return (
      <section className="resultPanel" aria-live="polite">
        <div className="eyebrow">SESSION COMPLETE</div>
        <h2>{accuracy}% accuracy</h2>
        <p>
          {correctCount} of {attempts.length} correct · {averageSeconds}s average
          response time.
        </p>
        <p className="muted">
          This is the first executable slice. The next integration will persist
          attempts and update skill state through the scoring and adaptive engines.
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setEvaluation(null);
            setAttempts([]);
            startedAt.current = Date.now();
          }}
        >
          Run again
        </button>
      </section>
    );
  }

  if (!item) return null;

  function submitAnswer() {
    if (!selected || evaluation) return;

    const result = evaluateAnswer(item, {
      type: "single-choice",
      optionId: selected,
    });

    const responseTimeMs = Date.now() - startedAt.current;
    setEvaluation(result);
    setAttempts((current) => [
      ...current,
      { itemId: item.id, correct: result.correct, responseTimeMs },
    ]);
  }

  function nextItem() {
    setIndex((current) => current + 1);
    setSelected(null);
    setEvaluation(null);
    startedAt.current = Date.now();
  }

  return (
    <section className="practiceCard">
      <div className="questionMeta">
        <span>
          Item {index + 1} / {items.length}
        </span>
        <span>Difficulty {item.difficulty.toFixed(1)} / 7</span>
        <span>Target {item.expectedTimeSeconds}s</span>
      </div>

      <h2 className="questionPrompt">{item.prompt}</h2>

      <fieldset className="choiceList" disabled={evaluation !== null}>
        <legend className="srOnly">Choose one answer</legend>
        {item.options.map((option) => (
          <label
            className={
              selected === option.id ? "choice selectedChoice" : "choice"
            }
            key={option.id}
          >
            <input
              type="radio"
              name={item.id}
              value={option.id}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      {evaluation ? (
        <div
          className={evaluation.correct ? "feedback correct" : "feedback incorrect"}
          role="status"
        >
          <strong>{evaluation.correct ? "Correct" : "Not quite"}</strong>
          <p>{evaluation.correct ? item.explanation : evaluation.feedback}</p>
          {item.strategy ? <p className="muted">Strategy: {item.strategy}</p> : null}
          {item.commonTrap ? (
            <p className="muted">Common trap: {item.commonTrap}</p>
          ) : null}
        </div>
      ) : null}

      <div className="questionActions">
        {evaluation ? (
          <button type="button" onClick={nextItem}>
            {index === items.length - 1 ? "See results" : "Next item"}
          </button>
        ) : (
          <button type="button" onClick={submitAnswer} disabled={!selected}>
            Check answer
          </button>
        )}
      </div>
    </section>
  );
}
