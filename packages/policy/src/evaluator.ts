import type {
  PermissionScope,
  PolicyEvaluationResult,
  UserPolicyContext,
} from "@volt/types";

export function hasScope(
  actor: UserPolicyContext,
  requiredScope: PermissionScope
): boolean {
  if (!actor.isActive) {
    return false;
  }
  return actor.scopes.includes(requiredScope);
}

export function hasAllScopes(
  actor: UserPolicyContext,
  requiredScopes: readonly PermissionScope[]
): boolean {
  if (!actor.isActive) {
    return false;
  }
  return requiredScopes.every((scope) => actor.scopes.includes(scope));
}

export function evaluateScopeAccess(
  actor: UserPolicyContext,
  requiredScope: PermissionScope
): PolicyEvaluationResult {
  if (!actor.isActive) {
    return {
      allowed: false,
      reason: "USER_INACTIVE",
    };
  }
  if (!actor.scopes.includes(requiredScope)) {
    return {
      allowed: false,
      reason: "MISSING_REQUIRED_SCOPE",
      missingScope: requiredScope,
    };
  }
  return { allowed: true };
}

export function assertScope(
  actor: UserPolicyContext,
  requiredScope: PermissionScope
): void {
  const result = evaluateScopeAccess(actor, requiredScope);
  if (!result.allowed) {
    throw new Error(
      `PBAC Access Denied: ${result.reason ?? "FORBIDDEN"} (required scope: ${requiredScope})`
    );
  }
}
