import type { HomeStatsProps } from "@volt/types";

import { StatTile } from "@/components/common/StatTile";
import { formatCurrency, formatPercent, formatPoints } from "@/lib/format";

export function HomeStats({ overview, isLoading }: HomeStatsProps) {
  const cycle = overview?.activeCycleSummary ?? null;
  const mine = cycle?.leaderboard.find((row) => row.userId === overview?.user.userId) ?? null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile
        hint={cycle ? cycle.cycleName : "No active cycle"}
        isLoading={isLoading}
        label="Cycle points"
        value={formatPoints(mine?.totalCyclePoints ?? 0)}
      />
      <StatTile
        hint={cycle ? `${cycle.activeContributorCount} contributors` : undefined}
        isLoading={isLoading}
        label="Pool share"
        value={formatPercent(mine?.poolSharePercent ?? 0)}
      />
      <StatTile
        hint="If the cycle closed today"
        isLoading={isLoading}
        label="Projected payout"
        value={cycle ? formatCurrency(mine?.cyclePayout ?? 0, cycle.currency) : "--"}
      />
      <StatTile
        hint="Logged, not yet committed"
        isLoading={isLoading}
        label="Staged items"
        value={String(overview?.stagedLogs.length ?? 0)}
      />
    </div>
  );
}
