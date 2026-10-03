"use client";

import { useEffect, useState } from "react";

type PublicItem = {
  id: string;
  skill: string;
  difficulty: number;
  prompt: string;
  options: Array<{ id: string; label: string }>;
};

type StartedSimulation = {
  token: string;
  blueprint: {
    id: string;
    title: string;
    durationSeconds: number;
  };
  startedAt: string;
  expiresAt: string;
  items: PublicItem[];
};

type SimulationReport = {
  timedOut: boolean;
  elapsedMs: number;
  correctCount: number;
  totalItems: number;
  accuracy: number;
  timeEfficiency: number;
  score: number;
  results: Array<{
    itemId: string;
    correct: boolean;
    correctOptionId: string;
    explanation: string;
  }>;
};

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SimulationClient() {
  const [session, setSession] = useState<StartedSimulation | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingMs, setRemainingMs] = useState(0);
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || report) return;

    const update = () => {
      setRemainingMs(
        Math.max(0, new Date(session.expiresAt).getTime() - Date.now()),
      );
    };

    update();
    const timer = window.setInterval(update, 250);

    return () => window.clearInterval(timer);
  }, [session, report]);

  async function start() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/simulations/start", { method: "POST" });
      const data = (await response.json()) as StartedSimulation & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start simulation.");
      }

      setSession(data);
      setAnswers({});
      setReport(null);
      setRemainingMs(new Date(data.expiresAt).getTime() - Date.now());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start simulation.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!session) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/simulations/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: session.token, answers }),
      });
      const data = (await response.json()) as SimulationReport & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to score simulation.");
      }

      setReport(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to score simulation.");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <section className="resultPanel">
        <div className="eyebrow">READY</div>
        <h2>4 minutes · 4 items</h2>
        <p className="muted">
          Once you start, the expiry time is signed by the server. The browser
          displays the clock but does not control it.
        </p>
        {error ? <p className="errorText">{error}</p> : null}
        <button type="button" onClick={start} disabled={busy}>
          {busy ? "Starting…" : "Start timed simulation"}
        </button>
      </section>
    );
  }

  if (report) {
    return (
      <section className="resultPanel" aria-live="polite">
        <div className="eyebrow">
          {report.timedOut ? "TIME EXPIRED · REPORT" : "SIMULATION COMPLETE"}
        </div>
        <h2>{report.score}/100 practice score</h2>
        <div className="metricGrid">
          <div><span>Accuracy</span><strong>{report.accuracy}%</strong></div>
          <div><span>Correct</span><strong>{report.correctCount}/{report.totalItems}</strong></div>
          <div><span>Time efficiency</span><strong>{report.timeEfficiency}%</strong></div>
          <div><span>Elapsed</span><strong>{Math.round(report.elapsedMs / 1000)}s</strong></div>
        </div>

        <div className="reportList">
          {session.items.map((item) => {
            const result = report.results.find((candidate) => candidate.itemId === item.id);
            if (!result) return null;
            const correctLabel =
              item.options.find((option) => option.id === result.correctOptionId)?.label ??
              result.correctOptionId;

            return (
              <article className="reportItem" key={item.id}>
                <div className={result.correct ? "reportMark goodMark" : "reportMark badMark"}>
                  {result.correct ? "Correct" : "Review"}
                </div>
                <h3>{item.prompt}</h3>
                <p>Correct answer: <strong>{correctLabel}</strong></p>
                <p className="muted">{result.explanation}</p>
              </article>
            );
          })}
        </div>

        <button type="button" onClick={start} disabled={busy}>
          Run another simulation
        </button>
      </section>
    );
  }

  return (
    <section className="practiceCard">
      <div className="simulationTopbar">
        <div>
          <span>Server timer</span>
          <strong>{formatRemaining(remainingMs)}</strong>
        </div>
        <div>
          <span>Answered</span>
          <strong>{Object.keys(answers).length}/{session.items.length}</strong>
        </div>
      </div>

      <div className="simulationItems">
        {session.items.map((item, index) => (
          <article className="simulationItem" key={item.id}>
            <div className="questionMeta">
              <span>Item {index + 1}</span>
              <span>{item.skill}</span>
              <span>Difficulty {item.difficulty.toFixed(1)}</span>
            </div>
            <h2 className="simulationPrompt">{item.prompt}</h2>
            <fieldset className="choiceList">
              <legend className="srOnly">Choose one answer</legend>
              {item.options.map((option) => (
                <label
                  className={
                    answers[item.id] === option.id
                      ? "choice selectedChoice"
                      : "choice"
                  }
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={item.id}
                    value={option.id}
                    checked={answers[item.id] === option.id}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [item.id]: option.id,
                      }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
          </article>
        ))}
      </div>

      {error ? <p className="errorText">{error}</p> : null}
      <div className="questionActions">
        <button type="button" onClick={submit} disabled={busy}>
          {busy ? "Scoring…" : remainingMs <= 0 ? "Submit after time" : "Submit simulation"}
        </button>
      </div>
    </section>
  );
}
