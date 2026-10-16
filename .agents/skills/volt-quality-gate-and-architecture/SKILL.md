---
name: volt-quality-gate-and-architecture
description: >-
  Enforces volt's strict code quality invariants: <=200 lines per file, 100% centralized
  types in @volt/types, zero any/unknown types, centralized ApiRoutes/AppRoutes constants,
  zero Unicode emojis, and shared React Context state persistence. Activate this skill
  before committing code or when decomposing files to pass bun run quality:gate.
---

# Volt Quality Gate & Clean Architecture Skill

Use this skill to structure, audit, and verify all code across the `volt` monorepo.

---

## 1. Mandatory Quality Gate Invariants

Run the automated gate at any time with:

```bash
export PATH="$HOME/.bun/bin:$HOME/.cargo/bin:$PATH"
bun run quality:gate
```

The script [`scripts/quality-gate.ts`](../../../scripts/quality-gate.ts) enforces four non-negotiable rules across all `.ts` and `.tsx` files:

1. **`[200-LINE-LIMIT]`**: Every `.ts` and `.tsx` file MUST have $\le 200$ lines.
   - **How to fix**: Extract subcomponents into `apps/web/src/components/`, state hooks into `apps/web/src/hooks/`, or pure domain/math builders into `apps/web/src/services/`.
2. **`[CENTRALIZED-TYPES]`**: Zero `interface` or `type` declarations outside `packages/types/src/`.
   - **How to fix**: Move all component `*Props` interfaces, state types, and helper return types into `packages/types/src/ui.types.ts` (or the appropriate module in `packages/types/src/`) and import them via `import type { ... } from "@volt/types"`.
3. **`[ZERO-ESCAPE-TYPES]`**: Zero occurrences of `any` or `unknown` on code lines (note: avoid writing the English words `any` or `unknown` even inside string literals on code lines, as the regex checks `\b(?:any|unknown)\b`).
4. **`[NO-EMOJIS]`**: Zero Unicode emojis anywhere in source code. Always use `lucide-react` icons or ASCII symbols.

---

## 2. Full Verification Sequence Before Commit

Always run the complete verification pipeline before committing and pushing:

```bash
export PATH="$HOME/.bun/bin:$HOME/.cargo/bin:$PATH"
bun run quality:gate && bun run typecheck && bun run build && bun test
```
