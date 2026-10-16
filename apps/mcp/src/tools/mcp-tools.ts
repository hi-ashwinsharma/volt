import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  ApiRoutes,
  buildApiRoute,
  type CliStatusOverviewResponse,
  type CommitType,
  type CreateCommitResponse,
  type LocalVoltConfig,
  type StageLogsMutationResponse,
  type VerifyCoAuthorResponse,
  type WorkDomain,
} from "@volt/types";

export function resolveMcpAuthConfig(): {
  readonly apiUrl: string;
  readonly apiKey: string;
} {
  const envKey = process.env["VOLT_API_KEY"];
  const envUrl = process.env["VOLT_API_URL"];
  if (envKey) {
    return {
      apiUrl: envUrl ?? "http://localhost:8080",
      apiKey: envKey,
    };
  }
  const configPath = join(
    process.env["VOLT_HOME_DIR"] ?? join(homedir(), ".volt"),
    "config.json"
  );
  if (existsSync(configPath)) {
    const parsed = JSON.parse(
      readFileSync(configPath, "utf-8")
    ) as LocalVoltConfig;
    return {
      apiUrl: parsed.apiUrl,
      apiKey: parsed.apiKey,
    };
  }
  return {
    apiUrl: envUrl ?? "http://localhost:8080",
    apiKey: "",
  };
}

export async function handleVoltStageLogTool(args: {
  readonly text: string;
  readonly github_pr_url?: string;
}): Promise<string> {
  const { apiUrl, apiKey } = resolveMcpAuthConfig();
  const res = await fetch(`${apiUrl}${ApiRoutes.stage.create}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      rawText: args.text,
      source: "mcp",
      githubPrUrl: args.github_pr_url ?? null,
    }),
  });

  if (!res.ok) {
    return `Failed to stage log (${res.status}): ${await res.text()}`;
  }
  const data = (await res.json()) as StageLogsMutationResponse;
  return `Staged micro-log via MCP. Total uncommitted staged logs: ${data.stagedCount}.`;
}

export async function handleVoltCommitWorkTool(args: {
  readonly type: CommitType;
  readonly domain?: WorkDomain;
  readonly summary: string;
  readonly github_pr_url?: string;
  readonly co_authors?: readonly string[];
}): Promise<string> {
  const { apiUrl, apiKey } = resolveMcpAuthConfig();
  const res = await fetch(`${apiUrl}${ApiRoutes.commits.create}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: args.type,
      domain: args.domain,
      summary: args.summary,
      githubPrUrl: args.github_pr_url ?? null,
      coAuthorHandles: args.co_authors ?? [],
    }),
  });

  if (!res.ok) {
    return `Failed to create commit (${res.status}): ${await res.text()}`;
  }
  const created = (await res.json()) as CreateCommitResponse;
  const auditScore = created.commit.latestAudit?.finalPoints;
  return `Created Volt commit [${created.shortHash}] (${created.type} | ${created.domain}) Status: ${created.status}${auditScore !== undefined ? ` | Score: ${auditScore} pts` : ""}.`;
}

export async function handleVoltGetStatusTool(): Promise<string> {
  const { apiUrl, apiKey } = resolveMcpAuthConfig();
  const res = await fetch(`${apiUrl}/v1/auth/status-overview`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    return `Unable to fetch Volt status (${res.status}).`;
  }
  const overview = (await res.json()) as CliStatusOverviewResponse;
  return JSON.stringify(
    {
      user: overview.user.handle,
      stagedCount: overview.stagedLogs.length,
      stagedLogs: overview.stagedLogs.map((l) => l.rawText),
      pendingHandshakes: overview.pendingHandshakes.map((h) => ({
        shortHash: h.shortHash,
        author: h.authorHandle,
        summary: h.summary,
      })),
      activeCycle: overview.activeCycleSummary?.cycleName ?? null,
    },
    null,
    2
  );
}

export async function handleVoltVerifyCoAuthorTool(args: {
  readonly short_hash: string;
  readonly action: "verify" | "reject";
  readonly contribution_note?: string;
}): Promise<string> {
  const { apiUrl, apiKey } = resolveMcpAuthConfig();
  const path = buildApiRoute(ApiRoutes.commits.verifyCoAuthor, {
    shortHash: args.short_hash,
  });
  const res = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      action: args.action,
      contributionNote: args.contribution_note,
    }),
  });
  if (!res.ok) {
    return `Handshake verification failed (${res.status}): ${await res.text()}`;
  }
  const data = (await res.json()) as VerifyCoAuthorResponse;
  return `Commit [${data.shortHash}] co-author status: ${data.coAuthorStatus} | Pipeline state: ${data.commitStatus}.`;
}
