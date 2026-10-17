import type {
  CoAuthorStatus,
  CommitStatus,
  CommitType,
  CycleStatus,
  PermissionScope,
  ScoreAuditRecord,
  ScoreFactor,
  StatusMeta,
  WorkDomain,
} from "@volt/types";

export const COMMIT_STATUS_META: Readonly<Record<CommitStatus, StatusMeta>> = {
  pending_coauthor: {
    label: "Awaiting co-authors",
    color: "warning",
    description: "Co-authors have 24 hours to confirm their contribution.",
  },
  pending_ai: {
    label: "Scoring",
    color: "default",
    description: "The AI judge is evaluating complexity, impact and evidence.",
  },
  pending_peer: {
    label: "In peer review",
    color: "warning",
    description: "High-stakes or flagged work needs a human reviewer.",
  },
  approved: {
    label: "Approved",
    color: "success",
    description: "Scored and counted toward the current cycle.",
  },
  rejected: {
    label: "Rejected",
    color: "danger",
    description: "Excluded from the cycle after review.",
  },
};

export const COAUTHOR_STATUS_META: Readonly<Record<CoAuthorStatus, StatusMeta>> = {
  pending: { label: "Pending", color: "warning", description: "Waiting for confirmation." },
  verified: { label: "Verified", color: "success", description: "Contribution confirmed." },
  rejected: { label: "Declined", color: "danger", description: "Co-author declined the tag." },
  timed_out: { label: "Timed out", color: "default", description: "No answer within 24 hours." },
};

export const CYCLE_STATUS_META: Readonly<Record<CycleStatus, StatusMeta>> = {
  upcoming: { label: "Upcoming", color: "default", description: "Not started yet." },
  active: { label: "Active", color: "success", description: "Accruing points now." },
  closed: { label: "Closed", color: "default", description: "Payouts finalized." },
};

export const DOMAIN_LABELS: Readonly<Record<WorkDomain, string>> = {
  engineering: "Engineering",
  research: "Research",
  ops: "Operations",
  finance: "Finance & Legal",
  pitch: "Pitch & Growth",
};

export const COMMIT_TYPE_LABELS: Readonly<Record<CommitType, string>> = {
  output: "Output",
  insight: "Insight (R&D)",
};

export const SCOPE_LABELS: Readonly<Record<PermissionScope, string>> = {
  "stage:write": "Log work",
  "commit:create": "Create commits",
  "commit:verify_coauthor": "Confirm co-authorship",
  "feed:read": "View ledger",
  "commit:review_peer": "Peer review",
  "commit:flag_review": "Flag for review",
  "github:connect": "Connect GitHub",
  "cycle:read": "View cycles",
  "cycle:manage": "Manage cycles",
  "user:manage": "Manage members",
  "policy:admin": "Administer policies",
};

export function scoreFactors(audit: ScoreAuditRecord): readonly ScoreFactor[] {
  return [
    {
      symbol: "C",
      label: "Complexity",
      value: String(audit.cComplexity),
      description: "Cognitive complexity on the modified Fibonacci scale, raised to 1.4.",
    },
    {
      symbol: "I",
      label: "Impact",
      value: `${audit.iImpact}x`,
      description: "Business leverage, from internal hygiene to revenue milestones.",
    },
    {
      symbol: "E",
      label: "Evidence",
      value: `${audit.eEvidence}x`,
      description: "Strength of proof: unverified, verified artifact, or merged with CI.",
    },
    {
      symbol: "V",
      label: "Consensus",
      value: `${audit.vConsensus.toFixed(2)}x`,
      description: "Peer review calibration between 0.70 and 1.30.",
    },
    {
      symbol: "D",
      label: "Timeliness",
      value: `${audit.dDecay.toFixed(2)}x`,
      description: "Decay for late logging, between 0.50 and 1.00.",
    },
  ];
}
