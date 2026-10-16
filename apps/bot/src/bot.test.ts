import { describe, expect, it } from "bun:test";
import { parseTelegramUpdate } from "./parser";

describe("@volt/bot — Telegram Zero-Friction Command & Voice Parser", () => {
  it("parses plain text messages into stage_text actions", () => {
    const res = parseTelegramUpdate({
      update_id: 1001,
      message: {
        message_id: 1,
        from: { id: 99, username: "ashwin" },
        chat: { id: 99, type: "private" },
        date: 1760600000,
        text: "Benchmarked 4-bit AWQ quantization on L4 GPU",
      },
    });
    expect(res).toEqual({
      kind: "stage_text",
      rawText: "Benchmarked 4-bit AWQ quantization on L4 GPU",
    });
  });

  it("parses /insight commits with domain and @co-author handles", () => {
    const res = parseTelegramUpdate({
      update_id: 1002,
      message: {
        message_id: 2,
        from: { id: 99, username: "ashwin" },
        chat: { id: 99, type: "private" },
        date: 1760600010,
        text: "/insight research Disproved 4-bit quantization hypothesis @rohan @priya",
      },
    });
    expect(res).toEqual({
      kind: "commit",
      type: "insight",
      domain: "research",
      summary: "Disproved 4-bit quantization hypothesis",
      coAuthorHandles: ["rohan", "priya"],
    });
  });

  it("parses /verify handshake replies with mandatory 1-line contribution note", () => {
    const res = parseTelegramUpdate({
      update_id: 1003,
      message: {
        message_id: 3,
        from: { id: 100, username: "rohan" },
        chat: { id: 100, type: "private" },
        date: 1760600020,
        text: "/verify a9f3c12b Built the Colab dataset loader and evaluation harness",
      },
    });
    expect(res).toEqual({
      kind: "verify_coauthor",
      shortHash: "a9f3c12b",
      decision: "verify",
      contributionNote: "Built the Colab dataset loader and evaluation harness",
    });
  });

  it("routes .ogg voice notes to native audio STT pipeline", () => {
    const res = parseTelegramUpdate({
      update_id: 1004,
      message: {
        message_id: 4,
        from: { id: 99, username: "ashwin" },
        chat: { id: 99, type: "private" },
        date: 1760600030,
        voice: {
          file_id: "AwACAgIAAxkBAAMZa",
          file_unique_id: "AgAD123",
          duration: 14,
          mime_type: "audio/ogg",
        },
      },
    });
    expect(res).toEqual({
      kind: "voice_note",
      fileId: "AwACAgIAAxkBAAMZa",
      durationSec: 14,
    });
  });
});
