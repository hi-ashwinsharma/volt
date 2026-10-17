import type { CycleStatsProps } from "@volt/types";

import { StatTile } from "@/components/common/StatTile";
import { formatCurrency, formatDate, formatPoints } from "@/lib/format";

export function CycleStats({ summary }: CycleStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile label="Pool budget" value={formatCurrency(summary.poolBudget, summary.currency)} />
      <StatTile label="Team points" value={formatPoints(summary.totalTeamPoints)} />
      <StatTile label="Contributors" value={String(summary.activeContributorCount)} />
      <StatTile
        label="Period"
        value={formatDate(summary.startDate)}
        hint={`to ${formatDate(summary.endDate)}`}
      />
    </div>
  );
}
