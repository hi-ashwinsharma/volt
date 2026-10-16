"use client";

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
      <div className="apple-surface rounded-[16px] px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
            Team Weighted Output
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-status-ok" />
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
      </div>

      <Link
        href={AppRoutes.poolMatrix}
        className="apple-surface group rounded-[16px] px-4 py-3.5"
      >
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
      </Link>

      <div className="apple-surface rounded-[16px] px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
            Staged Buffer
          </span>
          <span className="font-mono text-[10px] text-ink-tertiary">WAL</span>
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
      </div>

      <Link
        href={AppRoutes.peerReviews}
        className="apple-surface group rounded-[16px] px-4 py-3.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-secondary">
            Governance Queue
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              props.pendingReviewCount > 0 ? "bg-status-warn" : "bg-status-ok"
            }`}
          />
        </div>
        <p className="mt-1.5 font-mono text-[22px] font-semibold tracking-[-0.03em] tabular-nums text-ink-primary">
          {props.pendingReviewCount}
          <span className="ml-1.5 font-sans text-[12px] font-normal text-ink-tertiary">
            pending
          </span>
        </p>
        <p className="mt-0.5 text-[11px] text-ink-tertiary">
          {props.pendingReviewCount > 0
            ? "Requires peer verification"
            : "All high-stakes scores verified"}
        </p>
      </Link>
    </section>
  );
}
