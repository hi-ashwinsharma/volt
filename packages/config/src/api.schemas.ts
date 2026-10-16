import {
  CAPTURE_SOURCES,
  COMMIT_TYPES,
  COMPLEXITY_SCORES,
  EVIDENCE_MULTIPLIERS,
  IMPACT_MULTIPLIERS,
  MAX_CONSENSUS_MODIFIER,
  MIN_CONSENSUS_MODIFIER,
  PERMISSION_SCOPES,
  WORK_DOMAINS,
} from "@volt/types";
import { z } from "zod";

const complexityEnum = z
  .number()
  .int()
  .refine(
    (val): val is (typeof COMPLEXITY_SCORES)[number] =>
      (COMPLEXITY_SCORES as readonly number[]).includes(val),
    { message: "Complexity must be one of 1, 2, 3, 5, 8, 13" }
  );

const impactEnum = z
  .number()
  .refine(
    (val): val is (typeof IMPACT_MULTIPLIERS)[number] =>
      (IMPACT_MULTIPLIERS as readonly number[]).includes(val),
    { message: "Impact must be one of 0.5, 1.0, 1.5, 2.0, 3.0" }
  );

const evidenceEnum = z
  .number()
  .refine(
    (val): val is (typeof EVIDENCE_MULTIPLIERS)[number] =>
      (EVIDENCE_MULTIPLIERS as readonly number[]).includes(val),
    { message: "Evidence must be one of 0.5, 1.0, 1.2" }
  );

export const CreateStageLogSchema = z.object({
  clientLogId: z.string().min(1).max(64).optional(),
  rawText: z.string().trim().min(1).max(2000),
  source: z.enum(CAPTURE_SOURCES),
  artifactId: z.string().uuid().nullable().optional(),
  githubPrUrl: z.string().url().nullable().optional(),
});

export const BatchSyncStageLogsSchema = z.object({
  logs: z
    .array(
      z.object({
        clientLogId: z.string().min(1).max(64),
        rawText: z.string().trim().min(1).max(2000),
        source: z.enum(CAPTURE_SOURCES),
        artifactId: z.string().uuid().nullable().optional(),
        githubPrUrl: z.string().url().nullable().optional(),
        createdAt: z.string().min(1),
      })
    )
    .min(1)
    .max(100),
});

export const CreateCommitSchema = z.object({
  type: z.enum(COMMIT_TYPES).default("output"),
  domain: z.enum(WORK_DOMAINS).optional(),
  summary: z.string().trim().min(5).max(1000),
  githubPrUrl: z.string().url().nullable().optional(),
  uploadedArtifactId: z.string().uuid().nullable().optional(),
  coAuthorHandles: z
    .array(
      z
        .string()
        .trim()
        .transform((h) => h.replace(/^@/, "").toLowerCase())
    )
    .max(10)
    .optional(),
  workDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const VerifyCoAuthorSchema = z
  .object({
    action: z.enum(["verify", "reject"]),
    contributionNote: z.string().trim().min(5).max(500).optional(),
  })
  .refine(
    (data) =>
      data.action === "reject" ||
      (data.action === "verify" &&
        typeof data.contributionNote === "string" &&
        data.contributionNote.trim().length >= 5),
    {
      message:
        "contributionNote of at least 5 characters is required when action is 'verify'",
    }
  );

export const PeerReviewCommitSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  vConsensus: z
    .number()
    .min(MIN_CONSENSUS_MODIFIER)
    .max(MAX_CONSENSUS_MODIFIER)
    .optional(),
  overrideComplexity: complexityEnum.nullable().optional(),
  overrideImpact: impactEnum.nullable().optional(),
  overrideEvidence: evidenceEnum.nullable().optional(),
  reasoning: z.string().trim().min(5).max(1000),
});

export const CreateArtifactUploadUrlSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
  sha256Checksum: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

export const CreateApiKeySchema = z.object({
  label: z.string().trim().min(2).max(100),
});

export const CreateBillingCycleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  poolBudget: z.number().min(0),
  currency: z.string().trim().min(3).max(10).default("USD"),
});

export const UpdatePolicyGroupAssignmentSchema = z.object({
  policyGroupSlugs: z.array(z.string().trim().min(1)).min(1),
});

export const UpdateDirectScopesSchema = z.object({
  directScopes: z.array(z.enum(PERMISSION_SCOPES)),
});

export const AiJudgeEvaluationSchema = z.object({
  c_complexity: complexityEnum,
  i_impact: impactEnum,
  e_evidence: evidenceEnum,
  reasoning: z.string().trim().min(1),
  requires_human_review: z.boolean(),
  anti_gaming_flag: z.boolean(),
});

export const AiHandshakeValidationSchema = z.object({
  valid: z.boolean(),
  reason: z.string().trim().min(1),
});

export const TelegramVoiceExtractionSchema = z.object({
  intent: z.enum(["stage_only", "commit_output", "commit_insight"]),
  domain: z.enum(WORK_DOMAINS),
  transcript: z.string(),
  extracted_micro_logs: z.array(z.string()),
  commit_summary: z.string(),
  co_author_handles: z.array(z.string()),
});
