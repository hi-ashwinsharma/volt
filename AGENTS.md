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
   - Use `@gravity-ui/icons` (the icon set used in HeroUI's docs) in `@volt/web` and `@volt/mac-overlay`, and clean ASCII indicators (`[OK]`, `[WARN]`) in `@volt/cli`.

---

## 2. Frontend: Pure HeroUI v3 (No Other Design System)

`apps/web/` is built exclusively with **HeroUI v3** (`@heroui/react` + `@heroui/styles`, Tailwind CSS v4). Before any frontend work, read [`.agents/rules/heroui-react.md`](./.agents/rules/heroui-react.md) and use the HeroUI MCP server (`get_component_docs`, `get_theme_variables`).

1. **Components**: Use HeroUI compound components (`Card.Header`, `Table.Row`, ...) for every UI element. Do not hand-roll buttons, inputs, tables, overlays or navigation that HeroUI already provides. No other component library.
2. **Tokens only**: Colors, radius, shadows, spacing and typography come from HeroUI semantic tokens (`bg-background`, `bg-surface`, `text-muted`, `bg-accent`, `text-success`, `border-separator`, `rounded-lg`, ...). Never write hex/rgb/oklch literals or arbitrary values (`bg-[#...]`, `p-[13px]`) in components.
3. **Theme**: The only theme source is `apps/web/src/styles/theme.css`, exported from the HeroUI Theme Builder. Light/dark follows the OS (`next-themes`, `attribute="class"`, `defaultTheme="system"`). Do not override component styles via BEM classes unless HeroUI documents that pattern for the case.
4. **Semantic color meaning**: `success` = verified / approved / gains, `warning` = needs human action (peer review, co-author handshake), `danger` = destructive actions and anti-gaming flags, `accent` = primary action and focus. Everything else stays neutral.
5. **Density**: HeroUI default spacing; data-heavy surfaces (tables, lists) use HeroUI's documented `size="sm"` variants.
6. **Accessibility**: Rely on HeroUI's React Aria primitives; every icon-only button has `aria-label`, and every abbreviation (C, I, E, V, D) has a visible human-readable label.

---

## 3. Git Lifecycle & Verification Workflow

1. **Branching**: Never commit directly to `main`. Create a feature branch (`git checkout -b feat/<name> main`), commit incremental steps, push to `origin`, and merge `--no-ff` into `main` after full verification.
2. **Pre-Commit Verification Command**:
   ```bash
   export PATH="$HOME/.bun/bin:$HOME/.cargo/bin:$PATH"
   bun run quality:gate && bun run typecheck && bun run build && bun test
   ```
