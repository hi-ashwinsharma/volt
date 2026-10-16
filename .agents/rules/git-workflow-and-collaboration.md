# Invariant: Collaborative Pair Programming, Clarification & Git Lifecycle

1. **Proactive Clarification via `ask_question`**:
   - Never guess or assume ambiguous requirements or design trade-offs. Use Antigravity's interactive `ask_question` tool with structured options and a `(Recommended)` choice first.

2. **Collaborative Pair Programming**:
   - Externalize thinking, share architectural rationale and trade-offs, and work in verifiable, incremental steps.

3. **Git Branching & Verification Lifecycle**:
   - Never commit directly to `main`.
   - Always create a dedicated feature branch (`git checkout -b feat/<task-name> main`).
   - Run `bun run quality:gate && bun run typecheck && bun run build && bun test` before committing, push the feature branch to `origin`, and merge `--no-ff` into `main`.
