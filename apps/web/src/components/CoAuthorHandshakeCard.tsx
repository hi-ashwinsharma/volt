"use client";

import { Button, Card, Chip, Input } from "@heroui/react";
import type { CoAuthorHandshakeCardProps } from "@volt/types";
import { Check, X } from "lucide-react";
import { useState } from "react";

export function CoAuthorHandshakeCard(props: CoAuthorHandshakeCardProps) {
  const [note, setNote] = useState("");
  const { commit } = props;

  return (
    <Card className="apple-surface rounded-[20px] p-5 sm:p-6">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-status-warn animate-pulse" />
          <Chip size="sm" variant="secondary" className="font-mono text-ink-secondary">
            <Chip.Label>[{commit.shortHash}]</Chip.Label>
          </Chip>
          <span className="font-medium text-ink-primary">
            Co-Author Verification requested by <strong className="font-mono">@{commit.authorHandle}</strong>
          </span>
        </div>
        <Chip color="warning" size="sm" variant="soft" className="font-mono text-[11px]">
          <Chip.Label>24h handshake window</Chip.Label>
        </Chip>
      </div>

      <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-ink-primary">{commit.summary}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Co-author contribution note"
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe your 1-line contribution to unlock AI Judge grading..."
          className="apple-inset flex-1 rounded-full px-4 py-2 text-[12px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "verify", note)}
          className="apple-btn-primary flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Verify & Unlock</span>
        </Button>
        <Button
          size="sm"
          variant="danger-soft"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "reject")}
          className="flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reject</span>
        </Button>
      </div>
    </Card>
  );
}
