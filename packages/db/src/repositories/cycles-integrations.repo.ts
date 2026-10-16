import { calculateCyclePoolShare } from "@volt/math";
import type {
  BillingCycleRecord,
  CreateBillingCycleRequest,
  CyclePoolShareSummary,
  UserApprovedCommitPointEntry,
} from "@volt/types";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { getDb } from "../client";
import { billingCycles, commitCoauthors, commits, users } from "../schema";

export async function listBillingCycles(): Promise<BillingCycleRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(billingCycles)
    .orderBy(desc(billingCycles.startDate));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    startDate: r.startDate,
    endDate: r.endDate,
    poolBudget: Number(r.poolBudget),
    currency: r.currency,
    status: r.status,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createBillingCycle(
  userId: string,
  payload: CreateBillingCycleRequest
): Promise<BillingCycleRecord> {
  const db = getDb();
  const [inserted] = await db
    .insert(billingCycles)
    .values({
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      poolBudget: payload.poolBudget.toFixed(2),
      currency: payload.currency ?? "USD",
      status: "active",
      createdBy: userId,
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to create billing cycle");
  }

  return {
    id: inserted.id,
    name: inserted.name,
    startDate: inserted.startDate,
    endDate: inserted.endDate,
    poolBudget: Number(inserted.poolBudget),
    currency: inserted.currency,
    status: inserted.status,
    createdBy: inserted.createdBy,
    createdAt: inserted.createdAt.toISOString(),
  };
}

export async function computeCyclePoolShareSummary(
  cycleId?: string
): Promise<CyclePoolShareSummary | null> {
  const db = getDb();
  const cycleRows = cycleId
    ? await db
        .select()
        .from(billingCycles)
        .where(eq(billingCycles.id, cycleId))
        .limit(1)
    : await db
        .select()
        .from(billingCycles)
        .where(eq(billingCycles.status, "active"))
        .orderBy(desc(billingCycles.startDate))
        .limit(1);

  const cycle = cycleRows[0];
  if (!cycle) {
    return null;
  }

  const approvedCommits = await db
    .select()
    .from(commits)
    .where(
      and(
        eq(commits.status, "approved"),
        gte(commits.workDate, cycle.startDate),
        lte(commits.workDate, cycle.endDate)
      )
    );

  const allUsers = await db.select().from(users);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const commitIds = approvedCommits.map((c) => c.id);
  const verifiedCoAuthors =
    commitIds.length > 0
      ? await db
          .select()
          .from(commitCoauthors)
          .where(
            and(
              inArray(commitCoauthors.commitId, commitIds),
              eq(commitCoauthors.status, "verified")
            )
          )
      : [];

  const entries: UserApprovedCommitPointEntry[] = [];

  for (const commit of approvedCommits) {
    const author = userMap.get(commit.authorId);
    const isCollaborative = commit.verifiedParticipantCount > 1;
    if (author) {
      entries.push({
        userId: author.id,
        handle: author.handle,
        fullName: author.fullName,
        avatarUrl: author.avatarUrl,
        commitId: commit.id,
        domain: commit.domain,
        awardedPoints: Number(
          commit.authorAwardedPoints ?? commit.currentWC ?? 0
        ),
        isCollaborative,
      });
    }

    const coForCommit = verifiedCoAuthors.filter(
      (co) => co.commitId === commit.id
    );
    for (const co of coForCommit) {
      const coUser = userMap.get(co.userId);
      if (coUser) {
        entries.push({
          userId: coUser.id,
          handle: coUser.handle,
          fullName: coUser.fullName,
          avatarUrl: coUser.avatarUrl,
          commitId: commit.id,
          domain: commit.domain,
          awardedPoints: Number(co.awardedPoints ?? commit.currentWC ?? 0),
          isCollaborative: true,
        });
      }
    }
  }

  return calculateCyclePoolShare({
    cycleId: cycle.id,
    cycleName: cycle.name,
    startDate: cycle.startDate,
    endDate: cycle.endDate,
    poolBudget: Number(cycle.poolBudget),
    currency: cycle.currency,
    entries,
  });
}
