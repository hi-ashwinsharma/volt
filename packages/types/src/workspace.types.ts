import type {
  PolicyDirectoryResponse,
} from "./api.types";
import type {
  CommitRecord,
  StagedLogRecord,
} from "./commit.types";
import type {
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
import type { UserPolicyContext } from "./pbac.types";
import type {
  ImpactStreamFilterState,
  ThemeMode,
} from "./ui.types";

export interface VoltWorkspaceContextValue {
  readonly theme: ThemeMode;
  readonly toggleTheme: () => void;
  readonly currentUser: UserPolicyContext;
  readonly availablePersonas: readonly UserPolicyContext[];
  readonly switchPersona: (handle: string) => void;
  readonly stagedLogs: readonly StagedLogRecord[];
  readonly removeStagedLog: (id: string) => void;
  readonly commits: readonly CommitRecord[];
  readonly filteredCommits: readonly CommitRecord[];
  readonly filter: ImpactStreamFilterState;
  readonly setFilter: (
    updater:
      | ImpactStreamFilterState
      | ((prev: ImpactStreamFilterState) => ImpactStreamFilterState)
  ) => void;
  readonly isSubmitting: boolean;
  readonly isPaletteOpen: boolean;
  readonly setIsPaletteOpen: (open: boolean) => void;
  readonly poolBudget: number;
  readonly setPoolBudget: (budget: number) => void;
  readonly installations: readonly GitHubAppInstallationRecord[];
  readonly apiKeys: readonly UserApiKeyRecord[];
  readonly revokeApiKey: (id: string) => Promise<void>;
  readonly newlyCreatedSecret: string | null;
  readonly handleStageLog: (
    rawText: string,
    githubPrUrl: string | null
  ) => Promise<void>;
  readonly handleCreateCommit: (payload: {
    readonly type: CommitType;
    readonly domain: WorkDomain;
    readonly summary: string;
    readonly githubPrUrl: string | null;
    readonly coAuthorHandles: readonly string[];
  }) => Promise<void>;
  readonly policyDirectory: PolicyDirectoryResponse;
  readonly poolSummary: CyclePoolShareSummary;
  readonly handleSubmitPeerReview: (
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
  readonly handleVerifyHandshake: (
    shortHash: string,
    action: "verify" | "reject",
    contributionNote?: string
  ) => Promise<void>;
  readonly handleConnectGitHub: () => Promise<void>;
  readonly handleCreateApiKey: (label: string) => Promise<void>;
  readonly handleUpdateUserGroups: (
    userId: string,
    groupSlugs: readonly string[]
  ) => Promise<void>;
}

export interface UseWorkspaceCommitsParams {
  readonly currentUser: UserPolicyContext;
}

