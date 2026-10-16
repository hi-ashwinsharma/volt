"use client";

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
    <article className="apple-surface rounded-[24px] p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Context & Evidence */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-mono font-medium rounded-md bg-control px-2 py-0.5 text-ink-secondary">
              {commit.shortHash}
            </span>
            <span className="rounded-md px-2 py-0.5 font-medium bg-accent-amber-bg text-accent-amber">
              High-Stakes Score (&gt;15.00 pts threshold)
            </span>
            <span className="rounded-md bg-control px-2 py-0.5 capitalize text-ink-secondary font-medium">
              {commit.domain}
            </span>
            <span className="text-ink-tertiary">·</span>
            <span className="font-mono text-ink-secondary">by @{commit.authorHandle}</span>
          </div>

          <h3 className="text-[17px] font-semibold tracking-[-0.018em] text-ink-primary leading-snug">
            {commit.summary}
          </h3>

          {commit.artifactType === "github_app" && commit.githubPrUrl && (
            <div className="apple-inset rounded-[14px] p-3.5 flex items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-accent-blue" aria-hidden="true" />
                <span className="font-medium text-ink-primary">GitHub App Verified Pull Request</span>
              </div>
              <a href={commit.githubPrUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-accent-blue hover:underline">
                View Pull Request →
              </a>
            </div>
          )}

          {commit.artifactType === "file_upload" && (
            <div className="apple-inset rounded-[14px] p-3.5 flex items-center gap-2 text-[12px]">
              <FileCode2 className="h-4 w-4 text-accent-indigo" aria-hidden="true" />
              <span className="font-medium text-ink-primary">Verified .ipynb Empirical Benchmark Notebook</span>
            </div>
          )}

          {audit && (
            <div className="apple-inset rounded-[14px] p-4 text-[12px] space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-accent-emerald text-[11px]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Gemini 1.5 Flash AI Judge Recommendation</span>
              </div>
              <p className="text-ink-secondary leading-relaxed">{audit.reasoning}</p>
            </div>
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
    </article>
  );
}
export { CoAuthorHandshakeCard } from "./CoAuthorHandshakeCard";
