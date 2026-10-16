"use client";

import { Button, Chip, Input, Surface, Typography } from "@heroui/react";
import {
  WORK_DOMAINS,
  type CommandBarCaptureMode,
  type CommitType,
  type TopCaptureBarProps,
  type WorkDomain,
} from "@volt/types";
import {
  ArrowUp,
  ChevronDown,
  FlaskConical,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";

export function TopCaptureBar(props: TopCaptureBarProps) {
  const [mode, setMode] = useState<CommandBarCaptureMode>("stage");
  const [inputText, setInputText] = useState("");
  const [commitType, setCommitType] = useState<CommitType>("output");
  const [domain, setDomain] = useState<WorkDomain>(props.defaultDomain);
  const [githubPrUrl, setGithubPrUrl] = useState("");
  const [coAuthorsText, setCoAuthorsText] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (mode === "stage") {
      await props.onStageLog(inputText.trim(), githubPrUrl.trim() || null);
      setInputText("");
    } else {
      const handles = coAuthorsText.split(",").map((s) => s.trim().replace(/^@/, "")).filter(Boolean);
      await props.onCreateCommit({
        type: commitType,
        domain,
        summary: inputText.trim(),
        githubPrUrl: githubPrUrl.trim() || null,
        coAuthorHandles: handles,
      });
      setInputText("");
      setCoAuthorsText("");
    }
  };

  return (
    <Surface aria-label="Quick Capture and Deliverable Composer" variant="default" className="rounded-2xl border border-border p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface-secondary p-1">
          <Button
            size="sm"
            variant={mode === "stage" ? "primary" : "ghost"}
            onClick={() => setMode("stage")}
            className="rounded-full"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <Typography type="body-xs">Stage Micro-Log</Typography>
          </Button>
          <Button
            size="sm"
            variant={mode === "commit" ? "primary" : "ghost"}
            onClick={() => setMode("commit")}
            className="rounded-full"
          >
            <GitCommitHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <Typography type="body-xs">Synthesize Commit</Typography>
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDrawer((p) => !p)}
          className="rounded-full flex items-center gap-1.5 px-3 py-1"
        >
          <Layers className="h-3 w-3 text-muted" aria-hidden="true" />
          <Chip size="sm" variant="soft" className="h-4 px-1 font-mono font-semibold">
            <Chip.Label>{props.stagedLogs.length}</Chip.Label>
          </Chip>
          <Typography type="body-xs" color="muted">staged in buffer</Typography>
          <ChevronDown className={`h-3 w-3 text-muted transition-transform ${showDrawer ? "rotate-180" : ""}`} aria-hidden="true" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            aria-label="Deliverable or Micro-Log text"
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === "stage"
                ? "Log micro-progress in under 3 seconds (e.g., profiled AWQ kernel latency)..."
                : "Describe completed deliverable or disproved R&D hypothesis..."
            }
            variant="secondary"
          />
          <Button
            type="submit"
            size="md"
            variant="primary"
            isDisabled={props.isSubmitting || !inputText.trim()}
            className="rounded-xl px-4 shrink-0"
          >
            <Typography type="body-sm" className="font-medium text-primary-foreground">{mode === "stage" ? "Stage" : "Commit"}</Typography>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {mode === "commit" && (
              <>
                <div className="flex items-center gap-1 rounded-full border border-border bg-surface-secondary p-0.5">
                  <Button
                    size="sm"
                    variant={commitType === "output" ? "secondary" : "ghost"}
                    onClick={() => setCommitType("output")}
                    className="h-6 px-2 text-[11px] rounded-full"
                  >
                    <Typography type="body-xs">Output</Typography>
                  </Button>
                  <Button
                    size="sm"
                    variant={commitType === "insight" ? "secondary" : "ghost"}
                    onClick={() => setCommitType("insight")}
                    className="h-6 px-2 text-[11px] rounded-full"
                  >
                    <FlaskConical className="h-3 w-3" aria-hidden="true" />
                    <Typography type="body-xs">Insight (R&D)</Typography>
                  </Button>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-border bg-surface-secondary p-0.5">
                  {WORK_DOMAINS.map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant={domain === d ? "secondary" : "ghost"}
                      onClick={() => setDomain(d)}
                      className="h-6 px-2 text-[11px] capitalize rounded-full"
                    >
                      <Typography type="body-xs">{d}</Typography>
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-0.5">
                  <Users className="h-3 w-3 text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    value={coAuthorsText}
                    onChange={(e) => setCoAuthorsText(e.target.value)}
                    placeholder="Co-authors (@rohan)"
                    className="w-28 bg-transparent text-[11px] text-foreground placeholder:text-muted focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex min-w-[240px] flex-1 items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-0.5 sm:max-w-xs">
            <GitPullRequest className="h-3 w-3 text-muted" aria-hidden="true" />
            <input
              type="url"
              value={githubPrUrl}
              onChange={(e) => setGithubPrUrl(e.target.value)}
              placeholder="Attach GitHub PR URL for 1.2x proof..."
              className="w-full bg-transparent text-[11px] text-foreground placeholder:text-muted focus:outline-none"
            />
          </div>
        </div>
      </form>

      {showDrawer && (
        <div className="mt-4 border-t border-border pt-3">
          <ul className="space-y-1.5">
            {props.stagedLogs.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs">
                <Typography type="body-sm">{l.rawText}</Typography>
                <Chip size="sm" variant="secondary" className="font-mono text-[10px] uppercase">
                  <Chip.Label>{l.source}</Chip.Label>
                </Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Surface>
  );
}
