"use client";

import { Button, Card, Chip, Input, Typography } from "@heroui/react";
import type { CoAuthorHandshakeCardProps } from "@volt/types";
import { Check, X } from "lucide-react";
import { useState } from "react";

export function CoAuthorHandshakeCard(props: CoAuthorHandshakeCardProps) {
  const [note, setNote] = useState("");
  const { commit } = props;

  return (
    <Card variant="default" className="rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
          <Chip size="sm" variant="secondary" className="font-mono">
            <Chip.Label>[{commit.shortHash}]</Chip.Label>
          </Chip>
          <Typography type="body-sm" className="font-medium">
            Co-Author Verification requested by <strong className="font-mono">@{commit.authorHandle}</strong>
          </Typography>
        </div>
        <Chip color="warning" size="sm" variant="soft" className="font-mono text-[11px]">
          <Chip.Label>24h handshake window</Chip.Label>
        </Chip>
      </div>

      <Typography type="body-sm" className="mt-2.5 font-medium leading-relaxed">
        {commit.summary}
      </Typography>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Co-author contribution note"
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe your 1-line contribution to unlock AI Judge grading..."
          variant="secondary"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "verify", note)}
          className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <Typography type="body-sm" className="font-medium text-primary-foreground">Verify &amp; Unlock</Typography>
        </Button>
        <Button
          size="sm"
          variant="danger-soft"
          onClick={() => props.onVerifyHandshake(commit.shortHash, "reject")}
          className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <Typography type="body-sm">Reject</Typography>
        </Button>
      </div>
    </Card>
  );
}
