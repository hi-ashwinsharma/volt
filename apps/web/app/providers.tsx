"use client";

import { Toast } from "@heroui/react";
import type { ChildrenProps } from "@volt/types";
import { ThemeProvider } from "next-themes";

import { SessionProvider } from "@/components/session/SessionProvider";

export function Providers({ children }: ChildrenProps) {
  return (
    <ThemeProvider disableTransitionOnChange enableSystem attribute="class" defaultTheme="system">
      <SessionProvider>
        {children}
        <Toast.Provider placement="bottom end" />
      </SessionProvider>
    </ThemeProvider>
  );
}
