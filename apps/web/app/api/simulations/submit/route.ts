import { NextResponse } from "next/server";
import { simulationBlueprint } from "@/lib/simulation-bank.server";
import { verifySimulationToken } from "@/lib/simulation-token";

type Submission = {
  token?: unknown;
  answers?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Submission;

    if (typeof body.token !== "string") {
      return NextResponse.json({ error: "Missing simulation token." }, { status: 400 });
    }

    if (
      typeof body.answers !== "object" ||
      body.answers === null ||
      Array.isArray(body.answers)
    ) {
      return NextResponse.json({ error: "Invalid answers payload." }, { status: 400 });
    }

    const payload = verifySimulationToken(body.token);

    if (payload.blueprintId !== simulationBlueprint.id) {
      return NextResponse.json({ error: "Unknown simulation blueprint." }, { status: 400 });
    }

    const now = new Date();
    const startedAt = new Date(payload.startedAt);
    const expiresAt = new Date(payload.expiresAt);
    const timedOut = now.getTime() > expiresAt.getTime();
    const elapsedMs = Math.max(0, now.getTime() - startedAt.getTime());
    const answerMap = body.answers as Record<string, unknown>;

    const itemResults = simulationBlueprint.items.map((item) => {
      const selected = answerMap[item.id];
      const correct =
        typeof selected === "string" && selected === item.correctOptionId;

      return {
        itemId: item.id,
        skill: item.skill,
        difficulty: item.difficulty,
        selectedOptionId: typeof selected === "string" ? selected : null,
        correct,
        correctOptionId: item.correctOptionId,
        explanation: item.explanation,
      };
    });

    const correctCount = itemResults.filter((result) => result.correct).length;
    const accuracy = correctCount / itemResults.length;
    const allowedMs = simulationBlueprint.durationSeconds * 1000;
    const timeEfficiency = Math.min(1, allowedMs / Math.max(elapsedMs, 1));
    const score = Math.round(
      accuracy * 90 + (timedOut ? 0 : timeEfficiency * 10),
    );

    return NextResponse.json({
      sessionId: payload.sessionId,
      timedOut,
      elapsedMs,
      correctCount,
      totalItems: itemResults.length,
      accuracy: Math.round(accuracy * 100),
      timeEfficiency: Math.round(timeEfficiency * 100),
      score,
      results: itemResults,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to score simulation.",
      },
      { status: 400 },
    );
  }
}
