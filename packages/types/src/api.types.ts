import type {
  CommitRecord,
  ScoreAuditRecord,
  StagedLogRecord,
} from "./commit.types";
import type {
  ArtifactSourceType,
  BillingCycleRecord,
  CaptureSource,
  CoAuthorStatus,
  CommitStatus,
  CommitType,
  UserApiKeyRecord,
  WorkDomain,
} from "./domain.types";
import type { GitHubAppInstallationRecord } from "./github.types";
import type {
  ComplexityScore,
  CyclePoolShareSummary,
  EvidenceMultiplier,
  ImpactMultiplier,
} from "./math.types";
import type {
  PermissionScope,
  PolicyGroupRecord,
  UserPolicyContext,
} from "./pbac.types";

export interface HealthCheckResponse {
  readonly status: "ok" | "degraded";
  readonly service: "volt-api";
  readonly timestamp: string;
  readonly version: string;
}

export interface CreateStageLogRequest {
  readonly clientLogId?: string;
  readonly rawText: string;
  readonly source: CaptureSource;
  readonly artifactId?: string | null;
  readonly githubPrUrl?: string | null;
}

export interface BatchSyncStageLogItem {
  readonly clientLogId: string;
  readonly rawText: string;
  readonly source: CaptureSource;
  readonly artifactId?: string | null;
  readonly githubPrUrl?: string | null;
  readonly createdAt: string;
}

export interface BatchSyncStageLogsRequest {
  readonly logs: readonly BatchSyncStageLogItem[];
}

export interface StageLogsMutationResponse {
  readonly stagedCount: number;
  readonly syncedClientLogIds: readonly string[];
  readonly logs: readonly StagedLogRecord[];
}

export interface CreateCommitRequest {
  readonly type: CommitType;
  readonly domain?: WorkDomain;
  readonly summary: string;
  readonly githubPrUrl?: string | null;
  readonly uploadedArtifactId?: string | null;
  readonly coAuthorHandles?: readonly string[];
  readonly workDate?: string;
}

export interface CreateCommitResponse {
  readonly id: string;
  readonly shortHash: string;
  readonly status: CommitStatus;
  readonly type: CommitType;
  readonly domain: WorkDomain;
  readonly summary: string;
  readonly artifactType: ArtifactSourceType;
  readonly bundledLogsCount: number;
  readonly coAuthors: readonly {
    readonly handle: string;
    readonly status: CoAuthorStatus;
  }[];
  readonly coauthorDeadlineAt: string | null;
  readonly commit: CommitRecord;
}

export interface VerifyCoAuthorRequest {
  readonly action: "verify" | "reject";
  readonly contributionNote?: string;
}

export interface VerifyCoAuthorResponse {
  readonly shortHash: string;
  readonly coAuthorStatus: CoAuthorStatus;
  readonly aiValidated: boolean;
  readonly aiValidationReason: string;
  readonly commitStatus: CommitStatus;
}

export interface PeerReviewCommitRequest {
  readonly decision: "approve" | "reject";
  readonly vConsensus?: number;
  readonly overrideComplexity?: ComplexityScore | null;
  readonly overrideImpact?: ImpactMultiplier | null;
  readonly overrideEvidence?: EvidenceMultiplier | null;
  readonly reasoning: string;
}

export interface PeerReviewCommitResponse {
  readonly shortHash: string;
  readonly status: CommitStatus;
  readonly finalWC: number;
  readonly audit: ScoreAuditRecord;
}

export interface CreateArtifactUploadUrlRequest {
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256Checksum: string;
}

export interface CreateArtifactUploadUrlResponse {
  readonly artifactId: string;
  readonly uploadUrl: string;
  readonly storagePath: string;
  readonly expiresInSeconds: number;
}

export interface CreateApiKeyRequest {
  readonly label: string;
}

export interface CreateApiKeyResponse {
  readonly apiKey: UserApiKeyRecord;
  readonly rawSecretKey: string;
}

export interface AuthMeResponse {
  readonly user: UserPolicyContext;
  readonly apiKeys: readonly UserApiKeyRecord[];
  readonly githubInstallations: readonly GitHubAppInstallationRecord[];
}

export interface CliStatusOverviewResponse {
  readonly user: UserPolicyContext;
  readonly stagedLogs: readonly StagedLogRecord[];
  readonly pendingHandshakes: readonly CommitRecord[];
  readonly recentCommits: readonly CommitRecord[];
  readonly activeCycleSummary: CyclePoolShareSummary | null;
}

export interface CreateBillingCycleRequest {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly poolBudget: number;
  readonly currency?: string;
}

export interface UpdatePolicyGroupAssignmentRequest {
  readonly policyGroupSlugs: readonly string[];
}

export interface UpdateDirectScopesRequest {
  readonly directScopes: readonly PermissionScope[];
}

export interface PolicyDirectoryResponse {
  readonly groups: readonly PolicyGroupRecord[];
  readonly users: readonly {
    readonly id: string;
    readonly handle: string;
    readonly fullName: string;
    readonly email: string;
    readonly defaultDomain: WorkDomain;
    readonly groupSlugs: readonly string[];
    readonly directScopes: readonly PermissionScope[];
    readonly effectiveScopes: readonly PermissionScope[];
  }[];
  readonly cycles?: readonly BillingCycleRecord[];
}
