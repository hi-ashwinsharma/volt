import { Card, Separator, Tooltip } from "@heroui/react";
import type { ScoreBreakdownProps } from "@volt/types";

import { formatPoints } from "@/lib/format";
import { scoreFactors } from "@/lib/labels";

export function ScoreBreakdown({ audit }: ScoreBreakdownProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Score</Card.Title>
        <Card.Description>
          Points = C^1.4 x I x E x V x D, graded by{" "}
          {audit.isAiGrade ? "the AI judge" : `@${audit.gradedByHandle ?? "a reviewer"}`}.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">
            {formatPoints(audit.finalPoints)}
          </span>
          <span className="text-sm text-muted">points</span>
        </div>
        <Separator />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
          {scoreFactors(audit).map((factor) => (
            <Tooltip key={factor.symbol} delay={300}>
              <Tooltip.Trigger aria-label={`${factor.label}: ${factor.description}`}>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted">
                    {factor.label} ({factor.symbol})
                  </dt>
                  <dd className="font-mono text-sm font-medium tabular-nums">{factor.value}</dd>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>{factor.description}</Tooltip.Content>
            </Tooltip>
          ))}
        </dl>
      </Card.Content>
    </Card>
  );
}
