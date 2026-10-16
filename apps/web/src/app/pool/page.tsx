"use client";

import { useRouter } from "next/navigation";
import { CommandPalette } from "../../components/CommandPalette";
import { NavigationHeader } from "../../components/NavigationHeader";
import { PoolMatrixTable } from "../../components/PoolMatrixTable";
import { useGovernanceAndPool } from "../../hooks/useGovernanceAndPool";
import { useVoltCommandCenter } from "../../hooks/useVoltCommandCenter";

export default function PoolShareMatrixPage() {
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

  const handleExportCsv = () => {
    const header =
      "Handle,FullName,ApprovedCommits,TotalCyclePoints,PoolSharePercent,CyclePayout,Currency";
    const rows = gov.poolSummary.leaderboard.map(
      (r) =>
        `${r.handle},"${r.fullName}",${r.approvedCommitsCount},${r.totalCyclePoints},${r.poolSharePercent},${r.cyclePayout},${gov.poolSummary.currency}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `volt-pool-${gov.poolSummary.cycleId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <PoolMatrixTable
          summary={gov.poolSummary}
          canManageCycles={state.currentUser.scopes.includes("cycle:manage")}
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
