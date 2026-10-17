export const COMMIT_TYPES = ["output", "insight"] as const;
export type CommitType = (typeof COMMIT_TYPES)[number];

export const WORK_DOMAINS = [
  "engineering",
  "research",
  "ops",
  "finance",
  "pitch",
] as const;
export type WorkDomain = (typeof WORK_DOMAINS)[number];

export const COMMIT_STATUSES = [
  "pending_coauthor",
  "pending_ai",
  "pending_peer",
  "approved",
  "rejected",
] as const;
export type CommitStatus = (typeof COMMIT_STATUSES)[number];

export const COAUTHOR_STATUSES = [
  "pending",
  "verified",
  "rejected",
  "timed_out",
] as const;
export type CoAuthorStatus = (typeof COAUTHOR_STATUSES)[number];

export const CAPTURE_SOURCES = [
  "cli",
  "mcp",
  "mac_overlay",
  "telegram",
  "web",
] as const;
export type CaptureSource = (typeof CAPTURE_SOURCES)[number];

export const ARTIFACT_SOURCE_TYPES = [
  "none",
  "github_app",
  "file_upload",
] as const;
export type ArtifactSourceType = (typeof ARTIFACT_SOURCE_TYPES)[number];

export const CYCLE_STATUSES = ["upcoming", "active", "closed"] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];

export interface UserRecord {
  readonly id: string;
  readonly authProviderUid: string | null;
  readonly handle: string;
  readonly fullName: string;
  readonly email: string;
  readonly avatarUrl: string | null;
  readonly telegramChatId: number | null;
  readonly githubUserId: number | null;
  readonly githubUsername: string | null;
  readonly defaultDomain: WorkDomain;
  readonly directScopes: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserApiKeyRecord {
  readonly id: string;
  readonly userId: string;
  readonly label: string;
  readonly keyPrefix: string;
  readonly lastUsedAt: string | null;
  readonly revokedAt: string | null;
  readonly createdAt: string;
}

export interface BillingCycleRecord {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly poolBudget: number;
  readonly currency: string;
  readonly status: CycleStatus;
  readonly createdBy: string | null;
  readonly createdAt: string;
}
