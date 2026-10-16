"use client";

import { Alert, Button, Chip, Input, Surface, Typography } from "@heroui/react";
import {
  COMPLEXITY_SCORES,
  IMPACT_MULTIPLIERS,
  type ReviewWorkbenchCalibrationProps,
} from "@volt/types";
import {
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
    <Surface variant="secondary" className="lg:col-span-5 rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <div>
          <Typography type="body-xs" color="muted" className="uppercase tracking-wider font-medium">
            Calibrated Score
          </Typography>
          <div className="flex items-baseline gap-1 mt-0.5">
            <Typography type="h2" className="font-mono font-semibold tabular-nums">
              {livePoints.toFixed(2)}
            </Typography>
            <Typography type="body-xs" color="muted">pts</Typography>
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
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Conflict-of-Interest Guard Active</Alert.Title>
              <Alert.Description>
                Primary authors and tagged co-authors cannot approve their own high-stakes deliverables.
              </Alert.Description>
            </Alert.Content>
          </Alert>
          {onSwitchPersona && (
            <Button
              size="sm"
              variant="outline"
              fullWidth
              onClick={() => onSwitchPersona("priya")}
              className="flex items-center justify-center gap-2 rounded-xl py-2"
            >
              <UserCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <Typography type="body-xs">Switch to Independent Reviewer (@priya)</Typography>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex justify-between mb-1.5">
              <Typography type="body-xs" color="muted">Complexity (C)</Typography>
              <Typography type="body-xs" className="font-mono font-medium">C={overrideC}</Typography>
            </div>
            <div className="flex flex-wrap gap-1">
              {COMPLEXITY_SCORES.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={overrideC === c ? "primary" : "ghost"}
                  onClick={() => onSelectComplexity(c)}
                  className="h-7 min-w-7 px-2 font-mono text-xs rounded-lg"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <Typography type="body-xs" color="muted">Business Impact (I)</Typography>
              <Typography type="body-xs" className="font-mono font-medium">{overrideI}×</Typography>
            </div>
            <div className="flex flex-wrap gap-1">
              {IMPACT_MULTIPLIERS.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={overrideI === i ? "primary" : "ghost"}
                  onClick={() => onSelectImpact(i)}
                  className="h-7 px-2 font-mono text-xs rounded-lg"
                >
                  {i}×
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Typography type="body-xs" color="muted">Consensus Multiplier (V)</Typography>
              <Typography type="body-xs" className="font-mono font-medium">{vConsensus.toFixed(2)}×</Typography>
            </div>
            <input
              type="range"
              min="0.70"
              max="1.30"
              step="0.05"
              value={vConsensus}
              onChange={(e) => onChangeConsensus(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Input
            aria-label="Audit reasoning"
            fullWidth
            value={reasoning}
            onChange={(e) => onChangeReasoning(e.target.value)}
            placeholder="Audit reasoning for immutable score_audits ledger..."
            variant="secondary"
          />

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="primary"
              isDisabled={reasoning.trim().length < 5}
              onClick={() => onSubmitDecision("approve")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <Typography type="body-sm" className="font-medium text-primary-foreground">Approve Score</Typography>
            </Button>
            <Button
              size="sm"
              variant="danger-soft"
              isDisabled={reasoning.trim().length < 5}
              onClick={() => onSubmitDecision("reject")}
              className="flex items-center justify-center gap-1 rounded-xl px-3 py-2"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <Typography type="body-sm">Reject</Typography>
            </Button>
          </div>
        </div>
      )}
    </Surface>
  );
}
