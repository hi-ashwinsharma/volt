"use client";

import { Button, Input, Surface, Typography } from "@heroui/react";
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
  { value: "all", label: "All" },
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
    <div className="min-h-screen bg-background text-foreground pb-16">
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
        {/* Executive Telemetry Strip */}
        <ExecutiveKpiStrip
          summary={state.poolSummary}
          currentUserHandle={state.currentUser.handle}
          stagedCount={state.stagedLogs.length}
          pendingReviewCount={pendingReviewsCount}
        />

        {/* 12-Column Grid */}
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

            {/* Filter & Search Bar */}
            <Surface variant="default" className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl border border-border">
              <div className="flex flex-wrap items-center gap-1">
                {(["all", ...WORK_DOMAINS] as const).map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={state.filter.domain === d ? "primary" : "ghost"}
                    onClick={() => state.setFilter((f) => ({ ...f, domain: d }))}
                    className="h-7 px-3 capitalize rounded-full text-xs"
                  >
                    <Typography type="body-xs">{d}</Typography>
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1">
                  <Search className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                  <Input
                    aria-label="Search deliverables"
                    value={state.filter.searchQuery}
                    onChange={(e) =>
                      state.setFilter((f) => ({ ...f, searchQuery: e.target.value }))
                    }
                    placeholder="Search deliverables..."
                    className="w-32 bg-transparent text-xs text-foreground placeholder:text-muted focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-full border border-border bg-surface-secondary p-0.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={state.filter.status === opt.value ? "secondary" : "ghost"}
                      onClick={() => state.setFilter((f) => ({ ...f, status: opt.value }))}
                      className="h-6 px-2.5 rounded-full text-xs"
                    >
                      <Typography type="body-xs">{opt.label}</Typography>
                    </Button>
                  ))}
                </div>
              </div>
            </Surface>

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

          {/* Right 4-Column Sticky Live Staging Rail */}
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
