"use client";

import {
  WORK_DOMAINS,
  type CommandBarCaptureMode,
  type CommitType,
  type TopCaptureBarProps,
  type WorkDomain,
} from "@volt/types";
import {
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
    <section aria-label="Quick Capture and Commit Bar" className="volt-glass rounded-2xl p-4 shadow-2xl transition">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setMode("stage")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              mode === "stage" ? "bg-zinc-800 text-zinc-50 shadow" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Stage Micro-Log (volt add)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("commit")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              mode === "commit" ? "bg-emerald-500/20 text-emerald-300 shadow" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <GitCommitHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Commit Deliverable (volt commit)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowDrawer((p) => !p)}
          className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/[0.14]"
        >
          <Layers className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <span className="font-mono">{props.stagedLogs.length}</span>
          <span>staged logs ready</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === "stage"
                ? "Capture micro-task in <3 seconds (e.g., benchmarked quantization in Colab)..."
                : "Synthesize deliverable or disproved research hypothesis..."
            }
            className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-950/90 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={props.isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-50"
          >
            {mode === "stage" ? <Plus className="h-4 w-4" aria-hidden="true" /> : <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />}
            <span>{mode === "stage" ? "Stage Log" : "Evaluate & Commit"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {mode === "commit" && (
            <>
              <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-zinc-900/70 p-1">
                <button
                  type="button"
                  onClick={() => setCommitType("output")}
                  className={`rounded px-2.5 py-1 font-medium ${commitType === "output" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400"}`}
                >
                  OUTPUT
                </button>
                <button
                  type="button"
                  onClick={() => setCommitType("insight")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium ${commitType === "insight" ? "bg-violet-500/20 text-violet-300" : "text-zinc-400"}`}
                >
                  <FlaskConical className="h-3 w-3" aria-hidden="true" />
                  <span>INSIGHT (R&D)</span>
                </button>
              </div>

              <select
                aria-label="Work Domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value as WorkDomain)}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                {WORK_DOMAINS.map((d) => (
                  <option key={d} value={d}>Domain: {d}</option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/70 px-2.5 py-1">
                <Users className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                <input
                  type="text"
                  value={coAuthorsText}
                  onChange={(e) => setCoAuthorsText(e.target.value)}
                  placeholder="@rohan, @priya"
                  className="w-32 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/70 px-2.5 py-1">
            <GitPullRequest className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <input
              type="url"
              value={githubPrUrl}
              onChange={(e) => setGithubPrUrl(e.target.value)}
              placeholder="Attach GitHub App Verified PR URL..."
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </form>

      {showDrawer && (
        <div className="mt-3 border-t border-white/[0.07] pt-3">
          <ul className="space-y-1.5">
            {props.stagedLogs.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 text-xs text-zinc-300">
                <span>{l.rawText}</span>
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-400">{l.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
