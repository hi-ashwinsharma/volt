# volt — Agentic Engineering Constitution & Portable Workspace Rules

This file is automatically loaded by **Google Antigravity (AGY)** and compatible coding agents across any machine (Mac Mini, MacBook Pro, Linux CI). Every agent operating in this repository MUST enforce these invariants without exception.

---

## 1. Strict Code Quality & Architectural Invariants

All rules below are mechanically enforced by [`scripts/quality-gate.ts`](./scripts/quality-gate.ts) via `bun run quality:gate`:

1. **Strict 200-Line File Limit**:
   - Every `.ts` and `.tsx` file in `packages/` and `apps/` MUST be **$\le 200$ lines**.
   - If a file approaches 180 lines, proactively decompose it into focused subcomponents, custom hooks (`src/hooks/`), or pure domain helpers (`src/services/`).

2. **Centralized Types in `@volt/types` (`packages/types/src/`)**:
   - **Strict Prohibition**: Never declare `interface` or `type` aliases inside UI components (`.tsx`), hooks, services, API routes, CLI commands, or utility files.
   - Every shared model, API payload, DB record shape, and React component `*Props` interface MUST reside in `packages/types/src/` and be imported from `@volt/types`.

3. **Zero `any` and Zero Loose `unknown`**:
   - Neither `any` nor `unknown` is permitted anywhere in source code (`scripts/quality-gate.ts` scans for `\b(?:any|unknown)\b`).
   - Use explicit TypeScript types, discriminated unions, and Zod schemas (`@volt/config`).

4. **Centralized Route Constants (`ApiRoutes` & `AppRoutes`)**:
   - Never hardcode URL paths (`"/v1/commits"`, `"/reviews"`, `"/pool"`) in components, hooks, services, or tests.
   - Always import `ApiRoutes`, `AppRoutes`, `buildApiRoute`, and `buildAppRoute` from `@volt/types`.

5. **Strict Emoji Ban**:
   - Never use Unicode emojis anywhere in code, UI labels, CLI output, or commit messages.
   - Use `lucide-react` vector icons in `@volt/web` and `@volt/mac-overlay`, and clean ASCII indicators (`[OK]`, `[WARN]`) in `@volt/cli`.

---

## 2. UI/UX Philosophy: Don Norman's *Design of Everyday Things* + Apple HIG

When building or modifying any frontend surface (`apps/web/`, `apps/mac-overlay/`), read [`apps/web/AGENTS.md`](./apps/web/AGENTS.md) and activate the `.agents/skills/apple-norman-ui-engineering/SKILL.md` skill:

1. **Eliminate the "Mocked / Template" Feel — Let Elements Live in Open Air**:
   - Do not trap every piece of information inside stacked, claustrophobic rectangles.
   - Let section headers, hero telemetry, timelines, and filter rails breathe **directly on the open canvas** (`#F5F5F7` in Light Mode, `#0A0A0C` in Dark Mode). Reserve elevated glass cards (`.apple-surface`, `.apple-composer`) for interactive workbenches, composers, and focused artifacts.
   - Utilize desktop screen width (`max-w-[1360px]`) with asymmetric multi-column layouts (e.g., open-air timeline + live staging rail on `/`, Master-Detail Split Evaluation Workbench on `/reviews`).

2. **Don Norman's 7 Interaction Principles**:
   - **Discoverability & Signifiers**: Never display cryptic abbreviations (`C:8 * I:2.0 * E:1.2`) without human-readable labels (*Complexity*, *Impact*, *Proof*, *Consensus*, *Timeliness*). Every interactive element must look interactive.
   - **Conceptual Model (Bridge the Gulf of Execution & Evaluation)**: Users must visually see *how* micro-logs (`volt add`) accumulate in a live staging buffer and bundle into a daily scored Deliverable (`volt commit`).
   - **Natural Mapping & Constraints**: Group controls spatially next to the live readout they affect (e.g., interactive parameter pills directly beside the live $W_c$ score preview). Explain constraints clearly (e.g., why a commit is locked by the PBAC Conflict-of-Interest guard or why ` Approve ` requires a 5+ character audit note).

3. **Right Color in the Right Place (Calibrated Semantic Pigments, Not Monotone)**:
   - Keep 90% of the structural canvas and typography in Apple's neutral hierarchy (`#F5F5F7` / `#1D1D1F`), and deploy **calibrated semantic colors** purposefully where they carry immediate meaning:
     - **System Emerald (`#28CD41` light / `#30D158` dark)**: Verified status, `OUTPUT` engineering deliverables, and positive weightage/payout gains.
     - **System Indigo (`#5856D6` light / `#BF5AF2` dark)**: `INSIGHT (R&D)` epistemic discoveries and empirical `.ipynb` research notebooks.
     - **System Blue (`#007AFF` light / `#0A84FF` dark)**: Verifiable GitHub Pull Request links, CI check badges, and interactive focus states.
     - **System Amber (`#FF9500` light / `#FF9F0A` dark)**: Items requiring human intervention (Pending Peer Review $>15\text{ pts}$, 24h Co-Author Handshake).
     - **System Red (`#FF3B30` light / `#FF453A` dark)**: Destructive actions (`Reject`, `Revoke`) and anti-gaming flags.

---

## 3. Git Lifecycle & Verification Workflow

1. **Branching**: Never commit directly to `main`. Create a feature branch (`git checkout -b feat/<name> main`), commit incremental steps, push to `origin`, and merge `--no-ff` into `main` after full verification.
2. **Pre-Commit Verification Command**:
   ```bash
   export PATH="$HOME/.bun/bin:$HOME/.cargo/bin:$PATH"
   bun run quality:gate && bun run typecheck && bun run build && bun test
   ```
