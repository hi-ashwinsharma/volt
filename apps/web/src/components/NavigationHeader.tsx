"use client";

import { Button, Chip, Kbd } from "@heroui/react";
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
  UserCheck,
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
      label: "Reviews & Triage",
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
      <div className="mx-auto flex h-14 max-w-[1360px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href={AppRoutes.home}
            className="group flex items-center gap-2.5 transition-opacity duration-200 ease-apple hover:opacity-85"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-border-subtle bg-control text-ink-primary">
              <Terminal className="h-3.5 w-3.5 text-accent-emerald" aria-label="Volt Icon" />
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
                    <Chip color="warning" size="sm" variant="soft" className="ml-0.5 h-4 px-1 text-[10px]">
                      <Chip.Label>{item.badge}</Chip.Label>
                    </Chip>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={props.onOpenCommandPalette}
            className="apple-pill flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium"
            aria-label="Open Command Palette"
          >
            <Command className="h-3 w-3 opacity-75" aria-hidden="true" />
            <span className="hidden sm:inline">Command</span>
            <Kbd className="text-[10px]">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>K</Kbd.Content>
            </Kbd>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={props.onToggleTheme}
            className="apple-pill flex h-7 w-7 items-center justify-center rounded-full"
            aria-label={props.theme === "dark" ? "Switch to Apple Light Mode" : "Switch to macOS Dark Mode"}
          >
            {props.theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>

          {/* Interactive Persona Switcher */}
          {props.availableHandles && props.availableHandles.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-control px-2.5 py-1 text-[11px] text-ink-secondary">
              <UserCheck className="h-3 w-3 text-accent-blue" aria-hidden="true" />
              <span className="text-ink-tertiary">As:</span>
              <div className="flex items-center gap-1">
                {props.availableHandles.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => props.onSwitchPersona?.(h)}
                    className={`font-mono px-1.5 py-0.5 rounded transition-colors ${
                      props.userHandle === h
                        ? "bg-segmented-active text-ink-primary font-semibold shadow-xs"
                        : "hover:text-ink-primary"
                    }`}
                  >
                    @{h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
