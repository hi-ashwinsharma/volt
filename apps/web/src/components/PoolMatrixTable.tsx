"use client";

import { Button, Card, ProgressBar, Table } from "@heroui/react";
import type { PoolMatrixTableProps } from "@volt/types";
import { Download, Scale, Sliders, TrendingUp, Users } from "lucide-react";

export function PoolMatrixTable(props: PoolMatrixTableProps) {
  const { summary } = props;

  return (
    <section className="space-y-6">
      {/* 3-Column Bento Metric Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="apple-surface rounded-[20px] p-5 sm:p-6">
          <div className="flex items-center justify-between text-[12px] text-ink-secondary">
            <span>Active Sprint Cycle</span>
            <Scale className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
          </div>
          <p className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-ink-primary">{summary.cycleName}</p>
          <p className="mt-1 font-mono text-[11px] tabular-nums text-ink-tertiary">{summary.startDate} — {summary.endDate}</p>
        </Card>

        <Card className="apple-surface rounded-[20px] p-5 sm:p-6">
          <div className="flex items-center justify-between text-[12px] text-ink-secondary">
            <span>Total Team Weighted Output</span>
            <TrendingUp className="h-4 w-4 text-accent-emerald" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-[26px] font-semibold tracking-[-0.035em] tabular-nums text-ink-primary">
            {summary.totalTeamPoints.toFixed(2)}
            <span className="ml-1 font-sans text-[12px] font-normal text-ink-tertiary">pts</span>
          </p>
          <p className="mt-0.5 text-[11px] text-ink-tertiary">Across {summary.activeContributorCount} active contributors</p>
        </Card>

        <Card className="apple-surface rounded-[20px] p-5 sm:p-6">
          <div className="flex items-center justify-between text-[12px] text-ink-secondary">
            <span>Bonus Pool Allocation</span>
            <Users className="h-4 w-4 text-accent-blue" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className="font-mono text-[26px] font-semibold tracking-[-0.035em] tabular-nums text-ink-primary">
              {summary.currency} {props.poolBudget.toLocaleString()}
            </p>
            {props.canManageCycles && (
              <Button
                size="sm"
                variant="ghost"
                onClick={props.onExportCsv}
                className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                <span>Export CSV</span>
              </Button>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-ink-tertiary">Proportional to verified cycle weightage</p>
        </Card>
      </div>

      {/* Interactive What-If Pool Simulator */}
      {props.canManageCycles && (
        <Card className="apple-surface rounded-[20px] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue-bg text-accent-blue">
              <Sliders className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-ink-primary">What-If Pool Budget Simulator</h3>
              <p className="text-[11px] text-ink-tertiary">Adjust sprint budget to simulate real-time compensation payouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-80">
            <span className="font-mono text-[11px] text-ink-tertiary">$10k</span>
            <input
              type="range"
              min={10000}
              max={100000}
              step={5000}
              value={props.poolBudget}
              onChange={(e) => props.onChangePoolBudget(Number(e.target.value))}
              className="w-full accent-accent-blue"
            />
            <span className="font-mono text-[11px] text-ink-tertiary">$100k</span>
          </div>
        </Card>
      )}

      {/* Dynamic Bonus Pool Share Table */}
      <Card className="apple-surface overflow-hidden rounded-[20px]">
        <div className="border-b border-border-subtle px-6 py-5">
          <h2 className="text-[15px] font-semibold tracking-[-0.018em] text-ink-primary">
            Dynamic Bonus Pool Share &amp; Domain Leverage Matrix
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-secondary">
            1–3 verified participants receive 100% point duplication; 4+ switch to 3/N split mode.
          </p>
        </div>

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Dynamic Bonus Pool Share Matrix" className="w-full text-left text-[12px]">
              <Table.Header className="border-b border-border-subtle bg-control text-[11px] font-medium text-ink-secondary">
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
              <Table.Body className="divide-y divide-border-subtle">
                {summary.leaderboard.map((row) => (
                  <Table.Row key={row.userId} className="transition-colors duration-150 hover:bg-control">
                    <Table.Cell className="px-6 py-4">
                      <div className="font-medium text-ink-primary">{row.fullName}</div>
                      <div className="font-mono text-[11px] text-ink-tertiary">@{row.handle}</div>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-mono tabular-nums text-ink-secondary">
                      {row.approvedCommitsCount}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-mono tabular-nums text-accent-blue font-medium">
                      {row.collaborationRatioPercent.toFixed(0)}%
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-mono text-[11px] tabular-nums text-ink-secondary">
                      eng {row.domainBreakdown.engineering} · res {row.domainBreakdown.research} · ops {row.domainBreakdown.ops}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-right font-mono font-semibold tabular-nums text-accent-emerald">
                      {row.totalCyclePoints.toFixed(2)}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ProgressBar aria-label="Pool share" className="w-16" value={Math.min(100, row.poolSharePercent)}>
                          <ProgressBar.Track className="h-1.5 rounded-full bg-control">
                            <ProgressBar.Fill className="rounded-full bg-ink-primary" />
                          </ProgressBar.Track>
                        </ProgressBar>
                        <span className="font-mono font-medium tabular-nums text-ink-primary">
                          {row.poolSharePercent.toFixed(1)}%
                        </span>
                      </div>
                    </Table.Cell>
                    {props.poolBudget > 0 && (
                      <Table.Cell className="px-6 py-4 text-right font-mono font-semibold tabular-nums text-ink-primary">
                        {summary.currency} {row.cyclePayout.toLocaleString()}
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Card>
    </section>
  );
}
