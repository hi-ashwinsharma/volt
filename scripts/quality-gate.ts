import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT_DIR = process.cwd();
const SCAN_DIRS = ["packages", "apps"];
const MAX_LINES = 200;

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

const TYPE_DECL_REGEX =
  /^\s*(?:export\s+)?(?:interface\s+[A-Za-z0-9_]+|type\s+[A-Za-z0-9_]+\s*(?:<[^>]*>)?\s*=)/m;
const ANY_UNKNOWN_REGEX = /\b(?:any|unknown)\b/;

function collectSourceFiles(dirPath: string): string[] {
  const results: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dirPath);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (
      entry === "node_modules" ||
      entry === ".next" ||
      entry === "dist" ||
      entry === "target" ||
      entry === ".turbo"
    ) {
      continue;
    }
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

function runQualityGate(): void {
  const violations: string[] = [];
  let totalFilesChecked = 0;

  for (const dir of SCAN_DIRS) {
    const files = collectSourceFiles(join(ROOT_DIR, dir));
    for (const file of files) {
      totalFilesChecked += 1;
      const relPath = relative(ROOT_DIR, file);
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");

      if (lines.length > MAX_LINES) {
        violations.push(
          `[200-LINE-LIMIT] ${relPath} has ${lines.length} lines (max ${MAX_LINES}).`
        );
      }

      if (!relPath.startsWith("packages/types/src/") && !relPath.endsWith(".d.ts")) {
        if (TYPE_DECL_REGEX.test(content)) {
          violations.push(
            `[CENTRALIZED-TYPES] ${relPath} declares a type or interface outside packages/types/src/.`
          );
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? "";
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
          continue;
        }
        if (ANY_UNKNOWN_REGEX.test(line)) {
          violations.push(
            `[ZERO-ANY-UNKNOWN] ${relPath}:${i + 1} uses 'any' or 'unknown': ${trimmed}`
          );
        }
        if (EMOJI_REGEX.test(line)) {
          violations.push(
            `[ZERO-EMOJI] ${relPath}:${i + 1} contains a prohibited Unicode emoji.`
          );
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error("QUALITY GATE FAILED:");
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }

  console.log(
    `[OK] Quality gate passed across ${totalFilesChecked} source files (<=200 lines, centralized @volt/types, zero any/unknown, zero emojis).`
  );
}

runQualityGate();
