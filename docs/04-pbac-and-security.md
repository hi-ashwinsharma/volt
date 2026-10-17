# 04 — Policy-Based Access Control (PBAC) & Security Model

**Document ID:** `VOLT-DOC-04`  
**Parent Index:** [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md)

---

## 1. Philosophy: Capabilities Over Fixed Roles

In a high-velocity startup environment, team members operate across Engineering, AI Research, Operations, Finance, and Pitching. Hardcoding a single `role` column (`engineering` vs. `admin`) creates rigid bottlenecks.

`volt` implements **Policy-Based Access Control (PBAC)** via `@volt/policy`:
1. **Work Categorization (`domain`) is Decoupled from Authorization:** Every commit specifies its `domain` (`engineering`, `research`, `ops`, `finance`, `pitch`) for analytics, while each user has a `default_domain` purely as a UI/CLI convenience default.
2. **Flat Permission Scopes:** Authorization is governed strictly by granular permission scope strings (e.g., `commit:review_peer`).
3. **Reusable Policy Groups + Direct Scopes:** Users inherit scopes from any number of assigned `policy_groups` (e.g., `Peer Reviewers`, `Pool Managers`) plus optional per-user `direct_scopes`.

---

## 2. Canonical Permission Scopes Catalog

All scopes are defined as a strict TypeScript union `PermissionScope` in `packages/types/src/pbac.types.ts`:

| Scope String | Category | Capability Granted |
| :--- | :--- | :--- |
| `stage:write` | Capture | Stage micro-logs via CLI, MCP, Mac Overlay, Telegram, or Web UI (`POST /v1/stage`). |
| `commit:create` | Capture | Bundle staged logs into a scored `output` or `insight` commit (`POST /v1/commits`). |
| `commit:verify_coauthor` | Collaboration | Submit a 1-line `contribution_note` to verify or reject a co-author tag (`POST /v1/commits/:hash/verify`). |
| `feed:read` | Ledger | View the Live Impact Stream, commit details, and score audit history (`GET /v1/feed`). |
| `commit:review_peer` | Governance | Review `pending_peer` commits ($>15.0\text{ pts}$ or flagged), adjust consensus modifier $V \in [0.70, 1.30]$, or override $C, I, E$ with mandatory audit reasoning. |
| `commit:flag_review` | Governance | Manually flag any approved commit to enter the `pending_peer` queue for human audit. |
| `github:connect` | Integrations | Install or link the `volt` GitHub App to a GitHub user or organization account. |
| `cycle:read` | Compensation | View Dynamic Bonus Pool Share % and cycle analytics matrix. |
| `cycle:manage` | Compensation | Create/close billing cycles (`billing_cycles`), configure $\text{PoolBudget}_T$, and export CSV/PDF compensation ledgers. |
| `user:manage` | Administration | Invite team members, activate/deactivate accounts, and manage user handles. |
| `policy:admin` | Administration | Create/edit `policy_groups`, assign policy groups to users, and grant/revoke `direct_scopes`. |

---

## 3. Default Seeded Policy Groups

When `volt` initializes its database, four foundational policy groups are seeded in `policy_groups`:

| Group Slug | Group Name | Included Scopes |
| :--- | :--- | :--- |
| `core-contributor` | **Core Contributor** | `stage:write`, `commit:create`, `commit:verify_coauthor`, `feed:read`, `github:connect`, `cycle:read` |
| `peer-reviewer` | **Peer Reviewer** | `commit:review_peer`, `commit:flag_review` |
| `pool-manager` | **Pool & Cycle Manager** | `cycle:read`, `cycle:manage` |
| `policy-admin` | **System & Policy Administrator** | `user:manage`, `policy:admin`, `cycle:manage`, `commit:review_peer`, `commit:flag_review` |

*(Administrators with `policy:admin` can create custom policy groups in the Web UI at any time).*

---

## 4. Effective Policy Resolution & Conflict-of-Interest Guards

### 4.1 Effective Scopes Computation
When a request is authenticated, the Fastify auth plugin resolves the user's `UserPolicyContext`:

