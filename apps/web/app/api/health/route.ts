import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@reason-axis/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await checkDatabaseHealth();

  const checks = {
    application: true,
    database,
    simulationSigningSecret: Boolean(process.env.SIMULATION_SIGNING_SECRET),
  };

  const ready =
    checks.application &&
    checks.database.reachable &&
    checks.database.schemaReady &&
    checks.simulationSigningSecret;

  return NextResponse.json(
    {
      service: "reason-axis",
      status: ready ? "ready" : "degraded",
      checks,
    },
    { status: ready ? 200 : 503 },
  );
}
