"use client";

import { Avatar, Table } from "@heroui/react";
import { AppRoutes, buildAppRoute, type CommitsTableProps } from "@volt/types";
import { useRouter } from "next/navigation";

import { EmptyPanel } from "./EmptyPanel";
import { StatusChip } from "./StatusChip";

import { formatDate, formatPoints, initials } from "@/lib/format";
import { COMMIT_STATUS_META, COMMIT_TYPE_LABELS, DOMAIN_LABELS } from "@/lib/labels";

export function CommitsTable({
  commits,
  ariaLabel,
  emptyTitle,
  emptyDescription,
  showAuthor = true,
  detailRoute = AppRoutes.commitDetail,
}: CommitsTableProps) {
  const router = useRouter();

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={ariaLabel} className="min-w-3xl">
          <Table.Header>
            <Table.Column isRowHeader>Deliverable</Table.Column>
            {showAuthor ? <Table.Column>Author</Table.Column> : null}
            <Table.Column>Domain</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column className="text-right">Points</Table.Column>
            <Table.Column>Work date</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyPanel description={emptyDescription} title={emptyTitle} />
            )}
          >
            {commits.map((commit) => (
              <Table.Row
                key={commit.id}
                className="cursor-pointer"
                id={commit.id}
                onAction={() =>
                  router.push(buildAppRoute(detailRoute, { shortHash: commit.shortHash }))
                }
              >
                <Table.Cell>
                  <div className="flex max-w-md flex-col gap-0.5">
                    <span className="truncate font-medium">{commit.summary}</span>
                    <span className="font-mono text-xs text-muted">
                      {commit.shortHash} · {COMMIT_TYPE_LABELS[commit.type]}
                    </span>
                  </div>
                </Table.Cell>
                {showAuthor ? (
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <Avatar.Fallback>{initials(commit.authorFullName)}</Avatar.Fallback>
                      </Avatar>
                      <span className="text-sm">@{commit.authorHandle}</span>
                    </div>
                  </Table.Cell>
                ) : null}
                <Table.Cell>{DOMAIN_LABELS[commit.domain]}</Table.Cell>
                <Table.Cell>
                  <StatusChip meta={COMMIT_STATUS_META[commit.status]} />
                </Table.Cell>
                <Table.Cell className="text-right font-mono tabular-nums">
                  {formatPoints(commit.currentWC)}
                </Table.Cell>
                <Table.Cell className="text-muted">{formatDate(commit.workDate)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
