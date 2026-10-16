"use client";

import { calculateCommitWeightage } from "@volt/math";
import type { ReviewStageFilter } from "@volt/types";
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommandPalette } from "../../components/CommandPalette";
import { NavigationHeader } from "../../components/NavigationHeader";
import {
  CoAuthorHandshakeCard,
  PeerReviewCard,
} from "../../components/PeerReviewCard";
import { ReviewPipelineHeader } from "../../components/ReviewPipelineHeader";
import { useVoltWorkspace } from "../../context/VoltWorkspaceContext";

export default function PeerReviewsPage() {
  const router = useRouter();
  const state = useVoltWorkspace();
  const [filter, setFilter] = useState<ReviewStageFilter>("all_pending");

  const pendingCoAuthorCommits = state.commits.filter(
    (c) => c.status === "pending_coauthor"
  );
  const pendingPeerCommits = state.commits.filter(
    (c) => c.status === "pending_peer"
  );
  const auditedCommits = state.commits.filter(
    (c) => c.status === "approved" || c.status === "rejected"
  );

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        availableHandles={state.availablePersonas.map((p) => p.handle)}
        onSwitchPersona={state.switchPersona}
        pendingReviewsCount={pendingCoAuthorCommits.length + pendingPeerCommits.length}
        stagedLogsCount={state.stagedLogs.length}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-[1360px] px-6 pt-8 space-y-7">
        <ReviewPipelineHeader
          filter={filter}
          onFilterChange={setFilter}
          pendingCoAuthorCount={pendingCoAuthorCommits.length}
          pendingPeerCount={pendingPeerCommits.length}
          auditedCount={auditedCommits.length}
        />

        {/* Co-Author Handshake Section */}
        {(filter === "all_pending" || filter === "handshakes") && (
          <section className="space-y-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
              <Users className="h-4 w-4 text-accent-amber" aria-hidden="true" />
              <h2>Sequential Co-Author Handshake Requests (Pre-AI Gate)</h2>
            </div>
            {pendingCoAuthorCommits.length === 0 ? (
              filter === "handshakes" && (
                <div className="apple-surface rounded-[20px] p-6 text-[13px] text-ink-tertiary text-center">
                  Zero pending co-author handshakes awaiting verification.
                </div>
              )
            ) : (
              pendingCoAuthorCommits.map((c) => (
                <CoAuthorHandshakeCard
                  key={c.id}
                  commit={c}
                  currentUserHandle={state.currentUser.handle}
                  onVerifyHandshake={state.handleVerifyHandshake}
                />
              ))
            )}
          </section>
        )}

        {/* High-Stakes Peer Review Workbench Section */}
        {(filter === "all_pending" || filter === "peer_reviews") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
              <ShieldCheck className="h-4 w-4 text-accent-amber" aria-hidden="true" />
              <h2>High-Stakes Peer Review Queue (&gt;15.00 pts)</h2>
            </div>
            {pendingPeerCommits.length === 0 ? (
              filter === "peer_reviews" && (
                <div className="apple-surface rounded-[20px] p-6 text-[13px] text-ink-tertiary text-center">
                  All high-stakes deliverables have been finalized and recorded into score_audits.
                </div>
              )
            ) : (
              pendingPeerCommits.map((c) => (
                <PeerReviewCard
                  key={c.id}
                  commit={c}
                  currentUser={state.currentUser}
                  onSwitchPersona={state.switchPersona}
                  previewBreakdown={calculateCommitWeightage({
                    complexity: c.latestAudit?.cComplexity ?? 8,
                    impact: c.latestAudit?.iImpact ?? 1.0,
                    evidence: c.latestAudit?.eEvidence ?? 1.0,
                  })}
                  onSubmitReview={state.handleSubmitPeerReview}
                />
              ))
            )}
          </section>
        )}

        {/* Completed Audits View */}
        {filter === "audited" && (
          <section className="space-y-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
              <CheckCircle2 className="h-4 w-4 text-accent-emerald" aria-hidden="true" />
              <h2>Immutable Audit Ledger History</h2>
            </div>
            {auditedCommits.map((c) => (
              <div key={c.id} className="apple-surface rounded-[20px] p-5 sm:p-6 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-ink-secondary mb-1">
                    <span>[{c.shortHash}]</span>
                    <span>by @{c.authorHandle}</span>
                    <span className="text-accent-emerald font-semibold uppercase">{c.status}</span>
                  </div>
                  <p className="text-[14px] font-medium text-ink-primary">{c.summary}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[22px] font-semibold text-ink-primary">
                    {(c.currentWC ?? 0).toFixed(2)}
                  </span>
                  <span className="ml-1 text-[11px] text-ink-tertiary">pts</span>
                </div>
              </div>
            ))}
          </section>
        )}
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
