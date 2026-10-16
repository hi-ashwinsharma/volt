"use client";

import { Button, Chip, Input, Surface, Typography } from "@heroui/react";
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
      {/* Live Staging Buffer */}
      <Surface variant="default" className="rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <Typography type="h4" className="font-semibold text-foreground">
              Live Staging Buffer
            </Typography>
          </div>
          <Chip size="sm" variant="secondary" className="font-mono text-[11px] tabular-nums">
            <Chip.Label>{props.stagedLogs.length} uncommitted</Chip.Label>
          </Chip>
        </div>

        <Typography type="body-xs" color="muted" className="mt-2.5 leading-relaxed">
          Micro-tasks logged via CLI (<Typography type="code">volt add</Typography>), MCP, or web buffer in local SQLite (<Typography type="code">&lt;5ms</Typography>).
        </Typography>

        {/* Quick inline stage affordance */}
        <form onSubmit={handleQuickAdd} className="mt-3 flex items-center gap-1.5">
          <Input
            aria-label="Quick add micro-log"
            fullWidth
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="Quick add micro-log..."
            variant="secondary"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            isIconOnly
            isDisabled={!quickText.trim()}
            className="rounded-xl h-9 w-9 shrink-0"
            aria-label="Stage log immediately"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        {/* Micro-logs list */}
        <div className="mt-3.5 space-y-1.5 max-h-[220px] overflow-y-auto">
          {props.stagedLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-3 text-center">
              <Typography type="body-xs" color="muted">
                Buffer empty. Micro-logs you stage will live here before bundling.
              </Typography>
            </div>
          ) : (
            props.stagedLogs.map((l) => (
              <Surface
                key={l.id}
                variant="secondary"
                className="group flex items-start justify-between gap-2 rounded-lg p-2.5 border border-border"
              >
                <div className="min-w-0 flex-1">
                  <Typography type="body-xs" className="font-medium truncate">
                    {l.rawText}
                  </Typography>
                  <Typography type="body-xs" color="muted" className="font-mono text-[9px] uppercase tracking-wider block">
                    src:{l.source}
                  </Typography>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  isIconOnly
                  onClick={() => props.onRemoveStagedLog(l.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-muted hover:text-danger"
                  aria-label="Remove from buffer"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Surface>
            ))
          )}
        </div>
      </Surface>

      {/* Conceptual Mathematical Model */}
      <Surface variant="default" className="rounded-2xl border border-border p-5 text-xs">
        <div className="flex items-center gap-1.5 font-semibold mb-2">
          <Terminal className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          <Typography type="body-sm" className="font-semibold">Weightage Formula Model</Typography>
        </div>
        <Typography type="body-xs" color="muted" className="leading-relaxed">
          Deliverable value (<Typography type="code">W_c</Typography>) is mathematically determined:
        </Typography>
        <Surface variant="secondary" className="mt-2 p-3 rounded-xl border border-border text-center">
          <Typography type="code" className="text-xs">
            W_c = (C<sup>1.4</sup> × I × E) × V × D
          </Typography>
        </Surface>
        <ul className="mt-2.5 space-y-1.5">
          <li>
            <Typography type="body-xs" color="muted">
              • <strong className="text-foreground">C (Complexity):</strong> Fibonacci [1..21] raised to 1.4x exponent.
            </Typography>
          </li>
          <li>
            <Typography type="body-xs" color="muted">
              • <strong className="text-foreground">I (Impact):</strong> Business leverage [0.8x..2.0x].
            </Typography>
          </li>
          <li>
            <Typography type="body-xs" color="muted">
              • <strong className="text-foreground">E (Evidence):</strong> Automated GitHub PR [1.2x] or .ipynb [1.1x].
            </Typography>
          </li>
          <li>
            <Typography type="body-xs" color="muted">
              • <strong className="text-foreground">V (Consensus):</strong> Peer calibration [0.70x..1.30x].
            </Typography>
          </li>
          <li>
            <Typography type="body-xs" color="muted">
              • <strong className="text-foreground">D (Decay):</strong> Half-life timeliness discount [0.20x..1.00x].
            </Typography>
          </li>
        </ul>
      </Surface>
    </aside>
  );
}
