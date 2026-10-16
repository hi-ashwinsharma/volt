import { describe, expect, test } from "bun:test";
import type { UserPolicyContext } from "@volt/types";
import {
  DEFAULT_POLICY_GROUPS,
  canReviewCommit,
  evaluateScopeAccess,
  hasScope,
  resolveEffectiveScopes,
} from "./index";

const makeActor = (
  overrides: Partial<UserPolicyContext> = {}
): UserPolicyContext => ({
  userId: "user-reviewer",
  handle: "reviewer",
  email: "reviewer@volt.build",
  defaultDomain: "engineering",
  scopes: ["commit:review_peer", "feed:read"],
  groupSlugs: ["peer-reviewer"],
  isActive: true,
  ...overrides,
});

describe("@volt/policy — PBAC Engine & Conflict-of-Interest Guards", () => {
  test("merges and deduplicates effective scopes from groups and direct scopes", () => {
    const coreGroup = DEFAULT_POLICY_GROUPS.find(
      (g) => g.slug === "core-contributor"
    );
    const effective = resolveEffectiveScopes({
      directScopes: ["commit:review_peer", "invalid:scope"],
      groupScopesList: [coreGroup ? coreGroup.scopes : []],
    });

    expect(effective).toContain("stage:write");
    expect(effective).toContain("commit:create");
    expect(effective).toContain("commit:review_peer");
    expect(effective.length).toBe(7);
  });

  test("denies inactive users even if scope is present", () => {
    const inactiveActor = makeActor({ isActive: false });
    expect(hasScope(inactiveActor, "commit:review_peer")).toBe(false);
    expect(evaluateScopeAccess(inactiveActor, "commit:review_peer")).toEqual({
      allowed: false,
      reason: "USER_INACTIVE",
    });
  });

  test("enforces conflict-of-interest against primary author self-review", () => {
    const actor = makeActor({ userId: "author-1" });
    const result = canReviewCommit(actor, {
      commitId: "commit-100",
      authorId: "author-1",
      coAuthorUserIds: ["user-2"],
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("CONFLICT_OF_INTEREST_PRIMARY_AUTHOR");
  });

  test("enforces conflict-of-interest against tagged co-author self-review", () => {
    const actor = makeActor({ userId: "coauthor-2" });
    const result = canReviewCommit(actor, {
      commitId: "commit-100",
      authorId: "author-1",
      coAuthorUserIds: ["coauthor-2", "coauthor-3"],
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("CONFLICT_OF_INTEREST_COAUTHOR");
  });

  test("allows independent reviewer holding commit:review_peer scope", () => {
    const actor = makeActor({ userId: "independent-reviewer" });
    const result = canReviewCommit(actor, {
      commitId: "commit-100",
      authorId: "author-1",
      coAuthorUserIds: ["coauthor-2"],
    });

    expect(result.allowed).toBe(true);
  });
});
