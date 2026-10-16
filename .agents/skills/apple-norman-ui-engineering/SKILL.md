---
name: apple-norman-ui-engineering
description: >-
  Guides the design, refactoring, and verification of frontend UI components in @volt/web
  and @volt/mac-overlay using Don Norman's Design of Everyday Things principles (affordances,
  signifiers, conceptual models, natural mapping, constraints, feedback) combined with Apple
  Human Interface Guidelines (open-air spatial layout, adaptive light/dark mode, and calibrated
  semantic color). Activate this skill whenever creating, modifying, or auditing any UI page or
  component.
---

# Apple HIG & Don Norman UI Engineering Skill

Use this skill whenever building or refining UI surfaces in `apps/web/` or `apps/mac-overlay/`.

---

## 1. Don Norman's 7 Interaction Principles Checklist

Before shipping any UI component, verify it against all 7 principles from *The Design of Everyday Things*:

1. **Discoverability**: Can a first-time user tell what state the system is in and what actions are possible within 2 seconds of looking at the screen?
2. **Affordances**: Do interactive controls (pills, tabs, queue cards, sliders) visually invite clicking, dragging, or typing?
3. **Signifiers**:
   - Never use raw mathematical letters (`C`, `I`, `E`, `V`, `D`) alone. Always display human labels:
     - `Complexity (C)` · `Impact (I)` · `Proof (E)` · `Consensus (V)` · `Timeliness (D)`
   - Always label thresholds and rules inline (e.g., `"Auto-verified (<= 15 pts)"` vs `"Peer Review Required (> 15 pts)"`).
4. **Conceptual Model**:
   - Visually connect the **Staged Micro-Logs Buffer** (`volt add`) to the **Deliverable Composer** (`volt commit`) so users understand that micro-logs are bundled into a scored commit.
5. **Natural Mapping**:
   - Place parameter controls (`Complexity`, `Impact`, `Proof`, `Consensus`) directly beside the live $W_c$ equation breakdown so adjusting a control produces an immediate, spatially adjacent change in the score.
6. **Constraints**:
   - When an action is restricted (such as PBAC Conflict-of-Interest preventing self-review, or `Approve Score` requiring a 5+ character audit reason), explain the constraint clearly in human language.
7. **Feedback**:
   - Provide immediate visual feedback (`active:scale-[0.98]`, spring transitions `cubic-bezier(0.22, 1, 0.36, 1)`, live score recalculation, and instant optimistic state updates across all tabs via shared context).

---

## 2. Open-Air Spatial Architecture (Breaking Out of Stacked Boxes)

1. **Canvas First, Cards Second**:
   - Let page headers, hero telemetry numbers, chronological timeline spines, and secondary rails live **directly in open air** on `--bg-canvas` (`#F5F5F7` Light / `#0A0A0C` Dark), separated by `1px` hairlines (`--border-subtle`).
   - Reserve elevated glass surfaces (`.apple-surface`, `.apple-composer`) for interactive focal points: the Deliverable Composer, the active Review Inspector, and interactive cards.
2. **Full-Width Desktop Workbenches (`max-w-[1360px]`)**:
   - **Impact Stream (`/`)**: Asymmetric 12-column layout — 8-column Open-Air Deliverable Timeline on the left + 4-column sticky **Live Staging & Cycle Telemetry Rail** on the right.
   - **Reviews Workbench (`/reviews`)**: Master-Detail Split Workbench — 5-column selectable review queue on the left + 7-column sticky interactive Grading Inspector on the right.
   - **Pool Share (`/pool`)**: Open-air hero metrics + interactive What-If Pool Budget simulator + visual domain leverage breakdown bars.

---

## 3. Calibrated Semantic Color System ("Right Color in the Right Place")

Keep structural surfaces and typography in Apple's neutral hierarchy, and apply semantic colors where they carry immediate meaning:

- **Emerald (`text-accent-emerald` / `bg-accent-emerald-soft`)**: Verified status, `Output` engineering deliverables, and positive point/payout readouts.
- **Indigo (`text-accent-indigo` / `bg-accent-indigo-soft`)**: `Insight · R&D` discoveries and empirical `.ipynb` research artifacts.
- **Blue (`text-accent-blue` / `bg-accent-blue-soft`)**: Verifiable GitHub Pull Request links, CI check badges, and active selection borders.
- **Amber (`text-accent-amber` / `bg-accent-amber-soft`)**: Pending human action (Peer Review $>15\text{ pts}$ or 24h Co-Author Handshake).
- **Crimson (`text-status-danger` / `bg-accent-danger-soft`)**: Destructive actions (`Reject`, `Revoke`) and anti-gaming flags.
