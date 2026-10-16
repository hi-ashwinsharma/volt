"use client";

import { calculateCommitWeightage } from "@volt/math";
import { ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "../../components/CommandPalette";
import { NavigationHeader } from "../../components/NavigationHeader";
import {
  CoAuthorHandshakeCard,
  PeerReviewCard,
} from "../../components/PeerReviewCard";
import { useGovernanceAndPool } from "../../hooks/useGovernanceAndPool";
import { useVoltCommandCenter } from "../../hooks/useVoltCommandCenter";

export default function PeerReviewsPage() {
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

  const pendingCoAuthorCommits = state.commits.filter(
    (c) => c.status === "pending_coauthor"
  );
  const pendingPeerCommits = state.commits.filter(
    (c) => c.status === "pending_peer"
  );

  return (
    <div className="min-h-screen bg-canvas">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        pendingReviewsCount={
          pendingCoAuthorCommits.length + pendingPeerCommits.length
        }
        stagedLogsCount={state.stagedLogs.length}
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            <h1 className="text-[16px] font-semibold tracking-[-0.02em] text-ink-primary">
              Sequential Co-Author Handshake Inbox
            </h1>
          </div>
          {pendingCoAuthorCommits.length === 0 ? (
            <div className="apple-surface rounded-[20px] p-5 text-[13px] text-ink-secondary">
              Zero pending co-author handshakes awaiting verification.
            </div>
          ) : (
            pendingCoAuthorCommits.map((c) => (
              <CoAuthorHandshakeCard
                key={c.id}
                commit={c}
                currentUserHandle={state.currentUser.handle}
                onVerifyHandshake={gov.handleVerifyHandshake}
              />
            ))
          )}
        </section>

        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-ink-primary">
              High-Stakes Peer Review Queue (&gt; 15.00 pts)
            </h2>
          </div>
          {pendingPeerCommits.length === 0 ? (
            <div className="apple-surface rounded-[20px] p-5 text-[13px] text-ink-secondary">
              All high-stakes commits have been reviewed and finalized.
            </div>
          ) : (
            pendingPeerCommits.map((c) => (
              <PeerReviewCard
                key={c.id}
                commit={c}
                currentUser={state.currentUser}
                previewBreakdown={calculateCommitWeightage({
                  complexity: c.latestAudit?.cComplexity ?? 8,
                  impact: c.latestAudit?.iImpact ?? 1.0,
                  evidence: c.latestAudit?.eEvidence ?? 1.0,
                })}
                onSubmitReview={gov.handleSubmitPeerReview}
              />
            ))
          )}
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
