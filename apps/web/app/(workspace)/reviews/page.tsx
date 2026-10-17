"use client";

import { Alert } from "@heroui/react";
import { ApiRoutes, AppRoutes, type CommitRecord } from "@volt/types";

import { CommitsTable } from "@/components/common/CommitsTable";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useApiResource } from "@/hooks/useApiResource";

export default function ReviewQueuePage() {
  const queue = useApiResource<{ commits: readonly CommitRecord[] }>(
    `${ApiRoutes.commits.list}?status=pending_peer&limit=100`,
  );

  return (
    <>
      <PageHeader
        description="Deliverables scoring above 15 points, or flagged by a teammate, need a human decision."
        title="Review queue"
      />
      <div className="flex flex-col gap-4">
        <Alert>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              You cannot review work you authored or co-authored. Those items open read-only.
            </Alert.Description>
          </Alert.Content>
        </Alert>
        {queue.error ? <ErrorPanel message={queue.error} onRetry={queue.reload} /> : null}
        {queue.isLoading && !queue.data ? (
          <ListSkeleton rows={6} />
        ) : (
          <CommitsTable
            ariaLabel="Review queue"
            commits={queue.data?.commits ?? []}
            detailRoute={AppRoutes.reviewDetail}
            emptyDescription="Nothing is waiting for peer review."
            emptyTitle="Queue is clear"
          />
        )}
      </div>
    </>
  );
}
