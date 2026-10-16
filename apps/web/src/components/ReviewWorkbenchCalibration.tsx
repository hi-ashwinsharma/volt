"use client";

import { Button, Card, Chip, Input } from "@heroui/react";
import {
  COMPLEXITY_SCORES,
  IMPACT_MULTIPLIERS,
  type ReviewWorkbenchCalibrationProps,
} from "@volt/types";
import {
  Info,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

export function ReviewWorkbenchCalibration(props: ReviewWorkbenchCalibrationProps) {
  const {
    audit,
    canReview,
    livePoints,
    overrideC,
    onSelectComplexity,
    overrideI,
    onSelectImpact,
    vConsensus,
    onChangeConsensus,
    reasoning,
    onChangeReasoning,
    onSubmitDecision,
    onSwitchPersona,
  } = props;

  return (
    <Card className="lg:col-span-5 apple-inset rounded-[18px] p-5 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between border-b border-border-subtle pb-3">
        <div>
          <span className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">
            Calibrated Score
          </span>
          <div className="font-mono text-[24px] font-semibold tabular-nums text-ink-primary">
            {livePoints.toFixed(2)}{" "}
            <span className="text-[12px] font-normal text-ink-tertiary">pts</span>
          </div>
        </div>
        {audit && (
          <Chip size="sm" variant="secondary" className="font-mono text-[10px]">
            <Chip.Label>Baseline: {audit.finalPoints.toFixed(2)} pts</Chip.Label>
          </Chip>
        )}
      </div>

      {!canReview ? (
        <div className="space-y-3">
          <div className="rounded-[12px] bg-accent-amber-bg p-3 text-[11px] text-accent-amber flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Conflict-of-Interest Guard Active:</strong> Primary authors and tagged co-authors
              cannot approve their own high-stakes deliverables.
            </p>
          </div>
          {onSwitchPersona && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSwitchPersona("priya")}
              className="apple-pill w-full flex items-center justify-center gap-2 rounded-full py-2 text-[11px] font-medium text-ink-primary"
            >
              <UserCheck className="h-3.5 w-3.5 text-accent-blue" aria-hidden="true" />
              <span>Switch to Independent Reviewer (@priya)</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5 text-[11px]">
          <div>
            <div className="flex justify-between mb-1 text-ink-secondary">
              <span>Complexity (C)</span>
              <span className="font-mono font-medium text-ink-primary">C={overrideC}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {COMPLEXITY_SCORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectComplexity(c)}
                  className={`rounded-md px-2 py-0.5 font-mono transition-all ${
                    overrideC === c
                      ? "bg-segmented-active text-ink-primary font-semibold shadow-xs"
                      : "text-ink-tertiary hover:text-ink-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-ink-secondary">
              <span>Business Impact (I)</span>
              <span className="font-mono font-medium text-ink-primary">{overrideI}×</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {IMPACT_MULTIPLIERS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectImpact(i)}
                  className={`rounded-md px-2 py-0.5 font-mono transition-all ${
                    overrideI === i
                      ? "bg-segmented-active text-ink-primary font-semibold shadow-xs"
                      : "text-ink-tertiary hover:text-ink-primary"
                  }`}
                >
                  {i}×
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-ink-secondary">
              <span>Consensus Multiplier (V)</span>
              <span className="font-mono font-medium text-ink-primary">{vConsensus.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="0.70"
              max="1.30"
              step="0.05"
              value={vConsensus}
              onChange={(e) => onChangeConsensus(Number(e.target.value))}
              className="w-full accent-accent-blue"
            />
          </div>

          <Input
            aria-label="Audit reasoning"
            fullWidth
            value={reasoning}
            onChange={(e) => onChangeReasoning(e.target.value)}
            placeholder="Audit reasoning for immutable score_audits ledger..."
            className="apple-inset w-full rounded-full px-3.5 py-1.5 text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
          />

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="primary"
              isDisabled={reasoning.trim().length < 5}
              onClick={() => onSubmitDecision("approve")}
              className="apple-btn-primary flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Approve Score</span>
            </Button>
            <Button
              size="sm"
              variant="danger-soft"
              isDisabled={reasoning.trim().length < 5}
              onClick={() => onSubmitDecision("reject")}
              className="flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reject</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
