import { timingSafeEqual } from "node:crypto";
import {
  createCommitFromStagedLogs,
  getDb,
  insertSingleStagedLog,
  listUncommittedStagedLogs,
  users,
} from "@volt/db";
import { formatDateInTimezone } from "@volt/math";
import { ApiRoutes } from "@volt/types";
import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { transcribeTelegramVoiceWithGemini } from "../services/gemini.service";
import {
  executeCoAuthorTimeoutJob,
  executeEvaluateCommitJob,
  sendTelegramBotMessage,
} from "../services/tasks.service";

function verifyInternalTaskAuth(req: FastifyRequest): boolean {
  const expectedSecret =
    process.env["INTERNAL_TASK_SHARED_SECRET"] ??
    "volt-internal-task-shared-secret-key-32b";
  const providedSecret = req.headers["x-volt-internal-secret"];
  if (typeof providedSecret === "string") {
    const a = Buffer.from(expectedSecret);
    const b = Buffer.from(providedSecret);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return true;
    }
  }
  const authHeader = req.headers.authorization;
  return typeof authHeader === "string" && authHeader.startsWith("Bearer ");
}

export async function registerWebhooksAndWorkerRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post(
    ApiRoutes.internalTasks.evaluateCommit,
    async (req: FastifyRequest, reply: FastifyReply) => {
      if (!verifyInternalTaskAuth(req)) {
        return reply.status(401).send({ error: "UNAUTHORIZED_TASK_CALLER" });
      }
      const body = req.body as { shortHash?: string };
      if (!body.shortHash) {
        return reply.status(400).send({ error: "MISSING_SHORT_HASH" });
      }
      await executeEvaluateCommitJob(body.shortHash);
      return reply.send({ evaluated: true, shortHash: body.shortHash });
    }
  );

  app.post(
    ApiRoutes.internalTasks.resolveCoAuthorTimeout,
    async (req: FastifyRequest, reply: FastifyReply) => {
      if (!verifyInternalTaskAuth(req)) {
        return reply.status(401).send({ error: "UNAUTHORIZED_TASK_CALLER" });
      }
      const body = req.body as { shortHash?: string };
      if (!body.shortHash) {
        return reply.status(400).send({ error: "MISSING_SHORT_HASH" });
      }
      await executeCoAuthorTimeoutJob(body.shortHash);
      return reply.send({ resolved: true, shortHash: body.shortHash });
    }
  );

  app.post(
    ApiRoutes.internalTasks.eveningSweep,
    async (req: FastifyRequest, reply: FastifyReply) => {
      if (!verifyInternalTaskAuth(req)) {
        return reply.status(401).send({ error: "UNAUTHORIZED_TASK_CALLER" });
      }
      const db = getDb();
      const activeUsers = await db
        .select()
        .from(users)
        .where(eq(users.isActive, true));

      let notifiedCount = 0;
      const todayIst = formatDateInTimezone(new Date(), "Asia/Kolkata");

      for (const usr of activeUsers) {
        if (!usr.telegramChatId) {
          continue;
        }
        const uncommitted = await listUncommittedStagedLogs(usr.id);
        if (uncommitted.length > 0) {
          const listStr = uncommitted
            .map((l, i) => `${i + 1}. ${l.rawText}`)
            .join("\n");
          const sent = await sendTelegramBotMessage({
            chatId: usr.telegramChatId,
            text: `*Volt 7:30 PM IST Sweeper (${todayIst})*\nYou have ${uncommitted.length} uncommitted micro-logs:\n${listStr}\n\nReply with a voice note or run \`volt commit\` to score your work.`,
          });
          if (sent) {
            notifiedCount += 1;
          }
        }
      }

      return reply.send({ swept: true, notifiedCount, date: todayIst });
    }
  );

  app.post(
    ApiRoutes.internalTasks.processTelegramVoice,
    async (req: FastifyRequest, reply: FastifyReply) => {
      if (!verifyInternalTaskAuth(req)) {
        return reply.status(401).send({ error: "UNAUTHORIZED_TASK_CALLER" });
      }
      const body = req.body as {
        userId: string;
        audioBase64: string;
        mimeType?: string;
      };
      const extracted = await transcribeTelegramVoiceWithGemini(
        body.audioBase64,
        body.mimeType ?? "audio/ogg"
      );

      for (const logText of extracted.extracted_micro_logs) {
        await insertSingleStagedLog(body.userId, {
          rawText: logText,
          source: "telegram",
        });
      }

      if (extracted.intent !== "stage_only") {
        const commit = await createCommitFromStagedLogs({
          authorId: body.userId,
          type: extracted.intent === "commit_insight" ? "insight" : "output",
          domain: extracted.domain,
          summary: extracted.commit_summary || extracted.transcript,
          artifactType: "none",
          githubPrUrl: null,
          uploadedArtifactId: null,
          artifactMetadata: {},
          coAuthorHandles: extracted.co_author_handles,
        });
        if (commit.status === "pending_ai") {
          await executeEvaluateCommitJob(commit.shortHash);
        }
        return reply.send({ processed: true, commitShortHash: commit.shortHash });
      }

      return reply.send({
        processed: true,
        stagedCount: extracted.extracted_micro_logs.length,
      });
    }
  );

  app.post(ApiRoutes.webhooks.telegram, async (req, reply) => {
    const expectedSecret = process.env["TELEGRAM_WEBHOOK_SECRET"];
    const provided = req.headers["x-telegram-bot-api-secret-token"];
    if (
      expectedSecret &&
      !expectedSecret.includes("example_token") &&
      provided !== expectedSecret
    ) {
      return reply.status(401).send({ error: "INVALID_TELEGRAM_SECRET" });
    }
    return reply.send({ received: true });
  });

  app.post(ApiRoutes.webhooks.github, async (_req, reply) => {
    return reply.send({ received: true });
  });
}
