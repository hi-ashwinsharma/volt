"use client";

import { Button, Table } from "@heroui/react";
import {
  ApiRoutes,
  type CliStatusOverviewResponse,
  type HandshakeTarget,
} from "@volt/types";
import { useState } from "react";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { HandshakeDialog } from "@/components/handshakes/HandshakeDialog";
import { useApiResource } from "@/hooks/useApiResource";
import { formatRelative } from "@/lib/format";
import { DOMAIN_LABELS } from "@/lib/labels";

export default function HandshakesPage() {
  const overview = useApiResource<CliStatusOverviewResponse>(ApiRoutes.auth.statusOverview);
  const [active, setActive] = useState<HandshakeTarget | null>(null);
  const requests = overview.data?.pendingHandshakes ?? [];

  return (
    <>
      <PageHeader
        description="Teammates tagged you as a co-author. Confirm within 24 hours or the tag times out."
        title="Co-author requests"
      />
      {overview.error ? <ErrorPanel message={overview.error} onRetry={overview.reload} /> : null}
      {overview.isLoading && !overview.data ? (
        <ListSkeleton />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Co-author requests" className="min-w-2xl">
              <Table.Header>
                <Table.Column isRowHeader>Deliverable</Table.Column>
                <Table.Column>Author</Table.Column>
                <Table.Column>Domain</Table.Column>
                <Table.Column>Closes</Table.Column>
                <Table.Column className="text-right">Actions</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() => (
                  <EmptyPanel description="Nobody is waiting on you." title="No open requests" />
                )}
              >
                {requests.map((commit) => (
                  <Table.Row key={commit.id} id={commit.id}>
                    <Table.Cell className="max-w-md truncate font-medium">{commit.summary}</Table.Cell>
                    <Table.Cell>@{commit.authorHandle}</Table.Cell>
                    <Table.Cell>{DOMAIN_LABELS[commit.domain]}</Table.Cell>
                    <Table.Cell className="text-warning">
                      {commit.coauthorDeadlineAt ? formatRelative(commit.coauthorDeadlineAt) : "--"}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onPress={() => setActive({ commit, action: "reject" })}>
                          Decline
                        </Button>
                        <Button size="sm" onPress={() => setActive({ commit, action: "verify" })}>
                          Confirm
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
      {active ? (
        <HandshakeDialog
          action={active.action}
          commit={active.commit}
          onClose={() => setActive(null)}
          onDone={() => {
            setActive(null);
            overview.reload();
          }}
        />
      ) : null}
    </>
  );
}
