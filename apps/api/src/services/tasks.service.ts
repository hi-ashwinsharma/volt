import {
  applyCommitScoreAndFinalize,
  getCommitByShortHash,
  resolveCoAuthorTimeoutByShortHash,
} from "@volt/db";
import { ApiRoutes } from "@volt/types";
import { evaluateCommitWithGemini } from "./gemini.service";

export async function executeEvaluateCommitJob(
  shortHash: string
): Promise<void> {
  const commit = await getCommitByShortHash(shortHash);
  if (!commit || commit.status !== "pending_ai") {
    return;
  }

  const aiResult = await evaluateCommitWithGemini(commit);
  await applyCommitScoreAndFinalize({
    shortHash: commit.shortHash,
    gradedByUserId: null,
    isAiGrade: true,
    cComplexity: aiResult.c_complexity,
    iImpact: aiResult.i_impact,
    eEvidence: aiResult.e_evidence,
    vConsensus: 1.0,
    reasoning: aiResult.reasoning,
    requiresHumanReview: aiResult.requires_human_review,
    antiGamingFlag: aiResult.anti_gaming_flag,
  });
}

export async function enqueueEvaluateCommitTask(
  shortHash: string
): Promise<void> {
  const gcpProject = process.env["GCP_PROJECT_ID"];
  const apiPublicUrl =
    process.env["API_PUBLIC_URL"] ?? "http://localhost:8080";

  if (!gcpProject || gcpProject === "your-gcp-project-id" || apiPublicUrl.includes("localhost")) {
    await executeEvaluateCommitJob(shortHash);
    return;
  }

  const secret =
    process.env["INTERNAL_TASK_SHARED_SECRET"] ??
    "volt-internal-task-shared-secret-key-32b";

  await fetch(`${apiPublicUrl}${ApiRoutes.internalTasks.evaluateCommit}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Volt-Internal-Secret": secret,
    },
    body: JSON.stringify({ shortHash }),
  });
}

export async function executeCoAuthorTimeoutJob(
  shortHash: string
): Promise<void> {
  const resolved = await resolveCoAuthorTimeoutByShortHash(shortHash);
  if (resolved.transitionedToPendingAi && resolved.commit) {
    await executeEvaluateCommitJob(resolved.commit.shortHash);
  }
}

export async function sendTelegramBotMessage(params: {
  readonly chatId: number;
  readonly text: string;
}): Promise<boolean> {
  const botToken = process.env["TELEGRAM_BOT_TOKEN"];
  if (!botToken || botToken.includes("ExampleTelegramBotToken")) {
    return false;
  }

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
        parse_mode: "Markdown",
      }),
    }
  );
  return res.ok;
}
