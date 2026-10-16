# `volt` — Engineering Documentation Index & System Reference

**System Name:** `volt` — Zero-Friction Impact & Weightage Engine  
**Replaces:** `tracker.hi-ashwin.xyz`  
**Status:** Production Specification & Active Engineering Blueprint  
**Target Architecture:** Cloud-Native Serverless (Google Cloud Run, Cloud Tasks, Cloud Scheduler, Supabase PostgreSQL 16 + Storage, Upstash Redis, Gemini 1.5 Flash, Next.js 15, Bun CLI/MCP, Tauri v2 Mac Overlay)

---

## 1. Purpose of This Documentation Suite

This directory (`docs/`) serves as the single source of truth for the design, mathematical modeling, database schema, security/authorization model, state machines, API contracts, and phased execution roadmap of `volt`. Every architectural decision agreed upon during system design is codified here before code is written.

---

## 2. Documentation Map

| Document | Title | Scope & Contents |
| :--- | :--- | :--- |
| [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md) | **Documentation Index & Architecture Decisions** | Master table of contents, core engineering invariants, and Architecture Decision Records (ADRs). |
| [01-vision-and-math-engine.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/01-vision-and-math-engine.md) | **System Vision & Mathematical Weightage Engine** | Core philosophy, the $W_c$ formula, $C/I/E/V/D$ rubrics, 1–3 author duplication vs. $4+$ group split math, and dynamic bonus pool share formulas. |
| [02-system-architecture.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/02-system-architecture.md) | **System Architecture & Monorepo Topology** | C4-style architecture diagrams, `<50ms` local SQLite write-ahead queue (`~/.volt/`), Cloud Run + Cloud Tasks + Upstash Redis data flow, and strict modular monorepo layout. |
| [03-database-schema.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/03-database-schema.md) | **Database Schema, ERD & Drizzle ORM Specification** | Complete PostgreSQL 16 DDL, Entity-Relationship Diagram (ERD), append-only `score_audits` ledger triggers, and Drizzle ORM schema conventions. |
| [04-pbac-and-security.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/04-pbac-and-security.md) | **Policy-Based Access Control (PBAC) & Security Model** | Flat permission scopes (`commit:review_peer`, `cycle:manage`, `policy:admin`, etc.), reusable Policy Groups, conflict-of-interest guards, dual authentication (Supabase Auth + `volt_sk_...` API keys), and webhook security. |
| [05-pipeline-and-state-machines.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/05-pipeline-and-state-machines.md) | **Commit Lifecycle, Co-Author Handshake & AI Judge Pipeline** | Sequential state machine (`pending_coauthor` $\rightarrow$ `pending_ai` $\rightarrow$ `pending_peer` / `approved`), 24h timeout resolution, Gemini 1.5 Flash structured grading, and 7:30 PM IST Telegram Sweeper. |
| [06-github-app-and-artifacts.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/06-github-app-and-artifacts.md) | **GitHub App Integration & Artifact Verification Pipeline** | Strict two-path proof model: "Connect GitHub" OAuth/App installation for PR/commit verification vs. direct artifact file uploads (`.ipynb`, PDFs, screenshots, exports) to Supabase Storage / GCS. |
| [07-api-cli-mcp-contracts.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/07-api-cli-mcp-contracts.md) | **REST API, CLI (`volt`) & MCP (`volt-mcp`) Contracts** | OpenAPI-grade Fastify endpoint contracts, centralized route constants, CLI commands and local daemon sync protocol, and MCP tool schemas. |
| [08-ui-ux-design-system.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/08-ui-ux-design-system.md) | **Apple-Esque Web Command Center & Mac Overlay Spec** | macOS Sequoia / Linear dark-first design tokens, zero-emoji native icon policy, `Cmd+K` command palette, Peer Review slider UI, "Connect GitHub" UX, and Tauri v2 `Cmd+Shift+L` overlay. |
| [09-infrastructure-and-runbook.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/09-infrastructure-and-runbook.md) | **Cloud-Native Infrastructure, Provisioning & Runbook** | Day-1 live cloud setup (Supabase, Upstash Redis, GCP Cloud Run/Tasks/Scheduler, GitHub App, Telegram Bot), environment variables, and `volt-admin infra:setup` automation. |
| [10-engineering-roadmap.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/10-engineering-roadmap.md) | **Phased Engineering Roadmap & Verification Matrix** | Granular, verifiable milestones across Phase 0 through Phase 4, test coverage requirements, and human-agent pair-programming division of labor. |

---

## 3. Core Engineering Invariants (Code Quality & Architecture Rules)

Every package and application in the `volt` monorepo must adhere to these non-negotiable standards:

1. **Strict Modularity & 200-Line File Limit:**
   * Every source file must have a single, well-defined responsibility and remain **under 200 lines of code**. Any file approaching 200 lines must be proactively decomposed into subcomponents, hooks, services, or pure helper modules.
2. **Centralized Types (`@volt/types`):**
   * All TypeScript interfaces, types, DTOs, database row models, and component prop definitions must reside exclusively in `packages/types/src/` (or dedicated `*.types.ts` modules exported through `@volt/types`).
   * **Strict Prohibition:** Never declare or export `interface` or `type` definitions inside UI component files (`.tsx`), hooks, utilities, or service files.
