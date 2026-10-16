import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface-solid)",
        elevated: "var(--bg-elevated)",
        control: "var(--bg-control)",
        "control-hover": "var(--bg-control-hover)",
        "segmented-active": "var(--bg-segmented-active)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        "ink-primary": "var(--text-primary)",
        "ink-secondary": "var(--text-secondary)",
        "ink-tertiary": "var(--text-tertiary)",
        "status-ok": "var(--status-ok)",
        "status-warn": "var(--status-warn)",
        "status-danger": "var(--status-danger)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
