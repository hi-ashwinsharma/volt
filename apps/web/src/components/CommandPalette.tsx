"use client";

import { Button, Input, Kbd, Surface, Typography } from "@heroui/react";
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Volt Command Palette"
      onClick={props.onClose}
    >
      <Surface
        variant="default"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border shadow-2xl p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border pb-3 px-1">
          <Command className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
          <Input
            aria-label="Search or stage"
            autoFocus
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or micro-log to stage immediately..."
            variant="secondary"
          />
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={props.onClose}
            aria-label="Close Command Palette"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-2 space-y-1">
          {query.trim().length > 0 && (
            <Button
              variant="secondary"
              fullWidth
              onClick={async () => {
                await props.onQuickStage(query.trim());
                setQuery("");
                props.onClose();
              }}
              className="flex justify-between items-center py-2 px-3 text-left h-auto"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
                <Typography type="body-sm">Stage micro-log: &ldquo;{query.trim()}&rdquo;</Typography>
              </div>
              <CornerDownLeft className="h-4 w-4 text-muted" aria-hidden="true" />
            </Button>
          )}

          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.label}
                variant="ghost"
                fullWidth
                onClick={item.onSelect}
                className="flex justify-between items-center py-2 px-3 text-left h-auto hover:bg-surface-secondary"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
                  <Typography type="body-sm">{item.label}</Typography>
                </div>
                <Kbd>
                  <Kbd.Content>{item.shortcut}</Kbd.Content>
                </Kbd>
              </Button>
            );
          })}

          {props.onToggleTheme && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                props.onToggleTheme?.();
                props.onClose();
              }}
              className="flex justify-between items-center py-2 px-3 text-left h-auto hover:bg-surface-secondary"
            >
              <div className="flex items-center gap-2.5">
                {props.theme === "dark" ? (
                  <Sun className="h-4 w-4 text-muted" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4 text-muted" aria-hidden="true" />
                )}
                <Typography type="body-sm">
                  Switch to {props.theme === "dark" ? "Light" : "Dark"} Appearance
                </Typography>
              </div>
              <Kbd>
                <Kbd.Content>Theme</Kbd.Content>
              </Kbd>
            </Button>
          )}
        </div>
      </Surface>
    </div>
  );
}
