# 09 — Cloud-Native Infrastructure, Provisioning & Runbook

**Document ID:** `VOLT-DOC-09`  
**Parent Index:** [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md)

---

## 1. Day-1 Cloud-Native Philosophy

Per **ADR-003 / User Directive**, `volt` connects directly to live cloud-native services from Day 1 (Supabase PostgreSQL 16 + Auth + Storage, Upstash Redis, Google Cloud Tasks, Google Cloud Run, Vertex AI / Gemini 1.5 Flash, GitHub App, and Telegram Bot API).

To make setup effortless, we provide **both**:
1. A structured `.env` configuration where existing credentials can be pasted directly, AND
2. An interactive provisioning & verification utility (`bun run infra:setup` / `volt-admin infra:setup`) that validates every connection, pushes Drizzle database migrations + immutable audit triggers, seeds initial PBAC policy groups, creates the `volt-artifacts` storage bucket, provisions GCP Cloud Tasks queues, and registers the Telegram webhook.

---

## 2. Environment Variables Specification (`.env.example`)

All environment variables are strictly validated at startup via `@volt/config` (`packages/config/src/env.schema.ts`):

```dotenv
# ============================================================================
# 1. CORE SERVER & ENVIRONMENT
# ============================================================================
NODE_ENV="development"
PORT="8080"
API_PUBLIC_URL="http://localhost:8080"
WEB_PUBLIC_URL="http://localhost:3000"
CANONICAL_TIMEZONE="Asia/Kolkata"

# ============================================================================
# 2. SUPABASE (POSTGRESQL 16 + AUTH + ARTIFACT STORAGE)
# ============================================================================
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
SUPABASE_STORAGE_BUCKET="volt-artifacts"

# ============================================================================
# 3. UPSTASH REDIS (SERVERLESS STAGING BUFFER & PBAC CACHE)
# ============================================================================
UPSTASH_REDIS_REST_URL="https://[endpoint].upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX..."

# ============================================================================
# 4. GEMINI 1.5 FLASH (AI JUDGE & MULTIMODAL AUDIO STT)
# ============================================================================
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL_ID="gemini-1.5-flash"

# ============================================================================
# 5. GITHUB APP INTEGRATION ("CONNECT GITHUB" & PR VERIFICATION)
# ============================================================================
GITHUB_APP_ID="123456"
GITHUB_APP_SLUG="volt-impact-engine"
GITHUB_APP_CLIENT_ID="Iv1...."
GITHUB_APP_CLIENT_SECRET="your-github-app-client-secret"
GITHUB_APP_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQ..."
GITHUB_APP_WEBHOOK_SECRET="whsec_..."
GITHUB_STATE_SIGNING_SECRET="32-byte-hex-secret-for-oauth-csrf-state"

# ============================================================================
# 6. GOOGLE CLOUD PLATFORM (CLOUD RUN, CLOUD TASKS & CLOUD SCHEDULER)
# ============================================================================
GCP_PROJECT_ID="your-gcp-project-id"
GCP_LOCATION="asia-south1"
GCP_CLOUD_TASKS_QUEUE="volt-evaluation-queue"
GCP_SERVICE_ACCOUNT_EMAIL="volt-worker@your-gcp-project-id.iam.gserviceaccount.com"
INTERNAL_TASK_SHARED_SECRET="local-dev-and-fallback-hmac-secret"

# ============================================================================
# 7. TELEGRAM BOT (VOICE NOTES & 7:30 PM IST EVENING SWEEPER)
# ============================================================================
TELEGRAM_BOT_TOKEN="123456789:AAF..."
TELEGRAM_WEBHOOK_SECRET="volt_tg_secret_..."
```

---

## 3. Automated Infrastructure Provisioning (`bun run infra:setup`)

The provisioning script (`apps/cli/src/commands/infra-setup.ts`) executes six idempotent steps:

1. **Connectivity & Env Audit:**
   * Verifies `DATABASE_URL` (Supabase Postgres), `UPSTASH_REDIS_REST_URL`, and `GEMINI_API_KEY`.
2. **Database Schema & Trigger Deployment:**
   * Applies Drizzle SQL migrations (`packages/db/migrations`) and installs the `trg_score_audits_immutable` append-only trigger.
3. **PBAC Seed & Bootstrap Admin:**
   * Upserts the 4 canonical `policy_groups` (`core-contributor`, `peer-reviewer`, `pool-manager`, `policy-admin`).
   * Creates or updates the initial founder/admin user (e.g., `@ashwin`), assigns `core-contributor` + `policy-admin` groups, creates an active initial `billing_cycle`, and generates an initial `volt_sk_...` CLI/MCP API key written directly to `~/.volt/config.json`.
4. **Supabase Storage Bucket Setup:**
   * Ensures the private bucket `volt-artifacts` exists with a 25 MB file size limit and allowed MIME types.
5. **GCP Cloud Tasks & Cloud Scheduler Provisioning (via `gcloud` CLI if authenticated):**
   * Creates the Cloud Tasks queue `volt-evaluation-queue` in `GCP_LOCATION` with retry backoff (`maxAttempts: 5`, `minBackoff: 10s`).
   * Configures the Cloud Scheduler job `volt-evening-sweeper` (`30 19 * * *`, timezone `Asia/Kolkata`) targeting `POST /v1/internal/tasks/evening-sweep`.
6. **Telegram Webhook Registration:**
   * Calls `https://api.telegram.org/bot<TOKEN>/setWebhook` pointing to `${API_PUBLIC_URL}/v1/webhooks/telegram` with `secret_token = TELEGRAM_WEBHOOK_SECRET`.

---

## 4. Production Deployment Architecture

* **`apps/api` (Google Cloud Run):**
  * Multi-stage `Dockerfile` using `oven/bun:1-alpine`.
  * Configured with `--min-instances=0 --max-instances=10 --cpu=1 --memory=512Mi --concurrency=80`.
* **`apps/web` (Cloud Run or Vercel):**
  * Next.js 15 standalone build connected to `API_PUBLIC_URL` and Supabase Auth.
* **`apps/cli` & `apps/mcp`:**
  * Compiled to native macOS ARM64 (`darwin-arm64`) binaries via `bun build --compile` and linked into `/usr/local/bin/volt` and `/usr/local/bin/volt-mcp`.
