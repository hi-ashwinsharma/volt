"use client";

import { Button, Chip, Kbd, Surface, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1360px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href={AppRoutes.home} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-secondary text-foreground">
              <Terminal className="h-3.5 w-3.5 text-success" aria-label="Volt Icon" />
            </div>
            <div className="flex items-baseline gap-2">
              <Typography type="h4" className="font-semibold tracking-tight text-foreground">
                volt
              </Typography>
              <Typography type="body-xs" color="muted" className="hidden sm:inline">
                Impact Engine
              </Typography>
            </div>
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border bg-surface-secondary p-1" aria-label="Primary Navigation">
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
                  className={`${buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "sm",
                  })} flex items-center gap-1.5 rounded-full px-3 py-1`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <Typography type="body-xs" color={isActive ? "default" : "muted"}>
                    {item.label}
                  </Typography>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Chip color="warning" size="sm" variant="soft" className="h-4 px-1 text-[10px]">
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
            variant="outline"
            onClick={props.onOpenCommandPalette}
            className="flex items-center gap-2 rounded-full px-3 py-1 text-xs"
            aria-label="Open Command Palette"
          >
            <Command className="h-3 w-3 text-muted" aria-hidden="true" />
            <Typography type="body-xs" color="muted" className="hidden sm:inline">
              Command
            </Typography>
            <Kbd className="text-[10px]">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>K</Kbd.Content>
            </Kbd>
          </Button>

          <Button
            size="sm"
            variant="outline"
            isIconOnly
            onClick={props.onToggleTheme}
            className="h-8 w-8 rounded-full"
            aria-label={props.theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {props.theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            )}
          </Button>

          {props.availableHandles && props.availableHandles.length > 0 && (
            <Surface variant="secondary" className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
              <UserCheck className="h-3 w-3 text-accent" aria-hidden="true" />
              <Typography type="body-xs" color="muted">As:</Typography>
              <div className="flex items-center gap-1">
                {props.availableHandles.map((h) => (
                  <Button
                    key={h}
                    size="sm"
                    variant={props.userHandle === h ? "primary" : "ghost"}
                    onClick={() => props.onSwitchPersona?.(h)}
                    className="h-6 px-2 text-[11px] font-mono rounded"
                  >
                    @{h}
                  </Button>
                ))}
              </div>
            </Surface>
          )}
        </div>
      </div>
    </header>
  );
}
