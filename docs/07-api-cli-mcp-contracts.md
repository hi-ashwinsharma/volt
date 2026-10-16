# 07 — REST API, CLI (`volt`) & MCP (`volt-mcp`) Contracts

**Document ID:** `VOLT-DOC-07`  
**Parent Index:** [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md)

---

## 1. Centralized Route Constants (`@volt/types`)

Per **Rule #6 (Strict Prohibition of Hardcoded Paths)**, all backend and frontend paths are defined in `packages/types/src/routes.constants.ts` and imported everywhere across `apps/api`, `apps/cli`, `apps/mcp`, `apps/web`, `apps/mac-overlay`, and test suites.

```typescript
// packages/types/src/routes.constants.ts
export const ApiRoutes = {
  health: "/v1/health",
  auth: {
    me: "/v1/auth/me",
    apiKeys: "/v1/auth/api-keys",
    revokeApiKey: "/v1/auth/api-keys/:id",
    cliDeviceStart: "/v1/auth/cli/start",
    cliDevicePoll: "/v1/auth/cli/poll",
  },
  stage: {
    list: "/v1/stage",
    create: "/v1/stage",
    batchSync: "/v1/stage/batch",
    delete: "/v1/stage/:id",
  },
  commits: {
    list: "/v1/commits",
    create: "/v1/commits",
    detail: "/v1/commits/:shortHash",
    verifyCoAuthor: "/v1/commits/:shortHash/verify",
    peerReview: "/v1/commits/:shortHash/review",
    flagForReview: "/v1/commits/:shortHash/flag",
  },
  artifacts: {
    createUploadUrl: "/v1/artifacts/upload-url",
    confirmUpload: "/v1/artifacts/:id/confirm",
  },
  integrations: {
    githubStatus: "/v1/integrations/github/status",
    githubInstallUrl: "/v1/integrations/github/install-url",
    githubCallback: "/v1/integrations/github/callback",
  },
  cycles: {
    list: "/v1/cycles",
    activePoolShare: "/v1/cycles/active/pool-share",
    detailPoolShare: "/v1/cycles/:id/pool-share",
    create: "/v1/cycles",
    update: "/v1/cycles/:id",
    exportCsv: "/v1/cycles/:id/export",
  },
  policies: {
    groups: "/v1/policies/groups",
    assignGroup: "/v1/policies/users/:userId/groups",
    updateDirectScopes: "/v1/policies/users/:userId/scopes",
  },
  webhooks: {
    telegram: "/v1/webhooks/telegram",
    github: "/v1/webhooks/github",
  },
  internalTasks: {
    evaluateCommit: "/v1/internal/tasks/evaluate-commit",
    resolveCoAuthorTimeout: "/v1/internal/tasks/resolve-coauthor-timeout",
    processTelegramVoice: "/v1/internal/tasks/process-telegram-voice",
    eveningSweep: "/v1/internal/tasks/evening-sweep",
  },
} as const;

export const AppRoutes = {
  home: "/",
  login: "/login",
  authCliVerify: "/auth/cli",
  peerReviews: "/reviews",
  poolMatrix: "/pool",
  commitDetail: "/commits/:shortHash",
  settingsIntegrations: "/settings/integrations",
  settingsApiKeys: "/settings/api-keys",
  settingsPolicies: "/settings/policies",
  settingsCycles: "/settings/cycles",
} as const;
```

---

## 2. Core REST API Endpoint Specifications

### 2.1 Stage Micro-Logs (`POST /v1/stage` & `POST /v1/stage/batch`)
* **Required Scope:** `stage:write`
* **Single Request Body (`POST /v1/stage`):**
  ```json
  {
    "clientLogId": "019295f4-8c1a-7000-8000-000000000001",
    "rawText": "benchmarked 4-bit AWQ quantization latency in Colab",
    "source": "cli",
    "artifactId": null,
    "githubPrUrl": null
  }
  ```
* **Batch Sync Request Body (`POST /v1/stage/batch` — used by CLI write-ahead daemon):**
  ```json
  {
    "logs": [
      {
        "clientLogId": "019295f4-8c1a-7000-8000-000000000001",
        "rawText": "benchmarked 4-bit AWQ quantization latency in Colab",
        "source": "cli",
        "createdAt": "2026-10-16T07:15:00.000Z"
      }
    ]
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "stagedCount": 3,
    "syncedClientLogIds": ["019295f4-8c1a-7000-8000-000000000001"]
  }
  ```

