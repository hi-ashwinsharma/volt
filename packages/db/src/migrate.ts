import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { closeDbConnection, getSqlClient } from "./client";

export async function runDatabaseMigrations(
  connectionString?: string
): Promise<void> {
  const sql = getSqlClient(connectionString);
  const migrationsDir = join(import.meta.dir, "../migrations");
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await sql.unsafe(readFileSync(join(migrationsDir, file), "utf-8"));
  }
}

if (import.meta.main) {
  runDatabaseMigrations()
    .then(async () => {
      console.log("[OK] PostgreSQL 16 schema and immutable score_audits trigger applied.");
      await closeDbConnection();
    })
    .catch(async (err: Error) => {
      console.error("[ERROR] Migration failed:", err.message);
      await closeDbConnection();
      process.exit(1);
    });
}