3. **Strict Type Safety (`strict: true`, Zero `any` / `unknown`):**
   * Neither `any` nor unvalidated `unknown` is permitted anywhere in the codebase. Every function signature, hook, callback, and API handler is strictly typed and validated at runtime boundaries via Zod schemas.
4. **Centralized Route Constants (`AppRoutes` & `ApiRoutes`):**
   * Never hardcode URL paths or route strings (e.g., `"/v1/commits"`, `"/reviews"`) in components, hooks, services, CLI commands, or tests. Always import from centralized route registries (`AppRoutes` and `ApiRoutes`).
5. **Separation of Concerns (UI vs. Business Logic):**
   * Presentation components (`.tsx`) render UI and bind user interactions only. All data fetching, state transitions, math previews, and API calls reside in dedicated custom hooks (`use...`), store slices, or service modules.
6. **Zero Emojis — Semantic Native Icons Only:**
   * Unicode emojis are strictly prohibited in code, UI labels, CLI output, and placeholders. Use `lucide-react` semantic vector icons in the Web UI and Tauri overlay, and clean ASCII/ANSI geometric glyphs in CLI output.

---

## 4. Summary of Key Architecture Decision Records (ADRs)

### ADR-001: Drizzle ORM + Supabase PostgreSQL 16
* **Decision:** Use `drizzle-orm` with `postgres` (`postgres.js`) driver inside `packages/db`.
* **Rationale:** Zero binary overhead on Google Cloud Run cold starts (unlike Prisma's Rust engine), full SQL transparency for complex analytical aggregations (Pool Share % and append-only audit queries), and strict TypeScript type inference.

### ADR-002: Hybrid Auth — Supabase Auth (Web) + SHA-256 Personal API Keys (CLI/MCP/Overlay)
* **Decision:** Authenticate Web UI sessions via Supabase Auth JWTs (Google OAuth / Magic Link). Authenticate CLI (`volt`), MCP (`volt-mcp`), and Mac Overlay via Personal API Keys (`volt_sk_<random>`) stored as SHA-256 hashes in `user_api_keys`.
* **Rationale:** Eliminates headless token refresh friction in terminal/MCP environments while providing enterprise-grade session security in the browser.

### ADR-003: Policy-Based Access Control (PBAC) Over Fixed Roles
* **Decision:** Replace static user roles (`role VARCHAR`) with a flat Permission Scopes engine (`packages/policy`) backed by Reusable Policy Groups (`policy_groups`), User-Group assignments (`user_policy_groups`), and direct User Scopes (`direct_scopes`). Decouple work categorization into a commit-level `domain` (`engineering`, `research`, `ops`, `finance`, `pitch`) and user `default_domain`.
* **Rationale:** Team members wear multiple hats across engineering, research, and pitching. Authorization abilities (such as `commit:review_peer` or `cycle:manage`) must be dynamically composable via policy sets without hardcoding role hierarchies.

### ADR-004: Sequential Co-Author Handshake Before AI Judge Evaluation
* **Decision:** When a commit includes `--co @user2`, it enters `pending_coauthor` status first. Once all tagged co-authors verify via their 1-line `contribution_note` (or the 24-hour window expires, dropping unverified/rejected co-authors from $N$), the commit transitions to `pending_ai` and dispatches to the AI Judge with all verified contribution notes bundled.
* **Rationale:** Prevents duplicate AI invocations, gives the AI Judge complete context of both the primary author's summary and every verified co-author's specific contribution in a single pass, and ensures accurate group split ($3/N$) math after any rejections or timeouts.

### ADR-005: Strict Artifact Verification — Installed GitHub App + Direct File Upload Only
* **Decision:** Support exactly two verifiable artifact methods for $E \ge 1.0\text{x}$:
  1. **GitHub App Integration:** Users click **"Connect GitHub"** in the Web UI to link their GitHub account/org via the installed `volt` GitHub App. PRs and commits are verified directly via the GitHub App installation token (checking merge status, CI check suites, additions/deletions).
  2. **Direct File Upload:** For non-GitHub deliverables (Colab `.ipynb` notebooks, PDF decks, financial models, screenshots), users upload the file directly via CLI (`--file`), Web UI drag-and-drop, Mac Overlay, or Telegram Bot into cloud storage (`volt-artifacts`).
* **Rationale:** Eliminates brittle, unauthenticated HTML scraping of private Google Docs/Figma/Colab URLs and guarantees cryptographic/verifiable proof stored or inspected with first-party API credentials.

### ADR-006: Local SQLite Write-Ahead Queue (`~/.volt/queue.sqlite`) for `<50ms` Capture
* **Decision:** `volt add` writes immediately to a local SQLite database (`~/.volt/queue.sqlite` via `bun:sqlite`) in `<5ms` and spawns a detached background flush process to sync with the Cloud Run Fastify API / Upstash Redis staging buffer.
* **Rationale:** Guarantees the `<50ms` terminal execution invariant even when Google Cloud Run is experiencing a cold start or the user is temporarily offline.
