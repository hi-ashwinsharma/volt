import {
  AUTO_APPROVAL_THRESHOLD,
  COMPLEXITY_SCORES,
  DEFAULT_CONSENSUS_MODIFIER,
  EVIDENCE_MULTIPLIERS,
  IMPACT_MULTIPLIERS,
  MAX_CONSENSUS_MODIFIER,
  MAX_DECAY_FACTOR,
  MIN_CONSENSUS_MODIFIER,
  MIN_DECAY_FACTOR,
  type ComplexityScore,
  type EvidenceMultiplier,
  type ImpactMultiplier,
  type WeightageBreakdown,
  type WeightageInput,
} from "@volt/types";

export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isValidComplexityScore(val: number): val is ComplexityScore {
  return (COMPLEXITY_SCORES as readonly number[]).includes(val);
}

export function isValidImpactMultiplier(val: number): val is ImpactMultiplier {
  return (IMPACT_MULTIPLIERS as readonly number[]).includes(val);
}

export function isValidEvidenceMultiplier(
  val: number
): val is EvidenceMultiplier {
  return (EVIDENCE_MULTIPLIERS as readonly number[]).includes(val);
}

export function clampConsensusModifier(consensus: number): number {
  const clamped = Math.min(
    MAX_CONSENSUS_MODIFIER,
    Math.max(MIN_CONSENSUS_MODIFIER, consensus)
  );
  return roundToTwoDecimals(clamped);
}

export function clampDecayFactor(decay: number): number {
  const clamped = Math.min(MAX_DECAY_FACTOR, Math.max(MIN_DECAY_FACTOR, decay));
  return roundToTwoDecimals(clamped);
}

const COMPLEXITY_POWER_TABLE: Readonly<Record<ComplexityScore, number>> = {
  1: 1.0,
  2: 2.64,
  3: 4.66,
  5: 9.52,
  8: 18.38,
  13: 36.26,
};

export function computeComplexityPower(complexity: ComplexityScore): number {
  return COMPLEXITY_POWER_TABLE[complexity];
}

export function calculateCommitWeightage(
  input: WeightageInput
): WeightageBreakdown {
  if (!isValidComplexityScore(input.complexity)) {
    throw new Error(`Invalid complexity score: ${String(input.complexity)}`);
  }
  if (!isValidImpactMultiplier(input.impact)) {
    throw new Error(`Invalid impact multiplier: ${String(input.impact)}`);
  }
  if (!isValidEvidenceMultiplier(input.evidence)) {
    throw new Error(`Invalid evidence multiplier: ${String(input.evidence)}`);
  }

  const consensus =
    input.consensus !== undefined
      ? clampConsensusModifier(input.consensus)
      : DEFAULT_CONSENSUS_MODIFIER;

  const decay =
    input.decay !== undefined ? clampDecayFactor(input.decay) : MAX_DECAY_FACTOR;

  const complexityPower = computeComplexityPower(input.complexity);

  const rawInitial = complexityPower * input.impact * input.evidence;
  const initialPoints = roundToTwoDecimals(rawInitial);
  const finalPoints = roundToTwoDecimals(initialPoints * consensus * decay);

  return {
    complexity: input.complexity,
    complexityPower,
    impact: input.impact,
    evidence: input.evidence,
    consensus,
    decay,
    initialPoints,
    finalPoints,
    requiresPeerReviewByThreshold: initialPoints > AUTO_APPROVAL_THRESHOLD,
  };
}

export function enforceEvidenceCeiling(params: {
  readonly requestedEvidence: EvidenceMultiplier;
  readonly artifactType: "none" | "github_app" | "file_upload";
  readonly githubMergedAndCiPassed?: boolean;
}): EvidenceMultiplier {
  if (params.artifactType === "none") {
    return 0.5;
  }
  if (
    params.artifactType === "github_app" &&
    params.githubMergedAndCiPassed === true
  ) {
    return 1.2;
  }
  if (
    params.artifactType === "github_app" &&
    params.githubMergedAndCiPassed === false &&
    params.requestedEvidence > 1.0
  ) {
    return 1.0;
  }
  return params.requestedEvidence;
}
