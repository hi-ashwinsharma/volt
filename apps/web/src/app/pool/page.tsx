"use client";

import { useRouter } from "next/navigation";
import { CommandPalette } from "../../components/CommandPalette";
import { NavigationHeader } from "../../components/NavigationHeader";
import { PoolMatrixTable } from "../../components/PoolMatrixTable";
import { useVoltWorkspace } from "../../context/VoltWorkspaceContext";

export default function PoolShareMatrixPage() {
  const router = useRouter();
  const state = useVoltWorkspace();

  const handleExportCsv = () => {
    const header =
      "Handle,FullName,ApprovedCommits,TotalCyclePoints,PoolSharePercent,CyclePayout,Currency";
    const rows = state.poolSummary.leaderboard.map(
      (r) =>
        `${r.handle},"${r.fullName}",${r.approvedCommitsCount},${r.totalCyclePoints},${r.poolSharePercent},${r.cyclePayout},${state.poolSummary.currency}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `volt-pool-${state.poolSummary.cycleId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <PoolMatrixTable
          summary={state.poolSummary}
          canManageCycles={state.currentUser.scopes.includes("cycle:manage")}
          poolBudget={state.poolBudget}
          onChangePoolBudget={state.setPoolBudget}
          onExportCsv={handleExportCsv}
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
