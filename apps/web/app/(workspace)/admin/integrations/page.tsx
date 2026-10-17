"use client";

import { Button, Card, Chip, Separator, toast } from "@heroui/react";
import { ApiRoutes, type GitHubAppInstallationRecord } from "@volt/types";
import { useState } from "react";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useApiResource } from "@/hooks/useApiResource";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

export default function IntegrationsPage() {
  const status = useApiResource<{ installations: readonly GitHubAppInstallationRecord[] }>(
    ApiRoutes.integrations.githubStatus,
  );
  const [pending, setPending] = useState(false);
  const installations = status.data?.installations ?? [];

  const connect = async () => {
    setPending(true);
    try {
      const res = await apiRequest<{ installUrl: string }>(ApiRoutes.integrations.githubInstallUrl);
      window.location.assign(res.installUrl);
    } catch (err) {
      toast.danger("Could not start GitHub install", { description: errorMessage(err as Error) });
      setPending(false);
    }
  };

  return (
    <>
      <PageHeader
        description="Verified evidence raises scores. Connected sources let volt check pull requests and CI directly."
        title="Integrations"
      />
      {status.error ? <ErrorPanel message={status.error} onRetry={status.reload} /> : null}
      <Card>
        <Card.Header className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Card.Title>GitHub App</Card.Title>
            <Card.Description>
              Verifies pull request authorship, merge state and passing checks for the evidence multiplier.
            </Card.Description>
          </div>
          <Button isPending={pending} size="sm" onPress={() => void connect()}>
            {installations.length > 0 ? "Add account" : "Connect GitHub"}
          </Button>
        </Card.Header>
        <Card.Content className="flex flex-col">
          {status.isLoading && !status.data ? (
            <ListSkeleton rows={2} />
          ) : installations.length === 0 ? (
            <EmptyPanel description="Install the app on a GitHub user or organization." title="Not connected" />
          ) : (
            installations.map((install, index) => (
              <div key={install.id}>
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center gap-3 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">{install.accountLogin}</span>
                    <span className="text-xs text-muted">
                      {install.accountType} · {install.repositoriesSnapshot.length} repositories ·
                      since {formatDate(install.createdAt)}
                    </span>
                  </div>
                  <Chip color={install.suspendedAt ? "danger" : "success"} size="sm" variant="soft">
                    {install.suspendedAt ? "Suspended" : "Active"}
                  </Chip>
                </div>
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </>
  );
}
