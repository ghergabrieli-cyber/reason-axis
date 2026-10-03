import { sql } from "drizzle-orm";
import { getDb } from "./client";

export async function checkDatabaseHealth() {
  if (!process.env.DATABASE_URL) {
    return {
      configured: false,
      reachable: false,
      schemaReady: false,
    };
  }

  try {
    const db = getDb();
    await db.execute(sql.raw("select 1 as ok"));
    const schema = await db.execute(
      sql.raw("select to_regclass('public.users') as users_table"),
    );

    const first = schema.rows[0] as { users_table?: string | null } | undefined;

    return {
      configured: true,
      reachable: true,
      schemaReady: Boolean(first?.users_table),
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      schemaReady: false,
    };
  }
}
