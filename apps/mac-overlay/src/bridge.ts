import {
  ApiRoutes,
  type CommitType,
  type LocalQueuedLogRow,
  type OverlayCaptureResult,
  type TauriGlobalBridge,
  type WorkDomain,
} from "@volt/types";

export async function invokeOverlayQuickStage(params: {
  readonly rawText: string;
  readonly githubPrUrl: string | null;
  readonly apiUrl?: string;
  readonly apiKey?: string;
}): Promise<OverlayCaptureResult> {
  const started = performance.now();
  const clientLogId = crypto.randomUUID();
  const win = typeof window !== "undefined" ? (window as TauriGlobalBridge) : null;

  if (win?.__TAURI_INTERNALS__?.invoke) {
    return win.__TAURI_INTERNALS__.invoke("stage_micro_log_fast", {
      clientLogId,
      rawText: params.rawText,
      githubPrUrl: params.githubPrUrl,
    });
  }

  let flushed = false;
  if (params.apiUrl && params.apiKey) {
    try {
      const res = await fetch(`${params.apiUrl}${ApiRoutes.stage.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Volt-Api-Key": params.apiKey,
        },
        body: JSON.stringify({
          clientLogId,
          rawText: params.rawText.trim(),
          source: "mac_overlay",
          artifactId: null,
          githubPrUrl: params.githubPrUrl,
        }),
      });
      flushed = res.ok;
    } catch {
      flushed = false;
    }
  }

  return {
    clientLogId,
    rawText: params.rawText.trim(),
    latencyMs: Number((performance.now() - started).toFixed(2)),
    totalPendingCount: 1,
    flushedToCloud: flushed,
  };
}

export async function invokeOverlayQuickCommit(params: {
  readonly type: CommitType;
  readonly domain: WorkDomain;
  readonly summary: string;
  readonly githubPrUrl: string | null;
  readonly coAuthorHandles: readonly string[];
  readonly apiUrl?: string;
  readonly apiKey?: string;
}): Promise<{
  readonly shortHash: string;
  readonly latencyMs: number;
}> {
  const started = performance.now();
  if (params.apiUrl && params.apiKey) {
    try {
      const res = await fetch(`${params.apiUrl}${ApiRoutes.commits.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Volt-Api-Key": params.apiKey,
        },
        body: JSON.stringify({
          type: params.type,
          domain: params.domain,
          summary: params.summary,
          githubPrUrl: params.githubPrUrl,
          coAuthorHandles: params.coAuthorHandles,
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as { readonly commit: { readonly shortHash: string } };
        return {
          shortHash: body.commit.shortHash,
          latencyMs: Number((performance.now() - started).toFixed(2)),
        };
      }
    } catch {
      // Fallback to local hash when offline
    }
  }

  return {
    shortHash: Math.random().toString(16).slice(2, 10),
    latencyMs: Number((performance.now() - started).toFixed(2)),
  };
}

export function createLocalQueuePreviewRow(
  rawText: string,
  githubPrUrl: string | null
): LocalQueuedLogRow {
  return {
    id: Date.now(),
    client_log_id: crypto.randomUUID(),
    raw_text: rawText.trim(),
    source: "mac_overlay",
    artifact_id: null,
    github_pr_url: githubPrUrl,
    created_at: new Date().toISOString(),
    synced: 0,
    synced_at: null,
  };
}
