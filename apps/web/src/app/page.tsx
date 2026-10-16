"use client";

import { WORK_DOMAINS, type CommitStatus } from "@volt/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "../components/CommandPalette";
import { CommitCard } from "../components/CommitCard";
import { ExecutiveKpiStrip } from "../components/ExecutiveKpiStrip";
import { NavigationHeader } from "../components/NavigationHeader";
import { TopCaptureBar } from "../components/TopCaptureBar";
import { useGovernanceAndPool } from "../hooks/useGovernanceAndPool";
import { useVoltCommandCenter } from "../hooks/useVoltCommandCenter";

const STATUS_OPTIONS: readonly {
  readonly value: CommitStatus | "all";
  readonly label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "approved", label: "Verified" },
  { value: "pending_peer", label: "Peer Review" },
  { value: "pending_coauthor", label: "Handshake" },
];

export default function ImpactStreamPage() {
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

  const pendingReviewsCount = state.commits.filter(
    (c) => c.status === "pending_peer" || c.status === "pending_coauthor"
  ).length;

  return (
    <div className="min-h-screen bg-canvas">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        pendingReviewsCount={pendingReviewsCount}
        stagedLogsCount={state.stagedLogs.length}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <ExecutiveKpiStrip
          summary={gov.poolSummary}
          currentUserHandle={state.currentUser.handle}
          stagedCount={state.stagedLogs.length}
          pendingReviewCount={pendingReviewsCount}
        />

        <TopCaptureBar
          stagedLogs={state.stagedLogs}
          defaultDomain={state.currentUser.defaultDomain}
          onStageLog={state.handleStageLog}
          onCreateCommit={state.handleCreateCommit}
          isSubmitting={state.isSubmitting}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1 rounded-full border border-border-subtle bg-control p-1">
            {(["all", ...WORK_DOMAINS] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => state.setFilter((f) => ({ ...f, domain: d }))}
                className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all duration-150 ease-apple active:scale-[0.98] ${
                  state.filter.domain === d
                    ? "bg-segmented-active text-ink-primary shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1">
              <Search className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />
              <input
                type="text"
                value={state.filter.searchQuery}
                onChange={(e) =>
                  state.setFilter((f) => ({ ...f, searchQuery: e.target.value }))
                }
                placeholder="Filter deliverables..."
                className="w-32 bg-transparent text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
              />
            </div>

            <div className="flex items-center rounded-full border border-border-subtle bg-control p-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    state.setFilter((f) => ({ ...f, status: opt.value }))
                  }
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ease-apple active:scale-[0.98] ${
                    state.filter.status === opt.value
                      ? "bg-segmented-active text-ink-primary shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="space-y-3.5" aria-label="Live Impact Stream">
          {state.filteredCommits.map((commit) => (
            <CommitCard
              key={commit.id}
              commit={commit}
              currentUser={state.currentUser}
            />
          ))}
        </section>
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
