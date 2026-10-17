import { Tray } from "@gravity-ui/icons";
import { EmptyState, Typography } from "@heroui/react";
import type { EmptyPanelProps } from "@volt/types";

export function EmptyPanel({ title, description, action }: EmptyPanelProps) {
  return (
    <EmptyState className="flex w-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <Tray aria-hidden className="size-6 text-muted" />
      <Typography.Paragraph className="font-medium" size="sm">
        {title}
      </Typography.Paragraph>
      <Typography.Paragraph className="max-w-sm" color="muted" size="sm">
        {description}
      </Typography.Paragraph>
      {action ? <div className="pt-2">{action}</div> : null}
    </EmptyState>
  );
}