### 2.2 Create Commit (`POST /v1/commits`)
* **Required Scope:** `commit:create`
* **Request Body:**
  ```json
  {
    "type": "insight",
    "domain": "research",
    "summary": "Proved 4-bit AWQ quantization degrades recall@10 by 18.4%; retaining FP16 baseline",
    "githubPrUrl": null,
    "uploadedArtifactId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "coAuthorHandles": ["rohan"],
    "workDate": "2026-10-16"
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "id": "8f9d2a10-3b44-4d12-9a11-7e55b2319001",
    "shortHash": "a9f3c12b",
    "status": "pending_coauthor",
    "type": "insight",
    "domain": "research",
    "summary": "Proved 4-bit AWQ quantization degrades recall@10 by 18.4%; retaining FP16 baseline",
    "artifactType": "file_upload",
    "bundledLogsCount": 3,
    "coAuthors": [
      { "handle": "rohan", "status": "pending" }
    ],
    "coauthorDeadlineAt": "2026-10-17T08:06:00.000Z"
  }
  ```

### 2.3 Verify or Reject Co-Author Handshake (`POST /v1/commits/:shortHash/verify`)
* **Required Scope:** `commit:verify_coauthor`
* **Request Body:**
  ```json
  {
    "action": "verify",
    "contributionNote": "Built the recall@10 evaluation harness and synthetic query dataset"
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "shortHash": "a9f3c12b",
    "coAuthorStatus": "verified",
    "aiValidated": true,
    "commitStatus": "pending_ai"
  }
  ```

### 2.4 Peer Review High-Stakes Commit (`POST /v1/commits/:shortHash/review`)
* **Required Scope:** `commit:review_peer` (plus Conflict-of-Interest guard: reviewer cannot be author or co-author)
* **Request Body:**
  ```json
  {
    "decision": "approve",
    "vConsensus": 1.15,
    "overrideComplexity": null,
    "overrideImpact": null,
    "overrideEvidence": null,
    "reasoning": "Verified Colab benchmark methodology and reproduction cells; high leverage saving 2 weeks of wasted quantization work."
  }
  ```

---

## 3. CLI Specification (`volt`)

Compiled into a standalone native binary via `bun build --compile`:

```bash
# 0. Authenticate CLI with Volt account (writes ~/.volt/config.json)
volt login

# 1. Stage a micro-log (<5ms write to ~/.volt/queue.sqlite + detached background flush)
volt add "implemented Redis sliding window rate limiter"

# 2. Check current staged logs, pending co-author handshakes, and cycle points
volt status

# 3. Commit with a GitHub PR (verified via Installed GitHub App)
#    (If --pr is omitted inside a Git repo, volt auto-detects the current branch's open PR URL)
volt commit \
  --type output \
  --domain engineering \
  --summary "Shipped distributed sliding-window rate limiter with Upstash Redis" \
  --pr "https://github.com/coldcrunch/volt/pull/12" \
  --co @rohan

# 4. Commit with an uploaded file artifact (Colab .ipynb, PDF deck, Excel model, screenshot)
volt commit \
  --type insight \
  --domain research \
  --summary "Proved 4-bit quantization degrades recall by 18%; sticking to FP16" \
  --file ./experiments/quantization_benchmark.ipynb \
  --co @rohan

# 5. Verify or reject a teammate's co-author tag
volt verify a9f3c12b -m "Wrote the evaluation harness and recall metrics"
volt verify a9f3c12b --reject
```

---

## 4. MCP Server Specification (`volt-mcp`)

Built on `@modelcontextprotocol/sdk` (stdio transport) so **Antigravity** and **Claude Desktop** can log and commit engineering/research work autonomously:

| Tool Name | Input Schema | Behavior |
| :--- | :--- | :--- |
| `volt_stage_log` | `{ text: string, github_pr_url?: string, file_path?: string }` | Writes to local write-ahead queue and flushes to `/v1/stage`. Used automatically when an AI coding agent completes a sub-task or experiment. |
| `volt_commit_work` | `{ type: "output" \| "insight", domain?: WorkDomain, summary: string, github_pr_url?: string, file_path?: string, co_authors?: string[] }` | Flushes pending staged logs, auto-detects current Git repo PR URL (or uploads `file_path` if provided), and creates the commit via `/v1/commits`. |
| `volt_get_status` | `{}` | Returns current staged logs, pending co-author handshakes awaiting verification, recent graded commits, and current cycle Pool Share %. |
| `volt_verify_coauthor` | `{ short_hash: string, action: "verify" \| "reject", contribution_note?: string }` | Allows the user to verify pending co-author handshakes directly from their AI agent chat. |
