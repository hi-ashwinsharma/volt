import { Database } from "bun:sqlite";
import { randomUUID } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type {
  CaptureSource,
  LocalQueuedLogRow,
  LocalVoltConfig,
} from "@volt/types";

export function getVoltHomeDir(): string {
  const customDir = process.env["VOLT_HOME_DIR"];
  const dir = customDir ?? join(homedir(), ".volt");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  return dir;
}

export function getLocalConfigPath(): string {
  return join(getVoltHomeDir(), "config.json");
}

export function readLocalVoltConfig(): LocalVoltConfig | null {
  const path = getLocalConfigPath();
  if (!existsSync(path)) {
    const envKey = process.env["VOLT_API_KEY"];
    if (envKey) {
      return {
        apiUrl: process.env["VOLT_API_URL"] ?? "http://localhost:8080",
        apiKey: envKey,
        userHandle: process.env["VOLT_USER_HANDLE"] ?? "ashwin",
        defaultDomain: "engineering",
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  }
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as LocalVoltConfig;
}

export function writeLocalVoltConfig(config: LocalVoltConfig): void {
  const path = getLocalConfigPath();
  writeFileSync(path, JSON.stringify(config, null, 2), { mode: 0o600 });
  try {
    chmodSync(path, 0o600);
  } catch {
    // Ignore permission error on non-POSIX filesystems
  }
}

export function openLocalQueueDb(dbFilePath?: string): Database {
  const targetPath = dbFilePath ?? join(getVoltHomeDir(), "queue.sqlite");
  const db = new Database(targetPath, { create: true });
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS local_staged_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_log_id TEXT UNIQUE NOT NULL,
      raw_text TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'cli',
      artifact_id TEXT,
      github_pr_url TEXT,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      synced_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_local_unsynced ON local_staged_queue(synced, created_at);
  `);
  return db;
}

export function enqueueLocalMicroLog(params: {
  readonly rawText: string;
  readonly source?: CaptureSource;
  readonly artifactId?: string | null;
  readonly githubPrUrl?: string | null;
  readonly dbFilePath?: string;
}): LocalQueuedLogRow {
  const db = openLocalQueueDb(params.dbFilePath);
  const clientLogId = randomUUID();
  const createdAt = new Date().toISOString();
  const source = params.source ?? "cli";

  const stmt = db.prepare(`
    INSERT INTO local_staged_queue (client_log_id, raw_text, source, artifact_id, github_pr_url, created_at, synced)
    VALUES ($clientLogId, $rawText, $source, $artifactId, $githubPrUrl, $createdAt, 0)
    RETURNING *
  `);

  const inserted = stmt.get({
    $clientLogId: clientLogId,
    $rawText: params.rawText.trim(),
    $source: source,
    $artifactId: params.artifactId ?? null,
    $githubPrUrl: params.githubPrUrl ?? null,
    $createdAt: createdAt,
  }) as LocalQueuedLogRow;

  db.close();
  return inserted;
}

export function listUnsyncedLocalLogs(
  dbFilePath?: string
): LocalQueuedLogRow[] {
  const db = openLocalQueueDb(dbFilePath);
  const rows = db
    .query(
      "SELECT * FROM local_staged_queue WHERE synced = 0 ORDER BY id ASC LIMIT 100"
    )
    .all() as LocalQueuedLogRow[];
  db.close();
  return rows;
}

export function markLocalLogsSynced(
  clientLogIds: readonly string[],
  dbFilePath?: string
): void {
  if (clientLogIds.length === 0) {
    return;
  }
  const db = openLocalQueueDb(dbFilePath);
  const nowIso = new Date().toISOString();
  const updateStmt = db.prepare(
    "UPDATE local_staged_queue SET synced = 1, synced_at = $syncedAt WHERE client_log_id = $clientLogId"
  );
  const tx = db.transaction((ids: readonly string[]) => {
    for (const id of ids) {
      updateStmt.run({ $syncedAt: nowIso, $clientLogId: id });
    }
  });
  tx(clientLogIds);
  db.close();
}

export function clearSyncedLocalLogs(dbFilePath?: string): void {
  const db = openLocalQueueDb(dbFilePath);
  db.exec("DELETE FROM local_staged_queue WHERE synced = 1;");
  db.close();
}
