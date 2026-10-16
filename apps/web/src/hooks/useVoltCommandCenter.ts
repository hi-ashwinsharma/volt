"use client";

import type {
  CommitRecord,
  CommitType,
  GitHubAppInstallationRecord,
  ImpactStreamFilterState,
  StagedLogRecord,
  UserApiKeyRecord,
  UserPolicyContext,
  WorkDomain,
} from "@volt/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCommitFeed,
  fetchStagedLogs,
  postCreateCommit,
  postStageLog,
} from "../services/api-client";
import { buildOptimisticCommitRecord } from "../services/commit-builder";
import {
  INITIAL_COMMITS_FEED,
  INITIAL_STAGED_LOGS,
  INITIAL_USER_CONTEXT,
} from "../services/seed-state";

export function useVoltCommandCenter() {
  const [currentUser] = useState<UserPolicyContext>(INITIAL_USER_CONTEXT);
  const [stagedLogs, setStagedLogs] = useState<readonly StagedLogRecord[]>(INITIAL_STAGED_LOGS);
  const [commits, setCommits] = useState<readonly CommitRecord[]>(INITIAL_COMMITS_FEED);
  const [filter, setFilter] = useState<ImpactStreamFilterState>({
    domain: "all",
    status: "all",
    searchQuery: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [poolBudget, setPoolBudget] = useState<number>(25000);
  const [installations, setInstallations] = useState<readonly GitHubAppInstallationRecord[]>([
    {
      id: "inst-1",
      installedByUserId: "u-ashwin-01",
      installationId: 5891204,
      accountLogin: "hi-ashwinsharma",
      accountType: "User",
      repositoriesSnapshot: [
        {
          id: 901,
          name: "volt",
          fullName: "hi-ashwinsharma/volt",
          private: false,
          htmlUrl: "https://github.com/hi-ashwinsharma/volt",
        },
      ],
      suspendedAt: null,
      createdAt: "2026-10-16T08:00:00.000Z",
      updatedAt: "2026-10-16T08:00:00.000Z",
    },
  ]);
  const [apiKeys, setApiKeys] = useState<readonly UserApiKeyRecord[]>([
    {
      id: "key-1",
      userId: "u-ashwin-01",
      label: "MacBook Pro CLI & Antigravity MCP",
      keyPrefix: "volt_sk_9f8a1c",
      lastUsedAt: new Date().toISOString(),
      revokedAt: null,
      createdAt: "2026-10-16T07:00:00.000Z",
    },
  ]);
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [remoteStaged, remoteCommits] = await Promise.all([
        fetchStagedLogs(),
        fetchCommitFeed(),
      ]);
      if (remoteStaged.length > 0) setStagedLogs(remoteStaged);
      if (remoteCommits.length > 0) setCommits(remoteCommits);
    })();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStageLog = useCallback(
    async (rawText: string, githubPrUrl: string | null) => {
      if (!rawText.trim()) return;
      setIsSubmitting(true);
      const remote = await postStageLog(rawText, githubPrUrl);
      if (remote) {
        setStagedLogs(remote.logs);
      } else {
        setStagedLogs((prev) => [
          ...prev,
          {
            id: `stg-${Date.now()}`,
            userId: currentUser.userId,
            clientLogId: `local-${Date.now()}`,
            rawText: rawText.trim(),
            source: "web",
            artifactId: null,
            githubPrUrl,
            commitId: null,
            committedAt: null,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setIsSubmitting(false);
    },
    [currentUser.userId]
  );

  const handleCreateCommit = useCallback(
    async (payload: {
      readonly type: CommitType;
      readonly domain: WorkDomain;
      readonly summary: string;
      readonly githubPrUrl: string | null;
      readonly coAuthorHandles: readonly string[];
    }) => {
      setIsSubmitting(true);
      const remote = await postCreateCommit(payload);
      if (remote) {
        setCommits((prev) => [remote.commit, ...prev]);
      } else {
        const newCommit = buildOptimisticCommitRecord({
          currentUser,
          stagedLogs,
          ...payload,
        });
        setCommits((prev) => [newCommit, ...prev]);
      }
      setStagedLogs([]);
      setIsSubmitting(false);
    },
    [currentUser, stagedLogs]
  );

  const filteredCommits = useMemo(() => {
    return commits.filter((c) => {
      if (filter.domain !== "all" && c.domain !== filter.domain) return false;
      if (filter.status !== "all" && c.status !== filter.status) return false;
      if (
        filter.searchQuery &&
        !c.summary.toLowerCase().includes(filter.searchQuery.toLowerCase()) &&
        !c.shortHash.toLowerCase().includes(filter.searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [commits, filter]);

  return {
    currentUser,
    stagedLogs,
    commits,
    filteredCommits,
    filter,
    setFilter,
    isSubmitting,
    isPaletteOpen,
    setIsPaletteOpen,
    poolBudget,
    setPoolBudget,
    installations,
    setInstallations,
    apiKeys,
    setApiKeys,
    newlyCreatedSecret,
    setNewlyCreatedSecret,
    setCommits,
    handleStageLog,
    handleCreateCommit,
  };
}
