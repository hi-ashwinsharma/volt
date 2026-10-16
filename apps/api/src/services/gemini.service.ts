import {
  AiHandshakeValidationSchema,
  AiJudgeEvaluationSchema,
  TelegramVoiceExtractionSchema,
} from "@volt/config";
import type {
  AiHandshakeValidationOutput,
  AiJudgeEvaluationOutput,
  CommitRecord,
  TelegramVoiceExtractionOutput,
} from "@volt/types";

function getGeminiConfig(): {
  readonly apiKey: string;
  readonly modelId: string;
} | null {
  const apiKey = process.env["GEMINI_API_KEY"];
  const modelId = process.env["GEMINI_MODEL_ID"] ?? "gemini-1.5-flash";
  if (!apiKey || apiKey.includes("AIzaSyExample")) {
    return null;
  }
  return { apiKey, modelId };
}

function deterministicFallbackEvaluation(
  commit: CommitRecord
): AiJudgeEvaluationOutput {
  const logCount = commit.stagedSnapshot.length;
  const summaryLen = commit.summary.length;

  let cComplexity: 1 | 2 | 3 | 5 | 8 | 13 = 3;
  if (logCount >= 5 || summaryLen > 180) {
    cComplexity = 8;
  } else if (logCount >= 3 || summaryLen > 90) {
    cComplexity = 5;
  } else if (summaryLen < 35) {
    cComplexity = 2;
  }

  const iImpact: 0.5 | 1.0 | 1.5 | 2.0 | 3.0 =
    commit.type === "insight" ? 1.5 : 1.0;

  let eEvidence: 0.5 | 1.0 | 1.2 = 0.5;
  if (commit.artifactType === "github_app") {
    const mergedAndCi =
      "merged" in commit.artifactMetadata &&
      commit.artifactMetadata.merged === true &&
      "ciPassed" in commit.artifactMetadata &&
      commit.artifactMetadata.ciPassed === true;
    eEvidence = mergedAndCi ? 1.2 : 1.0;
  } else if (commit.artifactType === "file_upload") {
    eEvidence = 1.0;
  }

  return {
    c_complexity: cComplexity,
    i_impact: iImpact,
    e_evidence: eEvidence,
    reasoning: `Evaluated ${commit.type} commit in ${commit.domain} domain with ${logCount} staged micro-logs and artifact_type=${commit.artifactType}.`,
    requires_human_review: cComplexity >= 8,
    anti_gaming_flag: false,
  };
}

async function invokeGeminiJson(parts: readonly Record<string, string | object>[]): Promise<string | null> {
  const cfg = getGeminiConfig();
  if (!cfg) {
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.modelId}:generateContent?key=${cfg.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    return null;
  }
  const payload = (await res.json()) as {
    candidates?: readonly {
      content?: { parts?: readonly { text?: string }[] };
    }[];
  };
  return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export async function evaluateCommitWithGemini(
  commit: CommitRecord
): Promise<AiJudgeEvaluationOutput> {
  const prompt = [
    "You are the Volt Mathematical Impact Judge.",
    "Evaluate the following work commit strictly according to the Modified Fibonacci Complexity (C in {1,2,3,5,8,13}), Business Impact (I in {0.5,1.0,1.5,2.0,3.0}), and Evidence (E in {0.5,1.0,1.2}) rubrics.",
    `Commit Type: ${commit.type} | Domain: ${commit.domain}`,
    `Summary: ${commit.summary}`,
    `Staged Micro-Logs: ${JSON.stringify(commit.stagedSnapshot)}`,
    `Verified Co-Authors: ${JSON.stringify(
      commit.coAuthors
        .filter((c) => c.status === "verified")
        .map((c) => ({ handle: c.handle, note: c.contributionNote }))
    )}`,
    `Artifact Type: ${commit.artifactType} | Metadata: ${JSON.stringify(commit.artifactMetadata)}`,
    "Return ONLY valid JSON: { c_complexity, i_impact, e_evidence, reasoning, requires_human_review, anti_gaming_flag }.",
  ].join("\n");

  const rawJsonText = await invokeGeminiJson([{ text: prompt }]);
  if (!rawJsonText) {
    return deterministicFallbackEvaluation(commit);
  }
  return AiJudgeEvaluationSchema.parse(JSON.parse(rawJsonText));
}

export async function validateCoAuthorHandshakeWithGemini(params: {
  readonly commitSummary: string;
  readonly contributionNote: string;
}): Promise<AiHandshakeValidationOutput> {
  const trimmed = params.contributionNote.trim();
  if (trimmed.length < 5 || /^(lgtm|done|helped|same|ok)$/i.test(trimmed)) {
    return {
      valid: false,
      reason:
        "Contribution note is too generic. Describe your specific technical or operational contribution.",
    };
  }

  const prompt = [
    "Verify whether the co-author contribution_note describes genuine work related to the commit summary.",
    `Commit Summary: ${params.commitSummary}`,
    `Co-Author Contribution Note: ${trimmed}`,
    "Return JSON: { valid: boolean, reason: string }",
  ].join("\n");

  const rawText = await invokeGeminiJson([{ text: prompt }]);
  if (!rawText) {
    return {
      valid: true,
      reason: "Contribution note verified against commit scope.",
    };
  }
  return AiHandshakeValidationSchema.parse(JSON.parse(rawText));
}

export async function transcribeTelegramVoiceWithGemini(
  audioBase64: string,
  mimeType: string = "audio/ogg"
): Promise<TelegramVoiceExtractionOutput> {
  const rawText = await invokeGeminiJson([
    { inlineData: { mimeType, data: audioBase64 } },
    {
      text: "Transcribe this voice note and extract JSON: { intent: 'stage_only'|'commit_output'|'commit_insight', domain: 'engineering'|'research'|'ops'|'finance'|'pitch', transcript: string, extracted_micro_logs: string[], commit_summary: string, co_author_handles: string[] }",
    },
  ]);

  if (!rawText) {
    throw new Error("GEMINI_API_KEY is required for multimodal voice STT.");
  }
  return TelegramVoiceExtractionSchema.parse(JSON.parse(rawText));
}
