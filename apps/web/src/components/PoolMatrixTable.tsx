"use client";

import { Button, ProgressBar, Surface, Table, Typography } from "@heroui/react";
import type { PoolMatrixTableProps } from "@volt/types";
import { Download, Scale, Sliders, TrendingUp, Users } from "lucide-react";

export function PoolMatrixTable(props: PoolMatrixTableProps) {
  const { summary } = props;

  return (
    <section className="space-y-6">
      {/* 3-Column Bento Metric Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Surface variant="default" className="rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs">
            <Typography type="body-xs" color="muted">Active Sprint Cycle</Typography>
            <Scale className="h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          <Typography type="h3" className="mt-2 font-semibold tracking-tight text-foreground">
            {summary.cycleName}
          </Typography>
          <Typography type="body-xs" color="muted" className="mt-1 font-mono tabular-nums">
            {summary.startDate} — {summary.endDate}
          </Typography>
        </Surface>

        <Surface variant="default" className="rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs">
            <Typography type="body-xs" color="muted">Total Team Weighted Output</Typography>
            <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <Typography type="h2" className="font-mono font-semibold tabular-nums text-foreground">
              {summary.totalTeamPoints.toFixed(2)}
            </Typography>
            <Typography type="body-xs" color="muted">pts</Typography>
          </div>
          <Typography type="body-xs" color="muted" className="mt-0.5">
            Across {summary.activeContributorCount} active contributors
          </Typography>
        </Surface>

        <Surface variant="default" className="rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs">
            <Typography type="body-xs" color="muted">Bonus Pool Allocation</Typography>
            <Users className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <Typography type="h2" className="font-mono font-semibold tabular-nums text-foreground">
              {summary.currency} {props.poolBudget.toLocaleString()}
            </Typography>
            {props.canManageCycles && (
              <Button
                size="sm"
                variant="outline"
                onClick={props.onExportCsv}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                <Typography type="body-xs">Export CSV</Typography>
              </Button>
            )}
          </div>
          <Typography type="body-xs" color="muted" className="mt-0.5">
            Proportional to verified cycle weightage
          </Typography>
        </Surface>
      </div>

      {/* Interactive What-If Pool Simulator */}
      {props.canManageCycles && (
        <Surface variant="default" className="rounded-2xl border border-border p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary border border-border text-accent">
              <Sliders className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <Typography type="body-sm" className="font-semibold text-foreground">What-If Pool Budget Simulator</Typography>
              <Typography type="body-xs" color="muted">Adjust sprint budget to simulate real-time compensation payouts</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-80">
            <Typography type="code" className="text-[11px]">$10k</Typography>
            <input
              type="range"
              min={10000}
              max={100000}
              step={5000}
              value={props.poolBudget}
              onChange={(e) => props.onChangePoolBudget(Number(e.target.value))}
              className="w-full"
            />
            <Typography type="code" className="text-[11px]">$100k</Typography>
          </div>
        </Surface>
      )}

      {/* Dynamic Bonus Pool Share Table */}
      <Surface variant="default" className="overflow-hidden rounded-2xl border border-border">
        <div className="border-b border-border px-6 py-5">
          <Typography type="h3" className="font-semibold tracking-tight text-foreground">
            Dynamic Bonus Pool Share &amp; Domain Leverage Matrix
          </Typography>
          <Typography type="body-sm" color="muted" className="mt-0.5">
            1–3 verified participants receive 100% point duplication; 4+ switch to 3/N split mode.
          </Typography>
        </div>

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Dynamic Bonus Pool Share Matrix" className="w-full text-left text-xs">
              <Table.Header className="border-b border-border bg-surface-secondary text-[11px] font-medium">
                <Table.Column isRowHeader className="px-6 py-3 font-medium">Contributor</Table.Column>
                <Table.Column className="px-6 py-3 font-medium">Deliverables</Table.Column>
                <Table.Column className="px-6 py-3 font-medium">Collab Ratio</Table.Column>
                <Table.Column className="px-6 py-3 font-medium">Domain Breakdown</Table.Column>
                <Table.Column className="px-6 py-3 text-right font-medium">Cycle Points</Table.Column>
                <Table.Column className="px-6 py-3 text-right font-medium">Pool Share %</Table.Column>
                {props.poolBudget > 0 && (
                  <Table.Column className="px-6 py-3 text-right font-medium">Simulated Payout</Table.Column>
                )}
              </Table.Header>
              <Table.Body className="divide-y divide-border">
                {summary.leaderboard.map((row) => (
                  <Table.Row key={row.userId} className="transition-colors hover:bg-surface-secondary">
                    <Table.Cell className="px-6 py-4">
                      <Typography type="body-sm" className="font-medium">{row.fullName}</Typography>
                      <Typography type="body-xs" color="muted" className="font-mono">@{row.handle}</Typography>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-mono tabular-nums">
                      <Typography type="body-sm">{row.approvedCommitsCount}</Typography>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-mono tabular-nums text-accent font-medium">
                      <Typography type="body-sm" className="text-accent">{row.collaborationRatioPercent.toFixed(0)}%</Typography>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-mono text-[11px] tabular-nums">
                      <Typography type="body-xs" color="muted">
                        eng {row.domainBreakdown.engineering} · res {row.domainBreakdown.research} · ops {row.domainBreakdown.ops}
                      </Typography>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-right font-mono font-semibold tabular-nums text-success">
                      <Typography type="body-sm" className="text-success font-semibold">{row.totalCyclePoints.toFixed(2)}</Typography>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ProgressBar aria-label="Pool share" className="w-16" value={Math.min(100, row.poolSharePercent)}>
                          <ProgressBar.Track className="h-1.5 rounded-full bg-surface-secondary">
                            <ProgressBar.Fill className="rounded-full bg-foreground" />
                          </ProgressBar.Track>
                        </ProgressBar>
                        <Typography type="body-sm" className="font-mono font-medium tabular-nums">
                          {row.poolSharePercent.toFixed(1)}%
                        </Typography>
                      </div>
                    </Table.Cell>
                    {props.poolBudget > 0 && (
                      <Table.Cell className="px-6 py-4 text-right font-mono font-semibold tabular-nums">
                        <Typography type="body-sm" className="font-semibold">
                          {summary.currency} {row.cyclePayout.toLocaleString()}
                        </Typography>
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Surface>
    </section>
  );
}
