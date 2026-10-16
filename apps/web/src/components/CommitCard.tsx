"use client";

import { computeComplexityPower } from "@volt/math";
import type { CommitCardProps, MathEquationPillProps } from "@volt/types";
import {
  CheckCircle2,
  Clock,
  FileCode2,
  FlaskConical,
  GitCommitHorizontal,
  GitPullRequest,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

export function MathEquationPill(props: MathEquationPillProps) {
  const cPower = computeComplexityPower(props.complexity);

  return (
    <button
      type="button"
      onClick={props.onToggleExpand}
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-zinc-950/90 px-3 py-1.5 font-mono text-xs text-zinc-200 transition hover:border-emerald-500/40"
      aria-expanded={props.isExpanded}
    >
      <span className="text-zinc-400">C:{props.complexity}</span>
      <span className="text-zinc-500">({cPower})</span>
      <span className="text-zinc-600">*</span>
      <span className="text-zinc-300">I:{props.impact}x</span>
      <span className="text-zinc-600">*</span>
      <span className="text-cyan-300">E:{props.evidence}x</span>
      <span className="text-zinc-600">*</span>
      <span className="text-amber-300">V:{props.consensus.toFixed(2)}</span>
      <span className="text-zinc-600">*</span>
      <span className="text-zinc-400">D:{props.decay.toFixed(2)}</span>
      <span className="text-zinc-500">=</span>
      <span className="font-semibold text-emerald-400">
        {props.finalPoints.toFixed(2)} pts
      </span>
    </button>
  );
}

export function CommitCard(props: CommitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { commit } = props;
  const audit = commit.latestAudit;

  return (
    <article className="volt-glass rounded-2xl p-5 transition">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/[0.08] bg-zinc-900 px-2 py-0.5 font-mono text-xs text-zinc-300">
            {commit.shortHash}
          </span>

          <span
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase ${
              commit.type === "output"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-violet-500/15 text-violet-300"
            }`}
          >
            {commit.type === "output" ? (
              <GitCommitHorizontal className="h-3 w-3" aria-hidden="true" />
            ) : (
              <FlaskConical className="h-3 w-3" aria-hidden="true" />
            )}
            <span>{commit.type}</span>
          </span>

          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs capitalize text-zinc-300">
            {commit.domain}
          </span>

          <span className="font-mono text-xs text-zinc-400">
            @{commit.authorHandle}
          </span>

          {commit.coAuthors.length > 0 && (
            <span className="flex items-center gap-1 rounded-md border border-white/[0.07] bg-zinc-900/70 px-2 py-0.5 text-xs text-zinc-300">
              <Users className="h-3 w-3 text-cyan-400" aria-hidden="true" />
              <span>
                {commit.coAuthors.map((c) => `@${c.handle} (${c.status})`).join(", ")}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {commit.status === "approved" && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Approved</span>
            </span>
          )}
          {commit.status === "pending_peer" && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pending Peer Review (&gt;15 pts)</span>
            </span>
          )}
          {commit.status === "pending_coauthor" && (
            <span className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Awaiting Co-Author Handshake</span>
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-100">
        {commit.summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {audit ? (
          <MathEquationPill
            complexity={audit.cComplexity}
            impact={audit.iImpact}
            evidence={audit.eEvidence}
            consensus={audit.vConsensus}
            decay={audit.dDecay}
            finalPoints={audit.finalPoints}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((p) => !p)}
          />
        ) : (
          <span className="font-mono text-xs text-zinc-400">
            AI Judge queued pending co-author handshake resolution
          </span>
        )}

        <div className="flex items-center gap-2">
          {commit.artifactType === "github_app" && (
            <a
              href={commit.githubPrUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <GitPullRequest className="h-3.5 w-3.5" aria-hidden="true" />
              <span>GitHub App Verified PR</span>
            </a>
          )}
          {commit.artifactType === "file_upload" && (
            <span className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300">
              <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Verified .ipynb / Proof Artifact</span>
            </span>
          )}
        </div>
      </div>

      {isExpanded && audit && (
        <div className="mt-4 space-y-3 rounded-xl border border-white/[0.07] bg-black/40 p-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span className="font-semibold">
              Immutable Score Audit Ledger ({audit.isAiGrade ? "Gemini 1.5 Flash AI Judge" : `Peer Reviewed by @${audit.gradedByHandle}`})
            </span>
          </div>
          <p className="leading-relaxed text-zinc-300">{audit.reasoning}</p>
          {commit.stagedSnapshot.length > 0 && (
            <div className="border-t border-white/[0.06] pt-2">
              <p className="mb-1 font-mono text-[11px] uppercase text-zinc-400">
                Bundled Staged Micro-Logs ({commit.stagedSnapshot.length})
              </p>
              <ul className="space-y-1 text-zinc-400">
                {commit.stagedSnapshot.map((s) => (
                  <li key={s.id} className="font-mono text-[11px]">
                    - [{s.source}] {s.rawText}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
