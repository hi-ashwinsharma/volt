"use client";

import type { LiveStagingRailProps } from "@volt/types";
import { Plus, Terminal, Trash2 } from "lucide-react";
import { useState } from "react";

export function LiveStagingRail(props: LiveStagingRailProps) {
  const [quickText, setQuickText] = useState("");

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    await props.onStageLog(quickText.trim(), null);
    setQuickText("");
  };

  return (
    <aside aria-label="Live Staging Buffer and Conceptual Model" className="space-y-4">
      {/* Live Staging Buffer Card */}
      <div className="apple-surface rounded-[20px] p-4.5">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-ok animate-pulse" />
            <h3 className="text-[13px] font-semibold tracking-tight text-ink-primary">
              Live Staging Buffer
            </h3>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-ink-secondary bg-control px-2 py-0.5 rounded-full">
            {props.stagedLogs.length} uncommitted
          </span>
        </div>

        <p className="mt-2.5 text-[11px] leading-relaxed text-ink-tertiary">
          Micro-tasks logged via CLI (<code className="font-mono text-ink-secondary">volt add</code>), MCP, or web buffer in local SQLite (<code className="font-mono text-ink-secondary">&lt;5ms</code>).
        </p>

        {/* Quick inline stage affordance */}
        <form onSubmit={handleQuickAdd} className="mt-3 flex items-center gap-1.5">
          <input
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="Quick add micro-log..."
            className="apple-inset flex-1 rounded-full px-3 py-1.5 text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!quickText.trim()}
            className="apple-pill flex h-7 w-7 items-center justify-center rounded-full text-ink-primary disabled:opacity-30"
            title="Stage log immediately"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </button>
        </form>

        {/* Micro-logs list */}
        <div className="mt-3.5 space-y-1.5 max-h-[220px] overflow-y-auto">
          {props.stagedLogs.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border-subtle p-3 text-center text-[11px] text-ink-tertiary">
              Buffer empty. Micro-logs you stage will live here before bundling.
            </div>
          ) : (
            props.stagedLogs.map((l) => (
              <div
                key={l.id}
                className="apple-inset group flex items-start justify-between gap-2 rounded-[10px] p-2 text-[11px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink-primary truncate font-medium">{l.rawText}</p>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-tertiary">
                    src:{l.source}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => props.onRemoveStagedLog(l.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-ink-tertiary hover:text-status-danger"
                  title="Remove from buffer"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Don Norman Conceptual Model: The Math Engine at a glance */}
      <div className="apple-surface rounded-[20px] p-4.5 text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold text-ink-primary mb-2">
          <Terminal className="h-3.5 w-3.5 text-accent-emerald" aria-hidden="true" />
          <span>Weightage Formula Model</span>
        </div>
        <p className="text-ink-tertiary leading-relaxed">
          Deliverable value (<span className="font-mono text-ink-secondary">W_c</span>) is mathematically determined:
        </p>
        <div className="apple-inset mt-2 p-2 rounded-[10px] font-mono text-[10px] text-ink-primary text-center">
          W_c = (C<sup>1.4</sup> × I × E) × V × D
        </div>
        <ul className="mt-2.5 space-y-1 text-ink-tertiary">
          <li className="flex justify-between">
            <span>Complexity (C):</span>
            <span className="font-mono text-ink-secondary">1 to 13 (C^1.4)</span>
          </li>
          <li className="flex justify-between">
            <span>Impact (I):</span>
            <span className="font-mono text-ink-secondary">0.5× to 3.0×</span>
          </li>
          <li className="flex justify-between">
            <span>Proof (E):</span>
            <span className="font-mono text-ink-secondary">0.5× to 1.2×</span>
          </li>
          <li className="flex justify-between">
            <span>Auto-Approve:</span>
            <span className="font-mono text-accent-emerald font-medium">≤ 15.00 pts</span>
          </li>
          <li className="flex justify-between">
            <span>Peer Review:</span>
            <span className="font-mono text-accent-amber font-medium">&gt; 15.00 pts</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
