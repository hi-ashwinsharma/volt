"use client";

import { Card, Chip } from "@heroui/react";
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
      <Card className="apple-surface rounded-[16px] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
            Team Weighted Output
          </span>
          <Chip color="success" size="sm" variant="soft" className="h-4 px-1.5 text-[10px]">
            <Chip.Label>Active</Chip.Label>
          </Chip>
        </div>
        <p className="mt-1.5 font-mono text-[22px] font-semibold tracking-[-0.03em] tabular-nums text-ink-primary">
          {summary.totalTeamPoints.toFixed(2)}
          <span className="ml-1 font-sans text-[12px] font-normal text-ink-tertiary">
            pts
          </span>
        </p>
        <p className="mt-0.5 text-[11px] text-ink-tertiary">
          {summary.activeContributorCount} active in cycle
        </p>
      </Card>

      <Link
        href={AppRoutes.poolMatrix}
        className="block"
      >
        <Card className="apple-surface group rounded-[16px] p-4 sm:p-5 h-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
              Your Pool Share
            </span>
            <ArrowUpRight
              className="h-3.5 w-3.5 text-ink-tertiary transition-transform duration-200 ease-apple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-primary"
              aria-hidden="true"
            />
          </div>
          <p className="mt-1.5 font-mono text-[22px] font-semibold tracking-[-0.03em] tabular-nums text-ink-primary">
            {myShare.toFixed(1)}%
          </p>
          <p className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-tertiary">
            {myPoints.toFixed(2)} pts · {summary.currency}{" "}
            {myPayout.toLocaleString()}
          </p>
        </Card>
      </Link>

      <Card className="apple-surface rounded-[16px] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
            Staged Buffer
          </span>
          <Chip size="sm" variant="secondary" className="h-4 px-1 font-mono text-[10px]">
            <Chip.Label>WAL</Chip.Label>
          </Chip>
        </div>
        <p className="mt-1.5 font-mono text-[22px] font-semibold tracking-[-0.03em] tabular-nums text-ink-primary">
          {props.stagedCount}
          <span className="ml-1.5 font-sans text-[12px] font-normal text-ink-tertiary">
            micro-logs
          </span>
        </p>
        <p className="mt-0.5 text-[11px] text-ink-tertiary">
          Ready to bundle into commit
        </p>
      </Card>

      <Link
        href={AppRoutes.peerReviews}
        className="block"
      >
        <Card className="apple-surface group rounded-[16px] p-4 sm:p-5 h-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
              Governance Queue
            </span>
            <Chip
              color={props.pendingReviewCount > 0 ? "warning" : "success"}
              size="sm"
              variant="soft"
              className="h-4 px-1.5 text-[10px]"
            >
              <Chip.Label>{props.pendingReviewCount > 0 ? "Action Required" : "Cleared"}</Chip.Label>
            </Chip>
          </div>
          <p className="mt-1.5 font-mono text-[22px] font-semibold tracking-[-0.03em] tabular-nums text-ink-primary">
            {props.pendingReviewCount}
            <span className="ml-1.5 font-sans text-[12px] font-normal text-ink-tertiary">
              pending
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-ink-tertiary">
            {props.pendingReviewCount > 0
              ? "Requires peer or co-author action"
              : "Zero blocking reviews"}
          </p>
        </Card>
      </Link>
    </section>
  );
}
