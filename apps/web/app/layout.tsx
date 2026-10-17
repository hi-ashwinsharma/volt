import "@/styles/globals.css";
import type { ChildrenProps } from "@volt/types";
import clsx from "clsx";
import type { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { fontMono, fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: { default: "volt", template: "%s | volt" },
  description: "Output-based contribution ledger and impact scoring.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: ChildrenProps) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={clsx(
          "min-h-dvh bg-background font-sans text-foreground antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
