"use client";

import { useRouter } from "next/navigation";
import { CommandPalette } from "../../../components/CommandPalette";
import {
  ApiKeysCard,
  GitHubConnectCard,
  PolicyAdminConsole,
} from "../../../components/IntegrationsAndPolicyCards";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { useGovernanceAndPool } from "../../../hooks/useGovernanceAndPool";
import { useVoltCommandCenter } from "../../../hooks/useVoltCommandCenter";

export default function SettingsIntegrationsPage() {
  const router = useRouter();
  const state = useVoltCommandCenter();
  const gov = useGovernanceAndPool({
    currentUser: state.currentUser,
    commits: state.commits,
    setCommits: state.setCommits,
    poolBudget: state.poolBudget,
    apiKeys: state.apiKeys,
    setApiKeys: state.setApiKeys,
    setNewlyCreatedSecret: state.setNewlyCreatedSecret,
  });

  return (
    <div className="min-h-screen bg-canvas">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        pendingReviewsCount={
          state.commits.filter((c) => c.status === "pending_peer").length
        }
        stagedLogsCount={state.stagedLogs.length}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <GitHubConnectCard
          installations={state.installations}
          onConnectGitHub={gov.handleConnectGitHub}
          isLoading={state.isSubmitting}
        />

        <ApiKeysCard
          apiKeys={state.apiKeys}
          newlyCreatedSecret={state.newlyCreatedSecret}
          onCreateKey={gov.handleCreateApiKey}
          onRevokeKey={async (id) => {
            state.setApiKeys((prev) => prev.filter((k) => k.id !== id));
          }}
        />

        <PolicyAdminConsole
          groups={gov.policyDirectory.groups}
          users={gov.policyDirectory.users}
          onUpdateUserGroups={gov.handleUpdateUserGroups}
        />
      </main>

      <CommandPalette
        isOpen={state.isPaletteOpen}
        onClose={() => state.setIsPaletteOpen(false)}
        onNavigate={(route) => router.push(route)}
        onQuickStage={(txt) => state.handleStageLog(txt, null)}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
      />
    </div>
  );
}
