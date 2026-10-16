# @volt/web — Frontend Design & Interaction Constitution

This rule file governs all work inside `apps/web/`. Every change to the Command Center UI must honor **Don Norman's *The Design of Everyday Things*** and **Apple Human Interface Guidelines (HIG)**.

---

## 1. Don Norman's Interaction Principles in Practice

1. **Signifiers Over Cryptic Jargon**:
   - Never force users to decode raw mathematical variables (`C`, `I`, `E`, `V`, `D`) or internal database enums (`pending_coauthor`, `github_app`).
   - Always pair mathematical factors with clear human labels:
     - `C` $\rightarrow$ **Complexity** (Modified Fibonacci $C^{1.4}$)
     - `I` $\rightarrow$ **Impact** (Business Leverage)
     - `E` $\rightarrow$ **Proof** (Empirical Evidence)
     - `V` $\rightarrow$ **Consensus** (Peer Review Multiplier)
     - `D` $\rightarrow$ **Timeliness** (Same-Day IST Factor)
   - Show interactive states clearly: selectable cards must have a clear active ring/indicator, buttons must communicate whether they are ready or why they are disabled.

2. **Visible Conceptual Model (Micro-Logs $\rightarrow$ Deliverable $\rightarrow$ Audit $\rightarrow$ Pool Share)**:
   - Make the 4-stage lifecycle self-evident on screen:
     1. **Stage**: Quick micro-logs accumulate visibly in the **Live Staging Tray** (never hidden inside an opaque dropdown).
     2. **Synthesize**: One click transfers or bundles staged micro-logs into a scored **Deliverable Commit**.
     3. **Verify**: Commits $\le 15\text{ pts}$ auto-verify via AI Judge; commits $>15\text{ pts}$ or with `@co-authors` route to the **Reviews Workbench**.
     4. **Allocate**: Verified points flow into the **Pool Share Matrix**.

3. **Open-Air Spatial Architecture (No Box-Inside-Box Claustrophobia)**:
   - Use a generous `max-w-[1360px]` canvas with `px-6 lg:px-10`.
   - Let hero metrics, section headers, timeline spines, and secondary metadata sit **in open air** directly on `--bg-canvas` (`#F5F5F7` in Light Mode / `#0A0A0C` in Dark Mode), separated by subtle hairlines (`--border-subtle`) rather than wrapping every group in another bordered box.
   - Use **asymmetric multi-column layouts**:
     - **Impact Stream (`/`)**: 8-column Open-Air Chronological Deliverable Timeline + 4-column sticky **Live Staging & Telemetry Rail**.
     - **Reviews (`/reviews`)**: Master-Detail Split Workbench (5-column selectable review queue + 7-column sticky interactive grading inspector).
     - **Pool Share (`/pool`)**: Open-air executive telemetry header + interactive Pool Budget simulator + visual domain leverage breakdown.

---

## 2. Purposeful Color Architecture ("Right Color in the Right Place")

Avoid both extremes: never use chaotic neon borders, and never make the entire UI dead monochrome. Use Apple's calibrated semantic pigments where color carries instant cognitive meaning:

| Semantic Intent | Light Mode Token | Dark Mode Token | Where & Why It Is Used |
|---|---|---|---|
| **Engineering Output & Verified** | `#1D9E34` (`bg: rgba(40,205,65,0.10)`) | `#30D158` (`bg: rgba(48,209,88,0.12)`) | `Output` deliverable badge, verified status dot, and positive point/payout readouts. |
| **R&D Insight & Epistemic Proof** | `#5856D6` (`bg: rgba(88,86,214,0.10)`) | `#BF5AF2` (`bg: rgba(191,90,242,0.12)`) | `Insight · R&D` badge and `.ipynb` Colab research artifacts (visually honoring negative results). |
| **Verifiable Code / GitHub PR** | `#0066CC` (`bg: rgba(0,122,255,0.10)`) | `#0A84FF` (`bg: rgba(10,132,255,0.12)`) | GitHub PR verification pills, repository links, and active selection borders. |
| **Human Action Required** | `#C96E00` (`bg: rgba(255,149,0,0.12)`) | `#FF9F0A` (`bg: rgba(255,159,10,0.14)`) | Pending Peer Review ($>15\text{ pts}$) and 24-hour Co-Author Handshake requests. |
| **Destructive / Rejection** | `#D70015` (`bg: rgba(255,59,48,0.10)`) | `#FF453A` (`bg: rgba(255,69,58,0.12)`) | Reject commit, Revoke API key, and anti-gaming anomaly alerts. |
