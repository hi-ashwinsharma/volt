import { spawn } from "node:child_process";
import { ApiRoutes, type StageLogsMutationResponse } from "@volt/types";
import {
  listUnsyncedLocalLogs,
  markLocalLogsSynced,
  readLocalVoltConfig,
} from "../local-store/sqlite-queue";

export async function flushLocalWriteAheadQueue(
  dbFilePath?: string
): Promise<{
  readonly flushedCount: number;
  readonly offlineOrSkipped: boolean;
}> {
  const unsynced = listUnsyncedLocalLogs(dbFilePath);
  if (unsynced.length === 0) {
    return { flushedCount: 0, offlineOrSkipped: false };
  }

  const config = readLocalVoltConfig();
  if (!config || !config.apiKey) {
    return { flushedCount: 0, offlineOrSkipped: true };
  }

  try {
    const res = await fetch(`${config.apiUrl}${ApiRoutes.stage.batchSync}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        logs: unsynced.map((row) => ({
          clientLogId: row.client_log_id,
          rawText: row.raw_text,
          source: row.source,
          artifactId: row.artifact_id,
          githubPrUrl: row.github_pr_url,
          createdAt: row.created_at,
        })),
      }),
    });

    if (!res.ok) {
      return { flushedCount: 0, offlineOrSkipped: true };
    }

    const body = (await res.json()) as StageLogsMutationResponse;
    markLocalLogsSynced(body.syncedClientLogIds, dbFilePath);
    return {
      flushedCount: body.syncedClientLogIds.length,
      offlineOrSkipped: false,
    };
  } catch {
    return { flushedCount: 0, offlineOrSkipped: true };
  }
}

export function spawnDetachedFlushWorker(): void {
  try {
    const scriptPath = process.argv[1];
    if (!scriptPath) {
      return;
    }
    const child = spawn(process.execPath, [scriptPath, "__daemon_flush"], {
      detached: true,
      stdio: "ignore",
      env: process.env,
    });
    child.unref();
  } catch {
    // Non-blocking background sync fallback
  }
}
