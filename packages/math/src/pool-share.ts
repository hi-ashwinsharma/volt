import type {
  CyclePoolShareSummary,
  UserApprovedCommitPointEntry,
  UserPoolShareRow,
} from "@volt/types";
import { roundToTwoDecimals } from "./weightage";

export function calculateCyclePoolShare(params: {
  readonly cycleId: string;
  readonly cycleName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly poolBudget: number;
  readonly currency: string;
  readonly entries: readonly UserApprovedCommitPointEntry[];
}): CyclePoolShareSummary {
  const userMap = new Map<
    string,
    {
      handle: string;
      fullName: string;
      avatarUrl: string | null;
      commitIds: Set<string>;
      collaborativeCommitIds: Set<string>;
      totalPoints: number;
      domainBreakdown: {
        engineering: number;
        research: number;
        ops: number;
        finance: number;
        pitch: number;
      };
    }
  >();

  for (const entry of params.entries) {
    let bucket = userMap.get(entry.userId);
    if (!bucket) {
      bucket = {
        handle: entry.handle,
        fullName: entry.fullName,
        avatarUrl: entry.avatarUrl,
        commitIds: new Set<string>(),
        collaborativeCommitIds: new Set<string>(),
        totalPoints: 0,
        domainBreakdown: {
          engineering: 0,
          research: 0,
          ops: 0,
          finance: 0,
          pitch: 0,
        },
      };
      userMap.set(entry.userId, bucket);
    }

    bucket.commitIds.add(entry.commitId);
    if (entry.isCollaborative) {
      bucket.collaborativeCommitIds.add(entry.commitId);
    }
    bucket.totalPoints = roundToTwoDecimals(
      bucket.totalPoints + entry.awardedPoints
    );
    bucket.domainBreakdown[entry.domain] = roundToTwoDecimals(
      bucket.domainBreakdown[entry.domain] + entry.awardedPoints
    );
  }

  let totalTeamPoints = 0;
  for (const bucket of userMap.values()) {
    totalTeamPoints = roundToTwoDecimals(totalTeamPoints + bucket.totalPoints);
  }

  const rows: UserPoolShareRow[] = [];
  for (const [userId, bucket] of userMap.entries()) {
    const approvedCommitsCount = bucket.commitIds.size;
    const collaborativeCommitsCount = bucket.collaborativeCommitIds.size;
    const collaborationRatioPercent =
      approvedCommitsCount > 0
        ? roundToTwoDecimals(
            (collaborativeCommitsCount / approvedCommitsCount) * 100
          )
        : 0;

    const poolSharePercent =
      totalTeamPoints > 0
        ? roundToTwoDecimals((bucket.totalPoints / totalTeamPoints) * 100)
        : 0;

    const cyclePayout =
      totalTeamPoints > 0 && params.poolBudget > 0
        ? roundToTwoDecimals(
            (bucket.totalPoints / totalTeamPoints) * params.poolBudget
          )
        : 0;

    rows.push({
      userId,
      handle: bucket.handle,
      fullName: bucket.fullName,
      avatarUrl: bucket.avatarUrl,
      approvedCommitsCount,
      collaborativeCommitsCount,
      collaborationRatioPercent,
      totalCyclePoints: bucket.totalPoints,
      poolSharePercent,
      cyclePayout,
      domainBreakdown: bucket.domainBreakdown,
    });
  }

  rows.sort((a, b) => b.totalCyclePoints - a.totalCyclePoints);

  return {
    cycleId: params.cycleId,
    cycleName: params.cycleName,
    startDate: params.startDate,
    endDate: params.endDate,
    poolBudget: roundToTwoDecimals(params.poolBudget),
    currency: params.currency,
    totalTeamPoints,
    activeContributorCount: rows.length,
    leaderboard: rows,
  };
}
