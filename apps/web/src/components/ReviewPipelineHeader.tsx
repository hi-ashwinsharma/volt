"use client";

import { Chip } from "@heroui/react";
import type { ReviewPipelineHeaderProps } from "@volt/types";
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export function ReviewPipelineHeader(props: ReviewPipelineHeaderProps) {
  const { filter, onFilterChange, pendingCoAuthorCount, pendingPeerCount, auditedCount } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-wider text-accent-blue">
            Stage 2 Verification Pipeline
          </span>
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-ink-primary mt-1">
            Evaluation &amp; Triage Workbench
          </h1>
          <p className="text-[13px] text-ink-secondary mt-0.5">
            Sequential co-author consensus and conflict-of-interest guarded peer evaluation.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-control p-1">
          <button
            type="button"
            onClick={() => onFilterChange("all_pending")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all ${
              filter === "all_pending"
                ? "bg-segmented-active text-ink-primary shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Actionable</span>
            <Chip color="warning" size="sm" variant="soft" className="h-4 px-1.5 font-mono text-[10px]">
              <Chip.Label>{pendingCoAuthorCount + pendingPeerCount}</Chip.Label>
            </Chip>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("handshakes")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all ${
              filter === "handshakes"
                ? "bg-segmented-active text-ink-primary shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Clock className="h-3 w-3 opacity-70" aria-hidden="true" />
            <span>Handshakes ({pendingCoAuthorCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("peer_reviews")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all ${
              filter === "peer_reviews"
                ? "bg-segmented-active text-ink-primary shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <ShieldCheck className="h-3 w-3 opacity-70" aria-hidden="true" />
            <span>Peer Reviews ({pendingPeerCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("audited")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all ${
              filter === "audited"
                ? "bg-segmented-active text-ink-primary shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <CheckCircle2 className="h-3 w-3 opacity-70" aria-hidden="true" />
            <span>Audited Ledger ({auditedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
