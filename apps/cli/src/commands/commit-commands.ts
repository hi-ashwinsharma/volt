import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import {
  ApiRoutes,
  buildApiRoute,
  type CommitType,
  type CreateArtifactUploadUrlResponse,
  type CreateCommitResponse,
  type VerifyCoAuthorResponse,
  type WorkDomain,
} from "@volt/types";
import { flushLocalWriteAheadQueue } from "../daemon/flush-daemon";
import { clearSyncedLocalLogs, readLocalVoltConfig } from "../local-store/sqlite-queue";

async function uploadLocalArtifactFile(
  apiUrl: string,
  apiKey: string,
  filePath: string
): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`Artifact file not found: ${filePath}`);
  }
  const fileBuffer = readFileSync(filePath);
  const stat = statSync(filePath);
  const sha256Checksum = createHash("sha256").update(fileBuffer).digest("hex");
  const filename = basename(filePath);
  const mimeType = filename.endsWith(".ipynb")
    ? "application/x-ipynb+json"
    : filename.endsWith(".pdf")
      ? "application/pdf"
      : filename.endsWith(".png")
        ? "image/png"
        : "application/octet-stream";

  const res = await fetch(`${apiUrl}${ApiRoutes.artifacts.createUploadUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      filename,
      mimeType,
      sizeBytes: stat.size,
      sha256Checksum,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to request artifact upload URL (${res.status})`);
  }

  const created = (await res.json()) as CreateArtifactUploadUrlResponse;
  return created.artifactId;
}

export async function runCommitCommand(params: {
  readonly type: CommitType;
  readonly domain?: WorkDomain;
  readonly summary: string;
  readonly githubPrUrl?: string;
  readonly filePath?: string;
  readonly coAuthors?: readonly string[];
}): Promise<void> {
  const config = readLocalVoltConfig();
  if (!config) {
    console.error("[ERROR] Not authenticated. Run `volt login --key volt_sk_...` first.");
    process.exit(1);
  }

  await flushLocalWriteAheadQueue();

  let uploadedArtifactId: string | null = null;
  if (params.filePath) {
    uploadedArtifactId = await uploadLocalArtifactFile(
      config.apiUrl,
      config.apiKey,
      params.filePath
    );
  }

  const res = await fetch(`${config.apiUrl}${ApiRoutes.commits.create}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      type: params.type,
      domain: params.domain ?? config.defaultDomain,
      summary: params.summary,
      githubPrUrl: params.githubPrUrl ?? null,
      uploadedArtifactId,
      coAuthorHandles: params.coAuthors ?? [],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[ERROR] Commit creation failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const created = (await res.json()) as CreateCommitResponse;
  clearSyncedLocalLogs();

  console.log(
    `[COMMIT ${created.shortHash}] (${created.type.toUpperCase()} | ${created.domain}) Status: ${created.status}`
  );
  console.log(`  Summary: "${created.summary}"`);
  console.log(`  Bundled Staged Logs: ${created.bundledLogsCount}`);

  if (created.commit.latestAudit) {
    const a = created.commit.latestAudit;
    console.log(
      `  Weightage (W_c): C:${a.cComplexity} x I:${a.iImpact}x x E:${a.eEvidence}x x V:${a.vConsensus} x D:${a.dDecay} = ${a.finalPoints} pts`
    );
    console.log(`  AI Judge Reasoning: ${a.reasoning}`);
  } else if (created.status === "pending_coauthor") {
    console.log(
      `  Awaiting Co-Author Handshakes (${created.coAuthors.map((c) => `@${c.handle}`).join(", ")}) before AI Judge evaluation.`
    );
  }
}

export async function runVerifyCommand(params: {
  readonly shortHash: string;
  readonly action: "verify" | "reject";
  readonly contributionNote?: string;
}): Promise<void> {
  const config = readLocalVoltConfig();
  if (!config) {
    console.error("[ERROR] Not authenticated. Run `volt login --key volt_sk_...` first.");
    process.exit(1);
  }

  const path = buildApiRoute(ApiRoutes.commits.verifyCoAuthor, {
    shortHash: params.shortHash,
  });

  const res = await fetch(`${config.apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      action: params.action,
      contributionNote: params.contributionNote,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[ERROR] Handshake verification failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const data = (await res.json()) as VerifyCoAuthorResponse;
  console.log(
    `[OK] Commit [${data.shortHash}] co-author status: ${data.coAuthorStatus} | Commit pipeline state: ${data.commitStatus}`
  );
}
