"use client";

import type { PoolMatrixTableProps } from "@volt/types";
import { Download, Scale, TrendingUp, Users } from "lucide-react";

export function PoolMatrixTable(props: PoolMatrixTableProps) {
  const { summary } = props;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="volt-glass rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Active Cycle</span>
            <Scale className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-lg font-semibold text-zinc-100">
            {summary.cycleName}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            {summary.startDate} to {summary.endDate}
          </p>
        </div>

        <div className="volt-glass rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Team Weighted Output</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-emerald-400">
            {summary.totalTeamPoints.toFixed(2)} pts
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Across {summary.activeContributorCount} active contributors
          </p>
        </div>

        <div className="volt-glass rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Bonus Pool Budget</span>
            <Users className="h-4 w-4 text-violet-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">
            {summary.currency} {summary.poolBudget.toLocaleString()}
          </p>
          {props.canManageCycles && (
            <button
              type="button"
              onClick={props.onExportCsv}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export Compensation Ledger (CSV)</span>
            </button>
          )}
        </div>
      </div>

      <div className="volt-glass overflow-hidden rounded-2xl">
        <div className="border-b border-white/[0.07] px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Dynamic Bonus Pool Share & Domain Leverage Matrix
          </h2>
          <p className="text-xs text-zinc-400">
            1-3 verified participants receive 100% point duplication; 4+ switch to 3/N split mode.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.07] bg-black/40 font-mono uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3">Contributor</th>
                <th className="px-6 py-3">Approved Commits</th>
                <th className="px-6 py-3">Collab Ratio</th>
                <th className="px-6 py-3">Domain Breakdown (pts)</th>
                <th className="px-6 py-3 text-right">Cycle Points</th>
                <th className="px-6 py-3 text-right">Pool Share %</th>
                {summary.poolBudget > 0 && (
                  <th className="px-6 py-3 text-right">Calculated Payout</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {summary.leaderboard.map((row) => (
                <tr key={row.userId} className="transition hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-100">{row.fullName}</div>
                    <div className="font-mono text-zinc-400">@{row.handle}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-200">
                    {row.approvedCommitsCount}
                  </td>
                  <td className="px-6 py-4 font-mono text-cyan-300">
                    {row.collaborationRatioPercent.toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-zinc-300">
                    eng:{row.domainBreakdown.engineering} | res:{row.domainBreakdown.research} | ops:{row.domainBreakdown.ops}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">
                    {row.totalCyclePoints.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-zinc-100">
                    {row.poolSharePercent.toFixed(2)}%
                  </td>
                  {summary.poolBudget > 0 && (
                    <td className="px-6 py-4 text-right font-mono font-semibold text-amber-300">
                      {summary.currency} {row.cyclePayout.toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
