"use client";

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
      const handles = coAuthorsText
        .split(",")
        .map((s) => s.trim().replace(/^@/, ""))
        .filter(Boolean);
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
    <section aria-label="Quick Capture and Deliverable Composer" className="apple-composer rounded-[20px] p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center rounded-full border border-border-subtle bg-control p-0.5">
          <button
            type="button"
            onClick={() => setMode("stage")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200 ease-apple active:scale-[0.98] ${
              mode === "stage" ? "bg-segmented-active text-ink-primary shadow-sm" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            <span>Stage Micro-Log</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("commit")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200 ease-apple active:scale-[0.98] ${
              mode === "commit" ? "bg-segmented-active text-ink-primary shadow-sm" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <GitCommitHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Synthesize Commit</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowDrawer((p) => !p)}
          className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium active:scale-[0.98]"
        >
          <Layers className="h-3 w-3 opacity-70" aria-hidden="true" />
          <span className="font-mono font-semibold tabular-nums text-ink-primary">{props.stagedLogs.length}</span>
          <span>staged in buffer</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ease-apple ${showDrawer ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="apple-inset flex items-center gap-3 rounded-[14px] px-4 py-2.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === "stage"
                ? "Log micro-progress in under 3 seconds (e.g., profiled AWQ kernel latency)..."
                : "Describe completed deliverable or disproved R&D hypothesis..."
            }
            className="flex-1 bg-transparent text-[14px] tracking-[-0.012em] text-ink-primary placeholder-ink-tertiary focus:outline-none"
          />
          <button
            type="submit"
            disabled={props.isSubmitting || !inputText.trim()}
            className="apple-btn-primary flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium disabled:opacity-35"
          >
            <span>{mode === "stage" ? "Stage" : "Commit"}</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            {mode === "commit" && (
              <>
                <div className="flex items-center rounded-full border border-border-subtle bg-control p-0.5">
                  <button
                    type="button"
                    onClick={() => setCommitType("output")}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                      commitType === "output" ? "bg-segmented-active text-ink-primary shadow-sm" : "text-ink-secondary"
                    }`}
                  >
                    Output
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommitType("insight")}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                      commitType === "insight" ? "bg-segmented-active text-ink-primary shadow-sm" : "text-ink-secondary"
                    }`}
                  >
                    <FlaskConical className="h-3 w-3 opacity-75" aria-hidden="true" />
                    <span>Insight (R&D)</span>
                  </button>
                </div>

                <div className="flex items-center rounded-full border border-border-subtle bg-control p-0.5">
                  {WORK_DOMAINS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDomain(d)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] capitalize transition-all ${
                        domain === d ? "bg-segmented-active font-medium text-ink-primary shadow-sm" : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <div className="apple-pill flex items-center gap-1.5 rounded-full px-3 py-1">
                  <Users className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />
                  <input
                    type="text"
                    value={coAuthorsText}
                    onChange={(e) => setCoAuthorsText(e.target.value)}
                    placeholder="Co-authors (@rohan)"
                    className="w-28 bg-transparent text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="apple-pill flex min-w-[230px] flex-1 items-center gap-1.5 rounded-full px-3 py-1 sm:max-w-xs">
            <GitPullRequest className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />
            <input
              type="url"
              value={githubPrUrl}
              onChange={(e) => setGithubPrUrl(e.target.value)}
              placeholder="Attach GitHub PR URL for 1.2x proof..."
              className="w-full bg-transparent text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
            />
          </div>
        </div>
      </form>

      {showDrawer && (
        <div className="mt-3.5 border-t border-border-subtle pt-3">
          <ul className="space-y-1.5">
            {props.stagedLogs.map((l) => (
              <li key={l.id} className="apple-inset flex items-center justify-between rounded-[10px] px-3 py-2 text-[12px]">
                <span className="text-ink-primary">{l.rawText}</span>
                <span className="rounded-full bg-control px-2 py-0.5 font-mono text-[10px] uppercase text-ink-secondary">{l.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
