import type {
  BatchSyncStageLogItem,
  CreateStageLogRequest,
  StagedLogRecord,
} from "@volt/types";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "../client";
import { stagedLogs } from "../schema";

function mapStagedRow(
  row: typeof stagedLogs.$inferSelect
): StagedLogRecord {
  return {
    id: row.id,
    userId: row.userId,
    clientLogId: row.clientLogId,
    rawText: row.rawText,
    source: row.source,
    artifactId: row.artifactId,
    githubPrUrl: row.githubPrUrl,
    commitId: row.commitId,
    committedAt: row.committedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listUncommittedStagedLogs(
  userId: string
): Promise<StagedLogRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(stagedLogs)
    .where(and(eq(stagedLogs.userId, userId), isNull(stagedLogs.commitId)))
    .orderBy(asc(stagedLogs.createdAt));

  return rows.map(mapStagedRow);
}

export async function insertSingleStagedLog(
  userId: string,
  payload: CreateStageLogRequest
): Promise<StagedLogRecord> {
  const db = getDb();
  if (payload.clientLogId) {
    const [existing] = await db
      .select()
      .from(stagedLogs)
      .where(eq(stagedLogs.clientLogId, payload.clientLogId))
      .limit(1);
    if (existing) {
      return mapStagedRow(existing);
    }
  }

  const [inserted] = await db
    .insert(stagedLogs)
    .values({
      userId,
      clientLogId: payload.clientLogId ?? null,
      rawText: payload.rawText.trim(),
      source: payload.source,
      artifactId: payload.artifactId ?? null,
      githubPrUrl: payload.githubPrUrl ?? null,
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to insert staged log");
  }
  return mapStagedRow(inserted);
}

export async function batchInsertStagedLogs(
  userId: string,
  items: readonly BatchSyncStageLogItem[]
): Promise<{
  readonly syncedClientLogIds: readonly string[];
  readonly logs: readonly StagedLogRecord[];
}> {
  const db = getDb();
  const syncedClientLogIds: string[] = [];

  for (const item of items) {
    await db
      .insert(stagedLogs)
      .values({
        userId,
        clientLogId: item.clientLogId,
        rawText: item.rawText.trim(),
        source: item.source,
        artifactId: item.artifactId ?? null,
        githubPrUrl: item.githubPrUrl ?? null,
        createdAt: new Date(item.createdAt),
      })
      .onConflictDoNothing({ target: stagedLogs.clientLogId });

    syncedClientLogIds.push(item.clientLogId);
  }

  const currentUncommitted = await listUncommittedStagedLogs(userId);
  return {
    syncedClientLogIds,
    logs: currentUncommitted,
  };
}

export async function deleteUncommittedStagedLog(
  userId: string,
  logId: string
): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(stagedLogs)
    .where(
      and(
        eq(stagedLogs.id, logId),
        eq(stagedLogs.userId, userId),
        isNull(stagedLogs.commitId)
      )
    )
    .returning();

  return deleted.length > 0;
}
