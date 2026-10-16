import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

let cachedSql: Sql | null = null;
let cachedDb: PostgresJsDatabase<typeof schema> | null = null;

export function getSqlClient(connectionString?: string): Sql {
  if (cachedSql) {
    return cachedSql;
  }
  const url = connectionString ?? process.env["DATABASE_URL"];
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Please set DATABASE_URL in .env."
    );
  }
  cachedSql = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return cachedSql;
}

export function getDb(
  connectionString?: string
): PostgresJsDatabase<typeof schema> {
  if (cachedDb) {
    return cachedDb;
  }
  const sqlClient = getSqlClient(connectionString);
  cachedDb = drizzle(sqlClient, { schema });
  return cachedDb;
}

export async function closeDbConnection(): Promise<void> {
  if (cachedSql) {
    await cachedSql.end({ timeout: 5 });
    cachedSql = null;
    cachedDb = null;
  }
}
