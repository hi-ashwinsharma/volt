"use client";

import { Chip, Surface, Typography } from "@heroui/react";
import { AppRoutes, type ExecutiveKpiStripProps } from "@volt/types";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ExecutiveKpiStrip(props: ExecutiveKpiStripProps) {
  const { summary } = props;
  const userRow = summary.leaderboard.find(
    (r) => r.handle === props.currentUserHandle
  );
  const myPoints = userRow?.totalCyclePoints ?? 0;
  const myShare = userRow?.poolSharePercent ?? 0;
  const myPayout = userRow?.cyclePayout ?? 0;

  return (
    <section
      aria-label="Cycle Executive Telemetry"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <Surface variant="default" className="rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Typography type="body-xs" color="muted">
            Team Weighted Output
          </Typography>
          <Chip color="success" size="sm" variant="soft" className="h-4 px-1.5 text-[10px]">
            <Chip.Label>Active</Chip.Label>
          </Chip>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <Typography type="h2" className="font-mono font-semibold tabular-nums">
            {summary.totalTeamPoints.toFixed(2)}
          </Typography>
          <Typography type="body-xs" color="muted">pts</Typography>
        </div>
        <Typography type="body-xs" color="muted" className="mt-0.5">
          {summary.activeContributorCount} active in cycle
        </Typography>
      </Surface>

      <Link href={AppRoutes.poolMatrix} className="block group">
        <Surface variant="default" className="rounded-2xl border border-border p-4 sm:p-5 h-full transition-colors group-hover:bg-surface-secondary">
          <div className="flex items-center justify-between">
            <Typography type="body-xs" color="muted">
              Your Pool Share
            </Typography>
            <ArrowUpRight
              className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </div>
          <Typography type="h2" className="mt-1.5 font-mono font-semibold tabular-nums">
            {myShare.toFixed(1)}%
          </Typography>
          <Typography type="body-xs" color="muted" className="mt-0.5 font-mono tabular-nums">
            {myPoints.toFixed(2)} pts · {summary.currency} {myPayout.toLocaleString()}
          </Typography>
        </Surface>
      </Link>

      <Surface variant="default" className="rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Typography type="body-xs" color="muted">
            Staged Buffer
          </Typography>
          <Chip size="sm" variant="secondary" className="h-4 px-1 font-mono text-[10px]">
            <Chip.Label>WAL</Chip.Label>
          </Chip>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <Typography type="h2" className="font-mono font-semibold tabular-nums">
            {props.stagedCount}
          </Typography>
          <Typography type="body-xs" color="muted">micro-logs</Typography>
        </div>
        <Typography type="body-xs" color="muted" className="mt-0.5">
          Ready to bundle into commit
        </Typography>
      </Surface>

      <Link href={AppRoutes.peerReviews} className="block group">
        <Surface variant="default" className="rounded-2xl border border-border p-4 sm:p-5 h-full transition-colors group-hover:bg-surface-secondary">
          <div className="flex items-center justify-between">
            <Typography type="body-xs" color="muted">
              Governance Queue
            </Typography>
            <Chip
              color={props.pendingReviewCount > 0 ? "warning" : "success"}
              size="sm"
              variant="soft"
              className="h-4 px-1.5 text-[10px]"
            >
              <Chip.Label>{props.pendingReviewCount > 0 ? "Action Required" : "Cleared"}</Chip.Label>
            </Chip>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <Typography type="h2" className="font-mono font-semibold tabular-nums">
              {props.pendingReviewCount}
            </Typography>
            <Typography type="body-xs" color="muted">pending</Typography>
          </div>
          <Typography type="body-xs" color="muted" className="mt-0.5">
            {props.pendingReviewCount > 0
              ? "Requires peer or co-author action"
              : "Zero blocking reviews"}
          </Typography>
        </Surface>
      </Link>
    </section>
  );
}
