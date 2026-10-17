"use client";

import { Alert, Card, Skeleton } from "@heroui/react";
import {
  ApiRoutes,
  buildApiRoute,
  type CommitDetailViewProps,
  type CommitRecord,
} from "@volt/types";

import { AuditTrail } from "./AuditTrail";
import { CoAuthorsCard } from "./CoAuthorsCard";
import { CommitDetailsCard } from "./CommitDetailsCard";
import { FlagButton } from "./FlagButton";

import { ErrorPanel } from "@/components/common/ErrorPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { ScoreBreakdown } from "@/components/common/ScoreBreakdown";
import { StatusChip } from "@/components/common/StatusChip";
import { useApiResource } from "@/hooks/useApiResource";
import { COMMIT_STATUS_META } from "@/lib/labels";

export function CommitDetailView({ shortHash, breadcrumbs, renderAside }: CommitDetailViewProps) {
  const resource = useApiResource<{ commit: CommitRecord }>(
    buildApiRoute(ApiRoutes.commits.detail, { shortHash }),
  );
  const commit = resource.data?.commit ?? null;

  if (resource.error) {
    return <ErrorPanel message={resource.error} onRetry={resource.reload} />;
  }
  if (!commit) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3 rounded-md" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  const audits = commit.audits ?? (commit.latestAudit ? [commit.latestAudit] : []);
  const meta = COMMIT_STATUS_META[commit.status];

  return (
    <>
      <PageHeader
        actions={
          <>
            <StatusChip meta={meta} />
            <FlagButton commit={commit} onFlagged={resource.reload} />
          </>
        }
        breadcrumbs={[...breadcrumbs, { label: commit.shortHash }]}
        description={`${commit.shortHash} by @${commit.authorHandle}`}
        title={commit.summary}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          {commit.latestAudit ? (
            <ScoreBreakdown audit={commit.latestAudit} />
          ) : (
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Not scored yet</Alert.Title>
                <Alert.Description>{meta.description}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          <Card>
            <Card.Header>
              <Card.Title>Bundled work</Card.Title>
              <Card.Description>
                {commit.stagedSnapshot.length} staged items included in this deliverable.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
                {commit.stagedSnapshot.map((item) => (
                  <li key={item.id}>{item.rawText}</li>
                ))}
              </ol>
            </Card.Content>
          </Card>
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Audit trail</h2>
            <AuditTrail audits={audits} />
          </section>
        </div>
        <div className="flex flex-col gap-6">
          {renderAside ? renderAside(commit, resource.reload) : null}
          <CommitDetailsCard commit={commit} />
          <CoAuthorsCard coAuthors={commit.coAuthors} />
        </div>
      </div>
    </>
  );
}
