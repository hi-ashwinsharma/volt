"use client";

import { Button, Typography } from "@heroui/react";
import { computeComplexityPower } from "@volt/math";
import type { MathEquationPillProps } from "@volt/types";
import { ChevronDown } from "lucide-react";

export function MathEquationPill(props: MathEquationPillProps) {
  const cPower = computeComplexityPower(props.complexity);

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={props.onToggleExpand}
      className="flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] tabular-nums"
      aria-expanded={props.isExpanded}
    >
      <Typography type="body-xs" color="default">C:{props.complexity} ({cPower})</Typography>
      <Typography type="body-xs" color="muted">×</Typography>
      <Typography type="body-xs" color="default">I:{props.impact.toFixed(1)}×</Typography>
      <Typography type="body-xs" color="muted">×</Typography>
      <Typography type="body-xs" color="default">E:{props.evidence.toFixed(1)}×</Typography>
      <Typography type="body-xs" color="muted">×</Typography>
      <Typography type="body-xs" color="default">V:{props.consensus.toFixed(2)}</Typography>
      <Typography type="body-xs" color="muted">×</Typography>
      <Typography type="body-xs" color="default">D:{props.decay.toFixed(2)}</Typography>
      <ChevronDown
        className={`ml-1 h-3 w-3 text-muted transition-transform duration-200 ${
          props.isExpanded ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </Button>
  );
}
