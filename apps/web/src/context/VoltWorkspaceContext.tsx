"use client";

import type {
  GitHubAppInstallationRecord,
  UserApiKeyRecord,
  UserPolicyContext,
  VoltWorkspaceContextValue,
} from "@volt/types";
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useGovernanceAndPool } from "../hooks/useGovernanceAndPool";
import { useThemeMode } from "../hooks/useThemeMode";
import { useWorkspaceCommits } from "../hooks/useWorkspaceCommits";
import {
  AVAILABLE_PERSONAS,
  INITIAL_USER_CONTEXT,
} from "../services/seed-state";

const VoltWorkspaceContext = createContext<VoltWorkspaceContextValue | null>(null);

export function VoltWorkspaceProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useThemeMode();
  const [currentUser, setCurrentUser] = useState<UserPolicyContext>(INITIAL_USER_CONTEXT);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [poolBudget, setPoolBudget] = useState<number>(25000);
  const [installations] = useState<readonly GitHubAppInstallationRecord[]>([
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

  const workspaceCommits = useWorkspaceCommits({ currentUser });

  const gov = useGovernanceAndPool({
    currentUser,
    commits: workspaceCommits.commits,
    setCommits: workspaceCommits.setCommits,
    poolBudget,
    apiKeys,
    setApiKeys,
    setNewlyCreatedSecret,
  });

  const switchPersona = useCallback((handle: string) => {
    const found = AVAILABLE_PERSONAS.find((p) => p.handle === handle);
    if (found) setCurrentUser(found);
  }, []);

  const value: VoltWorkspaceContextValue = {
    theme,
    toggleTheme,
    currentUser,
    availablePersonas: AVAILABLE_PERSONAS,
    switchPersona,
    stagedLogs: workspaceCommits.stagedLogs,
    removeStagedLog: workspaceCommits.removeStagedLog,
    commits: workspaceCommits.commits,
    filteredCommits: workspaceCommits.filteredCommits,
    filter: workspaceCommits.filter,
    setFilter: workspaceCommits.setFilter,
    isSubmitting: workspaceCommits.isSubmitting,
    isPaletteOpen,
    setIsPaletteOpen,
    poolBudget,
    setPoolBudget,
    installations,
    apiKeys,
    revokeApiKey: async (id: string) => {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    },
    newlyCreatedSecret,
    handleStageLog: workspaceCommits.handleStageLog,
    handleCreateCommit: workspaceCommits.handleCreateCommit,
    policyDirectory: gov.policyDirectory,
    poolSummary: gov.poolSummary,
    handleSubmitPeerReview: gov.handleSubmitPeerReview,
    handleVerifyHandshake: gov.handleVerifyHandshake,
    handleConnectGitHub: gov.handleConnectGitHub,
    handleCreateApiKey: gov.handleCreateApiKey,
    handleUpdateUserGroups: gov.handleUpdateUserGroups,
  };

  return <VoltWorkspaceContext.Provider value={value}>{children}</VoltWorkspaceContext.Provider>;
}

export function useVoltWorkspace(): VoltWorkspaceContextValue {
  const ctx = useContext(VoltWorkspaceContext);
  if (!ctx) throw new Error("useVoltWorkspace must be used within a VoltWorkspaceProvider");
  return ctx;
}
