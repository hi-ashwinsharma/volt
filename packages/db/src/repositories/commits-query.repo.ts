import type {
  CoAuthorRecord,
  CommitRecord,
  ComplexityScore,
  EvidenceMultiplier,
  ImpactMultiplier,
  ScoreAuditRecord,
} from "@volt/types";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../client";
import { commitCoauthors, commits, scoreAudits, users } from "../schema";

function mapScoreAuditRow(
  row: typeof scoreAudits.$inferSelect,
  gradedByHandle: string | null
): ScoreAuditRecord {
  return {
    id: row.id,
    commitId: row.commitId,
    gradedByUserId: row.gradedByUserId,
    gradedByHandle,
    isAiGrade: row.isAiGrade,
    cComplexity: row.cComplexity as ComplexityScore,
    iImpact: Number(row.iImpact) as ImpactMultiplier,
    eEvidence: Number(row.eEvidence) as EvidenceMultiplier,
    vConsensus: Number(row.vConsensus),
    dDecay: Number(row.dDecay),
    initialPoints: Number(row.initialPoints),
    finalPoints: Number(row.finalPoints),
    antiGamingFlag: row.antiGamingFlag,
    reasoning: row.reasoning,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function hydrateCommitRecords(
  commitRows: readonly (typeof commits.$inferSelect)[]
): Promise<CommitRecord[]> {
  if (commitRows.length === 0) {
    return [];
  }
  const db = getDb();
  const commitIds = commitRows.map((c) => c.id);
  const authorIds = Array.from(new Set(commitRows.map((c) => c.authorId)));

  const coAuthorRows = await db
    .select({
      co: commitCoauthors,
      handle: users.handle,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
    })
    .from(commitCoauthors)
    .innerJoin(users, eq(commitCoauthors.userId, users.id))
    .where(inArray(commitCoauthors.commitId, commitIds));

  const auditRows = await db
    .select()
    .from(scoreAudits)
    .where(inArray(scoreAudits.commitId, commitIds))
    .orderBy(desc(scoreAudits.createdAt));

  const graderIds = auditRows
    .map((a) => a.gradedByUserId)
    .filter((id): id is string => id !== null);

  const allUserIds = Array.from(new Set([...authorIds, ...graderIds]));
  const userRows =
    allUserIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, allUserIds))
      : [];

  const userMap = new Map(userRows.map((u) => [u.id, u]));

  return commitRows.map((c) => {
    const author = userMap.get(c.authorId);
    const coAuthors: CoAuthorRecord[] = coAuthorRows
      .filter((r) => r.co.commitId === c.id)
      .map((r) => ({
        id: r.co.id,
        commitId: r.co.commitId,
        userId: r.co.userId,
        handle: r.handle,
        fullName: r.fullName,
        avatarUrl: r.avatarUrl,
        status: r.co.status,
        contributionNote: r.co.contributionNote,
        aiValidated: r.co.aiValidated,
        aiValidationReason: r.co.aiValidationReason,
        awardedPoints:
          r.co.awardedPoints !== null ? Number(r.co.awardedPoints) : null,
        notifiedAt: r.co.notifiedAt.toISOString(),
        verifiedAt: r.co.verifiedAt?.toISOString() ?? null,
      }));

    const commitAudits: ScoreAuditRecord[] = auditRows
      .filter((a) => a.commitId === c.id)
      .map((a) =>
        mapScoreAuditRow(
          a,
          a.gradedByUserId
            ? (userMap.get(a.gradedByUserId)?.handle ?? null)
            : null
        )
      );

    return {
      id: c.id,
      shortHash: c.shortHash,
      authorId: c.authorId,
      authorHandle: author?.handle ?? "unassigned",
      authorFullName: author?.fullName ?? "Team Member",
      authorAvatarUrl: author?.avatarUrl ?? null,
      type: c.type,
      domain: c.domain,
      summary: c.summary,
      stagedSnapshot: c.stagedSnapshot,
      artifactType: c.artifactType,
      githubPrUrl: c.githubPrUrl,
      uploadedArtifactId: c.uploadedArtifactId,
      artifactMetadata: c.artifactMetadata,
      status: c.status,
      currentWC: c.currentWC !== null ? Number(c.currentWC) : null,
      authorAwardedPoints:
        c.authorAwardedPoints !== null ? Number(c.authorAwardedPoints) : null,
      verifiedParticipantCount: c.verifiedParticipantCount,
      workDate: c.workDate,
      coauthorDeadlineAt: c.coauthorDeadlineAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      finalizedAt: c.finalizedAt?.toISOString() ?? null,
      coAuthors,
      latestAudit: commitAudits[0] ?? null,
      audits: commitAudits,
    };
  });
}

export async function getCommitByShortHash(
  shortHash: string
): Promise<CommitRecord | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commits)
    .where(eq(commits.shortHash, shortHash))
    .limit(1);

  const hydrated = await hydrateCommitRecords(rows);
  return hydrated[0] ?? null;
}
