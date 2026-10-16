#!/usr/bin/env bun
import type { CommitType, WorkDomain } from "@volt/types";
import {
  runAddCommand,
  runLoginCommand,
  runStatusCommand,
} from "./commands/capture-commands";
import {
  runCommitCommand,
  runVerifyCommand,
} from "./commands/commit-commands";
import { runInfraSetupCommand } from "./commands/infra-setup";
import { flushLocalWriteAheadQueue } from "./daemon/flush-daemon";

function parseFlagValue(
  argv: readonly string[],
  flagNames: readonly string[]
): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg && flagNames.includes(arg)) {
      return argv[i + 1];
    }
  }
  return undefined;
}

function parseMultiFlagValues(
  argv: readonly string[],
  flagNames: readonly string[]
): string[] {
  const values: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextVal = argv[i + 1];
    if (arg && flagNames.includes(arg) && nextVal) {
      values.push(nextVal);
    }
  }
  return values;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0] ?? "status";

  if (command === "__daemon_flush") {
    await flushLocalWriteAheadQueue();
    return;
  }

  if (command === "login") {
    await runLoginCommand({
      apiKey: parseFlagValue(argv, ["--key", "-k"]),
      apiUrl: parseFlagValue(argv, ["--url", "-u"]),
      handle: parseFlagValue(argv, ["--handle", "-h"]),
    });
    return;
  }

  if (command === "add") {
    const rawText = argv[1];
    if (!rawText) {
      console.error('Usage: volt add "<micro-task description>" [--pr <url>]');
      process.exit(1);
    }
    runAddCommand({
      rawText,
      githubPrUrl: parseFlagValue(argv, ["--pr", "--link"]),
    });
    return;
  }

  if (command === "status" || command === "pool") {
    await runStatusCommand();
    return;
  }

  if (command === "commit") {
    const summary = parseFlagValue(argv, ["-m", "--summary"]);
    if (!summary) {
      console.error(
        'Usage: volt commit -m "<summary>" [--type output|insight] [--domain engineering|research|ops|finance|pitch] [--pr <url>] [--file <path>] [--co @user]'
      );
      process.exit(1);
    }
    const typeFlag = (parseFlagValue(argv, ["--type", "-t"]) ??
      "output") as CommitType;
    const domainFlag = parseFlagValue(argv, ["--domain", "-d"]) as
      | WorkDomain
      | undefined;

    await runCommitCommand({
      type: typeFlag,
      domain: domainFlag,
      summary,
      githubPrUrl: parseFlagValue(argv, ["--pr", "--link"]),
      filePath: parseFlagValue(argv, ["--file", "-f"]),
      coAuthors: parseMultiFlagValues(argv, ["--co"]),
    });
    return;
  }

  if (command === "verify") {
    const shortHash = argv[1];
    if (!shortHash) {
      console.error('Usage: volt verify <shortHash> -m "<contribution note>" | --reject');
      process.exit(1);
    }
    const isReject = argv.includes("--reject");
    await runVerifyCommand({
      shortHash,
      action: isReject ? "reject" : "verify",
      contributionNote: parseFlagValue(argv, ["-m", "--note"]),
    });
    return;
  }

  if (command === "infra:setup") {
    await runInfraSetupCommand();
    return;
  }

  console.log(
    "Volt CLI Commands: volt login | volt add | volt status | volt commit | volt verify | volt infra:setup"
  );
}

if (import.meta.main) {
  main().catch((err: Error) => {
    console.error("[ERROR]", err.message);
    process.exit(1);
  });
}
