import { createHmac, timingSafeEqual } from "node:crypto";

export type SimulationTokenPayload = {
  sessionId: string;
  blueprintId: string;
  startedAt: string;
  expiresAt: string;
};

function getSecret() {
  const secret = process.env.SIMULATION_SIGNING_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "reason-axis-local-development-secret";
  }

  throw new Error("SIMULATION_SIGNING_SECRET is not configured.");
}

export function signSimulationToken(payload: SimulationTokenPayload) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

export function verifySimulationToken(token: string): SimulationTokenPayload {
  const [encoded, suppliedSignature] = token.split(".");

  if (!encoded || !suppliedSignature) {
    throw new Error("Malformed simulation token.");
  }

  const expectedSignature = createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    throw new Error("Invalid simulation token.");
  }

  const parsed = JSON.parse(
    Buffer.from(encoded, "base64url").toString("utf8"),
  ) as SimulationTokenPayload;

  if (
    !parsed.sessionId ||
    !parsed.blueprintId ||
    !parsed.startedAt ||
    !parsed.expiresAt
  ) {
    throw new Error("Invalid simulation token payload.");
  }

  return parsed;
}
