"use client";

import { calculateCommitWeightage } from "@volt/math";
import { canReviewCommit } from "@volt/policy";
import {
  COMPLEXITY_SCORES,
  EVIDENCE_MULTIPLIERS,
  IMPACT_MULTIPLIERS,
  type CoAuthorHandshakeCardProps,
  type ComplexityScore,
  type EvidenceMultiplier,
  type ImpactMultiplier,
  type PeerReviewCardProps,
} from "@volt/types";
import { Check, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

export function CoAuthorHandshakeCard(props: CoAuthorHandshakeCardProps) {
  const [note, setNote] = useState("");
  const { commit } = props;

  return (
    <div className="apple-surface rounded-[20px] p-5">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-status-warn" />
          <span className="font-mono text-ink-secondary">[{commit.shortHash}]</span>
          <span className="font-medium text-ink-primary">Co-Author Handshake from @{commit.authorHandle}</span>
        </div>
        <span className="font-mono text-[11px] text-ink-tertiary">24h window</span>
      </div>
      <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-ink-primary">{commit.summary}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe your 1-line contribution to unlock AI Judge grading..."
          className="apple-inset flex-1 rounded-full px-4 py-2 text-[12px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "verify", note)}
          className="apple-btn-primary flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Verify & Unlock</span>
        </button>
        <button
          type="button"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "reject")}
          className="apple-pill flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium text-status-danger"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}

export function PeerReviewCard(props: PeerReviewCardProps) {
  const { commit, currentUser } = props;
  const audit = commit.latestAudit;

  const [vConsensus, setVConsensus] = useState<number>(audit?.vConsensus ?? 1.0);
  const [overrideC, setOverrideC] = useState<ComplexityScore>(audit?.cComplexity ?? 8);
  const [overrideI, setOverrideI] = useState<ImpactMultiplier>(audit?.iImpact ?? 1.5);
  const [overrideE, setOverrideE] = useState<EvidenceMultiplier>(audit?.eEvidence ?? 1.0);
  const [reasoning, setReasoning] = useState("");

  const guard = canReviewCommit(currentUser, {
    commitId: commit.id,
    authorId: commit.authorId,
    coAuthorUserIds: commit.coAuthors.map((c) => c.userId),
  });

  const livePreview = calculateCommitWeightage({
    complexity: overrideC,
    impact: overrideI,
    evidence: overrideE,
    consensus: vConsensus,
    decay: audit?.dDecay ?? 1.0,
  });

  const submitDecision = (decision: "approve" | "reject") => {
    void props.onSubmitReview(commit.shortHash, {
      decision,
      vConsensus,
      overrideComplexity: overrideC,
      overrideImpact: overrideI,
      overrideEvidence: overrideE,
      reasoning,
    });
  };

  return (
    <div className="apple-surface rounded-[20px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full bg-status-warn" />
          <span className="rounded-[6px] border border-border-subtle bg-control px-2 py-0.5 font-mono text-[11px] text-ink-secondary">{commit.shortHash}</span>
          <span className="text-ink-secondary">
            by <strong className="font-mono text-ink-primary">@{commit.authorHandle}</strong> · <span className="capitalize">{commit.domain}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-ink-tertiary">Live Preview </span>
          <span className="font-mono text-[20px] font-semibold tracking-[-0.03em] tabular-nums text-ink-primary">{livePreview.finalPoints.toFixed(2)}</span>
          <span className="ml-1 text-[11px] text-ink-tertiary">pts</span>
        </div>
      </div>

      <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-ink-primary">{commit.summary}</p>
      {audit && <p className="mt-1 text-[12px] text-ink-secondary">AI Judge Rationale: {audit.reasoning}</p>}

      {!guard.allowed ? (
        <div className="apple-inset mt-4 flex items-center gap-2.5 rounded-[14px] px-4 py-3 text-[12px] text-ink-secondary">
          <span className="h-2 w-2 shrink-0 rounded-full bg-status-warn" />
          <span>Conflict-of-Interest Guard ({guard.reason}): Primary authors and co-authors cannot self-review their own high-stakes commits.</span>
        </div>
      ) : (
        <div className="mt-4 space-y-4 border-t border-border-subtle pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="apple-inset rounded-[12px] p-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-ink-secondary">Consensus (V)</span>
                <span className="font-mono font-semibold tabular-nums text-ink-primary">{vConsensus.toFixed(2)}×</span>
              </div>
              <input type="range" min="0.70" max="1.30" step="0.05" value={vConsensus} onChange={(e) => setVConsensus(Number(e.target.value))} className="mt-2.5 w-full" />
            </div>

            <div className="apple-inset rounded-[12px] p-3">
              <span className="block text-[11px] text-ink-secondary">Complexity (C)</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {COMPLEXITY_SCORES.map((c) => (
                  <button key={c} type="button" onClick={() => setOverrideC(c)} className={`rounded-[6px] px-2 py-0.5 font-mono text-[11px] transition-all ${overrideC === c ? "bg-segmented-active font-semibold text-ink-primary shadow-sm" : "text-ink-secondary hover:text-ink-primary"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="apple-inset rounded-[12px] p-3">
              <span className="block text-[11px] text-ink-secondary">Impact (I)</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {IMPACT_MULTIPLIERS.map((i) => (
                  <button key={i} type="button" onClick={() => setOverrideI(i)} className={`rounded-[6px] px-2 py-0.5 font-mono text-[11px] transition-all ${overrideI === i ? "bg-segmented-active font-semibold text-ink-primary shadow-sm" : "text-ink-secondary hover:text-ink-primary"}`}>
                    {i}×
                  </button>
                ))}
              </div>
            </div>

            <div className="apple-inset rounded-[12px] p-3">
              <span className="block text-[11px] text-ink-secondary">Evidence (E)</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {EVIDENCE_MULTIPLIERS.map((ev) => (
                  <button key={ev} type="button" onClick={() => setOverrideE(ev)} className={`rounded-[6px] px-2 py-0.5 font-mono text-[11px] transition-all ${overrideE === ev ? "bg-segmented-active font-semibold text-ink-primary shadow-sm" : "text-ink-secondary hover:text-ink-primary"}`}>
                    {ev}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Mandatory audit note for append-only score_audits ledger..."
              className="apple-inset flex-1 rounded-full px-4 py-2 text-[12px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
            />
            <button type="button" disabled={reasoning.trim().length < 5} onClick={() => submitDecision("approve")} className="apple-btn-primary flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium disabled:opacity-35">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Approve Score</span>
            </button>
            <button type="button" disabled={reasoning.trim().length < 5} onClick={() => submitDecision("reject")} className="apple-pill flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium text-status-danger disabled:opacity-35">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
