import type {
  ArtifactSourceType,
  CaptureSource,
  CoAuthorStatus,
  CommitStatus,
  CommitType,
  WorkDomain,
} from "./domain.types";
import type { ArtifactMetadataPayload } from "./github.types";
import type {
  ComplexityScore,
  EvidenceMultiplier,
  ImpactMultiplier,
} from "./math.types";

export interface StagedLogRecord {
  readonly id: string;
  readonly userId: string;
  readonly clientLogId: string | null;
  readonly rawText: string;
  readonly source: CaptureSource;
  readonly artifactId: string | null;
  readonly githubPrUrl: string | null;
  readonly commitId: string | null;
  readonly committedAt: string | null;
  readonly createdAt: string;
}

export interface StagedLogSnapshotItem {
  readonly id: string;
  readonly rawText: string;
  readonly source: CaptureSource;
  readonly createdAt: string;
}

export interface CoAuthorRecord {
  readonly id: string;
  readonly commitId: string;
  readonly userId: string;
  readonly handle: string;
  readonly fullName: string;
  readonly avatarUrl: string | null;
  readonly status: CoAuthorStatus;
  readonly contributionNote: string | null;
  readonly aiValidated: boolean | null;
  readonly aiValidationReason: string | null;
  readonly awardedPoints: number | null;
  readonly notifiedAt: string;
  readonly verifiedAt: string | null;
}

export interface ScoreAuditRecord {
  readonly id: string;
  readonly commitId: string;
  readonly gradedByUserId: string | null;
  readonly gradedByHandle: string | null;
  readonly isAiGrade: boolean;
  readonly cComplexity: ComplexityScore;
  readonly iImpact: ImpactMultiplier;
  readonly eEvidence: EvidenceMultiplier;
  readonly vConsensus: number;
  readonly dDecay: number;
  readonly initialPoints: number;
  readonly finalPoints: number;
  readonly antiGamingFlag: boolean;
  readonly reasoning: string;
  readonly createdAt: string;
}

export interface CommitRecord {
  readonly id: string;
  readonly shortHash: string;
  readonly authorId: string;
  readonly authorHandle: string;
  readonly authorFullName: string;
  readonly authorAvatarUrl: string | null;
  readonly type: CommitType;
  readonly domain: WorkDomain;
  readonly summary: string;
  readonly stagedSnapshot: readonly StagedLogSnapshotItem[];
  readonly artifactType: ArtifactSourceType;
  readonly githubPrUrl: string | null;
  readonly uploadedArtifactId: string | null;
  readonly artifactMetadata: ArtifactMetadataPayload;
  readonly status: CommitStatus;
  readonly currentWC: number | null;
  readonly authorAwardedPoints: number | null;
  readonly verifiedParticipantCount: number;
  readonly workDate: string;
  readonly coauthorDeadlineAt: string | null;
  readonly createdAt: string;
  readonly finalizedAt: string | null;
  readonly coAuthors: readonly CoAuthorRecord[];
  readonly latestAudit: ScoreAuditRecord | null;
  readonly audits?: readonly ScoreAuditRecord[];
}

export interface AiJudgeEvaluationOutput {
  readonly c_complexity: ComplexityScore;
  readonly i_impact: ImpactMultiplier;
  readonly e_evidence: EvidenceMultiplier;
  readonly reasoning: string;
  readonly requires_human_review: boolean;
  readonly anti_gaming_flag: boolean;
}

export interface AiHandshakeValidationOutput {
  readonly valid: boolean;
  readonly reason: string;
}

export interface TelegramVoiceExtractionOutput {
  readonly intent: "stage_only" | "commit_output" | "commit_insight";
  readonly domain: WorkDomain;
  readonly transcript: string;
  readonly extracted_micro_logs: readonly string[];
  readonly commit_summary: string;
  readonly co_author_handles: readonly string[];
}
