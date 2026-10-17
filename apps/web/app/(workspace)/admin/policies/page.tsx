"use client";

import { Chip, Table } from "@heroui/react";
import { ApiRoutes, type PolicyDirectoryResponse } from "@volt/types";

import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useApiResource } from "@/hooks/useApiResource";
import { SCOPE_LABELS } from "@/lib/labels";

export default function PoliciesPage() {
  const directory = useApiResource<PolicyDirectoryResponse>(ApiRoutes.policies.groups);
  const users = directory.data?.users ?? [];

  return (
    <>
      <PageHeader
        description="Access is granted by capability. Each group bundles permission scopes; members inherit the union."
        title="Policies"
      />
      {directory.error ? <ErrorPanel message={directory.error} onRetry={directory.reload} /> : null}
      {directory.isLoading && !directory.data ? (
        <ListSkeleton rows={4} />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Policy groups" className="min-w-3xl">
              <Table.Header>
                <Table.Column isRowHeader>Group</Table.Column>
                <Table.Column>Permissions</Table.Column>
                <Table.Column className="text-right">Members</Table.Column>
              </Table.Header>
              <Table.Body>
                {(directory.data?.groups ?? []).map((group) => (
                  <Table.Row key={group.id} id={group.id}>
                    <Table.Cell>
                      <div className="flex max-w-xs flex-col gap-0.5">
                        <span className="flex items-center gap-2 font-medium">
                          {group.name}
                          {group.isSystem ? (
                            <Chip size="sm" variant="tertiary">
                              System
                            </Chip>
                          ) : null}
                        </span>
                        <span className="text-xs text-muted">{group.description}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-wrap gap-1">
                        {group.scopes.map((scope) => (
                          <Chip key={scope} size="sm" variant="secondary">
                            {SCOPE_LABELS[scope]}
                          </Chip>
                        ))}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-right tabular-nums">
                      {users.filter((user) => user.groupSlugs.includes(group.slug)).length}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </>
  );
}
