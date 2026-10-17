"use client";

import { CommitFilters } from "@/components/common/CommitFilters";
import { CommitsTable } from "@/components/common/CommitsTable";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useCommitFeed } from "@/hooks/useCommitFeed";

export default function LedgerPage() {
  const feed = useCommitFeed(100);
  const { resource } = feed;
  const filtered = feed.status !== "all" || feed.domain !== "all";

  return (
    <>
      <PageHeader
        actions={
          <CommitFilters
            domain={feed.domain}
            status={feed.status}
            onDomainChange={feed.setDomain}
            onStatusChange={feed.setStatus}
          />
        }
        description="Every deliverable across the team. Scores and audits are append-only."
        title="Ledger"
      />
      {resource.error ? <ErrorPanel message={resource.error} onRetry={resource.reload} /> : null}
      {resource.isLoading && !resource.data ? (
        <ListSkeleton rows={8} />
      ) : (
        <CommitsTable
          ariaLabel="Team ledger"
          commits={resource.data?.commits ?? []}
          emptyDescription={
            filtered ? "Try a different status or domain filter." : "Committed work from the team appears here."
          }
          emptyTitle={filtered ? "No deliverables match" : "No deliverables yet"}
        />
      )}
    </>
  );
}
