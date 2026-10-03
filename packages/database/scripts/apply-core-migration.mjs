import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const here = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(here, "../migrations/0001_reason_axis_core.sql");
const migration = await readFile(migrationPath, "utf8");
const sql = neon(databaseUrl);

const existing = await sql("select to_regclass('public.users') as users_table");

if (existing[0]?.users_table) {
  console.log("REASON AXIS core schema already exists; migration skipped.");
  process.exit(0);
}

await sql.transaction([migration]);

console.log("REASON AXIS core schema applied successfully.");
