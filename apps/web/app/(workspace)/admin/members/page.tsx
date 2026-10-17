"use client";

import { Avatar, Button, Chip, Table } from "@heroui/react";
import { ApiRoutes, type DirectoryMember, type PolicyDirectoryResponse } from "@volt/types";
import { useState } from "react";

import { AccessDialog } from "@/components/admin/AccessDialog";
import { EmptyPanel } from "@/components/common/EmptyPanel";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useApiResource } from "@/hooks/useApiResource";
import { useSession } from "@/hooks/useSession";
import { initials } from "@/lib/format";
import { DOMAIN_LABELS } from "@/lib/labels";

export default function MembersPage() {
  const { hasScope } = useSession();
  const directory = useApiResource<PolicyDirectoryResponse>(ApiRoutes.policies.groups);
  const [editing, setEditing] = useState<DirectoryMember | null>(null);
  const groups = directory.data?.groups ?? [];
  const groupName = (slug: string) => groups.find((g) => g.slug === slug)?.name ?? slug;

  return (
    <>
      <PageHeader description="Everyone in the workspace and the policy groups they belong to." title="Members" />
      {directory.error ? <ErrorPanel message={directory.error} onRetry={directory.reload} /> : null}
      {directory.isLoading && !directory.data ? (
        <ListSkeleton rows={8} />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Members" className="min-w-3xl">
              <Table.Header>
                <Table.Column isRowHeader>Member</Table.Column>
                <Table.Column>Default domain</Table.Column>
                <Table.Column>Policy groups</Table.Column>
                <Table.Column className="text-right">Permissions</Table.Column>
                <Table.Column className="text-right">Actions</Table.Column>
              </Table.Header>
              <Table.Body renderEmptyState={() => <EmptyPanel description="Invite teammates to get started." title="No members" />}>
                {(directory.data?.users ?? []).map((member) => (
                  <Table.Row key={member.id} id={member.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <Avatar.Fallback>{initials(member.fullName)}</Avatar.Fallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{member.fullName}</span>
                          <span className="text-xs text-muted">{member.email}</span>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{DOMAIN_LABELS[member.defaultDomain]}</Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-wrap gap-1">
                        {member.groupSlugs.map((slug) => (
                          <Chip key={slug} size="sm" variant="secondary">
                            {groupName(slug)}
                          </Chip>
                        ))}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-right tabular-nums">{member.effectiveScopes.length}</Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end">
                        <Button
                          isDisabled={!hasScope("policy:admin")}
                          size="sm"
                          variant="ghost"
                          onPress={() => setEditing(member)}
                        >
                          Edit access
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
      {editing ? (
        <AccessDialog
          groups={groups}
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            directory.reload();
          }}
        />
      ) : null}
    </>
  );
}
