# Invariant: Don Norman Interaction Design & Apple HIG Spatial Aesthetics

1. **Affordances & Signifiers (Self-Evident UI)**:
   - Every interactive element must communicate *what it does* and *how to operate it* without a manual.
   - Never render raw single-letter math symbols (`C`, `I`, `E`, `V`, `D`) without human-readable labels (*Complexity*, *Impact*, *Proof*, *Consensus*, *Timeliness*).
   - When a button is disabled (e.g., `Approve Score` requiring an audit note), display a clear inline signifier explaining the exact requirement.

2. **Open-Air Spatial Layout**:
   - Avoid wrapping every section in nested cards. Use open-air typography, subtle hairlines, and generous whitespace on the `--bg-canvas` (`#F5F5F7` light / `#0A0A0C` dark) so elements breathe naturally across a `max-w-[1360px]` layout.
   - Use multi-column workbenches (such as a Master-Detail Split Workbench on `/reviews` and an Open-Air Timeline + Live Staging Rail on `/`) to take full advantage of desktop displays.

3. **Calibrated Semantic Color (Right Color in the Right Place)**:
   - Keep structural chrome, cards, and primary text in Apple's neutral hierarchy, and use semantic color tokens purposefully:
     - **Emerald (`--accent-emerald`)**: Verified state, `Output` deliverables, and positive point/payout readouts.
     - **Indigo (`--accent-indigo`)**: `Insight · R&D` discoveries and `.ipynb` research notebooks.
     - **Blue (`--accent-blue`)**: Verified GitHub PR links, active selection rings, and interactive focus indicators.
     - **Amber (`--accent-amber`)**: Pending human action (Peer Review $>15\text{ pts}$, Co-Author Handshake).
     - **Crimson (`--accent-danger`)**: Reject, Revoke, or anti-gaming flags.

4. **Strict Emoji Ban**:
   - Never use Unicode emojis anywhere in code or UI. Always use semantic vector icons (`lucide-react`) paired with accessible labels.
