# 08 — Apple-Esque Web Command Center & Mac Overlay Specification

**Document ID:** `VOLT-DOC-08`  
**Parent Index:** [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md)

---

## 1. Visual Language & Design Tokens

The `volt` Web Command Center (`apps/web`) and Tauri Mac Quick-Entry Overlay (`apps/mac-overlay`) share a cohesive **macOS Sequoia / Linear** dark-first glassmorphic design language.

### 1.1 Color & Surface Tokens
* **Canvas Background:** `#09090B` (Zinc 950 deep obsidian)
* **Elevated Glass Surface:** `rgba(24, 24, 27, 0.72)` with `backdrop-filter: blur(24px) saturate(180%)`
* **Hairline Specular Border:** `1px solid rgba(255, 255, 255, 0.07)` (hover state: `rgba(255, 255, 255, 0.14)`)
* **Primary Typography:** `#FAFAFA` (Inter Variable / SF Pro Display, tight tracking `-0.015em`)
* **Secondary / Muted Typography:** `#A1A1AA` (Zinc 400)
* **Monospace Equations & Hashes:** `JetBrains Mono` (`font-variant-numeric: tabular-nums`)
* **Semantic Accents:**
  * **Output Commit Badge:** Emerald `#10B981` (`rgba(16, 185, 129, 0.12)` background fill)
  * **Insight Commit Badge:** Indigo/Violet `#8B5CF6` (`rgba(139, 92, 246, 0.12)` background fill)
  * **High-Stakes Peer Review (`>15 pts`):** Amber `#F59E0B`
  * **Verified Artifact (`1.2x`):** Cyan `#06B6D4`

### 1.2 Strict Zero-Emoji Policy (Native Vector Icons Only)
Per our global user rule, **Unicode emojis are strictly prohibited** across all UI components, buttons, badges, empty states, and CLI outputs.
* All visual indicators use crisp `1.5px`-stroke vector icons from `lucide-react` (`GitCommitHorizontal`, `GitPullRequest`, `FlaskConical`, `ShieldCheck`, `Sparkles`, `FileCode2`, `Scale`, `Users`, `Terminal`, `ArrowUpRight`) paired with accessible `aria-label` attributes.

---

## 2. Core Views & Component Architecture (`apps/web`)

Every view in `apps/web` is decomposed into focused presentation components (`<200 lines` per file) backed by dedicated custom hooks (`useImpactStream`, `useStageCommit`, `usePeerReviewQueue`, `usePoolShareMatrix`, `useGitHubIntegration`).

### 2.1 Persistent Top Quick-Capture & Commit Bar
* Spotlight-inspired bar docked at the top of the workspace:
  * **Mode Toggle:** Switch between `Stage Log` (`volt add`) and `Commit Deliverable` (`volt commit`).
  * **Artifact Attachment Pill:**
    * Pick a recent PR from connected GitHub repositories (powered by the installed GitHub App), OR
    * Drag-and-drop / select a proof file (`.ipynb`, `.pdf`, `.xlsx`, `.png`) with live upload progress bar.
  * **Co-Author Tagging Autocomplete:** Type `@` to select team members.
  * **Staging Drawer Badge:** Expandable drawer showing current uncommitted micro-logs with timestamps and source badges (`CLI`, `MCP`, `Overlay`, `Telegram`).

