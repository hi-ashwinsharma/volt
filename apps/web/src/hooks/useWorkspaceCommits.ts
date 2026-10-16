"use client";

import type {
  CommitRecord,
  CommitType,
  ImpactStreamFilterState,
  StagedLogRecord,
  UseWorkspaceCommitsParams,
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
} from "../services/seed-state";

export function useWorkspaceCommits(params: UseWorkspaceCommitsParams) {
  const { currentUser } = params;
  const [stagedLogs, setStagedLogs] = useState<readonly StagedLogRecord[]>(INITIAL_STAGED_LOGS);
  const [commits, setCommits] = useState<readonly CommitRecord[]>(INITIAL_COMMITS_FEED);
  const [filter, setFilter] = useState<ImpactStreamFilterState>({
    domain: "all",
    status: "all",
    searchQuery: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const [remoteStaged, remoteCommits] = await Promise.all([fetchStagedLogs(), fetchCommitFeed()]);
      if (remoteStaged.length > 0) setStagedLogs(remoteStaged);
      if (remoteCommits.length > 0) setCommits(remoteCommits);
    })();
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

  const removeStagedLog = useCallback((id: string) => {
    setStagedLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

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
        setCommits((prev) => [buildOptimisticCommitRecord({ currentUser, stagedLogs, ...payload }), ...prev]);
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
    stagedLogs,
    setStagedLogs,
    removeStagedLog,
    handleStageLog,
    commits,
    setCommits,
    filter,
    setFilter,
    filteredCommits,
    isSubmitting,
    handleCreateCommit,
  };
}
