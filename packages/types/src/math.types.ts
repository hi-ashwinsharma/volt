export const COMPLEXITY_SCORES = [1, 2, 3, 5, 8, 13] as const;
export type ComplexityScore = (typeof COMPLEXITY_SCORES)[number];

export const IMPACT_MULTIPLIERS = [0.5, 1.0, 1.5, 2.0, 3.0] as const;
export type ImpactMultiplier = (typeof IMPACT_MULTIPLIERS)[number];

export const EVIDENCE_MULTIPLIERS = [0.5, 1.0, 1.2] as const;
export type EvidenceMultiplier = (typeof EVIDENCE_MULTIPLIERS)[number];

export const AUTO_APPROVAL_THRESHOLD = 15.0;
export const MIN_CONSENSUS_MODIFIER = 0.7;
export const MAX_CONSENSUS_MODIFIER = 1.3;
export const DEFAULT_CONSENSUS_MODIFIER = 1.0;

export const MIN_DECAY_FACTOR = 0.5;
export const MAX_DECAY_FACTOR = 1.0;
export const DECAY_RATE_PER_DAY = 0.1;

export interface WeightageInput {
  readonly complexity: ComplexityScore;
  readonly impact: ImpactMultiplier;
  readonly evidence: EvidenceMultiplier;
  readonly consensus?: number;
  readonly decay?: number;
}

export interface WeightageBreakdown {
  readonly complexity: ComplexityScore;
  readonly complexityPower: number;
  readonly impact: ImpactMultiplier;
  readonly evidence: EvidenceMultiplier;
  readonly consensus: number;
  readonly decay: number;
  readonly initialPoints: number;
  readonly finalPoints: number;
  readonly requiresPeerReviewByThreshold: boolean;
}

export interface TimelinessDecayInput {
  readonly workDate: string;
  readonly referenceTimestampIso?: string;
  readonly timezone?: string;
}

export interface TimelinessDecayResult {
  readonly workDate: string;
  readonly currentIstDate: string;
  readonly daysLate: number;
  readonly decayFactor: number;
}

export type AllocationMode = "duplication_100_percent" | "group_split_3_over_n";

export interface ParticipantShareInput {
  readonly finalCommitScore: number;
  readonly primaryAuthorId: string;
  readonly coAuthors: readonly {
    readonly userId: string;
    readonly status: "pending" | "verified" | "rejected" | "timed_out";
  }[];
}

export interface ParticipantAward {
  readonly userId: string;
  readonly role: "primary_author" | "co_author";
  readonly status: "verified" | "rejected" | "timed_out" | "pending";
  readonly awardedPoints: number;
}

export interface AllocationBreakdown {
  readonly finalCommitScore: number;
  readonly verifiedParticipantCount: number;
  readonly mode: AllocationMode;
  readonly individualAwardPoints: number;
  readonly awards: readonly ParticipantAward[];
}

export interface UserApprovedCommitPointEntry {
  readonly userId: string;
  readonly handle: string;
  readonly fullName: string;
  readonly avatarUrl: string | null;
  readonly commitId: string;
  readonly domain: "engineering" | "research" | "ops" | "finance" | "pitch";
  readonly awardedPoints: number;
  readonly isCollaborative: boolean;
}

export interface UserPoolShareRow {
  readonly userId: string;
  readonly handle: string;
  readonly fullName: string;
  readonly avatarUrl: string | null;
  readonly approvedCommitsCount: number;
  readonly collaborativeCommitsCount: number;
  readonly collaborationRatioPercent: number;
  readonly totalCyclePoints: number;
  readonly poolSharePercent: number;
  readonly cyclePayout: number;
  readonly domainBreakdown: Readonly<
    Record<"engineering" | "research" | "ops" | "finance" | "pitch", number>
  >;
}

export interface CyclePoolShareSummary {
  readonly cycleId: string;
  readonly cycleName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly poolBudget: number;
  readonly currency: string;
  readonly totalTeamPoints: number;
  readonly activeContributorCount: number;
  readonly leaderboard: readonly UserPoolShareRow[];
}
