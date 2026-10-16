"use client";

import { AppRoutes } from "@volt/types";
import {
  Activity,
  Command,
  GitBranch,
  Scale,
  Settings,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationHeader(props: {
  readonly userHandle: string;
  readonly pendingReviewsCount: number;
  readonly onOpenCommandPalette: () => void;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: AppRoutes.home,
      label: "Live Stream",
      icon: Activity,
    },
    {
      href: AppRoutes.peerReviews,
      label: "Peer Reviews",
      icon: ShieldCheck,
      badge: props.pendingReviewsCount,
    },
    {
      href: AppRoutes.poolMatrix,
      label: "Pool Share Matrix",
      icon: Scale,
    },
    {
      href: AppRoutes.settingsIntegrations,
      label: "GitHub & Policies",
      icon: Settings,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#09090B]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link
            href={AppRoutes.home}
            className="flex items-center gap-2.5 text-zinc-100 transition hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Terminal className="h-4 w-4" aria-label="Volt Terminal Icon" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold tracking-tight text-zinc-50">
                volt
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                Impact Engine
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === AppRoutes.home
                  ? pathname === AppRoutes.home
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "bg-white/[0.08] text-zinc-50"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={props.onOpenCommandPalette}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/[0.16] hover:text-zinc-200"
            aria-label="Open Command Palette"
          >
            <Command className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Command</span>
            <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
              Cmd+K
            </kbd>
          </button>

          <Link
            href={AppRoutes.settingsIntegrations}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Connect GitHub</span>
          </Link>

          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono">@{props.userHandle}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
