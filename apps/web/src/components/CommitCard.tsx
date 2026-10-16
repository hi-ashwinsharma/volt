"use client";

import { Card, Chip } from "@heroui/react";
import type { CommitCardProps } from "@volt/types";
import {
  FileCode2,
  FlaskConical,
  GitCommitHorizontal,
  GitPullRequest,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { MathEquationPill } from "./MathEquationPill";

export { MathEquationPill };

export function CommitCard(props: CommitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { commit } = props;
  const audit = commit.latestAudit;

  const statusMeta =
    commit.status === "approved"
      ? { color: "success" as const, label: "Verified & Scored" }
      : commit.status === "pending_peer"
        ? { color: "warning" as const, label: "Peer Review Required (>15 pts)" }
        : { color: "warning" as const, label: "Co-Author Handshake" };

  return (
    <Card className="apple-surface rounded-[20px] p-5 sm:p-6 relative">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <Chip size="sm" variant="secondary" className="font-mono text-ink-secondary">
              <Chip.Label>{commit.shortHash}</Chip.Label>
            </Chip>

            {commit.type === "output" ? (
              <Chip color="success" size="sm" variant="soft" className="font-medium">
                <GitCommitHorizontal className="h-3 w-3" aria-hidden="true" />
                <Chip.Label>Output</Chip.Label>
              </Chip>
            ) : (
              <Chip color="accent" size="sm" variant="soft" className="font-medium">
                <FlaskConical className="h-3 w-3" aria-hidden="true" />
                <Chip.Label>Insight (R&D)</Chip.Label>
              </Chip>
            )}

            <Chip size="sm" variant="secondary" className="capitalize text-ink-secondary font-medium">
              <Chip.Label>{commit.domain}</Chip.Label>
            </Chip>

            <span className="text-ink-tertiary">·</span>

            <span className="font-mono text-ink-secondary">@{commit.authorHandle}</span>

            {commit.coAuthors.length > 0 && (
              <Chip size="sm" variant="secondary" className="text-ink-secondary">
                <Users className="h-3 w-3 opacity-70" aria-hidden="true" />
                <Chip.Label>{commit.coAuthors.map((c) => `@${c.handle}`).join(", ")}</Chip.Label>
              </Chip>
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
              <Chip color="warning" size="sm" variant="soft" className="font-mono text-[11px]">
                <Chip.Label>AI Judge queued pending co-author handshake</Chip.Label>
              </Chip>
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
          <Chip color={statusMeta.color} size="sm" variant="secondary" className="font-medium">
            <Chip.Label>{statusMeta.label}</Chip.Label>
          </Chip>

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
    </Card>
  );
}
