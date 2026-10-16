"use client";

import type {
  ApiKeysCardProps,
  GitHubConnectCardProps,
  PolicyAdminConsoleProps,
} from "@volt/types";
import {
  CheckCircle2,
  GitBranch,
  KeyRound,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export function GitHubConnectCard(props: GitHubConnectCardProps) {
  return (
    <div className="volt-glass rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-zinc-100">
              First-Party GitHub App Integration (E = 1.0x / 1.2x Verification)
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Connect your GitHub account or Organization to automatically inspect PR diffs, merge status, and CI check runs.
          </p>
        </div>

        <button
          type="button"
          onClick={props.onConnectGitHub}
          disabled={props.isLoading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-400"
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Connect GitHub App</span>
        </button>
      </div>

      {props.installations.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/[0.07] pt-4">
          {props.installations.map((inst) => (
            <div
              key={inst.id}
              className="flex flex-wrap items-center justify-between rounded-xl bg-black/40 px-4 py-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span className="font-mono font-semibold text-zinc-100">
                  @{inst.accountLogin}
                </span>
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">
                  {inst.accountType}
                </span>
              </div>
              <span className="font-mono text-zinc-400">
                {inst.repositoriesSnapshot.length} verified repositories connected
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
    <div className="volt-glass rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-zinc-100">
          Personal API Keys (CLI volt & Antigravity volt-mcp)
        </h2>
      </div>
      <p className="mt-1 text-xs text-zinc-400">
        Keys use SHA-256 zero-plaintext storage. Copy your secret key immediately upon generation.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Key label (e.g., MacBook Pro M4 Max CLI)..."
          className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={async () => {
            if (label.trim()) {
              await props.onCreateKey(label.trim());
              setLabel("");
            }
          }}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Generate Key</span>
        </button>
      </div>

      {props.newlyCreatedSecret && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-300">
          New Secret Key (save now in ~/.volt/config.json):{" "}
          <strong>{props.newlyCreatedSecret}</strong>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {props.apiKeys.map((k) => (
          <div
            key={k.id}
            className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-2.5 text-xs"
          >
            <div>
              <span className="font-medium text-zinc-200">{k.label}</span>
              <span className="ml-3 font-mono text-zinc-400">
                {k.keyPrefix}...
              </span>
            </div>
            <button
              type="button"
              onClick={() => props.onRevokeKey(k.id)}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
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
    <div className="volt-glass rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-violet-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-zinc-100">
          PBAC Policy Groups & Flat Permission Scope Console
        </h2>
      </div>
      <p className="mt-1 text-xs text-zinc-400">
        Authorization is decoupled from work domains via composable Policy Groups.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {props.groups.map((g) => (
          <div
            key={g.id}
            className="rounded-xl border border-white/[0.07] bg-black/40 p-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-100">{g.name}</span>
              <span className="font-mono text-[10px] text-emerald-400">
                {g.slug}
              </span>
            </div>
            <p className="mt-1 text-zinc-400">{g.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {g.scopes.map((s) => (
                <span
                  key={s}
                  className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
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
