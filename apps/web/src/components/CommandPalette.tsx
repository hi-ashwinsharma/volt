"use client";

import { AppRoutes, type CommandPaletteProps } from "@volt/types";
import {
  Activity,
  Command,
  GitBranch,
  Plus,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";

export function CommandPalette(props: CommandPaletteProps) {
  const [quickText, setQuickText] = useState("");

  if (!props.isOpen) {
    return null;
  }

  const actions = [
    {
      label: "Go to Live Impact Stream",
      route: AppRoutes.home,
      icon: Activity,
    },
    {
      label: "Open High-Stakes Peer Review & Handshake Queue",
      route: AppRoutes.peerReviews,
      icon: ShieldCheck,
    },
    {
      label: "View Dynamic Bonus Pool Share Matrix",
      route: AppRoutes.poolMatrix,
      icon: Scale,
    },
    {
      label: "Connect GitHub App & Manage PBAC Policies",
      route: AppRoutes.settingsIntegrations,
      icon: GitBranch,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-24 backdrop-blur-sm"
    >
      <div className="volt-glass w-full max-w-xl rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Command className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="font-semibold">Volt Global Command Palette</span>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
            aria-label="Close Command Palette"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (quickText.trim()) {
              await props.onQuickStage(quickText.trim());
              setQuickText("");
              props.onClose();
            }
          }}
          className="mt-3 flex gap-2"
        >
          <input
            type="text"
            autoFocus
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="Type a micro-task and press Enter to stage immediately..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Stage</span>
          </button>
        </form>

        <div className="mt-4 space-y-1">
          <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Quick Navigation
          </p>
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.route}
                type="button"
                onClick={() => {
                  props.onNavigate(act.route);
                  props.onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-zinc-200 transition hover:bg-white/[0.06]"
              >
                <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
