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
      <span className="text-ink-primary">C {props.complexity}</span>
      <span className="text-ink-tertiary">({cPower})</span>
      <span className="text-ink-tertiary">·</span>
      <span className="text-ink-primary">I {props.impact.toFixed(1)}×</span>
      <span className="text-ink-tertiary">·</span>
      <span className="text-ink-primary">E {props.evidence.toFixed(1)}×</span>
      <span className="text-ink-tertiary">·</span>
      <span className="text-ink-secondary">V {props.consensus.toFixed(2)}</span>
      <span className="text-ink-tertiary">·</span>
      <span className="text-ink-secondary">D {props.decay.toFixed(2)}</span>
      <ChevronDown
        className={`ml-0.5 h-3 w-3 text-ink-tertiary transition-transform duration-200 ease-apple group-hover:text-ink-primary ${
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
      ? { dotClass: "bg-status-ok", label: "Verified" }
      : commit.status === "pending_peer"
        ? { dotClass: "bg-status-warn", label: "Peer Review (>15 pts)" }
        : { dotClass: "bg-status-warn", label: "Co-Author Handshake" };

  return (
    <article className="apple-surface rounded-[20px] p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-[6px] border border-border-subtle bg-control px-2 py-0.5 font-mono text-ink-secondary">
              {commit.shortHash}
            </span>

            <span className="flex items-center gap-1 rounded-[6px] border border-border-subtle bg-control px-2 py-0.5 font-medium capitalize text-ink-primary">
              {commit.type === "output" ? (
                <GitCommitHorizontal className="h-3 w-3 opacity-70" aria-hidden="true" />
              ) : (
                <FlaskConical className="h-3 w-3 opacity-70" aria-hidden="true" />
              )}
              <span>{commit.type === "insight" ? "Insight · R&D" : "Output"}</span>
            </span>

            <span className="rounded-[6px] bg-control px-2 py-0.5 capitalize text-ink-secondary">
              {commit.domain}
            </span>

            <span className="text-ink-tertiary">·</span>

            <span className="font-mono text-ink-secondary">
              @{commit.authorHandle}
            </span>

            {commit.coAuthors.length > 0 && (
              <span className="flex items-center gap-1 rounded-[6px] bg-control px-2 py-0.5 text-ink-secondary">
                <Users className="h-3 w-3 opacity-70" aria-hidden="true" />
                <span>
                  {commit.coAuthors.map((c) => `@${c.handle}`).join(", ")}
                </span>
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-medium leading-[1.5] tracking-[-0.015em] text-ink-primary">
            {commit.summary}
          </h3>

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
              <span className="font-mono text-[11px] text-ink-tertiary">
                AI Judge queued pending co-author handshake
              </span>
            )}

            {commit.artifactType === "github_app" && (
              <a
                href={commit.githubPrUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
              >
                <GitPullRequest className="h-3 w-3 opacity-75" aria-hidden="true" />
                <span>Verified GitHub PR</span>
              </a>
            )}

            {commit.artifactType === "file_upload" && (
              <span className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium">
                <FileCode2 className="h-3 w-3 opacity-75" aria-hidden="true" />
                <span>Empirical .ipynb Artifact</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-between border-t border-border-subtle pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-control px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary">
            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
            <span>{statusMeta.label}</span>
          </div>

          <div className="mt-0 text-right sm:mt-2.5">
            <span className="font-mono text-[24px] font-semibold tracking-[-0.035em] tabular-nums text-ink-primary">
              {(commit.currentWC ?? 0).toFixed(2)}
            </span>
            <span className="ml-1 text-[11px] text-ink-tertiary">pts</span>
          </div>
        </div>
      </div>

      {isExpanded && audit && (
        <div className="apple-inset mt-4 space-y-2.5 rounded-[14px] p-4 text-[12px]">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="flex items-center gap-1.5 font-medium text-ink-primary">
              <Sparkles className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
              <span>
                {audit.isAiGrade
                  ? "Gemini 1.5 Flash Audit Rationale"
                  : `Peer Reviewed by @${audit.gradedByHandle}`}
              </span>
            </span>
            <span className="font-mono text-[11px] text-ink-tertiary">
              Immutable Audit #{audit.id}
            </span>
          </div>
          <p className="leading-relaxed text-ink-secondary">{audit.reasoning}</p>
          {commit.stagedSnapshot.length > 0 && (
            <div className="border-t border-border-subtle pt-2.5">
              <p className="mb-1.5 text-[11px] font-medium text-ink-tertiary">
                Bundled Staged Micro-Logs ({commit.stagedSnapshot.length})
              </p>
              <ul className="space-y-1 font-mono text-[11px] text-ink-secondary">
                {commit.stagedSnapshot.map((s) => (
                  <li key={s.id}>
                    [{s.source}] {s.rawText}
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
