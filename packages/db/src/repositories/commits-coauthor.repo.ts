import type { CommitRecord } from "@volt/types";
import { and, eq } from "drizzle-orm";
import { getDb } from "../client";
import { commitCoauthors, commits } from "../schema";
import { getCommitByShortHash } from "./commits-query.repo";

export async function updateCoAuthorHandshake(params: {
  readonly shortHash: string;
  readonly userId: string;
  readonly action: "verify" | "reject";
  readonly contributionNote?: string;
  readonly aiValidated: boolean;
  readonly aiValidationReason: string;
}): Promise<{
  readonly commit: CommitRecord;
  readonly allCoAuthorsResolved: boolean;
}> {
  const db = getDb();
  const commit = await getCommitByShortHash(params.shortHash);
  if (!commit) {
    throw new Error(`Commit ${params.shortHash} not found`);
  }

  const targetStatus = params.action === "verify" ? "verified" : "rejected";
  await db
    .update(commitCoauthors)
    .set({
      status: targetStatus,
      contributionNote: params.contributionNote ?? null,
      aiValidated: params.aiValidated,
      aiValidationReason: params.aiValidationReason,
      verifiedAt: new Date(),
    })
    .where(
      and(
        eq(commitCoauthors.commitId, commit.id),
        eq(commitCoauthors.userId, params.userId)
      )
    );

  const allCoRows = await db
    .select()
    .from(commitCoauthors)
    .where(eq(commitCoauthors.commitId, commit.id));

  const pendingRemaining = allCoRows.some((r) => r.status === "pending");
  const verifiedCount =
    1 + allCoRows.filter((r) => r.status === "verified").length;

  if (!pendingRemaining && commit.status === "pending_coauthor") {
    await db
      .update(commits)
      .set({
        status: "pending_ai",
        verifiedParticipantCount: verifiedCount,
      })
      .where(eq(commits.id, commit.id));
  } else {
    await db
      .update(commits)
      .set({ verifiedParticipantCount: verifiedCount })
      .where(eq(commits.id, commit.id));
  }

  const refreshed = await getCommitByShortHash(params.shortHash);
  if (!refreshed) {
    throw new Error("Failed to reload commit after co-author verification");
  }
  return {
    commit: refreshed,
    allCoAuthorsResolved: !pendingRemaining,
  };
}

export async function resolveCoAuthorTimeoutByShortHash(
  shortHash: string
): Promise<{
  readonly transitionedToPendingAi: boolean;
  readonly commit: CommitRecord | null;
}> {
  const db = getDb();
  const commit = await getCommitByShortHash(shortHash);
  if (!commit || commit.status !== "pending_coauthor") {
    return { transitionedToPendingAi: false, commit };
  }

  await db
    .update(commitCoauthors)
    .set({ status: "timed_out" })
    .where(
      and(
        eq(commitCoauthors.commitId, commit.id),
        eq(commitCoauthors.status, "pending")
      )
    );

  const allCoRows = await db
    .select()
    .from(commitCoauthors)
    .where(eq(commitCoauthors.commitId, commit.id));

  const verifiedCount =
    1 + allCoRows.filter((r) => r.status === "verified").length;

  await db
    .update(commits)
    .set({
      status: "pending_ai",
      verifiedParticipantCount: verifiedCount,
    })
    .where(eq(commits.id, commit.id));

  const refreshed = await getCommitByShortHash(shortHash);
  return { transitionedToPendingAi: true, commit: refreshed };
}
