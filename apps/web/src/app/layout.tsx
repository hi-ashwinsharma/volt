import type { Metadata } from "next";
import { VoltWorkspaceProvider } from "../context/VoltWorkspaceContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "volt — Zero-Friction Impact & Mathematical Weightage Engine",
  description:
    "Replace time sheets with cognitive complexity, business leverage, and verifiable empirical proof.",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <VoltWorkspaceProvider>{children}</VoltWorkspaceProvider>
      </body>
    </html>
  );
}
