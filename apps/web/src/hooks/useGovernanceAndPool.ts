"use client";

import { DEFAULT_POLICY_GROUPS, resolveEffectiveScopes } from "@volt/policy";
import type {
  CommitRecord,
  ComplexityScore,
  CyclePoolShareSummary,
  EvidenceMultiplier,
  ImpactMultiplier,
  PolicyDirectoryResponse,
  UserApiKeyRecord,
  UserPolicyContext,
} from "@volt/types";
import { useCallback, useMemo, useState } from "react";
import {
  fetchGitHubInstallUrl,
  postCreateApiKey,
  postPeerReviewCommit,
  postVerifyCoAuthor,
} from "../services/api-client";
import {
  applyLocalPeerReviewToCommit,
  computeCyclePoolFromCommits,
} from "../services/commit-builder";

export function useGovernanceAndPool(params: {
  readonly currentUser: UserPolicyContext;
  readonly commits: readonly CommitRecord[];
  readonly setCommits: React.Dispatch<React.SetStateAction<readonly CommitRecord[]>>;
  readonly poolBudget: number;
  readonly apiKeys: readonly UserApiKeyRecord[];
  readonly setApiKeys: React.Dispatch<React.SetStateAction<readonly UserApiKeyRecord[]>>;
  readonly setNewlyCreatedSecret: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [policyDirectory, setPolicyDirectory] = useState<PolicyDirectoryResponse>(() => ({
    groups: DEFAULT_POLICY_GROUPS.map((g, i) => ({
      id: `pg-${i}`,
      slug: g.slug,
      name: g.name,
      description: g.description,
      scopes: g.scopes,
      isSystem: g.isSystem,
      createdAt: "2026-10-16T00:00:00.000Z",
    })),
    users: [
      {
        id: "u-ashwin-01",
        handle: "ashwin",
        fullName: "Ashwin Sharma",
        email: "hi.ashwinsharma@gmail.com",
        defaultDomain: "engineering",
        groupSlugs: ["core-contributor", "peer-reviewer", "pool-manager", "policy-admin"],
        directScopes: [],
        effectiveScopes: params.currentUser.scopes,
      },
      {
        id: "u-rohan-02",
        handle: "rohan",
        fullName: "Rohan Verma",
        email: "rohan@volt.build",
        defaultDomain: "research",
        groupSlugs: ["core-contributor", "peer-reviewer"],
        directScopes: [],
        effectiveScopes: [
          "stage:write",
          "commit:create",
          "commit:verify_coauthor",
          "feed:read",
          "github:connect",
          "cycle:read",
          "commit:review_peer",
          "commit:flag_review",
        ],
      },
    ],
  }));

  const handleSubmitPeerReview = useCallback(
    async (
      shortHash: string,
      payload: {
        readonly decision: "approve" | "reject";
        readonly vConsensus: number;
        readonly overrideComplexity: ComplexityScore | null;
        readonly overrideImpact: ImpactMultiplier | null;
        readonly overrideEvidence: EvidenceMultiplier | null;
        readonly reasoning: string;
      }
    ) => {
      const remote = await postPeerReviewCommit(shortHash, payload);
      params.setCommits((prev) =>
        prev.map((c) => {
          if (c.shortHash !== shortHash) return c;
          if (remote) {
            return { ...c, status: remote.status, currentWC: remote.finalWC, latestAudit: remote.audit };
          }
          return applyLocalPeerReviewToCommit(c, params.currentUser, payload);
        })
      );
    },
    [params]
  );

  const handleVerifyHandshake = useCallback(
    async (shortHash: string, action: "verify" | "reject", contributionNote?: string) => {
      await postVerifyCoAuthor(shortHash, { action, contributionNote });
      params.setCommits((prev) =>
        prev.map((c) =>
          c.shortHash !== shortHash
            ? c
            : {
                ...c,
                status: "approved",
                coAuthors: c.coAuthors.map((co) =>
                  co.handle === params.currentUser.handle
                    ? { ...co, status: action === "verify" ? "verified" : "rejected", contributionNote: contributionNote ?? null }
                    : co
                ),
              }
        )
      );
    },
    [params]
  );

  const poolSummary: CyclePoolShareSummary = useMemo(
    () => computeCyclePoolFromCommits(params.commits, params.poolBudget),
    [params.commits, params.poolBudget]
  );

  const handleConnectGitHub = useCallback(async () => {
    const url = await fetchGitHubInstallUrl();
    window.open(url ?? "https://github.com/apps/volt-impact-engine/installations/new", "_blank");
  }, []);

  const handleCreateApiKey = useCallback(
    async (label: string) => {
      const created = await postCreateApiKey(label);
      const raw = created?.rawSecretKey ?? `volt_sk_${Math.random().toString(36).slice(2, 18)}`;
      params.setApiKeys((prev) => [
        created?.apiKey ?? {
          id: `key-${Date.now()}`,
          userId: params.currentUser.userId,
          label,
          keyPrefix: raw.slice(0, 14),
          lastUsedAt: null,
          revokedAt: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      params.setNewlyCreatedSecret(raw);
    },
    [params]
  );

  const handleUpdateUserGroups = useCallback(
    async (userId: string, groupSlugs: readonly string[]) => {
      setPolicyDirectory((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id !== userId
            ? u
            : {
                ...u,
                groupSlugs,
                effectiveScopes: resolveEffectiveScopes({
                  directScopes: u.directScopes,
                  groupScopesList: prev.groups.filter((g) => groupSlugs.includes(g.slug)).map((g) => g.scopes),
                }),
              }
        ),
      }));
    },
    []
  );

  return {
    policyDirectory,
    poolSummary,
    handleSubmitPeerReview,
    handleVerifyHandshake,
    handleConnectGitHub,
    handleCreateApiKey,
    handleUpdateUserGroups,
  };
}
