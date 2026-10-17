"use client";

import { Button, Card, Chip, Table, toast } from "@heroui/react";
import { ApiRoutes, buildApiRoute, type ApiKeysCardProps } from "@volt/types";

import { CreateKeyDialog } from "./CreateKeyDialog";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { formatDate, formatRelative } from "@/lib/format";

export function ApiKeysCard({ apiKeys, onChange }: ApiKeysCardProps) {
  const revoke = async (id: string) => {
    try {
      await apiRequest(buildApiRoute(ApiRoutes.auth.revokeApiKey, { id }), { method: "DELETE" });
      toast.success("Key revoked");
      onChange();
    } catch (err) {
      toast.danger("Could not revoke key", { description: errorMessage(err as Error) });
    }
  };

  return (
    <Card>
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Card.Title>API keys</Card.Title>
          <Card.Description>
            Used by the volt CLI, MCP server, Mac overlay and this web app. Treat them like passwords.
          </Card.Description>
        </div>
        <CreateKeyDialog onCreated={onChange} />
      </Card.Header>
      <Card.Content>
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="API keys" className="min-w-xl">
              <Table.Header>
                <Table.Column isRowHeader>Label</Table.Column>
                <Table.Column>Key</Table.Column>
                <Table.Column>Last used</Table.Column>
                <Table.Column>Created</Table.Column>
                <Table.Column className="text-right">Actions</Table.Column>
              </Table.Header>
              <Table.Body renderEmptyState={() => <EmptyPanel description="Create a key to connect a client." title="No keys" />}>
                {apiKeys.map((key) => (
                  <Table.Row key={key.id} id={key.id}>
                    <Table.Cell className="font-medium">{key.label}</Table.Cell>
                    <Table.Cell className="font-mono text-xs">{key.keyPrefix}...</Table.Cell>
                    <Table.Cell className="text-muted">
                      {key.lastUsedAt ? formatRelative(key.lastUsedAt) : "Never"}
                    </Table.Cell>
                    <Table.Cell className="text-muted">{formatDate(key.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end">
                        {key.revokedAt ? (
                          <Chip size="sm" variant="tertiary">
                            Revoked
                          </Chip>
                        ) : (
                          <Button size="sm" variant="danger-soft" onPress={() => void revoke(key.id)}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Card.Content>
    </Card>
  );
}
