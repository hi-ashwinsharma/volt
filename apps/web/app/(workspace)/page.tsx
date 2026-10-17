"use client";

import { Card } from "@heroui/react";
import { ApiRoutes, type CliStatusOverviewResponse } from "@volt/types";

import { CommitsTable } from "@/components/common/CommitsTable";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { AttentionCard } from "@/components/home/AttentionCard";
import { HomeStats } from "@/components/home/HomeStats";
import { StagingPanel } from "@/components/home/StagingPanel";
import { useApiResource } from "@/hooks/useApiResource";
import { useSession } from "@/hooks/useSession";

export default function HomePage() {
  const { me } = useSession();
  const overview = useApiResource<CliStatusOverviewResponse>(ApiRoutes.auth.statusOverview);
  const data = overview.data;

  return (
    <>
      <PageHeader
        description="Your staged work, open requests and standing in the current cycle."
        title={`Welcome back, @${me?.user.handle ?? ""}`}
      />
      <div className="flex flex-col gap-6">
        {overview.error ? <ErrorPanel message={overview.error} onRetry={overview.reload} /> : null}
        <HomeStats isLoading={overview.isLoading} overview={data} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            {overview.isLoading && !data ? (
              <Card>
                <ListSkeleton rows={4} />
              </Card>
            ) : (
              <StagingPanel logs={data?.stagedLogs ?? []} onChange={overview.reload} />
            )}
          </div>
          <AttentionCard handshakes={data?.pendingHandshakes ?? []} />
        </div>
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Recent deliverables</h2>
          {overview.isLoading && !data ? (
            <ListSkeleton />
          ) : (
            <CommitsTable
              ariaLabel="Recent deliverables"
              commits={data?.recentCommits ?? []}
              emptyDescription="Commit staged work to see it scored here."
              emptyTitle="No deliverables yet"
              showAuthor={false}
            />
          )}
        </section>
      </div>
    </>
  );
}
