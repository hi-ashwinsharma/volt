import {
  WORK_DOMAINS,
  type CommitType,
  type OverlayQuickState,
  type WorkDomain,
} from "@volt/types";
import {
  Command,
  CornerDownLeft,
  FlaskConical,
  GitCommitHorizontal,
  GitPullRequest,
  Plus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  createLocalQueuePreviewRow,
  invokeOverlayQuickCommit,
  invokeOverlayQuickStage,
} from "./bridge";

export function SpotlightOverlayApp() {
  const [state, setState] = useState<OverlayQuickState>({
    mode: "stage",
    text: "",
    commitType: "output",
    domain: "engineering",
    githubPrUrl: "",
    coAuthorsText: "",
    recentLogs: [],
    lastLatencyMs: null,
    statusMessage: "Ready (Cmd + Shift + L)",
  });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.text.trim()) return;

    if (state.mode === "stage") {
      const res = await invokeOverlayQuickStage({
        rawText: state.text,
        githubPrUrl: state.githubPrUrl.trim() || null,
      });
      const row = createLocalQueuePreviewRow(state.text, state.githubPrUrl.trim() || null);
      setState((prev) => ({
        ...prev,
        text: "",
        recentLogs: [row, ...prev.recentLogs].slice(0, 5),
        lastLatencyMs: res.latencyMs,
        statusMessage: `Staged to ~/.volt/queue.sqlite in ${res.latencyMs}ms`,
      }));
    } else {
      const coAuthors = state.coAuthorsText
        .split(",")
        .map((c) => c.trim().replace(/^@/, ""))
        .filter(Boolean);
      const res = await invokeOverlayQuickCommit({
        type: state.commitType,
        domain: state.domain,
        summary: state.text.trim(),
        githubPrUrl: state.githubPrUrl.trim() || null,
        coAuthorHandles: coAuthors,
      });
      setState((prev) => ({
        ...prev,
        text: "",
        coAuthorsText: "",
        recentLogs: [],
        lastLatencyMs: res.latencyMs,
        statusMessage: `Committed [${res.shortHash}] in ${res.latencyMs}ms`,
      }));
    }
  };

  return (
    <div className="mx-auto w-[680px] rounded-2xl border border-white/15 bg-zinc-950/90 p-4 text-zinc-100 shadow-2xl backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span className="font-mono font-semibold text-zinc-200">volt macOS Spotlight Overlay</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">Cmd+Shift+L</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setState((p) => ({ ...p, mode: "stage" }))}
            className={`rounded px-2 py-1 font-mono text-[11px] ${
              state.mode === "stage" ? "bg-zinc-800 text-white" : "text-zinc-400"
            }`}
          >
            Stage (Tab)
          </button>
          <button
            type="button"
            onClick={() => setState((p) => ({ ...p, mode: "commit" }))}
            className={`rounded px-2 py-1 font-mono text-[11px] ${
              state.mode === "commit" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400"
            }`}
          >
            Commit
          </button>
        </div>
      </div>

      <form onSubmit={handleAction} className="space-y-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5">
          {state.mode === "stage" ? (
            <Plus className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <GitCommitHorizontal className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          )}
          <input
            type="text"
            autoFocus
            value={state.text}
            onChange={(e) => setState((p) => ({ ...p, text: e.target.value }))}
            placeholder={
              state.mode === "stage"
                ? "Type micro-task and press Enter (<5ms SQLite write-ahead)..."
                : "Synthesize deliverable or disproved research hypothesis..."
            }
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-950"
          >
            <span>Enter</span>
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {state.mode === "commit" && (
            <>
              <button
                type="button"
                onClick={() =>
                  setState((p) => ({
                    ...p,
                    commitType: (p.commitType === "output" ? "insight" : "output") as CommitType,
                  }))
                }
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 font-mono text-[11px]"
              >
                <FlaskConical className="h-3 w-3 text-violet-400" aria-hidden="true" />
                <span>{state.commitType.toUpperCase()}</span>
              </button>
              <select
                value={state.domain}
                onChange={(e) => setState((p) => ({ ...p, domain: e.target.value as WorkDomain }))}
                className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 font-mono text-[11px]"
              >
                {WORK_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </>
          )}
          <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/70 px-2.5 py-1">
            <GitPullRequest className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <input
              type="url"
              value={state.githubPrUrl}
              onChange={(e) => setState((p) => ({ ...p, githubPrUrl: e.target.value }))}
              placeholder="Optional GitHub PR URL..."
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </form>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <Command className="h-3 w-3" aria-hidden="true" />
          <span>{state.statusMessage}</span>
        </span>
        <span>{state.recentLogs.length} staged in session</span>
      </div>
    </div>
  );
}
