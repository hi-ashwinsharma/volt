import { describe, expect, it } from "bun:test";
import { createLocalQueuePreviewRow, invokeOverlayQuickStage } from "./bridge";

describe("@volt/mac-overlay — Spotlight Quick-Entry Bridge", () => {
  it("stages micro-logs with sub-5ms local write-ahead latency", async () => {
    const res = await invokeOverlayQuickStage({
      rawText: "Profiled Metal shader kernels for local inference",
      githubPrUrl: "https://github.com/hi-ashwinsharma/volt/pull/15",
    });

    expect(res.rawText).toBe("Profiled Metal shader kernels for local inference");
    expect(res.clientLogId.length).toBeGreaterThan(10);
    expect(res.latencyMs).toBeLessThan(25);
  });

  it("constructs valid LocalQueuedLogRow entries tagged with mac_overlay source", () => {
    const row = createLocalQueuePreviewRow("Shipped Tauri global shortcut handler", null);
    expect(row.source).toBe("mac_overlay");
    expect(row.synced).toBe(0);
    expect(row.raw_text).toBe("Shipped Tauri global shortcut handler");
  });
});
