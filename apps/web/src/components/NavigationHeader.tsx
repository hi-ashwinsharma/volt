"use client";

import { AppRoutes, type NavigationHeaderProps } from "@volt/types";
import {
  Activity,
  Command,
  Moon,
  Scale,
  Settings,
  ShieldCheck,
  Sun,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationHeader(props: NavigationHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: AppRoutes.home,
      label: "Stream",
      icon: Activity,
    },
    {
      href: AppRoutes.peerReviews,
      label: "Reviews",
      icon: ShieldCheck,
      badge: props.pendingReviewsCount,
    },
    {
      href: AppRoutes.poolMatrix,
      label: "Pool Share",
      icon: Scale,
    },
    {
      href: AppRoutes.settingsIntegrations,
      label: "Governance",
      icon: Settings,
    },
  ];

  return (
    <header className="apple-header sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={AppRoutes.home}
          className="group flex items-center gap-2.5 transition-opacity duration-200 ease-apple hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-border-subtle bg-control text-ink-primary transition-transform duration-200 ease-apple group-active:scale-95">
            <Terminal className="h-3.5 w-3.5" aria-label="Volt Icon" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-[-0.025em] text-ink-primary">
              volt
            </span>
            <span className="hidden text-[11px] font-medium tracking-[-0.01em] text-ink-tertiary sm:inline">
              Impact Engine
            </span>
          </div>
        </Link>

        <nav
          className="flex items-center rounded-full border border-border-subtle bg-control p-1"
          aria-label="Primary Navigation"
        >
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
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium tracking-[-0.01em] transition-all duration-200 ease-apple active:scale-[0.98] ${
                  isActive
                    ? "bg-segmented-active text-ink-primary shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                <Icon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-0.5 flex items-center gap-1 rounded-full bg-control px-1.5 py-0.2 font-mono text-[10px] font-semibold tabular-nums text-ink-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-warn" />
                    <span>{item.badge}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onOpenCommandPalette}
            className="apple-pill flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium active:scale-[0.97]"
            aria-label="Open Command Palette"
          >
            <Command className="h-3 w-3 opacity-75" aria-hidden="true" />
            <span className="hidden sm:inline">Command</span>
            <kbd className="font-mono text-[10px] text-ink-tertiary">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={props.onToggleTheme}
            className="apple-pill flex h-7 w-7 items-center justify-center rounded-full active:scale-95"
            aria-label={
              props.theme === "dark" ? "Switch to Light Appearance" : "Switch to Dark Appearance"
            }
            title={
              props.theme === "dark" ? "Switch to Apple Light Mode" : "Switch to macOS Dark Mode"
            }
          >
            {props.theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>

          <div className="hidden items-center gap-1.5 rounded-full border border-border-subtle bg-control px-2.5 py-1 text-[12px] text-ink-secondary md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-status-ok" />
            <span className="font-mono text-[11px] text-ink-primary">
              @{props.userHandle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
