import { readFileSync } from "node:fs";
import { join } from "node:path";
import { closeDbConnection, getSqlClient } from "./client";

export async function runDatabaseMigrations(
  connectionString?: string
): Promise<void> {
  const sql = getSqlClient(connectionString);
  const migrationPath = join(
    import.meta.dir,
    "../migrations/0000_initial_volt_schema.sql"
  );
  const ddl = readFileSync(migrationPath, "utf-8");
  await sql.unsafe(ddl);
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
