"use client";

import { Button } from "@heroui/react";
import { computeComplexityPower } from "@volt/math";
import type { MathEquationPillProps } from "@volt/types";
import { ChevronDown } from "lucide-react";

export function MathEquationPill(props: MathEquationPillProps) {
  const cPower = computeComplexityPower(props.complexity);

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={props.onToggleExpand}
      className="apple-pill group flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] tabular-nums"
      aria-expanded={props.isExpanded}
    >
      <span className="text-ink-secondary">C:{props.complexity} ({cPower})</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">I:{props.impact.toFixed(1)}×</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">E:{props.evidence.toFixed(1)}×</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">V:{props.consensus.toFixed(2)}</span>
      <span className="text-ink-tertiary">×</span>
      <span className="text-ink-secondary">D:{props.decay.toFixed(2)}</span>
      <ChevronDown
        className={`ml-1 h-3 w-3 text-ink-tertiary transition-transform duration-200 ease-apple group-hover:text-ink-primary ${
          props.isExpanded ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </Button>
  );
}
