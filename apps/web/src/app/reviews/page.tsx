"use client";

import { Card, Chip, Surface, Typography } from "@heroui/react";
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
    <div className="min-h-screen bg-background text-foreground pb-20">
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
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-warning" aria-hidden="true" />
              <Typography type="h3" className="font-semibold text-foreground">
                Sequential Co-Author Handshake Requests (Pre-AI Gate)
              </Typography>
            </div>
            {pendingCoAuthorCommits.length === 0 ? (
              filter === "handshakes" && (
                <Surface variant="secondary" className="rounded-2xl border border-border p-6 text-center">
                  <Typography type="body-sm" color="muted">
                    Zero pending co-author handshakes awaiting verification.
                  </Typography>
                </Surface>
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
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-warning" aria-hidden="true" />
              <Typography type="h3" className="font-semibold text-foreground">
                High-Stakes Peer Review Queue (&gt;15.00 pts)
              </Typography>
            </div>
            {pendingPeerCommits.length === 0 ? (
              filter === "peer_reviews" && (
                <Surface variant="secondary" className="rounded-2xl border border-border p-6 text-center">
                  <Typography type="body-sm" color="muted">
                    All high-stakes deliverables have been finalized and recorded into score_audits.
                  </Typography>
                </Surface>
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
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
              <Typography type="h3" className="font-semibold text-foreground">
                Immutable Audit Ledger History
              </Typography>
            </div>
            {auditedCommits.map((c) => (
              <Card key={c.id} variant="default" className="rounded-2xl border border-border p-5 sm:p-6 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono mb-1">
                    <Chip size="sm" variant="secondary">
                      <Chip.Label>[{c.shortHash}]</Chip.Label>
                    </Chip>
                    <Typography type="body-xs" color="muted">by @{c.authorHandle}</Typography>
                    <Chip color="success" size="sm" variant="soft" className="uppercase font-semibold">
                      <Chip.Label>{c.status}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography type="body-sm" className="font-medium text-foreground">{c.summary}</Typography>
                </div>
                <div className="text-right">
                  <Typography type="h2" className="font-mono font-semibold tabular-nums text-foreground inline">
                    {(c.currentWC ?? 0).toFixed(2)}
                  </Typography>
                  <Typography type="body-xs" color="muted" className="ml-1 inline">
                    pts
                  </Typography>
                </div>
              </Card>
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
