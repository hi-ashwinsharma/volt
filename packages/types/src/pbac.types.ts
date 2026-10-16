export const PERMISSION_SCOPES = [
  "stage:write",
  "commit:create",
  "commit:verify_coauthor",
  "feed:read",
  "commit:review_peer",
  "commit:flag_review",
  "github:connect",
  "cycle:read",
  "cycle:manage",
  "user:manage",
  "policy:admin",
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export type SystemPolicyGroupSlug =
  | "core-contributor"
  | "peer-reviewer"
  | "pool-manager"
  | "policy-admin";

export interface PolicyGroupRecord {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly scopes: readonly PermissionScope[];
  readonly isSystem: boolean;
  readonly createdAt: string;
}

export interface UserPolicyContext {
  readonly userId: string;
  readonly handle: string;
  readonly email: string;
  readonly defaultDomain: "engineering" | "research" | "ops" | "finance" | "pitch";
  readonly scopes: readonly PermissionScope[];
  readonly groupSlugs: readonly string[];
  readonly isActive: boolean;
}

export interface CommitReviewTarget {
  readonly commitId: string;
  readonly authorId: string;
  readonly coAuthorUserIds: readonly string[];
}

export type PolicyDenialReason =
  | "USER_INACTIVE"
  | "MISSING_REQUIRED_SCOPE"
  | "MISSING_SCOPE_COMMIT_REVIEW_PEER"
  | "CONFLICT_OF_INTEREST_PRIMARY_AUTHOR"
  | "CONFLICT_OF_INTEREST_COAUTHOR";

export interface PolicyEvaluationResult {
  readonly allowed: boolean;
  readonly reason?: PolicyDenialReason;
  readonly missingScope?: PermissionScope;
}
