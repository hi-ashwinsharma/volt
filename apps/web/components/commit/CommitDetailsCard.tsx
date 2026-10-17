import { Card, Link, Separator } from "@heroui/react";
import type { CommitDetailsCardProps } from "@volt/types";

import { formatDate, formatDateTime } from "@/lib/format";
import { COMMIT_TYPE_LABELS, DOMAIN_LABELS } from "@/lib/labels";

const EVIDENCE_LABELS = {
  none: "Text claim only",
  github_app: "GitHub pull request",
  file_upload: "Uploaded artifact",
} as const;

export function CommitDetailsCard({ commit }: CommitDetailsCardProps) {
  const rows = [
    ["Author", `${commit.authorFullName} (@${commit.authorHandle})`],
    ["Type", COMMIT_TYPE_LABELS[commit.type]],
    ["Domain", DOMAIN_LABELS[commit.domain]],
    ["Work date", formatDate(commit.workDate)],
    ["Committed", formatDateTime(commit.createdAt)],
    ["Evidence", EVIDENCE_LABELS[commit.artifactType]],
  ] as const;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Details</Card.Title>
      </Card.Header>
      <Card.Content>
        <dl className="flex flex-col">
          {rows.map(([label, value], index) => (
            <div key={label}>
              {index > 0 ? <Separator /> : null}
              <div className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card.Content>
      {commit.githubPrUrl ? (
        <Card.Footer>
          <Link href={commit.githubPrUrl} rel="noopener noreferrer" target="_blank">
            Open pull request
            <Link.Icon />
          </Link>
        </Card.Footer>
      ) : null}
    </Card>
  );
}
