import { CircleFill } from "@gravity-ui/icons";
import { Chip, Tooltip } from "@heroui/react";
import type { StatusChipProps } from "@volt/types";

export function StatusChip({ meta }: StatusChipProps) {
  return (
    <Tooltip delay={400}>
      <Tooltip.Trigger aria-label={`Status: ${meta.label}`}>
        <Chip color={meta.color} size="sm" variant="soft">
          <CircleFill aria-hidden width={6} />
          <Chip.Label>{meta.label}</Chip.Label>
        </Chip>
      </Tooltip.Trigger>
      <Tooltip.Content>{meta.description}</Tooltip.Content>
    </Tooltip>
  );
}
