"use client";

import { AppRoutes, type CommandPaletteProps } from "@volt/types";
import {
  Activity,
  Command,
  CornerDownLeft,
  Moon,
  Plus,
  Scale,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";

export function CommandPalette(props: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  if (!props.isOpen) {
    return null;
  }

  const actions = [
    {
      label: "Go to Impact Stream",
      shortcut: "G S",
      icon: Activity,
      onSelect: () => {
        props.onNavigate(AppRoutes.home);
        props.onClose();
      },
    },
    {
      label: "Open Peer Review & Handshake Queue",
      shortcut: "G R",
      icon: ShieldCheck,
      onSelect: () => {
        props.onNavigate(AppRoutes.peerReviews);
        props.onClose();
      },
    },
    {
      label: "Inspect Dynamic Bonus Pool Share Matrix",
      shortcut: "G P",
      icon: Scale,
      onSelect: () => {
        props.onNavigate(AppRoutes.poolMatrix);
        props.onClose();
      },
    },
    {
      label: "Manage GitHub App, API Keys & PBAC Policies",
      shortcut: "G I",
      icon: Settings,
      onSelect: () => {
        props.onNavigate(AppRoutes.settingsIntegrations);
        props.onClose();
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      props.onClose();
    } else if (e.key === "Enter" && query.trim().length > 0 && filtered.length === 0) {
      await props.onQuickStage(query.trim());
      setQuery("");
      props.onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Volt Command Palette"
      onClick={props.onClose}
    >
      <div
        className="apple-composer w-full max-w-xl overflow-hidden rounded-[20px] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-2.5">
          <Command className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or micro-log to stage immediately..."
            className="w-full bg-transparent text-[14px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
          />
          <button
            type="button"
            onClick={props.onClose}
            className="apple-pill rounded-full p-1"
            aria-label="Close Command Palette"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1.5 space-y-1 p-1">
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={async () => {
                await props.onQuickStage(query.trim());
                setQuery("");
                props.onClose();
              }}
              className="flex w-full items-center justify-between rounded-[12px] bg-control px-3.5 py-2.5 text-left text-[12px] text-ink-primary transition hover:bg-control-hover"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Stage micro-log: &ldquo;{query.trim()}&rdquo;</span>
              </span>
              <CornerDownLeft className="h-3.5 w-3.5 text-ink-tertiary" aria-hidden="true" />
            </button>
          )}

          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onSelect}
                className="flex w-full items-center justify-between rounded-[12px] px-3.5 py-2.5 text-left text-[13px] text-ink-secondary transition hover:bg-control hover:text-ink-primary"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                <kbd className="rounded-[6px] bg-control px-2 py-0.5 font-mono text-[10px] text-ink-tertiary">
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}

          {props.onToggleTheme && (
            <button
              type="button"
              onClick={() => {
                props.onToggleTheme?.();
                props.onClose();
              }}
              className="flex w-full items-center justify-between rounded-[12px] px-3.5 py-2.5 text-left text-[13px] text-ink-secondary transition hover:bg-control hover:text-ink-primary"
            >
              <span className="flex items-center gap-2.5">
                {props.theme === "dark" ? (
                  <Sun className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
                )}
                <span>
                  Switch to {props.theme === "dark" ? "Light" : "Dark"} Appearance
                </span>
              </span>
              <kbd className="rounded-[6px] bg-control px-2 py-0.5 font-mono text-[10px] text-ink-tertiary">
                Theme
              </kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
