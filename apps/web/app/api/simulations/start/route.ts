import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getPublicSimulationItems,
  simulationBlueprint,
} from "@/lib/simulation-bank.server";
import { signSimulationToken } from "@/lib/simulation-token";

export async function POST() {
  try {
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + simulationBlueprint.durationSeconds * 1000,
    );

    const token = signSimulationToken({
      sessionId: randomUUID(),
      blueprintId: simulationBlueprint.id,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    return NextResponse.json({
      token,
      blueprint: {
        id: simulationBlueprint.id,
        title: simulationBlueprint.title,
        durationSeconds: simulationBlueprint.durationSeconds,
      },
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      items: getPublicSimulationItems(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to start simulation.",
      },
      { status: 503 },
    );
  }
}
