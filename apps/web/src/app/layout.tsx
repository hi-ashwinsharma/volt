import type { Metadata } from "next";
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090B] text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
