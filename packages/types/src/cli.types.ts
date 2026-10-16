import type { CaptureSource } from "./domain.types";

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
