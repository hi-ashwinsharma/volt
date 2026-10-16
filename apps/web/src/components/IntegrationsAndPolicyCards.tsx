"use client";

import { Button, Chip, Input, Surface, Typography } from "@heroui/react";
import type {
  ApiKeysCardProps,
  GitHubConnectCardProps,
  PolicyAdminConsoleProps,
} from "@volt/types";
import { GitBranch, KeyRound, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

export function GitHubConnectCard(props: GitHubConnectCardProps) {
  return (
    <Surface variant="default" className="rounded-2xl border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted" aria-hidden="true" />
            <Typography type="h3" className="font-semibold tracking-tight text-foreground">
              First-Party GitHub App Integration
            </Typography>
          </div>
          <Typography type="body-sm" color="muted">
            Automatically verifies pull request diffs, merge state, and CI check runs for 1.2× evidence weightage.
          </Typography>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={props.onConnectGitHub}
          isDisabled={props.isLoading}
          className="flex items-center gap-2 rounded-xl px-4 py-2"
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          <Typography type="body-sm" className="font-medium text-primary-foreground">Connect GitHub App</Typography>
        </Button>
      </div>

      {props.installations.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {props.installations.map((inst) => (
            <Surface
              key={inst.id}
              variant="secondary"
              className="flex flex-wrap items-center justify-between rounded-xl border border-border px-4 py-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <Typography type="body-sm" className="font-mono font-semibold">@{inst.accountLogin}</Typography>
                <Chip size="sm" variant="secondary" className="text-[10px]">
                  <Chip.Label>{inst.accountType}</Chip.Label>
                </Chip>
              </div>
              <Typography type="body-xs" color="muted" className="font-mono">
                {inst.repositoriesSnapshot.length} verified repository connected
              </Typography>
            </Surface>
          ))}
        </div>
      )}
    </Surface>
  );
}

export function ApiKeysCard(props: ApiKeysCardProps) {
  const [label, setLabel] = useState("");

  return (
    <Surface variant="default" className="rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-muted" aria-hidden="true" />
        <Typography type="h3" className="font-semibold tracking-tight text-foreground">
          Personal API Keys (CLI volt &amp; Antigravity MCP)
        </Typography>
      </div>
      <Typography type="body-sm" color="muted" className="mt-1">
        Zero-plaintext SHA-256 hashed credentials for terminal and agentic workflows.
      </Typography>

      <div className="mt-4 flex gap-2">
        <Input
          aria-label="Key label"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Key label (e.g., MacBook Pro M4 Max CLI)..."
          variant="secondary"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={async () => {
            if (label.trim()) {
              await props.onCreateKey(label.trim());
              setLabel("");
            }
          }}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <Typography type="body-sm" className="font-medium text-primary-foreground">Generate Key</Typography>
        </Button>
      </div>

      {props.newlyCreatedSecret && (
        <Surface variant="secondary" className="mt-3 flex items-center gap-2 rounded-xl border border-border p-3 font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-success" />
          <Typography type="body-xs">
            Save secret key now: <strong className="select-all text-foreground">{props.newlyCreatedSecret}</strong>
          </Typography>
        </Surface>
      )}

      <div className="mt-4 space-y-2">
        {props.apiKeys.map((k) => (
          <Surface
            key={k.id}
            variant="secondary"
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <Typography type="body-sm" className="font-medium">{k.label}</Typography>
              <Typography type="body-xs" color="muted" className="font-mono">{k.keyPrefix}•••</Typography>
            </div>
            <Button
              size="sm"
              variant="danger-soft"
              onClick={() => props.onRevokeKey(k.id)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <Typography type="body-xs">Revoke</Typography>
            </Button>
          </Surface>
        ))}
      </div>
    </Surface>
  );
}

export function PolicyAdminConsole(props: PolicyAdminConsoleProps) {
  return (
    <Surface variant="default" className="rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted" aria-hidden="true" />
        <Typography type="h3" className="font-semibold tracking-tight text-foreground">
          Policy-Based Access Control (PBAC) Groups
        </Typography>
      </div>
      <Typography type="body-sm" color="muted" className="mt-1">
        Authorization scopes are decoupled from work domains via composable policy groups.
      </Typography>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {props.groups.map((g) => (
          <Surface key={g.id} variant="secondary" className="rounded-xl border border-border p-4 text-xs">
            <div className="flex items-center justify-between">
              <Typography type="body-sm" className="font-semibold">{g.name}</Typography>
              <Typography type="code" className="text-[10px]">{g.slug}</Typography>
            </div>
            <Typography type="body-xs" color="muted" className="mt-1">{g.description}</Typography>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {g.scopes.map((s) => (
                <Chip key={s} size="sm" variant="secondary" className="font-mono text-[10px]">
                  <Chip.Label>{s}</Chip.Label>
                </Chip>
              ))}
            </div>
          </Surface>
        ))}
      </div>
    </Surface>
  );
}
