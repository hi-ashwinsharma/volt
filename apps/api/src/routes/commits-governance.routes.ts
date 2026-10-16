import {
  PeerReviewCommitSchema,
  VerifyCoAuthorSchema,
} from "@volt/config";
import {
  applyCommitScoreAndFinalize,
  flagCommitForPeerReview,
  getCommitByShortHash,
  updateCoAuthorHandshake,
} from "@volt/db";
import { canReviewCommit } from "@volt/policy";
import {
  ApiRoutes,
  type PeerReviewCommitResponse,
  type VerifyCoAuthorResponse,
} from "@volt/types";
import type { FastifyInstance } from "fastify";
import { requireUserScope } from "../plugins/auth.plugin";
import { validateCoAuthorHandshakeWithGemini } from "../services/gemini.service";
import { enqueueEvaluateCommitTask } from "../services/tasks.service";

export async function registerCommitGovernanceRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post(ApiRoutes.commits.verifyCoAuthor, async (req, reply) => {
    const user = await requireUserScope(req, reply, "commit:verify_coauthor");
    if (!user) {
      return;
    }
    const params = req.params as { shortHash: string };
    const parsed = VerifyCoAuthorSchema.parse(req.body);

    const existing = await getCommitByShortHash(params.shortHash);
    if (!existing) {
      return reply.status(404).send({ error: "COMMIT_NOT_FOUND" });
    }

    let aiValidated = true;
    let aiValidationReason = "Rejected by tagged co-author.";

    if (parsed.action === "verify" && parsed.contributionNote) {
      const validation = await validateCoAuthorHandshakeWithGemini({
        commitSummary: existing.summary,
        contributionNote: parsed.contributionNote,
      });
      aiValidated = validation.valid;
      aiValidationReason = validation.reason;
      if (!validation.valid) {
        return reply.status(422).send({
          error: "INVALID_CONTRIBUTION_NOTE",
          reason: validation.reason,
        });
      }
    }

    const updated = await updateCoAuthorHandshake({
      shortHash: params.shortHash,
      userId: user.userId,
      action: parsed.action,
      contributionNote: parsed.contributionNote,
      aiValidated,
      aiValidationReason,
    });

    if (updated.allCoAuthorsResolved) {
      await enqueueEvaluateCommitTask(params.shortHash);
    }

    const finalCommit =
      (await getCommitByShortHash(params.shortHash)) ?? updated.commit;
    const response: VerifyCoAuthorResponse = {
      shortHash: params.shortHash,
      coAuthorStatus: parsed.action === "verify" ? "verified" : "rejected",
      aiValidated,
      aiValidationReason,
      commitStatus: finalCommit.status,
    };
    return reply.send(response);
  });

  app.post(ApiRoutes.commits.peerReview, async (req, reply) => {
    const user = await requireUserScope(req, reply, "commit:review_peer");
    if (!user) {
      return;
    }
    const params = req.params as { shortHash: string };
    const parsed = PeerReviewCommitSchema.parse(req.body);

    const commit = await getCommitByShortHash(params.shortHash);
    if (!commit) {
      return reply.status(404).send({ error: "COMMIT_NOT_FOUND" });
    }

    const guard = canReviewCommit(user, {
      commitId: commit.id,
      authorId: commit.authorId,
      coAuthorUserIds: commit.coAuthors.map((c) => c.userId),
    });

    if (!guard.allowed) {
      return reply.status(403).send({
        error: guard.reason ?? "CONFLICT_OF_INTEREST",
        message: "Authors and co-authors cannot review their own commits.",
      });
    }

    const baseAudit = commit.latestAudit;
    const finalized = await applyCommitScoreAndFinalize({
      shortHash: commit.shortHash,
      gradedByUserId: user.userId,
      isAiGrade: false,
      cComplexity: parsed.overrideComplexity ?? baseAudit?.cComplexity ?? 5,
      iImpact: parsed.overrideImpact ?? baseAudit?.iImpact ?? 1.0,
      eEvidence: parsed.overrideEvidence ?? baseAudit?.eEvidence ?? 1.0,
      vConsensus: parsed.vConsensus ?? 1.0,
      reasoning: parsed.reasoning,
      requiresHumanReview: false,
      antiGamingFlag: false,
      forceDecision: parsed.decision,
    });

    if (!finalized.latestAudit) {
      return reply.status(500).send({ error: "AUDIT_MISSING" });
    }

    const response: PeerReviewCommitResponse = {
      shortHash: finalized.shortHash,
      status: finalized.status,
      finalWC: finalized.currentWC ?? 0,
      audit: finalized.latestAudit,
    };
    return reply.send(response);
  });

  app.post(ApiRoutes.commits.flagForReview, async (req, reply) => {
    const user = await requireUserScope(req, reply, "commit:flag_review");
    if (!user) {
      return;
    }
    const params = req.params as { shortHash: string };
    const flagged = await flagCommitForPeerReview(params.shortHash);
    return reply.send({ commit: flagged });
  });
}
