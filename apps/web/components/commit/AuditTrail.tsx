import { Chip, Table } from "@heroui/react";
import type { AuditTrailProps } from "@volt/types";

import { formatDateTime, formatPoints } from "@/lib/format";

export function AuditTrail({ audits }: AuditTrailProps) {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label="Score audit trail" className="min-w-2xl">
          <Table.Header>
            <Table.Column isRowHeader>Graded by</Table.Column>
            <Table.Column>C / I / E / V / D</Table.Column>
            <Table.Column className="text-right">Points</Table.Column>
            <Table.Column>Reasoning</Table.Column>
            <Table.Column>When</Table.Column>
          </Table.Header>
          <Table.Body>
            {audits.map((audit) => (
              <Table.Row key={audit.id} id={audit.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <span>{audit.isAiGrade ? "AI judge" : `@${audit.gradedByHandle ?? "reviewer"}`}</span>
                    {audit.antiGamingFlag ? (
                      <Chip color="danger" size="sm" variant="soft">
                        Flagged
                      </Chip>
                    ) : null}
                  </div>
                </Table.Cell>
                <Table.Cell className="font-mono text-xs tabular-nums">
                  {audit.cComplexity} / {audit.iImpact} / {audit.eEvidence} /{" "}
                  {audit.vConsensus.toFixed(2)} / {audit.dDecay.toFixed(2)}
                </Table.Cell>
                <Table.Cell className="text-right font-mono tabular-nums">
                  {formatPoints(audit.finalPoints)}
                </Table.Cell>
                <Table.Cell className="max-w-sm text-sm text-muted">{audit.reasoning}</Table.Cell>
                <Table.Cell className="whitespace-nowrap text-muted">
                  {formatDateTime(audit.createdAt)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
