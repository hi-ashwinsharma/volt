import {
  PERMISSION_SCOPES,
  type PermissionScope,
  type SystemPolicyGroupSlug,
} from "@volt/types";

export const DEFAULT_POLICY_GROUPS: readonly {
  readonly slug: SystemPolicyGroupSlug;
  readonly name: string;
  readonly description: string;
  readonly scopes: readonly PermissionScope[];
  readonly isSystem: boolean;
}[] = [
  {
    slug: "core-contributor",
    name: "Core Contributor",
    description:
      "Baseline team capabilities: stage logs, create commits, verify co-author handshakes, read stream, and view pool share.",
    scopes: [
      "stage:write",
      "commit:create",
      "commit:verify_coauthor",
      "feed:read",
      "github:connect",
      "cycle:read",
    ],
    isSystem: true,
  },
  {
    slug: "peer-reviewer",
    name: "Peer Reviewer",
    description:
      "Authorized to review high-stakes (>15 pts) or flagged commits, adjust consensus modifier V, and flag commits for audit.",
    scopes: ["commit:review_peer", "commit:flag_review"],
    isSystem: true,
  },
  {
    slug: "pool-manager",
    name: "Pool & Cycle Manager",
    description:
      "Authorized to create/close billing cycles, configure bonus pool budgets, and export payroll CSV ledgers.",
    scopes: ["cycle:read", "cycle:manage"],
    isSystem: true,
  },
  {
    slug: "policy-admin",
    name: "System & Policy Administrator",
    description:
      "Full administrative governance over policy groups, user scope assignments, cycles, and peer review queues.",
    scopes: [
      "user:manage",
      "policy:admin",
      "cycle:manage",
      "commit:review_peer",
      "commit:flag_review",
    ],
    isSystem: true,
  },
] as const;

export function isValidPermissionScope(val: string): val is PermissionScope {
  return (PERMISSION_SCOPES as readonly string[]).includes(val);
}

export function resolveEffectiveScopes(params: {
  readonly directScopes: readonly string[];
  readonly groupScopesList: readonly (readonly string[])[];
}): PermissionScope[] {
  const merged = new Set<PermissionScope>();

  for (const rawScope of params.directScopes) {
    if (isValidPermissionScope(rawScope)) {
      merged.add(rawScope);
    }
  }

  for (const groupScopes of params.groupScopesList) {
    for (const rawScope of groupScopes) {
      if (isValidPermissionScope(rawScope)) {
        merged.add(rawScope);
      }
    }
  }

  return Array.from(merged);
}
