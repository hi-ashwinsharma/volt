"use client";

import { Bars } from "@gravity-ui/icons";
import { Button, Drawer, Separator } from "@heroui/react";
import type { ChildrenProps } from "@volt/types";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Brand } from "./Brand";
import { NavList } from "./NavList";
import { ThemeMenu } from "./ThemeMenu";
import { UserMenu } from "./UserMenu";

import { useNavCounts } from "@/hooks/useNavCounts";

export function AppShell({ children }: ChildrenProps) {
  const pathname = usePathname();
  const counts = useNavCounts();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-separator bg-surface lg:flex">
        <div className="flex h-14 items-center justify-between pl-6 pr-3">
          <Brand />
          <ThemeMenu />
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavList counts={counts} pathname={pathname} />
        </div>
        <Separator />
        <div className="p-2">
          <UserMenu />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-separator bg-surface px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              aria-label="Open navigation"
              size="sm"
              variant="ghost"
              onPress={() => setDrawerOpen(true)}
            >
              <Bars className="size-4" />
            </Button>
            <Brand />
          </div>
          <ThemeMenu />
        </header>

        <Drawer.Backdrop isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="flex flex-col">
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Navigation</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="flex-1">
                <NavList
                  counts={counts}
                  pathname={pathname}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </Drawer.Body>
              <Drawer.Footer>
                <UserMenu />
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
