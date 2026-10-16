"use client";

import type { CoAuthorHandshakeCardProps } from "@volt/types";
import { Check, X } from "lucide-react";
import { useState } from "react";

export function CoAuthorHandshakeCard(props: CoAuthorHandshakeCardProps) {
  const [note, setNote] = useState("");
  const { commit } = props;

  return (
    <div className="apple-surface rounded-[20px] p-5 sm:p-6">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-status-warn animate-pulse" />
          <span className="font-mono text-ink-secondary">[{commit.shortHash}]</span>
          <span className="font-medium text-ink-primary">
            Co-Author Verification requested by <strong className="font-mono">@{commit.authorHandle}</strong>
          </span>
        </div>
        <span className="font-mono text-[11px] text-accent-amber bg-accent-amber-bg px-2 py-0.5 rounded-full">
          24h handshake window
        </span>
      </div>
      <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-ink-primary">{commit.summary}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe your 1-line contribution to unlock AI Judge grading..."
          className="apple-inset flex-1 rounded-full px-4 py-2 text-[12px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "verify", note)}
          className="apple-btn-primary flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Verify & Unlock</span>
        </button>
        <button
          type="button"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "reject")}
          className="apple-pill flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium text-status-danger"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
