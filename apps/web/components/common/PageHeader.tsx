import { Breadcrumbs, Typography } from "@heroui/react";
import type { PageHeaderProps } from "@volt/types";

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumbs>
          {breadcrumbs.map((crumb) => (
            <Breadcrumbs.Item key={crumb.label} href={crumb.href}>
              {crumb.label}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography.Heading level={3}>{title}</Typography.Heading>
          {description ? (
            <Typography.Paragraph color="muted" size="sm">
              {description}
            </Typography.Paragraph>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
