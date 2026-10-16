"use client";

import { WORK_DOMAINS, type CommitStatus } from "@volt/types";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "../components/CommandPalette";
import { CommitCard } from "../components/CommitCard";
import { NavigationHeader } from "../components/NavigationHeader";
import { TopCaptureBar } from "../components/TopCaptureBar";
import { useVoltCommandCenter } from "../hooks/useVoltCommandCenter";

export default function ImpactStreamPage() {
  const router = useRouter();
  const state = useVoltCommandCenter();

  const pendingReviewsCount = state.commits.filter(
    (c) => c.status === "pending_peer" || c.status === "pending_coauthor"
  ).length;

  return (
    <div className="min-h-screen bg-[#09090B]">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        pendingReviewsCount={pendingReviewsCount}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <TopCaptureBar
          stagedLogs={state.stagedLogs}
          defaultDomain={state.currentUser.defaultDomain}
          onStageLog={state.handleStageLog}
          onCreateCommit={state.handleCreateCommit}
          isSubmitting={state.isSubmitting}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs text-zinc-400">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Domain:</span>
            </span>
            {(["all", ...WORK_DOMAINS] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => state.setFilter((f) => ({ ...f, domain: d }))}
                className={`rounded-lg px-2.5 py-1 text-xs capitalize transition ${
                  state.filter.domain === d
                    ? "bg-white/[0.12] font-semibold text-zinc-50"
                    : "text-zinc-400 hover:bg-white/[0.05]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter by commit status"
            value={state.filter.status}
            onChange={(e) =>
              state.setFilter((f) => ({
                ...f,
                status: e.target.value as CommitStatus | "all",
              }))
            }
            className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending_peer">Pending Peer Review (&gt;15 pts)</option>
            <option value="pending_coauthor">Pending Co-Author Handshake</option>
          </select>
        </div>

        <section className="space-y-4" aria-label="Live Impact Stream">
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
      />
    </div>
  );
}
