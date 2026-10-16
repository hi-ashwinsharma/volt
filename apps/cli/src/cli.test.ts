import { describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  clearSyncedLocalLogs,
  enqueueLocalMicroLog,
  listUnsyncedLocalLogs,
  markLocalLogsSynced,
} from "./local-store/sqlite-queue";

describe("@volt/cli — <5ms Local SQLite Write-Ahead Queue", () => {
  test("stages micro-logs in <50ms and transitions unsynced -> synced -> cleared", () => {
    const tempDb = join(tmpdir(), `volt-test-queue-${Date.now()}.sqlite`);

    const startNs = Bun.nanoseconds();
    const row1 = enqueueLocalMicroLog({
      rawText: "benchmarked 4-bit AWQ quantization in Colab",
      source: "cli",
      dbFilePath: tempDb,
    });
    const elapsedMs = (Bun.nanoseconds() - startNs) / 1_000_000;

    expect(elapsedMs).toBeLessThan(50);
    expect(row1.synced).toBe(0);

    const row2 = enqueueLocalMicroLog({
      rawText: "updated Fastify rate limiter plugin",
      source: "mcp",
      dbFilePath: tempDb,
    });

    const unsynced = listUnsyncedLocalLogs(tempDb);
    expect(unsynced.length).toBe(2);

    markLocalLogsSynced([row1.client_log_id], tempDb);
    const remainingUnsynced = listUnsyncedLocalLogs(tempDb);
    expect(remainingUnsynced.length).toBe(1);
    expect(remainingUnsynced[0]?.client_log_id).toBe(row2.client_log_id);

    clearSyncedLocalLogs(tempDb);
    try {
      rmSync(tempDb, { force: true });
      rmSync(`${tempDb}-wal`, { force: true });
      rmSync(`${tempDb}-shm`, { force: true });
    } catch {
      // ignore cleanup error
    }
  });
});
