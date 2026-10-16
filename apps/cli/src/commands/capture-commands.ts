import {
  ApiRoutes,
  type AuthMeResponse,
  type CliStatusOverviewResponse,
} from "@volt/types";
import { flushLocalWriteAheadQueue, spawnDetachedFlushWorker } from "../daemon/flush-daemon";
import {
  enqueueLocalMicroLog,
  listUnsyncedLocalLogs,
  readLocalVoltConfig,
  writeLocalVoltConfig,
} from "../local-store/sqlite-queue";

export async function runLoginCommand(args: {
  readonly apiKey?: string;
  readonly apiUrl?: string;
  readonly handle?: string;
}): Promise<void> {
  const apiUrl =
    args.apiUrl ?? process.env["VOLT_API_URL"] ?? "http://localhost:8080";
  const apiKey = args.apiKey ?? process.env["VOLT_API_KEY"];

  if (!apiKey || !apiKey.startsWith("volt_sk_")) {
    console.error(
      "[ERROR] Please provide a valid Personal API Key via --key volt_sk_... or VOLT_API_KEY."
    );
    process.exit(1);
  }

  let userHandle = args.handle ?? "ashwin";
  let defaultDomain: "engineering" | "research" | "ops" | "finance" | "pitch" =
    "engineering";

  try {
    const res = await fetch(`${apiUrl}${ApiRoutes.auth.me}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const me = (await res.json()) as AuthMeResponse;
      userHandle = me.user.handle;
      defaultDomain = me.user.defaultDomain;
    }
  } catch {
    // Allow offline config persistence
  }

  writeLocalVoltConfig({
    apiUrl,
    apiKey,
    userHandle,
    defaultDomain,
    updatedAt: new Date().toISOString(),
  });

  console.log(
    `[OK] Authenticated as @${userHandle} (default domain: ${defaultDomain}) -> ~/.volt/config.json`
  );
}

export function runAddCommand(params: {
  readonly rawText: string;
  readonly githubPrUrl?: string;
}): void {
  const startNs = Bun.nanoseconds();
  const row = enqueueLocalMicroLog({
    rawText: params.rawText,
    source: "cli",
    githubPrUrl: params.githubPrUrl ?? null,
  });
  spawnDetachedFlushWorker();
  const elapsedMs = ((Bun.nanoseconds() - startNs) / 1_000_000).toFixed(2);
  console.log(
    `[+] Staged [${row.client_log_id.slice(0, 8)}] "${row.raw_text}" (${elapsedMs}ms local WAL)`
  );
}

export async function runStatusCommand(): Promise<void> {
  await flushLocalWriteAheadQueue();
  const unsynced = listUnsyncedLocalLogs();
  const config = readLocalVoltConfig();

  console.log("=== VOLT WORKSPACE STATUS ===");
  if (!config) {
    console.log("Auth: [UNCONFIGURED] Run `volt login --key volt_sk_...`");
  } else {
    console.log(
      `User: @${config.userHandle} | Domain: ${config.defaultDomain} | API: ${config.apiUrl}`
    );
  }

  if (unsynced.length > 0) {
    console.log(`\nLocal Write-Ahead Queue (${unsynced.length} pending sync):`);
    for (const item of unsynced) {
      console.log(`  * [${item.client_log_id.slice(0, 8)}] ${item.raw_text}`);
    }
  }

  if (!config) {
    return;
  }

  try {
    const res = await fetch(`${config.apiUrl}/v1/auth/status-overview`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (!res.ok) {
      console.log("\nRemote API status unavailable (offline or unauthorized).");
      return;
    }
    const overview = (await res.json()) as CliStatusOverviewResponse;

    console.log(`\nStaged Micro-Logs (${overview.stagedLogs.length}):`);
    if (overview.stagedLogs.length === 0) {
      console.log("  (none - run `volt add \"...\"` to stage work)");
    } else {
      for (const l of overview.stagedLogs) {
        console.log(`  - [${l.source}] ${l.rawText}`);
      }
    }

    if (overview.pendingHandshakes.length > 0) {
      console.log(
        `\nPending Co-Author Handshakes (${overview.pendingHandshakes.length}):`
      );
      for (const h of overview.pendingHandshakes) {
        console.log(
          `  ! [${h.shortHash}] by @${h.authorHandle}: "${h.summary}" -> run: volt verify ${h.shortHash} -m "..."`
        );
      }
    }

    if (overview.activeCycleSummary) {
      const myRow = overview.activeCycleSummary.leaderboard.find(
        (r) => r.handle === overview.user.handle
      );
      console.log(
        `\nActive Cycle: ${overview.activeCycleSummary.cycleName} | Pool Share: ${myRow?.poolSharePercent ?? 0}% (${myRow?.totalCyclePoints ?? 0} pts)`
      );
    }
  } catch {
    console.log("\nRemote API status unavailable (offline mode).");
  }
}
