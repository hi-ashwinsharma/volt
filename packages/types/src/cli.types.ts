import type { CaptureSource, CommitType, WorkDomain } from "./domain.types";

export interface LocalQueuedLogRow {
  readonly id: number;
  readonly client_log_id: string;
  readonly raw_text: string;
  readonly source: CaptureSource;
  readonly artifact_id: string | null;
  readonly github_pr_url: string | null;
  readonly created_at: string;
  readonly synced: 0 | 1;
  readonly synced_at: string | null;
}

export interface LocalVoltConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
  readonly userHandle: string;
  readonly defaultDomain: "engineering" | "research" | "ops" | "finance" | "pitch";
  readonly updatedAt: string;
}

export interface CliParsedArgs {
  readonly command: string;
  readonly positional: readonly string[];
  readonly flags: Readonly<Record<string, string | boolean | readonly string[]>>;
}

export interface OverlayCaptureResult {
  readonly clientLogId: string;
  readonly rawText: string;
  readonly latencyMs: number;
  readonly totalPendingCount: number;
  readonly flushedToCloud: boolean;
}

export interface OverlayQuickState {
  readonly mode: "stage" | "commit";
  readonly text: string;
  readonly commitType: CommitType;
  readonly domain: WorkDomain;
  readonly githubPrUrl: string;
  readonly coAuthorsText: string;
  readonly recentLogs: readonly LocalQueuedLogRow[];
  readonly lastLatencyMs: number | null;
  readonly statusMessage: string | null;
}

export type BotParsedAction =
  | {
      readonly kind: "stage_text";
      readonly rawText: string;
    }
  | {
      readonly kind: "commit";
      readonly type: CommitType;
      readonly domain: WorkDomain;
      readonly summary: string;
      readonly coAuthorHandles: readonly string[];
    }
  | {
      readonly kind: "verify_coauthor";
      readonly shortHash: string;
      readonly decision: "verify" | "reject";
      readonly contributionNote: string;
    }
  | {
      readonly kind: "status";
    }
  | {
      readonly kind: "voice_note";
      readonly fileId: string;
      readonly durationSec: number;
    }
  | {
      readonly kind: "ignore";
      readonly reason: string;
    };
