"use client";

import { Card, Chip, Surface, Typography } from "@heroui/react";
import { calculateCommitWeightage } from "@volt/math";
import { canReviewCommit } from "@volt/policy";
import type {
  ComplexityScore,
  EvidenceMultiplier,
  ImpactMultiplier,
  PeerReviewCardProps,
} from "@volt/types";
import {
  FileCode2,
  GitPullRequest,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { ReviewWorkbenchCalibration } from "./ReviewWorkbenchCalibration";

export function PeerReviewCard(props: PeerReviewCardProps) {
  const { commit, currentUser } = props;
  const audit = commit.latestAudit;

  const [vConsensus, setVConsensus] = useState<number>(audit?.vConsensus ?? 1.0);
  const [overrideC, setOverrideC] = useState<ComplexityScore>(audit?.cComplexity ?? 8);
  const [overrideI, setOverrideI] = useState<ImpactMultiplier>(audit?.iImpact ?? 1.5);
  const overrideE: EvidenceMultiplier = audit?.eEvidence ?? 1.0;
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
    <Card variant="default" className="rounded-2xl border border-border p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Context & Evidence */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Chip size="sm" variant="secondary" className="font-mono font-medium">
              <Chip.Label>{commit.shortHash}</Chip.Label>
            </Chip>
            <Chip color="warning" size="sm" variant="soft" className="font-medium">
              <Chip.Label>High-Stakes Score (&gt;15.00 pts threshold)</Chip.Label>
            </Chip>
            <Chip size="sm" variant="secondary" className="capitalize font-medium">
              <Chip.Label>{commit.domain}</Chip.Label>
            </Chip>
            <Typography type="body-xs" color="muted">·</Typography>
            <Typography type="body-xs" color="muted" className="font-mono">by @{commit.authorHandle}</Typography>
          </div>

          <Typography type="h3" className="font-semibold tracking-tight text-foreground leading-snug">
            {commit.summary}
          </Typography>

          {commit.artifactType === "github_app" && commit.githubPrUrl && (
            <Surface variant="secondary" className="rounded-xl border border-border p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-accent" aria-hidden="true" />
                <Typography type="body-sm" className="font-medium">GitHub App Verified Pull Request</Typography>
              </div>
              <a href={commit.githubPrUrl} target="_blank" rel="noreferrer" className="text-xs font-mono text-accent hover:underline">
                View Pull Request →
              </a>
            </Surface>
          )}

          {commit.artifactType === "file_upload" && (
            <Surface variant="secondary" className="rounded-xl border border-border p-3.5 flex items-center gap-2 text-xs">
              <FileCode2 className="h-4 w-4 text-accent" aria-hidden="true" />
              <Typography type="body-sm" className="font-medium">Verified .ipynb Empirical Benchmark Notebook</Typography>
            </Surface>
          )}

          {audit && (
            <Surface variant="secondary" className="rounded-xl border border-border p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-success text-[11px]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <Typography type="body-xs" className="font-medium text-success">Gemini 1.5 Flash AI Judge Recommendation</Typography>
              </div>
              <Typography type="body-sm" color="muted" className="leading-relaxed">
                {audit.reasoning}
              </Typography>
            </Surface>
          )}
        </div>

        {/* Right 5 Columns: Interactive Workbench */}
        <ReviewWorkbenchCalibration
          audit={audit}
          canReview={guard.allowed}
          livePoints={livePreview.finalPoints}
          overrideC={overrideC}
          onSelectComplexity={setOverrideC}
          overrideI={overrideI}
          onSelectImpact={setOverrideI}
          vConsensus={vConsensus}
          onChangeConsensus={setVConsensus}
          reasoning={reasoning}
          onChangeReasoning={setReasoning}
          onSubmitDecision={submitDecision}
          onSwitchPersona={props.onSwitchPersona}
        />
      </div>
    </Card>
  );
}
export { CoAuthorHandshakeCard } from "./CoAuthorHandshakeCard";
