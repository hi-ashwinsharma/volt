import type {
  CommitReviewTarget,
  PolicyEvaluationResult,
  UserPolicyContext,
} from "@volt/types";

export function canReviewCommit(
  actor: UserPolicyContext,
  commit: CommitReviewTarget
): PolicyEvaluationResult {
  if (!actor.isActive) {
    return {
      allowed: false,
      reason: "USER_INACTIVE",
    };
  }

  if (!actor.scopes.includes("commit:review_peer")) {
    return {
      allowed: false,
      reason: "MISSING_SCOPE_COMMIT_REVIEW_PEER",
      missingScope: "commit:review_peer",
    };
  }

  if (commit.authorId === actor.userId) {
    return {
      allowed: false,
      reason: "CONFLICT_OF_INTEREST_PRIMARY_AUTHOR",
    };
  }

  if (commit.coAuthorUserIds.includes(actor.userId)) {
    return {
      allowed: false,
      reason: "CONFLICT_OF_INTEREST_COAUTHOR",
    };
  }

  return { allowed: true };
}
