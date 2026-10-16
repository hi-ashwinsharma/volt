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
import { Check, ShieldCheck, Sliders, X } from "lucide-react";
import { useState } from "react";

export function CoAuthorHandshakeCard(props: CoAuthorHandshakeCardProps) {
  const [note, setNote] = useState("");
  const { commit } = props;

  return (
    <div className="volt-glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-cyan-300">
          [{commit.shortHash}] Co-Author Handshake Request from @{commit.authorHandle}
        </span>
        <span className="font-mono text-xs text-zinc-400">24h window</span>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-100">{commit.summary}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe your specific 1-line contribution to unlock AI Judge grading..."
          className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "verify", note)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Verify & Unlock</span>
        </button>
        <button
          type="button"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "reject")}
          className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reject Tag</span>
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
    <div className="volt-glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-xs text-amber-300">{commit.shortHash}</span>
          <span className="text-xs text-zinc-300">
            by <strong className="font-mono">@{commit.authorHandle}</strong> ({commit.domain})
          </span>
        </div>
        <span className="font-mono text-sm font-semibold text-emerald-400">
          Preview W_c: {livePreview.finalPoints.toFixed(2)} pts
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-100">{commit.summary}</p>
      {audit && <p className="mt-1 text-xs text-zinc-400">AI Judge Rationale: {audit.reasoning}</p>}

      {!guard.allowed ? (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
          PBAC Conflict-of-Interest Guard Active ({guard.reason}): Primary authors and co-authors cannot self-review their own high-stakes commits.
        </div>
      ) : (
        <div className="mt-4 space-y-4 border-t border-white/[0.07] pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block font-mono text-[11px] text-zinc-400">Consensus Slider V ({vConsensus.toFixed(2)}x)</label>
              <input
                type="range"
                min="0.70"
                max="1.30"
                step="0.05"
                value={vConsensus}
                onChange={(e) => setVConsensus(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-400"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-zinc-400">Complexity (C)</label>
              <select
                value={overrideC}
                onChange={(e) => setOverrideC(Number(e.target.value) as ComplexityScore)}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-100"
              >
                {COMPLEXITY_SCORES.map((c) => <option key={c} value={c}>C = {c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-zinc-400">Impact (I)</label>
              <select
                value={overrideI}
                onChange={(e) => setOverrideI(Number(e.target.value) as ImpactMultiplier)}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-100"
              >
                {IMPACT_MULTIPLIERS.map((i) => <option key={i} value={i}>I = {i}x</option>)}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-zinc-400">Evidence (E)</label>
              <select
                value={overrideE}
                onChange={(e) => setOverrideE(Number(e.target.value) as EvidenceMultiplier)}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-100"
              >
                {EVIDENCE_MULTIPLIERS.map((ev) => <option key={ev} value={ev}>E = {ev}x</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Mandatory audit reasoning recorded in append-only score_audits..."
              className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={reasoning.trim().length < 5}
              onClick={() => submitDecision("approve")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-40"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Approve Score</span>
            </button>
            <button
              type="button"
              disabled={reasoning.trim().length < 5}
              onClick={() => submitDecision("reject")}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 disabled:opacity-40"
            >
              <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
