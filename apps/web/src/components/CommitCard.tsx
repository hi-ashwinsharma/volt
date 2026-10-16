"use client";

import { computeComplexityPower } from "@volt/math";
import type { CommitCardProps, MathEquationPillProps } from "@volt/types";
import {
  ChevronDown,
  FileCode2,
  FlaskConical,
  GitCommitHorizontal,
  GitPullRequest,
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
      className="apple-pill group flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] tabular-nums active:scale-[0.98]"
      aria-expanded={props.isExpanded}
    >
      <span className="text-ink-secondary">C:{props.complexity} ({cPower})</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">I:{props.impact.toFixed(1)}×</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">E:{props.evidence.toFixed(1)}×</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">V:{props.consensus.toFixed(2)}</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">D:{props.decay.toFixed(2)}</span>
      <ChevronDown
        className={`ml-1 h-3 w-3 text-ink-tertiary transition-transform duration-200 ease-apple group-hover:text-ink-primary ${
          props.isExpanded ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

export function CommitCard(props: CommitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { commit } = props;
  const audit = commit.latestAudit;

  const statusMeta =
    commit.status === "approved"
      ? { dotClass: "bg-status-ok", label: "Verified & Scored", textClass: "text-accent-emerald" }
      : commit.status === "pending_peer"
        ? { dotClass: "bg-status-warn", label: "Peer Review Required (>15 pts)", textClass: "text-accent-amber" }
        : { dotClass: "bg-status-warn", label: "Co-Author Handshake", textClass: "text-accent-amber" };

  return (
    <article className="apple-surface rounded-[20px] p-5.5 relative">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-md border border-border-subtle bg-control px-2 py-0.5 font-mono text-ink-secondary">
              {commit.shortHash}
            </span>

            {commit.type === "output" ? (
              <span className="flex items-center gap-1 rounded-md px-2 py-0.5 font-medium bg-accent-emerald-bg text-accent-emerald">
                <GitCommitHorizontal className="h-3 w-3" aria-hidden="true" />
                <span>Output</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md px-2 py-0.5 font-medium bg-accent-indigo-bg text-accent-indigo">
                <FlaskConical className="h-3 w-3" aria-hidden="true" />
                <span>Insight (R&D)</span>
              </span>
            )}

            <span className="rounded-md bg-control px-2 py-0.5 capitalize text-ink-secondary font-medium">
              {commit.domain}
            </span>

            <span className="text-ink-tertiary">·</span>

            <span className="font-mono text-ink-secondary">@{commit.authorHandle}</span>

            {commit.coAuthors.length > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-control px-2 py-0.5 text-ink-secondary">
                <Users className="h-3 w-3 opacity-70" aria-hidden="true" />
                <span>{commit.coAuthors.map((c) => `@${c.handle}`).join(", ")}</span>
              </span>
            )}
          </div>

          {/* Deliverable Narrative */}
          <h3 className="text-[15px] font-medium leading-relaxed tracking-[-0.015em] text-ink-primary">
            {commit.summary}
          </h3>

          {/* Interactive Evidence and Equation Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
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
              <span className="font-mono text-[11px] text-accent-amber bg-accent-amber-bg px-2.5 py-0.5 rounded-full">
                AI Judge queued pending co-author handshake
              </span>
            )}

            {commit.artifactType === "github_app" && (
              <a
                href={commit.githubPrUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-accent-blue-bg px-3 py-1 text-[11px] font-medium text-accent-blue hover:opacity-85 transition-opacity"
              >
                <GitPullRequest className="h-3 w-3" aria-hidden="true" />
                <span>GitHub App Verified PR</span>
              </a>
            )}

            {commit.artifactType === "file_upload" && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent-indigo-bg px-3 py-1 text-[11px] font-medium text-accent-indigo">
                <FileCode2 className="h-3 w-3" aria-hidden="true" />
                <span>Empirical .ipynb Artifact</span>
              </span>
            )}
          </div>
        </div>

        {/* Score Readout on the Right */}
        <div className="flex flex-row items-center justify-between border-t border-border-subtle pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-control px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary">
            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
            <span className={statusMeta.textClass}>{statusMeta.label}</span>
          </div>

          <div className="mt-0 text-right sm:mt-2.5">
            <span className="font-mono text-[26px] font-semibold tracking-[-0.035em] tabular-nums text-ink-primary">
              {(commit.currentWC ?? 0).toFixed(2)}
            </span>
            <span className="ml-1 text-[11px] text-ink-tertiary">pts</span>
          </div>
        </div>
      </div>

      {/* Expandable Audit Ledger Details */}
      {isExpanded && audit && (
        <div className="apple-inset mt-4 space-y-2.5 rounded-[14px] p-4 text-[12px]">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="flex items-center gap-1.5 font-medium text-ink-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent-emerald" aria-hidden="true" />
              <span>
                {audit.isAiGrade
                  ? "Gemini 1.5 Flash AI Judge Rationale"
                  : `Peer Reviewed by @${audit.gradedByHandle}`}
              </span>
            </span>
            <span className="font-mono text-[11px] text-ink-tertiary">
              Immutable Ledger #{audit.id}
            </span>
          </div>
          <p className="leading-relaxed text-ink-secondary">{audit.reasoning}</p>
          {commit.stagedSnapshot.length > 0 && (
            <div className="border-t border-border-subtle pt-2.5">
              <p className="mb-1 text-[11px] font-medium text-ink-tertiary">
                Bundled Micro-Logs from Buffer ({commit.stagedSnapshot.length})
              </p>
              <ul className="space-y-1 font-mono text-[11px] text-ink-secondary">
                {commit.stagedSnapshot.map((s) => (
                  <li key={s.id}>
                    • [{s.source}] {s.rawText}
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