$$\text{EffectiveScopes}(u) = u.\text{direct\_scopes} \cup \bigcup_{g \in u.\text{policy\_groups}} g.\text{scopes}$$

This resolved set is cached in Upstash Redis under key `volt:pbac:user:<user_id>` with a 5-minute TTL and immediately invalidated whenever a user's policy groups or direct scopes are updated.

### 4.2 Conflict-of-Interest Rule for Peer Review
Even if a user holds the `commit:review_peer` scope, `@volt/policy` enforces a strict **Conflict-of-Interest Invariant** inside `canReviewCommit(actor, commit)`:

```typescript
// Conceptual logic in packages/policy/src/guards.ts
export function canReviewCommit(
  actor: UserPolicyContext,
  commit: CommitReviewTarget
): PolicyEvaluationResult {
  if (!actor.scopes.includes("commit:review_peer")) {
    return { allowed: false, reason: "MISSING_SCOPE_COMMIT_REVIEW_PEER" };
  }
  if (commit.authorId === actor.userId) {
    return { allowed: false, reason: "CONFLICT_OF_INTEREST_PRIMARY_AUTHOR" };
  }
  if (commit.coAuthorUserIds.includes(actor.userId)) {
    return { allowed: false, reason: "CONFLICT_OF_INTEREST_COAUTHOR" };
  }
  return { allowed: true };
}
```

---

## 5. Dual Authentication Architecture

### 5.1 Web Command Center Authentication (Firebase Auth / Identity Platform)
* Users sign in to the Next.js Web UI with **Continue with Google** or an **email sign-in link**, both powered by Firebase Authentication (Google Cloud Identity Platform). Firebase only proves identity; volt keeps its own `users` table and PBAC scopes.
* The Web UI attaches the current Firebase ID token (`Authorization: Bearer <firebase_id_token>`) to API requests. The Firebase SDK refreshes it before its one-hour expiry; `onIdTokenChanged` keeps the session in sync.
* Fastify verifies the token with `firebase-admin` `verifyIdToken` against `FIREBASE_PROJECT_ID` (RS256 signature from Google's public keys, issuer, audience, expiry). Tokens without a verified email are rejected. No shared secret exists, so forged or unsigned JWTs cannot pass.
* The Firebase `uid` maps to `users.auth_provider_uid` (provider-neutral, `TEXT`). On first sign-in a pre-provisioned row with the same verified email is linked once; an email already linked to a different uid is refused. Otherwise a new user joins the `core-contributor` group.
* **Dev header:** `x-volt-user-id: <uuid>` impersonation is honoured only when `NODE_ENV=development` and ignored everywhere else.

### 5.2 CLI (`volt`), MCP (`volt-mcp`), and Mac Overlay Authentication (`volt_sk_*`)
* Users generate Personal API Keys in the Web UI (**Settings $\rightarrow$ API Keys**) or via `volt login` (browser device-code / callback handoff).
* **Key Format:** `volt_sk_<32_byte_base62_random>`
* **Zero Plaintext Storage:** The raw key is shown once upon creation and stored locally in `~/.volt/config.json` (`0600` file permissions). The database stores only `key_prefix` (first 12 chars for identification) and `SHA-256(raw_key)` in `user_api_keys.key_hash`.
* On every CLI/MCP request, Fastify hashes the bearer token with SHA-256, looks up the active `user_api_keys` row (cached in Upstash Redis), updates `last_used_at` asynchronously, and resolves the user's `UserPolicyContext`.

### 5.3 Webhook & Internal Worker Authentication
* **Telegram Bot Webhook (`POST /v1/webhooks/telegram`):** Verified using the `X-Telegram-Bot-Api-Secret-Token` header matched via constant-time comparison (`crypto.timingSafeEqual`) against `TELEGRAM_WEBHOOK_SECRET`.
* **GitHub App Webhook (`POST /v1/webhooks/github`):** Verified using HMAC-SHA256 (`X-Hub-Signature-256`) against `GITHUB_APP_WEBHOOK_SECRET`.
* **Google Cloud Tasks & Cloud Scheduler (`POST /v1/internal/tasks/*`):** Verified via Google OIDC ID token validation matching the dedicated Cloud Run service account email.
