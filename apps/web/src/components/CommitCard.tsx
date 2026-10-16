"use client";

import { Card, Chip, Surface, Typography } from "@heroui/react";
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
    <Card variant="default" className="rounded-2xl border border-border p-5 relative">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Chip size="sm" variant="secondary" className="font-mono">
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

            <Chip size="sm" variant="secondary" className="capitalize font-medium">
              <Chip.Label>{commit.domain}</Chip.Label>
            </Chip>

            <Typography type="body-xs" color="muted">·</Typography>

            <Typography type="body-xs" color="muted" className="font-mono">@{commit.authorHandle}</Typography>

            {commit.coAuthors.length > 0 && (
              <Chip size="sm" variant="secondary">
                <Users className="h-3 w-3 opacity-70" aria-hidden="true" />
                <Chip.Label>{commit.coAuthors.map((c) => `@${c.handle}`).join(", ")}</Chip.Label>
              </Chip>
            )}
          </div>

          {/* Deliverable Narrative */}
          <Typography type="h4" className="font-medium leading-relaxed text-foreground">
            {commit.summary}
          </Typography>

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
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1 text-[11px] font-medium text-accent hover:opacity-80 transition-opacity"
              >
                <GitPullRequest className="h-3 w-3" aria-hidden="true" />
                <Typography type="body-xs" className="text-accent font-medium">GitHub App Verified PR</Typography>
              </a>
            )}

            {commit.artifactType === "file_upload" && (
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1 text-[11px] font-medium text-accent">
                <FileCode2 className="h-3 w-3" aria-hidden="true" />
                <Typography type="body-xs" className="text-accent font-medium">Empirical .ipynb Artifact</Typography>
              </div>
            )}
          </div>
        </div>

        {/* Score Readout on the Right */}
        <div className="flex flex-row items-center justify-between border-t border-border pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <Chip color={statusMeta.color} size="sm" variant="secondary" className="font-medium">
            <Chip.Label>{statusMeta.label}</Chip.Label>
          </Chip>

          <div className="mt-0 text-right sm:mt-2">
            <Typography type="h2" className="font-mono font-semibold tabular-nums text-foreground inline">
              {(commit.currentWC ?? 0).toFixed(2)}
            </Typography>
            <Typography type="body-xs" color="muted" className="ml-1 inline">
              pts
            </Typography>
          </div>
        </div>
      </div>

      {/* Expandable Audit Ledger Details */}
      {isExpanded && audit && (
        <Surface variant="secondary" className="mt-4 space-y-2.5 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <Typography type="body-sm" className="font-medium">
                {audit.isAiGrade
                  ? "Gemini 1.5 Flash AI Judge Rationale"
                  : `Peer Reviewed by @${audit.gradedByHandle}`}
              </Typography>
            </div>
            <Typography type="body-xs" color="muted" className="font-mono">
              Immutable Ledger #{audit.id}
            </Typography>
          </div>
          <Typography type="body-sm" color="muted" className="leading-relaxed">
            {audit.reasoning}
          </Typography>
          {commit.stagedSnapshot.length > 0 && (
            <div className="border-t border-border pt-2.5">
              <Typography type="body-xs" color="muted" className="mb-1 font-medium">
                Bundled Micro-Logs from Buffer ({commit.stagedSnapshot.length})
              </Typography>
              <ul className="space-y-1 font-mono text-[11px]">
                {commit.stagedSnapshot.map((s) => (
                  <li key={s.id}>
                    <Typography type="body-xs" color="muted">
                      • [{s.source}] {s.rawText}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Surface>
      )}
    </Card>
  );
}
