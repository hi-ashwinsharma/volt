"use client";

import { CommitFilters } from "@/components/common/CommitFilters";
import { CommitsTable } from "@/components/common/CommitsTable";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useCommitFeed } from "@/hooks/useCommitFeed";
import { useSession } from "@/hooks/useSession";

export default function MyWorkPage() {
  const { me } = useSession();
  const feed = useCommitFeed(200);
  const { resource } = feed;
  const userId = me?.user.userId;
  const mine = (resource.data?.commits ?? []).filter(
    (commit) =>
      commit.authorId === userId || commit.coAuthors.some((author) => author.userId === userId),
  );

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
        description="Deliverables you authored or co-authored, with their scoring status."
        title="My work"
      />
      {resource.error ? <ErrorPanel message={resource.error} onRetry={resource.reload} /> : null}
      {resource.isLoading && !resource.data ? (
        <ListSkeleton rows={8} />
      ) : (
        <CommitsTable
          ariaLabel="My deliverables"
          commits={mine}
          emptyDescription="Stage work from Home or the CLI, then commit it."
          emptyTitle="No deliverables yet"
        />
      )}
    </>
  );
}
