"use client";

import { Card, Chip, Separator } from "@heroui/react";

import { useSession } from "@/hooks/useSession";
import { DOMAIN_LABELS, SCOPE_LABELS } from "@/lib/labels";

export function ProfileCard() {
  const { me } = useSession();
  if (!me) {
    return null;
  }
  const rows = [
    ["Handle", `@${me.user.handle}`],
    ["Email", me.user.email],
    ["Default domain", DOMAIN_LABELS[me.user.defaultDomain]],
    ["Policy groups", me.user.groupSlugs.join(", ") || "None"],
  ] as const;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Profile</Card.Title>
        <Card.Description>Managed by your workspace administrator.</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted">Effective permissions</span>
          <div className="flex flex-wrap gap-1">
            {me.user.scopes.map((scope) => (
              <Chip key={scope} size="sm" variant="secondary">
                {SCOPE_LABELS[scope]}
              </Chip>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
