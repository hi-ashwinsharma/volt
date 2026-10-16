"use client";

import { Input } from "@heroui/react";
import { WORK_DOMAINS, type CommitStatus } from "@volt/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "../components/CommandPalette";
import { CommitCard } from "../components/CommitCard";
import { ExecutiveKpiStrip } from "../components/ExecutiveKpiStrip";
import { LiveStagingRail } from "../components/LiveStagingRail";
import { NavigationHeader } from "../components/NavigationHeader";
import { TopCaptureBar } from "../components/TopCaptureBar";
import { useVoltWorkspace } from "../context/VoltWorkspaceContext";

const STATUS_OPTIONS: readonly {
  readonly value: CommitStatus | "all";
  readonly label: string;
}[] = [
  { value: "all", label: "All Deliverables" },
  { value: "approved", label: "Verified" },
  { value: "pending_peer", label: "Peer Review" },
  { value: "pending_coauthor", label: "Handshake" },
];

export default function ImpactStreamPage() {
  const router = useRouter();
  const state = useVoltWorkspace();

  const pendingReviewsCount = state.commits.filter(
    (c) => c.status === "pending_peer" || c.status === "pending_coauthor"
  ).length;

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        availableHandles={state.availablePersonas.map((p) => p.handle)}
        onSwitchPersona={state.switchPersona}
        pendingReviewsCount={pendingReviewsCount}
        stagedLogsCount={state.stagedLogs.length}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-[1360px] px-6 pt-6 space-y-6">
        {/* Open-Air Executive Telemetry Strip */}
        <ExecutiveKpiStrip
          summary={state.poolSummary}
          currentUserHandle={state.currentUser.handle}
          stagedCount={state.stagedLogs.length}
          pendingReviewCount={pendingReviewsCount}
        />

        {/* 12-Column Asymmetric Open-Air Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main 8-Column Deliverable Stream */}
          <div className="lg:col-span-8 space-y-5">
            {/* Unified Deliverable Composer */}
            <TopCaptureBar
              stagedLogs={state.stagedLogs}
              defaultDomain={state.currentUser.defaultDomain}
              onStageLog={state.handleStageLog}
              onCreateCommit={state.handleCreateCommit}
              isSubmitting={state.isSubmitting}
            />

            {/* Open-Air Filter & Search Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
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

              <div className="flex items-center gap-2">
                <div className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1">
                  <Search className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />
                  <Input
                    aria-label="Search deliverables"
                    value={state.filter.searchQuery}
                    onChange={(e) =>
                      state.setFilter((f) => ({ ...f, searchQuery: e.target.value }))
                    }
                    placeholder="Search deliverables..."
                    className="w-32 bg-transparent text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
                  />
                </div>

                <div className="flex items-center rounded-full border border-border-subtle bg-control p-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => state.setFilter((f) => ({ ...f, status: opt.value }))}
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

            {/* Chronological Stream */}
            <section className="space-y-3.5" aria-label="Chronological Deliverable Stream">
              {state.filteredCommits.map((commit) => (
                <CommitCard
                  key={commit.id}
                  commit={commit}
                  currentUser={state.currentUser}
                />
              ))}
            </section>
          </div>

          {/* Right 4-Column Sticky Live Staging & Conceptual Model Rail */}
          <div className="lg:col-span-4 sticky top-20">
            <LiveStagingRail
              stagedLogs={state.stagedLogs}
              onStageLog={state.handleStageLog}
              onRemoveStagedLog={state.removeStagedLog}
            />
          </div>
        </div>
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
