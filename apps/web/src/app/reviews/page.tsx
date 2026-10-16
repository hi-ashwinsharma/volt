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
    <div className="min-h-screen bg-[#09090B]">
      <NavigationHeader
        userHandle={state.currentUser.handle}
        pendingReviewsCount={
          pendingCoAuthorCommits.length + pendingPeerCommits.length
        }
        onOpenCommandPalette={() => state.setIsPaletteOpen(true)}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <h1 className="text-base font-semibold text-zinc-100">
              Sequential Co-Author Handshake Inbox (Pre-AI Judge Gate)
            </h1>
          </div>
          {pendingCoAuthorCommits.length === 0 ? (
            <div className="volt-glass rounded-2xl p-5 text-xs text-zinc-400">
              Zero pending co-author handshakes awaiting your verification.
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

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-100">
              High-Stakes Peer Review Queue (Initial Score &gt; 15.00 pts)
            </h2>
          </div>
          {pendingPeerCommits.length === 0 ? (
            <div className="volt-glass rounded-2xl p-5 text-xs text-zinc-400">
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
      />
    </div>
  );
}
