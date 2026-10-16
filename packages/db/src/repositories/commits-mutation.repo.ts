import { createHash, randomBytes } from "node:crypto";
import { formatDateInTimezone } from "@volt/math";
import type {
  ArtifactMetadataPayload,
  ArtifactSourceType,
  CommitRecord,
  CommitStatus,
  CommitType,
  StagedLogSnapshotItem,
  WorkDomain,
} from "@volt/types";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "../client";
import {
  commitCoauthors,
  commits,
  stagedLogs,
  users,
} from "../schema";
import {
  getCommitByShortHash,
  hydrateCommitRecords,
} from "./commits-query.repo";

export function generateCommitShortHash(
  authorId: string,
  summary: string
): string {
  const salt = randomBytes(8).toString("hex");
  return createHash("sha256")
    .update(`${authorId}:${summary}:${Date.now()}:${salt}`)
    .digest("hex")
    .slice(0, 8);
}

export async function createCommitFromStagedLogs(params: {
  readonly authorId: string;
  readonly type: CommitType;
  readonly domain: WorkDomain;
  readonly summary: string;
  readonly artifactType: ArtifactSourceType;
  readonly githubPrUrl: string | null;
  readonly uploadedArtifactId: string | null;
  readonly artifactMetadata: ArtifactMetadataPayload;
  readonly coAuthorHandles: readonly string[];
  readonly workDate?: string;
}): Promise<CommitRecord> {
  const db = getDb();
  const shortHash = generateCommitShortHash(params.authorId, params.summary);
  const workDate =
    params.workDate ?? formatDateInTimezone(new Date(), "Asia/Kolkata");

  const uncommittedRows = await db
    .select()
    .from(stagedLogs)
    .where(
      and(eq(stagedLogs.userId, params.authorId), isNull(stagedLogs.commitId))
    );

  const stagedSnapshot: StagedLogSnapshotItem[] = uncommittedRows.map((r) => ({
    id: r.id,
    rawText: r.rawText,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
  }));

  const normalizedHandles = Array.from(
    new Set(params.coAuthorHandles.map((h) => h.replace(/^@/, "").toLowerCase()))
  );

  const coAuthorUserRows =
    normalizedHandles.length > 0
      ? await db
          .select()
          .from(users)
          .where(inArray(users.handle, normalizedHandles))
      : [];

  const validCoAuthorUsers = coAuthorUserRows.filter(
    (u) => u.id !== params.authorId
  );

  const hasCoAuthors = validCoAuthorUsers.length > 0;
  const initialStatus: CommitStatus = hasCoAuthors
    ? "pending_coauthor"
    : "pending_ai";
  const coauthorDeadlineAt = hasCoAuthors
    ? new Date(Date.now() + 24 * 60 * 60 * 1000)
    : null;

  const [createdCommit] = await db
    .insert(commits)
    .values({
      shortHash,
      authorId: params.authorId,
      type: params.type,
      domain: params.domain,
      summary: params.summary.trim(),
      stagedSnapshot,
      artifactType: params.artifactType,
      githubPrUrl: params.githubPrUrl,
      uploadedArtifactId: params.uploadedArtifactId,
      artifactMetadata: params.artifactMetadata,
      status: initialStatus,
      verifiedParticipantCount: 1,
      workDate,
      coauthorDeadlineAt,
    })
    .returning();

  if (!createdCommit) {
    throw new Error("Failed to insert commit record");
  }

  if (uncommittedRows.length > 0) {
    await db
      .update(stagedLogs)
      .set({
        commitId: createdCommit.id,
        committedAt: new Date(),
      })
      .where(
        inArray(
          stagedLogs.id,
          uncommittedRows.map((r) => r.id)
        )
      );
  }

  for (const coUser of validCoAuthorUsers) {
    await db.insert(commitCoauthors).values({
      commitId: createdCommit.id,
      userId: coUser.id,
      status: "pending",
    });
  }

  const hydrated = await getCommitByShortHash(shortHash);
  if (!hydrated) {
    throw new Error("Failed to hydrate newly created commit");
  }
  return hydrated;
}

export async function listCommitFeed(params: {
  readonly domain?: WorkDomain;
  readonly status?: CommitStatus;
  readonly limit?: number;
}): Promise<CommitRecord[]> {
  const db = getDb();
  const conditions = [];
  if (params.domain) {
    conditions.push(eq(commits.domain, params.domain));
  }
  if (params.status) {
    conditions.push(eq(commits.status, params.status));
  }

  const rows = await db
    .select()
    .from(commits)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(commits.createdAt))
    .limit(params.limit ?? 50);

  return hydrateCommitRecords(rows);
}
