import { Avatar, Meter, Table } from "@heroui/react";
import type { PoolShareTableProps } from "@volt/types";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { formatCurrency, formatPercent, formatPoints, initials } from "@/lib/format";

export function PoolShareTable({ summary }: PoolShareTableProps) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Pool share by member" className="min-w-3xl">
          <Table.Header>
            <Table.Column className="w-12">#</Table.Column>
            <Table.Column isRowHeader>Member</Table.Column>
            <Table.Column className="text-right">Approved</Table.Column>
            <Table.Column className="text-right">Collaborative</Table.Column>
            <Table.Column className="text-right">Points</Table.Column>
            <Table.Column className="w-48">Pool share</Table.Column>
            <Table.Column className="text-right">Payout</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyPanel description="No approved deliverables in this cycle yet." title="No contributions" />
            )}
          >
            {summary.leaderboard.map((row, index) => (
              <Table.Row key={row.userId} id={row.userId}>
                <Table.Cell className="text-muted tabular-nums">{index + 1}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <Avatar.Fallback>{initials(row.fullName)}</Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{row.fullName}</span>
                      <span className="text-xs text-muted">@{row.handle}</span>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="text-right tabular-nums">{row.approvedCommitsCount}</Table.Cell>
                <Table.Cell className="text-right tabular-nums">
                  {formatPercent(row.collaborationRatioPercent)}
                </Table.Cell>
                <Table.Cell className="text-right font-mono tabular-nums">
                  {formatPoints(row.totalCyclePoints)}
                </Table.Cell>
                <Table.Cell>
                  <Meter aria-label={`${row.handle} pool share`} size="sm" value={row.poolSharePercent}>
                    <Meter.Output />
                    <Meter.Track>
                      <Meter.Fill />
                    </Meter.Track>
                  </Meter>
                </Table.Cell>
                <Table.Cell className="text-right font-medium tabular-nums">
                  {formatCurrency(row.cyclePayout, summary.currency)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
