# Invariant: Clean Architecture, Component Reuse & File Modularity

1. **Component Reuse First**:
   - Before authoring any new component, systematically inspect `apps/web/src/components/` to check if a suitable or adaptable component already exists.
   - Reuse and compose existing components whenever possible rather than duplicating functionality.

2. **Separation of Concerns (UI vs. Business Logic)**:
   - Decouple business logic, mathematical weightage calculations, and API side-effects from UI presentation components.
   - Extract logic into dedicated custom hooks (`apps/web/src/hooks/`) or service modules (`apps/web/src/services/`).

3. **Strict Modularity & 200-Line File Limit**:
   - Every `.ts` and `.tsx` file MUST remain $\le 200$ lines (`bun run quality:gate`).
   - Proactively decompose files into focused subcomponents, hooks, or helpers before reaching 200 lines.

4. **Centralized Types in `@volt/types`**:
   - All TypeScript `interface` and `type` definitions MUST reside exclusively in `packages/types/src/`.
   - Never declare or export `interface` or `type` from UI components, hooks, services, or utilities.

5. **Centralized Route Constants (`ApiRoutes` & `AppRoutes`)**:
   - Never hardcode URL paths or route strings; always use `ApiRoutes` and `AppRoutes` from `@volt/types`.

6. **Strict Type Safety (`strict: true`, Zero `any`/`unknown`)**:
   - Never use `any` or `unknown`. All packages must pass `bun run typecheck` and `bun run quality:gate` with zero errors.
