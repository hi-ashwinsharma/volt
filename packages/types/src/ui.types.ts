import type {
  CommitRecord,
  ScoreAuditRecord,
  StagedLogRecord,
} from "./commit.types";
import type {
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
  WeightageBreakdown,
} from "./math.types";
import type {
  PermissionScope,
  PolicyGroupRecord,
  UserPolicyContext,
} from "./pbac.types";

export type CommandBarCaptureMode = "stage" | "commit";
export type ThemeMode = "dark" | "light";
export type ReviewStageFilter = "all_pending" | "handshakes" | "peer_reviews" | "audited";

export interface NavigationHeaderProps {
  readonly userHandle: string;
  readonly availableHandles?: readonly string[];
  readonly onSwitchPersona?: (handle: string) => void;
  readonly pendingReviewsCount: number;
  readonly stagedLogsCount: number;
  readonly theme: ThemeMode;
  readonly onToggleTheme: () => void;
  readonly onOpenCommandPalette: () => void;
}

export interface ExecutiveKpiStripProps {
  readonly summary: CyclePoolShareSummary;
  readonly currentUserHandle: string;
  readonly stagedCount: number;
  readonly pendingReviewCount: number;
}

export interface TopCaptureBarProps {
  readonly stagedLogs: readonly StagedLogRecord[];
  readonly defaultDomain: WorkDomain;
  readonly onStageLog: (rawText: string, githubPrUrl: string | null) => Promise<void>;
  readonly onCreateCommit: (payload: {
    readonly type: CommitType;
    readonly domain: WorkDomain;
    readonly summary: string;
    readonly githubPrUrl: string | null;
    readonly coAuthorHandles: readonly string[];
  }) => Promise<void>;
  readonly isSubmitting: boolean;
}

export interface LiveStagingRailProps {
  readonly stagedLogs: readonly StagedLogRecord[];
  readonly onStageLog: (rawText: string, githubPrUrl: string | null) => Promise<void>;
  readonly onRemoveStagedLog: (id: string) => void;
}

export interface ImpactStreamFilterState {
  readonly domain: WorkDomain | "all";
  readonly status: CommitStatus | "all";
  readonly searchQuery: string;
}

export interface CommitCardProps {
  readonly commit: CommitRecord;
  readonly currentUser: UserPolicyContext | null;
  readonly onFlagCommit?: (shortHash: string) => Promise<void>;
}

export interface MathEquationPillProps {
  readonly complexity: ComplexityScore;
  readonly impact: ImpactMultiplier;
  readonly evidence: EvidenceMultiplier;
  readonly consensus: number;
  readonly decay: number;
  readonly finalPoints: number;
  readonly isExpanded: boolean;
  readonly onToggleExpand: () => void;
}

export interface PeerReviewCardProps {
  readonly commit: CommitRecord;
  readonly currentUser: UserPolicyContext;
  readonly previewBreakdown: WeightageBreakdown;
  readonly onSwitchPersona?: (handle: string) => void;
  readonly onSubmitReview: (
    shortHash: string,
    payload: {
      readonly decision: "approve" | "reject";
      readonly vConsensus: number;
      readonly overrideComplexity: ComplexityScore | null;
      readonly overrideImpact: ImpactMultiplier | null;
      readonly overrideEvidence: EvidenceMultiplier | null;
      readonly reasoning: string;
    }
  ) => Promise<void>;
}

export interface CoAuthorHandshakeCardProps {
  readonly commit: CommitRecord;
  readonly currentUserHandle: string;
  readonly onVerifyHandshake: (
    shortHash: string,
    action: "verify" | "reject",
    contributionNote?: string
  ) => Promise<void>;
}

export interface PoolMatrixTableProps {
  readonly summary: CyclePoolShareSummary;
  readonly canManageCycles: boolean;
  readonly poolBudget: number;
  readonly onChangePoolBudget: (nextBudget: number) => void;
  readonly onExportCsv: () => void;
}

export interface GitHubConnectCardProps {
  readonly installations: readonly GitHubAppInstallationRecord[];
  readonly onConnectGitHub: () => Promise<void>;
  readonly isLoading: boolean;
}

export interface ApiKeysCardProps {
  readonly apiKeys: readonly UserApiKeyRecord[];
  readonly newlyCreatedSecret: string | null;
  readonly onCreateKey: (label: string) => Promise<void>;
  readonly onRevokeKey: (id: string) => Promise<void>;
}

export interface PolicyAdminConsoleProps {
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
  readonly onUpdateUserGroups: (
    userId: string,
    groupSlugs: readonly string[]
  ) => Promise<void>;
}

export interface CommandPaletteProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onNavigate: (route: string) => void;
  readonly onQuickStage: (text: string) => Promise<void>;
  readonly theme?: ThemeMode;
  readonly onToggleTheme?: () => void;
}

export interface ReviewPipelineHeaderProps {
  readonly filter: ReviewStageFilter;
  readonly onFilterChange: (stage: ReviewStageFilter) => void;
  readonly pendingCoAuthorCount: number;
  readonly pendingPeerCount: number;
  readonly auditedCount: number;
}

export interface ReviewWorkbenchCalibrationProps {
  readonly audit: ScoreAuditRecord | null;
  readonly canReview: boolean;
  readonly livePoints: number;
  readonly overrideC: ComplexityScore;
  readonly onSelectComplexity: (c: ComplexityScore) => void;
  readonly overrideI: ImpactMultiplier;
  readonly onSelectImpact: (i: ImpactMultiplier) => void;
  readonly vConsensus: number;
  readonly onChangeConsensus: (v: number) => void;
  readonly reasoning: string;
  readonly onChangeReasoning: (r: string) => void;
  readonly onSubmitDecision: (decision: "approve" | "reject") => void;
  readonly onSwitchPersona?: (handle: string) => void;
}
