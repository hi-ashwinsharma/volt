import {
  calculateCommitWeightage,
  calculateParticipantAllocation,
  calculateTimelinessDecay,
  enforceEvidenceCeiling,
} from "@volt/math";
import type {
  CommitRecord,
  CommitStatus,
  ComplexityScore,
  EvidenceMultiplier,
  ImpactMultiplier,
} from "@volt/types";
import { and, eq } from "drizzle-orm";
import { getDb } from "../client";
import { commitCoauthors, commits, scoreAudits } from "../schema";
import { getCommitByShortHash } from "./commits-query.repo";

export async function applyCommitScoreAndFinalize(params: {
  readonly shortHash: string;
  readonly gradedByUserId: string | null;
  readonly isAiGrade: boolean;
  readonly cComplexity: ComplexityScore;
  readonly iImpact: ImpactMultiplier;
  readonly eEvidence: EvidenceMultiplier;
  readonly vConsensus: number;
  readonly reasoning: string;
  readonly requiresHumanReview: boolean;
  readonly antiGamingFlag: boolean;
  readonly forceDecision?: "approve" | "reject";
}): Promise<CommitRecord> {
  const db = getDb();
  const commit = await getCommitByShortHash(params.shortHash);
  if (!commit) {
    throw new Error(`Commit ${params.shortHash} not found`);
  }

  const githubMergedAndCi =
    commit.artifactType === "github_app" &&
    "merged" in commit.artifactMetadata &&
    commit.artifactMetadata.merged === true &&
    "ciPassed" in commit.artifactMetadata &&
    commit.artifactMetadata.ciPassed === true;

  const effectiveEvidence = params.isAiGrade
    ? enforceEvidenceCeiling({
        requestedEvidence: params.eEvidence,
        artifactType: commit.artifactType,
        githubMergedAndCiPassed: githubMergedAndCi,
      })
    : params.eEvidence;

  const decayResult = calculateTimelinessDecay({
    workDate: commit.workDate,
    referenceTimestampIso: commit.createdAt,
  });

  const weightage = calculateCommitWeightage({
    complexity: params.cComplexity,
    impact: params.iImpact,
    evidence: effectiveEvidence,
    consensus: params.vConsensus,
    decay: decayResult.decayFactor,
  });

  await db.insert(scoreAudits).values({
    commitId: commit.id,
    gradedByUserId: params.gradedByUserId,
    isAiGrade: params.isAiGrade,
    cComplexity: weightage.complexity,
    iImpact: weightage.impact.toFixed(2),
    eEvidence: weightage.evidence.toFixed(2),
    vConsensus: weightage.consensus.toFixed(2),
    dDecay: weightage.decay.toFixed(2),
    initialPoints: weightage.initialPoints.toFixed(2),
    finalPoints: weightage.finalPoints.toFixed(2),
    antiGamingFlag: params.antiGamingFlag,
    reasoning: params.reasoning,
  });

  let nextStatus: CommitStatus = "approved";
  if (params.forceDecision === "reject") {
    nextStatus = "rejected";
  } else if (params.forceDecision === "approve") {
    nextStatus = "approved";
  } else if (
    weightage.requiresPeerReviewByThreshold ||
    params.requiresHumanReview ||
    params.antiGamingFlag
  ) {
    nextStatus = "pending_peer";
  }

  const allocation = calculateParticipantAllocation({
    finalCommitScore: nextStatus === "approved" ? weightage.finalPoints : 0,
    primaryAuthorId: commit.authorId,
    coAuthors: commit.coAuthors.map((c) => ({
      userId: c.userId,
      status: c.status,
    })),
  });

  await db
    .update(commits)
    .set({
      status: nextStatus,
      currentWC: weightage.finalPoints.toFixed(2),
      authorAwardedPoints:
        nextStatus === "approved"
          ? allocation.individualAwardPoints.toFixed(2)
          : "0.00",
      verifiedParticipantCount: allocation.verifiedParticipantCount,
      finalizedAt:
        nextStatus === "approved" || nextStatus === "rejected"
          ? new Date()
          : null,
    })
    .where(eq(commits.id, commit.id));

  for (const award of allocation.awards) {
    if (award.role === "co_author") {
      await db
        .update(commitCoauthors)
        .set({
          awardedPoints:
            nextStatus === "approved"
              ? award.awardedPoints.toFixed(2)
              : "0.00",
        })
        .where(
          and(
            eq(commitCoauthors.commitId, commit.id),
            eq(commitCoauthors.userId, award.userId)
          )
        );
    }
  }

  const updated = await getCommitByShortHash(params.shortHash);
  if (!updated) {
    throw new Error("Failed to load finalized commit");
  }
  return updated;
}

export async function flagCommitForPeerReview(
  shortHash: string
): Promise<CommitRecord> {
  const db = getDb();
  const commit = await getCommitByShortHash(shortHash);
  if (!commit) {
    throw new Error(`Commit ${shortHash} not found`);
  }

  await db
    .update(commits)
    .set({ status: "pending_peer" })
    .where(eq(commits.id, commit.id));

  const refreshed = await getCommitByShortHash(shortHash);
  if (!refreshed) {
    throw new Error("Failed to reload flagged commit");
  }
  return refreshed;
}
