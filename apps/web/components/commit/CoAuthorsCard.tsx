import { Avatar, Card, Separator } from "@heroui/react";
import type { CoAuthorsCardProps } from "@volt/types";

import { StatusChip } from "@/components/common/StatusChip";
import { formatPoints, initials } from "@/lib/format";
import { COAUTHOR_STATUS_META } from "@/lib/labels";

export function CoAuthorsCard({ coAuthors }: CoAuthorsCardProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Co-authors</Card.Title>
        <Card.Description>
          Up to three contributors each get full credit; larger groups split 3/N.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col">
        {coAuthors.length === 0 ? (
          <span className="text-sm text-muted">Solo deliverable.</span>
        ) : (
          coAuthors.map((author, index) => (
            <div key={author.id}>
              {index > 0 ? <Separator /> : null}
              <div className="flex items-center gap-3 py-2.5">
                <Avatar size="sm">
                  <Avatar.Fallback>{initials(author.fullName)}</Avatar.Fallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">@{author.handle}</span>
                  {author.contributionNote ? (
                    <span className="truncate text-xs text-muted">{author.contributionNote}</span>
                  ) : null}
                </div>
                <span className="font-mono text-xs tabular-nums text-muted">
                  {formatPoints(author.awardedPoints)}
                </span>
                <StatusChip meta={COAUTHOR_STATUS_META[author.status]} />
              </div>
            </div>
          ))
        )}
      </Card.Content>
    </Card>
  );
}