### 2.2 View 1: Live Impact Stream (`AppRoutes.home`)
* Real-time chronological ledger of team commits with filter pills by Domain (`All`, `Engineering`, `Research`, `Ops`, `Finance`, `Pitch`) and Status (`Approved`, `Pending Peer`, `Pending Co-Author`).
* **Commit Card Anatomy:**
  * **Header:** Monospace hash pill (`a9f3c12b`), author + verified co-author avatars (with tooltip showing each co-author's verified `contribution_note`), Domain badge, and `OUTPUT` vs. `INSIGHT` pill.
  * **Interactive Math Equation Pill:**
    $$\texttt{C:8 (18.38) × I:2.0x × E:1.2x × V:1.00 × D:1.00 = 44.11 pts}$$
    Clicking expands the full **Append-Only Score Audit Trail** showing the AI Judge's reasoning and any subsequent Peer Reviewer adjustments.
  * **Artifact Verification Chip:**
    * For `github_app`: Displays `GitPullRequest` icon, repo/PR number, `+additions / -deletions`, `Merged` badge, and `CI Passed` indicator.
    * For `file_upload`: Displays `FileCode2` / `FileText` icon, filename, size, and one-click preview modal.

### 2.3 View 2: Peer Review & Handshake Queue (`AppRoutes.peerReviews`)
Split into two high-priority action sections:
1. **My Pending Co-Author Handshakes:**
   * Lists commits where the current user was tagged via `--co @handle` along with a live countdown to the 24-hour deadline.
   * 1-line input field (`"Describe your specific contribution..."`) + **Verify & Unlock** button or **Reject Tag** button.
2. **High-Stakes Peer Review Queue ($>15.0\text{ pts}$ or Flagged):**
   * Visible and actionable to users holding the `commit:review_peer` scope (automatically excluding commits where the user is the author or co-author).
   * Interactive precision slider for $V \in [0.70, 1.30]$ that recalculates $W_c$ in real time, optional discrete selectors to override $C, I, E$, mandatory audit reasoning input, and **Approve Score** / **Reject Commit** actions.

### 2.4 View 3: Dynamic Pool Share & Analytics Matrix (`AppRoutes.poolMatrix`)
* **Cycle Selector Header:** Switch between the active `billing_cycle`, past cycles, Monthly, Weekly, or Custom Date Range. Users with `cycle:manage` can update $\text{PoolBudget}_T$ or create a new cycle inline.
* **Real-Time Pool Share Ticker & Leaderboard Table:**
  * Displays each team member's Approved Commits count, Total Cycle Points ($P_{u, T}$), Collaboration Ratio, Domain Breakdown bar (`Engineering` / `Research` / `Ops` / `Finance` / `Pitch`), **Dynamic Pool Share ($\text{Share}_{u, T}\%$)**, and calculated **Cycle Payout ($\text{Payout}_{u, T}$)** when $\text{PoolBudget}_T > 0$.
  * One-click **Export Compensation Ledger (CSV)** for payroll execution.

### 2.5 View 4: Integrations & Policy Management (`AppRoutes.settingsIntegrations` & `AppRoutes.settingsPolicies`)
* **"Connect GitHub" Card:** Prominent one-click button to install/link the `volt` GitHub App, displaying connected GitHub accounts/organizations, accessible repositories, and installation health.
* **Personal API Keys Manager:** Generate and revoke `volt_sk_...` keys for CLI, MCP, and Mac Overlay.
* **PBAC Policy Console (`commit:policy_admin`):** Manage reusable Policy Groups (`Core Contributor`, `Peer Reviewer`, `Pool Manager`, custom groups) and assign scopes to team members without touching code.

### 2.6 Global `Cmd + K` Command Palette
Accessible from anywhere in the Web UI to:
* Stage a quick micro-log
* Commit staged logs
* Jump to pending peer reviews or co-author handshakes
* Connect GitHub or generate an API key
* Export the active cycle's compensation report

---

## 3. Ambient Mac Quick-Entry Overlay (`apps/mac-overlay`)

Built with **Tauri v2** (`Rust` core + lightweight `React/Tailwind` frontend):
1. Registers global macOS shortcut `Cmd + Shift + L` via `tauri-plugin-global-shortcut`.
2. Summons a frameless, transparent, vibrancy-blurred floating Spotlight bar centered in the upper third of the active screen (`NSPanel` behavior, appears over full-screen apps without stealing desktop spaces).
3. **Instant Capture Flow:**
   * Type log text $\rightarrow$ press `Enter` $\rightarrow$ writes directly to `~/.volt/queue.sqlite` in `<5ms`, hides the overlay window immediately, and triggers the background sync flush.
   * Press `Tab` inside the overlay to switch to quick `Commit` mode or drag-and-drop a screenshot file directly onto the pill.
