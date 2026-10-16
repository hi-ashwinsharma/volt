"use client";

import { useRouter } from "next/navigation";
import { CommandPalette } from "../../../components/CommandPalette";
import {
  ApiKeysCard,
  GitHubConnectCard,
  PolicyAdminConsole,
} from "../../../components/IntegrationsAndPolicyCards";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { useVoltWorkspace } from "../../../context/VoltWorkspaceContext";

export default function SettingsIntegrationsPage() {
  const router = useRouter();
  const state = useVoltWorkspace();

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        availableHandles={state.availablePersonas.map((p) => p.handle)}
        onSwitchPersona={state.switchPersona}
        pendingReviewsCount={
          state.commits.filter((c) => c.status === "pending_peer" || c.status === "pending_coauthor").length
        }
        stagedLogsCount={state.stagedLogs.length}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-[1360px] px-6 pt-8 space-y-6">
        <GitHubConnectCard
          installations={state.installations}
          onConnectGitHub={state.handleConnectGitHub}
          isLoading={state.isSubmitting}
        />

        <ApiKeysCard
          apiKeys={state.apiKeys}
          newlyCreatedSecret={state.newlyCreatedSecret}
          onCreateKey={state.handleCreateApiKey}
          onRevokeKey={state.revokeApiKey}
        />

        <PolicyAdminConsole
          groups={state.policyDirectory.groups}
          users={state.policyDirectory.users}
          onUpdateUserGroups={state.handleUpdateUserGroups}
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
