"use client";

import { Button, Card, Chip, Input } from "@heroui/react";
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
      <Card className="apple-surface rounded-[20px] p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-ok animate-pulse" />
            <h3 className="text-[13px] font-semibold tracking-tight text-ink-primary">
              Live Staging Buffer
            </h3>
          </div>
          <Chip size="sm" variant="secondary" className="font-mono text-[11px] tabular-nums">
            <Chip.Label>{props.stagedLogs.length} uncommitted</Chip.Label>
          </Chip>
        </div>

        <p className="mt-2.5 text-[11px] leading-relaxed text-ink-tertiary">
          Micro-tasks logged via CLI (<code className="font-mono text-ink-secondary">volt add</code>), MCP, or web buffer in local SQLite (<code className="font-mono text-ink-secondary">&lt;5ms</code>).
        </p>

        {/* Quick inline stage affordance */}
        <form onSubmit={handleQuickAdd} className="mt-3 flex items-center gap-1.5">
          <Input
            aria-label="Quick add micro-log"
            fullWidth
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="Quick add micro-log..."
            className="apple-inset flex-1 rounded-full px-3 py-1.5 text-[11px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            isIconOnly
            isDisabled={!quickText.trim()}
            className="apple-pill flex h-7 w-7 items-center justify-center rounded-full text-ink-primary"
            aria-label="Stage log immediately"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </Button>
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
      </Card>

      {/* Don Norman Conceptual Model: The Math Engine at a glance */}
      <Card className="apple-surface rounded-[20px] p-5 text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold text-ink-primary mb-2">
          <Terminal className="h-3.5 w-3.5 text-accent-emerald" aria-hidden="true" />
          <span>Weightage Formula Model</span>
        </div>
        <p className="text-ink-tertiary leading-relaxed">
          Deliverable value (<span className="font-mono text-ink-secondary">W_c</span>) is mathematically determined:
        </p>
        <div className="apple-inset mt-2 p-3 rounded-[12px] font-mono text-[10px] text-ink-primary text-center">
          W_c = (C<sup>1.4</sup> × I × E) × V × D
        </div>
        <ul className="mt-2.5 space-y-1 text-ink-tertiary">
          <li>• <strong className="text-ink-primary">C (Complexity):</strong> Fibonacci [1..21] raised to 1.4x exponent.</li>
          <li>• <strong className="text-ink-primary">I (Impact):</strong> Business leverage [0.8x..2.0x].</li>
          <li>• <strong className="text-ink-primary">E (Evidence):</strong> Automated GitHub PR [1.2x] or .ipynb [1.1x].</li>
          <li>• <strong className="text-ink-primary">V (Consensus):</strong> Peer calibration [0.70x..1.30x].</li>
          <li>• <strong className="text-ink-primary">D (Decay):</strong> Half-life timeliness discount [0.20x..1.00x].</li>
        </ul>
      </Card>
    </aside>
  );
}
