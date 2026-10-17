import { ArrowRight, PersonPlus } from "@gravity-ui/icons";
import { Card, Chip, Separator } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { AppRoutes, type AttentionCardProps } from "@volt/types";
import NextLink from "next/link";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { formatRelative } from "@/lib/format";

export function AttentionCard({ handshakes }: AttentionCardProps) {
  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <Card.Title>Needs your attention</Card.Title>
          <Card.Description>Co-author requests awaiting your confirmation.</Card.Description>
        </div>
        {handshakes.length > 0 ? (
          <Chip color="warning" size="sm" variant="soft">
            {handshakes.length} open
          </Chip>
        ) : null}
      </Card.Header>
      <Card.Content className="flex flex-col">
        {handshakes.length === 0 ? (
          <EmptyPanel description="You are all caught up." title="No open requests" />
        ) : (
          handshakes.slice(0, 4).map((commit, index) => (
            <div key={commit.id}>
              {index > 0 ? <Separator /> : null}
              <div className="flex items-center gap-3 py-3">
                <PersonPlus aria-hidden className="size-4 shrink-0 text-warning" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{commit.summary}</span>
                  <span className="text-xs text-muted">
                    @{commit.authorHandle} tagged you
                    {commit.coauthorDeadlineAt
                      ? ` · closes ${formatRelative(commit.coauthorDeadlineAt)}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </Card.Content>
      {handshakes.length > 0 ? (
        <Card.Footer>
          <NextLink
            className={buttonVariants({ variant: "tertiary", size: "sm" })}
            href={AppRoutes.handshakes}
          >
            Review requests
            <ArrowRight className="size-4" />
          </NextLink>
        </Card.Footer>
      ) : null}
    </Card>
  );
}
