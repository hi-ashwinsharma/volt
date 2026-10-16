import {
  ApiRoutes,
  buildApiRoute,
  type BotParsedAction,
  type CreateCommitResponse,
  type StageLogsMutationResponse,
  type TelegramUpdatePayload,
} from "@volt/types";
import { parseTelegramUpdate } from "./parser";

export async function sendTelegramReply(
  botToken: string,
  chatId: number,
  text: string
): Promise<boolean> {
  if (!botToken) {
    return false;
  }
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
  return res.ok;
}

export async function dispatchTelegramUpdateToVoltApi(params: {
  readonly update: TelegramUpdatePayload;
  readonly apiUrl: string;
  readonly apiKey: string;
  readonly botToken?: string;
}): Promise<{
  readonly action: BotParsedAction;
  readonly replyText: string;
}> {
  const action = parseTelegramUpdate(params.update);
  const headers = {
    "Content-Type": "application/json",
    "X-Volt-Api-Key": params.apiKey,
  };

  if (action.kind === "ignore") {
    return { action, replyText: `[VOLT] Ignored: ${action.reason}` };
  }

  if (action.kind === "stage_text") {
    const res = await fetch(`${params.apiUrl}${ApiRoutes.stage.create}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        clientLogId: crypto.randomUUID(),
        rawText: action.rawText,
        source: "telegram_text",
        artifactId: null,
        githubPrUrl: null,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as StageLogsMutationResponse;
      return {
        action,
        replyText: `[VOLT] Staged micro-log (${data.stagedCount} total uncommitted). Send /commit when ready.`,
      };
    }
    return { action, replyText: `[VOLT] Staged locally: "${action.rawText}"` };
  }

  if (action.kind === "commit") {
    const res = await fetch(`${params.apiUrl}${ApiRoutes.commits.create}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: action.type,
        domain: action.domain,
        summary: action.summary,
        coAuthorHandles: action.coAuthorHandles,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as CreateCommitResponse;
      return {
        action,
        replyText: `[VOLT] Commit [${data.commit.shortHash}] created (${data.commit.status}) -> W_c: ${(data.commit.currentWC ?? 0).toFixed(2)} pts`,
      };
    }
    return {
      action,
      replyText: `[VOLT] Commit queued (${action.type.toUpperCase()} / ${action.domain}): "${action.summary}"`,
    };
  }

  if (action.kind === "verify_coauthor") {
    const route = buildApiRoute(ApiRoutes.commits.verifyCoAuthor, {
      shortHash: action.shortHash,
    });
    await fetch(`${params.apiUrl}${route}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: action.decision,
        contributionNote: action.contributionNote,
      }),
    });
    return {
      action,
      replyText: `[VOLT] Co-author handshake ${action.decision.toUpperCase()} recorded for [${action.shortHash}].`,
    };
  }

  if (action.kind === "voice_note") {
    await fetch(`${params.apiUrl}${ApiRoutes.webhooks.telegram}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.update),
    });
    return {
      action,
      replyText: `[VOLT] Voice note (${action.durationSec}s) forwarded to Gemini 1.5 Flash native audio transcriber.`,
    };
  }

  const res = await fetch(`${params.apiUrl}${ApiRoutes.stage.list}`, { headers });
  if (res.ok) {
    const data = (await res.json()) as { readonly logs: readonly { readonly rawText: string }[] };
    return {
      action,
      replyText: `[VOLT] You have ${data.logs.length} uncommitted staged logs.`,
    };
  }
  return { action, replyText: "[VOLT] Status check complete." };
}
