import {
  calculateCommitWeightage,
  calculateCyclePoolShare,
  calculateParticipantAllocation,
} from "@volt/math";
import type {
  CommitRecord,
  CommitType,
  ComplexityScore,
  CyclePoolShareSummary,
  EvidenceMultiplier,
  ImpactMultiplier,
  StagedLogRecord,
  UserApprovedCommitPointEntry,
  UserPolicyContext,
  WorkDomain,
} from "@volt/types";

export function buildOptimisticCommitRecord(params: {
  readonly currentUser: UserPolicyContext;
  readonly stagedLogs: readonly StagedLogRecord[];
  readonly type: CommitType;
  readonly domain: WorkDomain;
  readonly summary: string;
  readonly githubPrUrl: string | null;
  readonly coAuthorHandles: readonly string[];
}): CommitRecord {
  const hasCo = params.coAuthorHandles.length > 0;
  const eVal: EvidenceMultiplier = params.githubPrUrl ? 1.2 : 0.5;
  const w = calculateCommitWeightage({ complexity: 5, impact: 1.5, evidence: eVal });
  const nowIso = new Date().toISOString();
  const commitId = `c-${Date.now()}`;

  return {
    id: commitId,
    shortHash: Math.random().toString(16).slice(2, 10),
    authorId: params.currentUser.userId,
    authorHandle: params.currentUser.handle,
    authorFullName: "Ashwin Sharma",
    authorAvatarUrl: null,
    type: params.type,
    domain: params.domain,
    summary: params.summary,
    stagedSnapshot: params.stagedLogs.map((s) => ({
      id: s.id,
      rawText: s.rawText,
      source: s.source,
      createdAt: s.createdAt,
    })),
    artifactType: params.githubPrUrl ? "github_app" : "none",
    githubPrUrl: params.githubPrUrl,
    uploadedArtifactId: null,
    artifactMetadata: {},
    status: hasCo ? "pending_coauthor" : w.requiresPeerReviewByThreshold ? "pending_peer" : "approved",
    currentWC: w.finalPoints,
    authorAwardedPoints: w.finalPoints,
    verifiedParticipantCount: 1,
    workDate: "2026-10-16",
    coauthorDeadlineAt: hasCo ? new Date(Date.now() + 24 * 3600 * 1000).toISOString() : null,
    createdAt: nowIso,
    finalizedAt: hasCo ? null : nowIso,
    coAuthors: params.coAuthorHandles.map((h, idx) => ({
      id: `co-${Date.now()}-${idx}`,
      commitId,
      userId: `u-${h}`,
      handle: h,
      fullName: h,
      avatarUrl: null,
      status: "pending",
      contributionNote: null,
      aiValidated: null,
      aiValidationReason: null,
      awardedPoints: null,
      notifiedAt: nowIso,
      verifiedAt: null,
    })),
    latestAudit: hasCo
      ? null
      : {
          id: `aud-${Date.now()}`,
          commitId,
          gradedByUserId: null,
          gradedByHandle: null,
          isAiGrade: true,
          cComplexity: w.complexity,
          iImpact: w.impact,
          eEvidence: w.evidence,
          vConsensus: 1.0,
          dDecay: 1.0,
          initialPoints: w.initialPoints,
          finalPoints: w.finalPoints,
          antiGamingFlag: false,
          reasoning: "Evaluated by Gemini 1.5 Flash AI Judge.",
          createdAt: nowIso,
        },
  };
}

export function applyLocalPeerReviewToCommit(
  c: CommitRecord,
  currentUser: UserPolicyContext,
  payload: {
    readonly decision: "approve" | "reject";
    readonly vConsensus: number;
    readonly overrideComplexity: ComplexityScore | null;
    readonly overrideImpact: ImpactMultiplier | null;
    readonly overrideEvidence: EvidenceMultiplier | null;
    readonly reasoning: string;
  }
): CommitRecord {
  const base = c.latestAudit;
  const w = calculateCommitWeightage({
    complexity: payload.overrideComplexity ?? base?.cComplexity ?? 8,
    impact: payload.overrideImpact ?? base?.iImpact ?? 1.0,
    evidence: payload.overrideEvidence ?? base?.eEvidence ?? 1.0,
    consensus: payload.vConsensus,
    decay: base?.dDecay ?? 1.0,
  });
  const alloc = calculateParticipantAllocation({
    finalCommitScore: payload.decision === "approve" ? w.finalPoints : 0,
    primaryAuthorId: c.authorId,
    coAuthors: c.coAuthors.map((co) => ({ userId: co.userId, status: co.status })),
  });
  return {
    ...c,
    status: payload.decision === "approve" ? "approved" : "rejected",
    currentWC: w.finalPoints,
    authorAwardedPoints: alloc.individualAwardPoints,
    latestAudit: {
      id: `aud-${Date.now()}`,
      commitId: c.id,
      gradedByUserId: currentUser.userId,
      gradedByHandle: currentUser.handle,
      isAiGrade: false,
      cComplexity: w.complexity,
      iImpact: w.impact,
      eEvidence: w.evidence,
      vConsensus: w.consensus,
      dDecay: w.decay,
      initialPoints: w.initialPoints,
      finalPoints: w.finalPoints,
      antiGamingFlag: false,
      reasoning: payload.reasoning,
      createdAt: new Date().toISOString(),
    },
  };
}

export function computeCyclePoolFromCommits(
  commits: readonly CommitRecord[],
  poolBudget: number
): CyclePoolShareSummary {
  const entries: UserApprovedCommitPointEntry[] = [];
  for (const c of commits) {
    if (c.status !== "approved") continue;
    const isCollab = c.verifiedParticipantCount > 1;
    entries.push({
      userId: c.authorId,
      handle: c.authorHandle,
      fullName: c.authorFullName,
      avatarUrl: c.authorAvatarUrl,
      commitId: c.id,
      domain: c.domain,
      awardedPoints: c.authorAwardedPoints ?? c.currentWC ?? 0,
      isCollaborative: isCollab,
    });
    for (const co of c.coAuthors) {
      if (co.status === "verified") {
        entries.push({
          userId: co.userId,
          handle: co.handle,
          fullName: co.fullName,
          avatarUrl: co.avatarUrl,
          commitId: c.id,
          domain: c.domain,
          awardedPoints: co.awardedPoints ?? c.currentWC ?? 0,
          isCollaborative: true,
        });
      }
    }
  }
  return calculateCyclePoolShare({
    cycleId: "cycle-oct-2026",
    cycleName: "Sprint 14 (Oct 16 - Oct 31, 2026)",
    startDate: "2026-10-16",
    endDate: "2026-10-31",
    poolBudget,
    currency: "USD",
    entries,
  });
}
