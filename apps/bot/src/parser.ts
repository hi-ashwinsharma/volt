import type { BotParsedAction, CommitType, TelegramUpdatePayload, WorkDomain } from "@volt/types";

const VALID_DOMAINS: readonly WorkDomain[] = [
  "engineering",
  "research",
  "ops",
  "finance",
  "pitch",
];

function extractCoAuthorHandles(input: string): {
  readonly cleanedSummary: string;
  readonly handles: readonly string[];
} {
  const handles: string[] = [];
  const words = input.split(/\s+/);
  const kept: string[] = [];

  for (const w of words) {
    if (w.startsWith("@") && w.length > 2) {
      handles.push(w.slice(1).toLowerCase().replace(/[^a-z0-9_-]/g, ""));
    } else {
      kept.push(w);
    }
  }

  return {
    cleanedSummary: kept.join(" ").trim(),
    handles,
  };
}

export function parseTelegramUpdate(update: TelegramUpdatePayload): BotParsedAction {
  const msg = update.message;
  if (!msg) {
    return { kind: "ignore", reason: "No message in update payload" };
  }

  if (msg.voice) {
    return {
      kind: "voice_note",
      fileId: msg.voice.file_id,
      durationSec: msg.voice.duration,
    };
  }

  const raw = msg.text?.trim() ?? "";
  if (!raw) {
    return { kind: "ignore", reason: "Empty message text" };
  }

  if (raw === "/status" || raw.startsWith("/status ")) {
    return { kind: "status" };
  }

  if (raw.startsWith("/verify ")) {
    const parts = raw.slice("/verify ".length).trim().split(/\s+/);
    const shortHash = parts[0] ?? "";
    const note = parts.slice(1).join(" ").trim();
    if (!shortHash || note.length < 3) {
      return {
        kind: "ignore",
        reason: "Usage: /verify <short_hash> <1-line contribution note>",
      };
    }
    return {
      kind: "verify_coauthor",
      shortHash,
      decision: "verify",
      contributionNote: note,
    };
  }

  if (raw.startsWith("/reject ")) {
    const shortHash = raw.slice("/reject ".length).trim().split(/\s+/)[0] ?? "";
    if (!shortHash) {
      return { kind: "ignore", reason: "Usage: /reject <short_hash>" };
    }
    return {
      kind: "verify_coauthor",
      shortHash,
      decision: "reject",
      contributionNote: "Rejected co-author tag via Telegram",
    };
  }

  if (raw.startsWith("/commit") || raw.startsWith("/insight")) {
    const isInsight = raw.startsWith("/insight");
    const type: CommitType = isInsight ? "insight" : "output";
    const body = raw.replace(/^\/(?:commit|insight)\s*/, "").trim();
    const firstToken = body.split(/\s+/)[0]?.toLowerCase() ?? "";
    const matchedDomain = VALID_DOMAINS.find((d) => d === firstToken);
    const domain: WorkDomain = matchedDomain ?? "engineering";
    const restSummary = matchedDomain ? body.slice(firstToken.length).trim() : body;
    const { cleanedSummary, handles } = extractCoAuthorHandles(restSummary);

    return {
      kind: "commit",
      type,
      domain,
      summary: cleanedSummary || "Synthesized daily deliverable via Telegram",
      coAuthorHandles: handles,
    };
  }

  const stageText = raw.startsWith("/add ") ? raw.slice("/add ".length).trim() : raw;
  return {
    kind: "stage_text",
    rawText: stageText,
  };
}
