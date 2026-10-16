"use client";

import { Button, Chip, Typography } from "@heroui/react";
import type { ReviewPipelineHeaderProps } from "@volt/types";
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export function ReviewPipelineHeader(props: ReviewPipelineHeaderProps) {
  const { filter, onFilterChange, pendingCoAuthorCount, pendingPeerCount, auditedCount } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <Typography type="body-xs" className="uppercase tracking-wider font-medium text-accent">
            Stage 2 Verification Pipeline
          </Typography>
          <Typography type="h2" className="font-semibold tracking-tight mt-1 text-foreground">
            Evaluation &amp; Triage Workbench
          </Typography>
          <Typography type="body-sm" color="muted" className="mt-0.5">
            Sequential co-author consensus and conflict-of-interest guarded peer evaluation.
          </Typography>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface-secondary p-1">
          <Button
            size="sm"
            variant={filter === "all_pending" ? "secondary" : "ghost"}
            onClick={() => onFilterChange("all_pending")}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1"
          >
            <Typography type="body-xs">Actionable</Typography>
            <Chip color="warning" size="sm" variant="soft" className="h-4 px-1.5 font-mono text-[10px]">
              <Chip.Label>{pendingCoAuthorCount + pendingPeerCount}</Chip.Label>
            </Chip>
          </Button>

          <Button
            size="sm"
            variant={filter === "handshakes" ? "secondary" : "ghost"}
            onClick={() => onFilterChange("handshakes")}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1"
          >
            <Clock className="h-3 w-3 text-muted" aria-hidden="true" />
            <Typography type="body-xs">Handshakes ({pendingCoAuthorCount})</Typography>
          </Button>

          <Button
            size="sm"
            variant={filter === "peer_reviews" ? "secondary" : "ghost"}
            onClick={() => onFilterChange("peer_reviews")}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1"
          >
            <ShieldCheck className="h-3 w-3 text-muted" aria-hidden="true" />
            <Typography type="body-xs">Peer Reviews ({pendingPeerCount})</Typography>
          </Button>

          <Button
            size="sm"
            variant={filter === "audited" ? "secondary" : "ghost"}
            onClick={() => onFilterChange("audited")}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1"
          >
            <CheckCircle2 className="h-3 w-3 text-muted" aria-hidden="true" />
            <Typography type="body-xs">Audited Ledger ({auditedCount})</Typography>
          </Button>
        </div>
      </div>
    </div>
  );
}
