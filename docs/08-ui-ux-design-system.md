# 08 — Web Command Center: HeroUI v3 Design System & Information Architecture

**Document ID:** `VOLT-DOC-08`
**Parent Index:** [00-index.md](./00-index.md)

---

## 1. Design System: Pure HeroUI v3

`apps/web` was generated with `heroui init` (Next.js App Router template) and uses only HeroUI v3 (`@heroui/react`, `@heroui/styles`) on Tailwind CSS v4. There is no other component library and no custom design language.

| Concern | Source of truth |
| :--- | :--- |
| Components | HeroUI compound components (`Card.Header`, `Table.Row`, `Modal.Dialog`, ...). Next.js links reuse HeroUI styles via `buttonVariants` from `@heroui/styles`. |
| Theme | `apps/web/styles/theme.css`: the HeroUI Theme Builder **Uber** preset (monochrome; black accent in light mode, white in dark; 4px radius). |
| Tokens | HeroUI semantic utilities only: `bg-background`, `bg-surface`, `text-muted`, `bg-accent`, `border-separator`, `text-success`, `rounded-lg`, ... No hex/oklch literals or arbitrary values in components. |
| Color mode | `next-themes`, `attribute="class"`, `defaultTheme="system"`; user override in the sidebar appearance menu. |
| Icons | `@gravity-ui/icons` (the set HeroUI's docs use). |
| Typography | Inter + Fira Code via `next/font`; HeroUI `Typography` primitives for headings. |
| Density | HeroUI defaults. Fields placed on cards/modals use `variant="secondary"` as HeroUI documents for on-surface use; dense data uses `Table` and `size="sm"` chips/buttons. |

### 1.1 Semantic color meaning

Neutral by default; color carries meaning only:

* `success`: approved, verified, positive payout.
* `warning`: needs a human (peer review, co-author confirmation).
* `danger`: destructive actions, rejections, anti-gaming flags.
* `accent`: the primary action on a view and focus rings.

---

## 2. Information Architecture

Navigation is grouped by job, and each item is shown only when the user holds the PBAC scope it needs (see [04](./04-pbac-and-security.md)).

| Group | Page | Route | Scope |
| :--- | :--- | :--- | :--- |
| Personal | Home: stats, staging buffer, commit dialog, open requests | `/` | any |
| Personal | My work | `/work` | `commit:create` |
| Personal | Co-author requests | `/handshakes` | `commit:verify_coauthor` |
| Team | Ledger (all deliverables, filters) | `/ledger` | `feed:read` |
| Team | Deliverable detail: score factors, bundled work, audit trail | `/commits/:shortHash` | `feed:read` |
| Governance | Review queue and review workbench (conflict-of-interest guard) | `/reviews`, `/reviews/:shortHash` | `commit:review_peer` |
| Compensation | Cycles: pool stats, share table, export, new cycle | `/cycles` | `cycle:read` / `cycle:manage` |
| Admin | Members, Policies, Integrations | `/admin/*` | `user:manage`, `policy:admin`, `github:connect` |
| Account | Settings: profile, API keys, capture clients | `/settings` | any |

All routes are constants in `AppRoutes` (`@volt/types`).

## 3. Authentication

The web app signs in with a personal API key (`volt_sk_*`) validated against `GET /v1/auth/me`; the key is kept in browser storage. Supabase SSO is the planned replacement.
