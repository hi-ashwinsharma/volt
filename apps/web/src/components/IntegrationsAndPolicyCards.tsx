"use client";

import type {
  ApiKeysCardProps,
  GitHubConnectCardProps,
  PolicyAdminConsoleProps,
} from "@volt/types";
import { GitBranch, KeyRound, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

export function GitHubConnectCard(props: GitHubConnectCardProps) {
  return (
    <div className="apple-surface rounded-[20px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold tracking-[-0.018em] text-ink-primary">
              First-Party GitHub App Integration
            </h2>
          </div>
          <p className="text-[12px] text-ink-secondary">
            Automatically verifies pull request diffs, merge state, and CI check runs for 1.2× evidence weightage.
          </p>
        </div>

        <button
          type="button"
          onClick={props.onConnectGitHub}
          disabled={props.isLoading}
          className="apple-btn-primary flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium"
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Connect GitHub App</span>
        </button>
      </div>

      {props.installations.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border-subtle pt-4">
          {props.installations.map((inst) => (
            <div
              key={inst.id}
              className="apple-inset flex flex-wrap items-center justify-between rounded-[12px] px-4 py-3 text-[12px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-status-ok" />
                <span className="font-mono font-semibold text-ink-primary">
                  @{inst.accountLogin}
                </span>
                <span className="rounded-full bg-control px-2 py-0.5 text-[10px] text-ink-secondary">
                  {inst.accountType}
                </span>
              </div>
              <span className="font-mono text-[11px] text-ink-secondary">
                {inst.repositoriesSnapshot.length} verified repository connected
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ApiKeysCard(props: ApiKeysCardProps) {
  const [label, setLabel] = useState("");

  return (
    <div className="apple-surface rounded-[20px] p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
        <h2 className="text-[15px] font-semibold tracking-[-0.018em] text-ink-primary">
          Personal API Keys (CLI volt & Antigravity MCP)
        </h2>
      </div>
      <p className="mt-1 text-[12px] text-ink-secondary">
        Zero-plaintext SHA-256 hashed credentials for terminal and agentic workflows.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Key label (e.g., MacBook Pro M4 Max CLI)..."
          className="apple-inset flex-1 rounded-full px-4 py-2 text-[12px] text-ink-primary placeholder-ink-tertiary focus:outline-none"
        />
        <button
          type="button"
          onClick={async () => {
            if (label.trim()) {
              await props.onCreateKey(label.trim());
              setLabel("");
            }
          }}
          className="apple-btn-primary flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Generate Key</span>
        </button>
      </div>

      {props.newlyCreatedSecret && (
        <div className="apple-inset mt-3 flex items-center gap-2 rounded-[12px] p-3 font-mono text-[12px] text-ink-primary">
          <span className="h-2 w-2 rounded-full bg-status-ok" />
          <span>
            Save secret key now:{" "}
            <strong className="select-all">{props.newlyCreatedSecret}</strong>
          </span>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {props.apiKeys.map((k) => (
          <div
            key={k.id}
            className="apple-inset flex items-center justify-between rounded-[12px] px-4 py-3 text-[12px]"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-ink-primary">{k.label}</span>
              <span className="font-mono text-[11px] text-ink-tertiary">
                {k.keyPrefix}•••
              </span>
            </div>
            <button
              type="button"
              onClick={() => props.onRevokeKey(k.id)}
              className="flex items-center gap-1 text-[11px] font-medium text-status-danger transition-opacity hover:opacity-80"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Revoke</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PolicyAdminConsole(props: PolicyAdminConsoleProps) {
  return (
    <div className="apple-surface rounded-[20px] p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
        <h2 className="text-[15px] font-semibold tracking-[-0.018em] text-ink-primary">
          Policy-Based Access Control (PBAC) Groups
        </h2>
      </div>
      <p className="mt-1 text-[12px] text-ink-secondary">
        Authorization scopes are decoupled from work domains via composable policy groups.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {props.groups.map((g) => (
          <div key={g.id} className="apple-inset rounded-[14px] p-4 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-primary">{g.name}</span>
              <span className="font-mono text-[10px] text-ink-tertiary">
                {g.slug}
              </span>
            </div>
            <p className="mt-1 text-ink-secondary">{g.description}</p>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {g.scopes.map((s) => (
                <span
                  key={s}
                  className="rounded-[6px] bg-control px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
