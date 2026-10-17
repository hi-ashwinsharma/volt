# SYSTEM SPECIFICATION: `volt` — Zero-Friction Impact & Weightage Engine
**Target Agent:** Argon (Antigravity) / Engineering Execution Agent  
**System Type:** Distributed CLI (`<5ms` Local Write-Ahead Queue), MCP Server, Event-Driven Evaluation Pipeline, Tauri v2 Mac Overlay, and Apple-Esque Web Command Center  
**Replaces:** `tracker.hi-ashwin.xyz`  
**Detailed Engineering Docs:** See [`docs/00-index.md`](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md) through [`docs/10-engineering-roadmap.md`](file:///Users/ashwinsharma/coldcrunch/volt/docs/10-engineering-roadmap.md)

---

## 1. SYSTEM VISION & CORE PHILOSOPHY
`volt` is an **Output-Based Compensation & Impact Engine** disguised as a zero-friction work logger. It replaces time-tracking with a Git-inspired workflow (`add` $\rightarrow$ `commit`) that measures **cognitive complexity, business impact, and verifiable proof** across Engineering (`engineering`), AI Research (`research`), Operations (`ops`), Finance (`finance`), and Pitching (`pitch`).

### Core Invariants (Strict Architectural Rules)
1. **The 3-Second Capture Rule:** Logging a micro-task (`volt add`) must take $<3\text{ seconds}$ and $<50\text{ms}$ terminal latency via a local SQLite write-ahead queue (`~/.volt/queue.sqlite`) with detached background sync to Upstash Redis & Supabase PostgreSQL, plus Mac OS Tauri overlay (`Cmd+Shift+L`), MCP agent, or Telegram Bot.
2. **Complexity Over Hours:** Time spent is never rewarded. A 2-hour high-complexity architecture task exponentially outweighs 4 hours of low-complexity routine work.
3. **Epistemic Value Parity:** Rigorous R&D or dead-end research (`commit --type insight`) that disproves a bad hypothesis with data is rewarded equally to shipped code/artifacts (`commit --type output`).
4. **Immutable Audit Ledger:** Every score calculation, AI evaluation, co-author handshake, and peer review modification is stored in an append-only PostgreSQL audit trail (`score_audits` protected by an immutability trigger).
5. **Policy-Based Access Control (PBAC):** Authorization is governed by flat permission scopes (`commit:review_peer`, `cycle:manage`, `policy:admin`, etc.) and reusable Policy Groups rather than fixed user roles. Work categorization (`domain`) is decoupled from authorization.
6. **Strict First-Party Artifact Verification:** Only two verified proof channels qualify for $E \ge 1.0\text{x}$:
   * **Installed GitHub App** ("Connect GitHub" in Web UI) for PR and commit inspection.
   * **Direct File Upload** to `volt-artifacts` storage (`.ipynb` notebooks, PDFs, models, screenshots).

---

## 2. MATHEMATICAL WEIGHTAGE ENGINE

Every `volt commit` is evaluated to produce a **Commit Weight Score ($W_c$)** using a combination of the **Modified Fibonacci Scale**, the **Hay Job Evaluation Method**, and **WSJF (Weighted Shortest Job First)**.

### 2.1 Primary Weightage Formula
$$W_{\text{initial}} = C^{1.4} \times I \times E$$
$$W_c = \text{round}\left( W_{\text{initial}} \times V \times D, \, 2 \right)$$

### 2.2 Variable Definitions & Rubrics

#### 1. $C$ — Cognitive Complexity (Modified Fibonacci)
Allowed discrete values: $\{1, 2, 3, 5, 8, 13\}$
* **$1$ (Trivial / Hygiene):** Adding print logs, fixing typos, formatting slide decks, scheduling meetings, basic data entry.
* **$2$ (Routine):** Minor UI tweaks, simple bug fixes, writing standard outreach emails, updating financial tracking sheets.
* **$3$ (Standard Execution):** Building standard CRUD endpoints, writing unit test suites, compiling a 10-competitor market research matrix.
* **$5$ (Challenging):** Multi-service integration, training/fine-tuning baseline models in Google Colab, drafting a comprehensive investor pitch narrative.
* **$8$ (Complex Architecture / Deep Research):** Designing high-concurrency systems, custom caching layers, complex financial modeling, closing key strategic partnerships.
* **$13$ (Force Multiplier / Breakthrough):** Building a custom Redis-grade engine, inventing a novel ML architecture, proving a company-saving pivot with deep empirical benchmarks.

#### 2. $I$ — Business Impact Multiplier
Allowed discrete values: $\{0.5, 1.0, 1.5, 2.0, 3.0\}$
* **$0.5\text{x}$:** Internal maintenance / minor hygiene.
* **$1.0\text{x}$:** Core roadmap execution.
* **$1.5\text{x}$:** High-priority sprint deliverable or major customer/investor-facing asset.
* **$2.0\text{x}$:** Unblocks multiple team members or eliminates a major engineering/ops bottleneck.
* **$3.0\text{x}$:** Direct revenue generation, fundraising closure, or existential company milestone.

#### 3. $E$ — Evidence & Artifact Multiplier
Allowed discrete values: $\{0.5, 1.0, 1.2\}$
* **$0.5\text{x}$ (Unverified Text):** Pure text claim with no GitHub App-verified PR/commit and no uploaded artifact file (e.g., *"Discussed architecture on FaceTime"*).
* **$1.0\text{x}$ (Verified Artifact):** Verified via either:
  * *Installed GitHub App:* Open/draft GitHub PR or verified commit in a connected repository.
  * *Direct File Upload:* Uploaded `.ipynb` Colab notebook, Markdown/PDF experiment log, Figma/Pitch PDF export, financial model, or screenshot proof stored in `volt-artifacts`.
* **$1.2\text{x}$ (Production / Empirical Proof):** Merged GitHub PR with passing CI/CD check suites verified via the GitHub App, or an uploaded empirical benchmark (`.ipynb` / traction proof) verified by the AI Judge.

#### 4. $V$ — Verification Consensus Modifier
Continuous range: $[0.70, 1.30]$
* Baseline set by the **AI Judge** is $1.00$.
* **Auto-Approval Threshold:** If initial $(C^{1.4} \times I \times E) \le 15.0\text{ points}$ and not flagged, the commit is auto-approved ($V = 1.00$).
* **High-Stakes Peer Review:** If initial score $> 15.0\text{ points}$ (or flagged), the commit enters the Peer Review Queue (`pending_peer`). Authorized reviewers holding the `commit:review_peer` policy scope (excluding the commit's primary author and co-authors) can adjust $V$ between $0.70\text{x}$ and $1.30\text{x}$ or override $C, I, E$ with mandatory audit reasoning.

#### 5. $D$ — Timeliness Decay Factor (Anti-Procrastination)
* Commits logged for the current day (or prior 24h window in `Asia/Kolkata`): $D = 1.00$.
* Backdated commits incur a linear decay of $-10\%$ per day late, floored at $D = 0.50$:
  $$D = \max(0.50, 1.0 - 0.10 \times \text{days\_late})$$

---

## 3. COLLABORATION & CO-AUTHOR MECHANICS (SEQUENTIAL PIPELINE)

To incentivize teamwork while preventing tag-spamming:

1. **Sequential Handshake Before AI Grading (`pending_coauthor` $\rightarrow$ `pending_ai`):**
   * When a commit tags co-authors (`--co @user2`), the commit enters `pending_coauthor` status with a 24-hour deadline (`coauthor_deadline_at = NOW() + 24h`).
   * Tagged co-authors receive an asynchronous prompt (via Telegram Bot / Web UI / CLI) and must submit a 1-line `contribution_note` (`volt verify <hash> -m "..."`) or reject the tag.
   * Gemini 1.5 Flash validates that each `contribution_note` aligns with the commit summary.
   * Once all tagged co-authors verify/reject—or when the 24-hour Cloud Task timer fires—any unverified/rejected co-authors are dropped from the participant count $N$, and the commit transitions to `pending_ai` so the AI Judge grades the primary summary and all verified contribution notes in one pass.
2. **100% Point Duplication (1 to 3 Verified Participants):**
   * When $1 \le N \le 3$ verified participants (including primary author), **each verified participant receives $100\%$ of $W_c$**.
3. **Group Split Mode ($4+$ Verified Participants):**
   * If $N \ge 4$ verified participants, the system switches to Split Mode where each verified participant receives:
     $$W_{\text{individual}} = \text{round}\left(\frac{W_c \times 3}{N}, \, 2\right)$$

---

## 4. DYNAMIC BONUS POOL SHARE FORMULA

The system tracks real-time profit/bonus pool share across all active team members for any configurable billing/sprint cycle $T$ (`billing_cycles` table):

$$\text{Share}_{u, T} (\%) = \left( \frac{\sum_{c \in \text{Approved}(u, T)} W_{u, c}}{\sum_{m \in \text{Team}} \sum_{c \in \text{Approved}(m, T)} W_{m, c}} \right) \times 100$$

$$\text{Payout}_{u, T} = \frac{\text{Share}_{u, T}}{100} \times \text{PoolBudget}_T$$

*(Note: When $\text{PoolBudget}_T = 0$, the UI displays $\text{Share}_{u, T}(\%)$ and raw points as an impact ledger).*

---

## 5. SYSTEM ARCHITECTURE & TECH STACK

* **Database & ORM:** **Supabase PostgreSQL 16** + **Drizzle ORM** (`packages/db`)
* **Authentication:** **Supabase Auth** (Google OAuth / Magic Link) for Web UI + **SHA-256 Personal API Keys** (`volt_sk_...`) for CLI, MCP, and Mac Overlay
* **Authorization:** **Policy-Based Access Control (`@volt/policy`)** with Flat Permission Scopes and Reusable Policy Groups
* **Backend API & Task Worker:** TypeScript (**Fastify**) running on **Google Cloud Run**
* **Asynchronous Jobs & Sweeper:** **Google Cloud Tasks** (immediate evaluation + 24h co-author timeout timer) + **Google Cloud Scheduler** (daily 19:30 IST sweeper)
* **Staging Cache & PBAC Cache:** **Upstash Redis**
* **Artifact Verification & Storage:** **Installed GitHub App** (REST API PR/commit inspection) + **Supabase Storage / GCS** (`volt-artifacts` bucket)
* **AI Judge & STT:** **Gemini 1.5 Flash** (`temperature: 0.1`, strict JSON schema + native `.ogg` audio voice note transcription)
* **CLI & MCP:** Bun/TypeScript monorepo compiled to native binaries (`volt` with `~/.volt/queue.sqlite` `<5ms` write-ahead queue, and `volt-mcp`)
* **Mac Quick-Entry Bar:** **Tauri v2** native floating menubar/Spotlight overlay (`Cmd + Shift + L`) in `apps/mac-overlay`
* **Frontend Web UI:** **Next.js 15 (App Router)**, Tailwind CSS, Framer Motion, Radix Primitives, `lucide-react` native vector icons (strictly zero emojis)

---

## 6. COMPLETE ENGINEERING DOCUMENTATION SUITE

All detailed schemas, DDL, API contracts, state machines, and roadmaps are maintained in `docs/`:
* [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md) — Documentation Index, Engineering Invariants & ADRs
* [01-vision-and-math-engine.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/01-vision-and-math-engine.md) — Mathematical Weightage Engine & Rubrics
* [02-system-architecture.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/02-system-architecture.md) — System Architecture, `<5ms` Local Queue & Monorepo Topology
* [03-database-schema.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/03-database-schema.md) — Complete PostgreSQL 16 DDL, ERD & Drizzle ORM Layout
* [04-pbac-and-security.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/04-pbac-and-security.md) — Policy-Based Access Control (PBAC) & Hybrid Auth Model
* [05-pipeline-and-state-machines.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/05-pipeline-and-state-machines.md) — Sequential Co-Author Handshake, 24h Timeout & AI Judge Pipeline
* [06-github-app-and-artifacts.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/06-github-app-and-artifacts.md) — "Connect GitHub" App Flow & Direct Artifact Upload Pipeline
* [07-api-cli-mcp-contracts.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/07-api-cli-mcp-contracts.md) — Centralized `ApiRoutes` / `AppRoutes`, REST API, CLI & MCP Contracts
* [08-ui-ux-design-system.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/08-ui-ux-design-system.md) — Apple-Esque Web Command Center & Tauri v2 Mac Overlay Spec
* [09-infrastructure-and-runbook.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/09-infrastructure-and-runbook.md) — Cloud-Native Environment Setup & `infra:setup` Provisioning
* [10-engineering-roadmap.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/10-engineering-roadmap.md) — Phased Execution Plan & Quality Gates