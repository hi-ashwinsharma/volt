import { Card, Skeleton } from "@heroui/react";
import type { StatTileProps } from "@volt/types";

export function StatTile({ label, value, hint, isLoading }: StatTileProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Description>{label}</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-1">
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-md" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
        )}
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </Card.Content>
    </Card>
  );
}
