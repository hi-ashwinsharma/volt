# 01 — System Vision & Mathematical Weightage Engine

**Document ID:** `VOLT-DOC-01`  
**Parent Index:** [00-index.md](file:///Users/ashwinsharma/coldcrunch/volt/docs/00-index.md)

---

## 1. System Vision & Core Philosophy

`volt` is an **Output-Based Compensation & Impact Engine** disguised as a zero-friction work logger. It replaces traditional time-tracking (`tracker.hi-ashwin.xyz`) with a Git-inspired workflow (`volt add` $\rightarrow$ `volt commit`) that measures **cognitive complexity, business leverage, and verifiable empirical proof** across five operational domains:
* **Engineering** (`engineering`)
* **AI & Empirical Research** (`research`)
* **Operations** (`ops`)
* **Finance & Legal** (`finance`)
* **Pitching & Growth** (`pitch`)

### 1.1 The Four Foundational Invariants

| Invariant | Rule | Engineering Mechanism |
| :--- | :--- | :--- |
| **1. The 3-Second Capture Rule** | Logging a micro-task (`volt add`) must take $<3\text{s}$ human effort and $<50\text{ms}$ terminal latency. | Local `bun:sqlite` write-ahead queue (`~/.volt/queue.sqlite`) with detached background flush to Upstash Redis & Supabase Postgres. |
| **2. Complexity Over Hours** | Time spent is never tracked or rewarded. A 2-hour high-complexity breakthrough exponentially outweighs 4 hours of routine chores. | Non-linear exponent ($C^{1.4}$) on Modified Fibonacci complexity multiplied by Business Impact ($I$). |
| **3. Epistemic Value Parity** | Rigorous R&D or dead-end research (`commit --type insight`) that disproves a hypothesis with empirical data is rewarded equally to shipped code (`commit --type output`). | AI Judge rubric explicitly grades hypothesis + methodology + benchmarked refutation on par with production engineering. |
| **4. Immutable Audit Ledger** | Every score calculation, AI evaluation, co-author handshake, and peer review modification is permanently recorded. | Append-only PostgreSQL `score_audits` table protected by database triggers that forbid `UPDATE` and `DELETE`. |

---

## 2. Primary Weightage Formula ($W_c$)

Every `volt commit` is evaluated to produce a **Base Commit Weight Score ($W_c$)** combining the **Modified Fibonacci Scale**, the **Hay Job Evaluation Method**, and **WSJF (Weighted Shortest Job First)**:

$$W_{\text{initial}} = C^{1.4} \times I \times E$$

$$W_c = \text{round}\left( W_{\text{initial}} \times V \times D, \, 2 \right)$$

Where:
* $C \in \{1, 2, 3, 5, 8, 13\}$ is **Cognitive Complexity**
* $I \in \{0.5, 1.0, 1.5, 2.0, 3.0\}$ is **Business Impact Multiplier**
* $E \in \{0.5, 1.0, 1.2\}$ is **Evidence & Artifact Multiplier**
* $V \in [0.70, 1.30]$ is **Verification Consensus Modifier**
* $D \in [0.50, 1.00]$ is **Timeliness Decay Factor**

---

## 3. Variable Definitions & Calibration Rubrics

### 3.1 $C$ — Cognitive Complexity (Modified Fibonacci)

| Value | $C^{1.4}$ | Tier Name | Domain Examples (Engineering / Research / Ops / Finance / Pitch) |
| :---: | :---: | :--- | :--- |
| **$1$** | $1.00$ | **Trivial / Hygiene** | Adding print/debug logs, fixing typos, formatting slide decks, scheduling meetings, basic CRM data entry. |
| **$2$** | $2.64$ | **Routine** | Minor UI tweaks, simple bug fixes, writing standard outreach emails, updating financial tracking sheets. |
| **$3$** | $4.66$ | **Standard Execution** | Building standard CRUD endpoints, writing unit test suites, compiling a 10-competitor market research matrix. |
| **$5$** | $9.52$ | **Challenging** | Multi-service integration, training/fine-tuning baseline models in Colab, drafting a comprehensive investor pitch narrative. |
| **$8$** | $18.38$ | **Complex Architecture / Deep Research** | Designing high-concurrency systems, custom caching layers, complex multi-scenario financial modeling, closing key strategic partnerships. |
| **$13$** | $36.26$ | **Force Multiplier / Breakthrough** | Building a custom Redis-grade engine, inventing a novel ML architecture, proving a company-saving pivot with deep empirical benchmarks. |

### 3.2 $I$ — Business Impact Multiplier

| Value | Tier Name | Qualification Criteria |
| :---: | :--- | :--- |
| **$0.5\text{x}$** | **Internal Hygiene** | Internal maintenance, minor refactoring, or non-critical housekeeping. |
| **$1.0\text{x}$** | **Core Roadmap** | Standard planned sprint execution and baseline deliverables. |
| **$1.5\text{x}$** | **High-Priority Deliverable** | High-priority sprint milestone or major customer/investor-facing asset. |
| **$2.0\text{x}$** | **Force Unblocker** | Unblocks multiple team members or eliminates a severe engineering/operational bottleneck. |
| **$3.0\text{x}$** | **Existential / Revenue Milestone** | Direct revenue generation, fundraising closure, or existential company milestone. |

### 3.3 $E$ — Evidence & Artifact Multiplier

As established in **ADR-005**, `volt` enforces strict proof verification via two first-party channels (Installed GitHub App or Direct File Upload):

| Value | Tier Name | Verification Requirement |
| :---: | :--- | :--- |
| **$0.5\text{x}$** | **Unverified Text Claim** | No GitHub PR/commit verified via GitHub App and no uploaded artifact file in `volt-artifacts` (e.g., pure text claim *"Discussed architecture on FaceTime"*). |
| **$1.0\text{x}$** | **Verified Artifact** | Either: (a) Open/draft GitHub PR or verified commit via the installed GitHub App, OR (b) Uploaded proof file (`.ipynb` Colab notebook, PDF deck, CSV/XLSX sheet, screenshot proof) stored in `volt-artifacts`. |
| **$1.2\text{x}$** | **Empirical / Production Proof** | Either: (a) **Merged** GitHub PR with **passing CI/CD check suites** verified via the GitHub App API, OR (b) Uploaded `.ipynb` / empirical benchmark report containing reproducible evaluation metrics or live customer/investor traction proof verified by the AI Judge. |

### 3.4 $V$ — Verification Consensus Modifier

Continuous range: $[0.70, 1.30]$ (step $0.05$ in UI, stored as `NUMERIC(3,2)`).
* **AI Judge Baseline:** Always initialized to $V = 1.00$.
* **Auto-Approval Threshold ($W_{\text{initial}} \le 15.00$):**
  * If $W_{\text{initial}} = (C^{1.4} \times I \times E) \le 15.00$, AND `requires_human_review == false`, AND `anti_gaming_flag == false`, the commit is **automatically approved** (`status = 'approved'`) with $V = 1.00$.
* **High-Stakes Peer Review ($W_{\text{initial}} > 15.00$ or Flagged):**
  * If $W_{\text{initial}} > 15.00$, OR the AI Judge sets `requires_human_review = true` / `anti_gaming_flag = true`, the commit enters `status = 'pending_peer'`.
  * Any authorized reviewer holding the `commit:review_peer` policy scope (excluding the commit's primary author and co-authors) can:
    1. Adjust $V \in [0.70, 1.30]$, OR
    2. Override $C, I, E$ directly with mandatory `reasoning` recorded in `score_audits`.

### 3.5 $D$ — Timeliness Decay Factor (Anti-Procrastination)

Calculated deterministically using the commit's `work_date` vs. the current date in the organization's canonical timezone (`Asia/Kolkata` / IST):

$$\text{days\_late} = \max\left(0, \, \text{CURRENT\_DATE}_{\text{IST}} - \text{work\_date}\right)$$

* If logged on the same day or within the prior 24-hour window ($\text{days\_late} \le 1$ when committed before the morning cutoff, or $\text{days\_late} = 0$): $D = 1.00$.
* Specifically, for each day backdated ($\text{days\_late} \ge 1$):

$$D = \max\left(0.50, \, 1.00 - 0.10 \times \text{days\_late}\right)$$

| Days Late | $0$ | $1$ | $2$ | $3$ | $4$ | $\ge 5$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **$D$ Multiplier** | $1.00$ | $0.90$ | $0.80$ | $0.70$ | $0.60$ | $0.50$ (Floor) |

---

## 4. Collaboration & Co-Author Allocation Mathematics

Let $N$ be the total number of **verified** participants on a commit $c$:

$$N = 1 \text{ (Primary Author)} + \left| \{ u \in \text{CoAuthors}(c) \mid u.\text{status} == \text{'verified'} \} \right|$$

> [!IMPORTANT]
> **Rejected or Timed-Out Co-Authors Are Excluded from $N$:**  
> Per **ADR-004**, if a tagged co-author explicitly rejects a handshake or fails to verify within the 24-hour window, their status becomes `'rejected'` or `'timed_out'` and they are **dropped from $N$**. They do not penalize the remaining verified authors.

### 4.1 Individual Point Award ($W_{u, c}$)

Once commit $c$ is finalized (`approved`), each verified participant $u$ (the primary author plus each verified co-author) receives $W_{u, c}$ points:

$$W_{u, c} = \begin{cases} 
W_c & \text{if } 1 \le N \le 3 \quad \text{(100\% Point Duplication Mode)} \\
\text{round}\left(\dfrac{W_c \times 3}{N}, \, 2\right) & \text{if } N \ge 4 \quad \text{(Group Split Mode)}
\end{cases}$$

**Example Scenarios:**
1. **Solo Commit ($N=1$):** $W_c = 20.00 \implies$ Author gets $20.00\text{ pts}$.
2. **Pair / Trio Commit ($N=2$ or $N=3$):** $W_c = 20.00 \implies$ Each verified participant gets $20.00\text{ pts}$ ($100\%$ duplication to incentivize tight collaboration).
3. **4 Authors Tagged, All 4 Verify ($N=4$):** $W_c = 20.00 \implies$ Each of the 4 participants gets $\frac{20.00 \times 3}{4} = 15.00\text{ pts}$.
4. **4 Authors Tagged, 1 Times Out After 24h ($N=3$ verified):** Rejected/timed-out user gets $0\text{ pts}$. Remaining $N=3$ verified participants receive $100\%$ duplication ($20.00\text{ pts}$ each).

---

## 5. Dynamic Bonus Pool Share Formula

For any billing or sprint cycle $T$ with a configured pool budget $\text{PoolBudget}_T \ge 0$:

Let $\text{Approved}(u, T)$ be the set of all commits $c$ whose `work_date` falls within cycle $T$, where $c.\text{status} == \text{'approved'}$, and user $u$ is either the primary author or a verified co-author.

1. **User Cycle Points ($P_{u, T}$):**
   $$P_{u, T} = \sum_{c \in \text{Approved}(u, T)} W_{u, c}$$

2. **Total Team Cycle Points ($P_{\text{Team}, T}$):**
   $$P_{\text{Team}, T} = \sum_{m \in \text{ActiveUsers}} P_{m, T}$$

3. **Dynamic Pool Share Percentage ($\text{Share}_{u, T}$):**
   $$\text{Share}_{u, T} (\%) = \begin{cases} 
   0.00\% & \text{if } P_{\text{Team}, T} = 0 \\
   \text{round}\left( \dfrac{P_{u, T}}{P_{\text{Team}, T}} \times 100, \, 2 \right) & \text{if } P_{\text{Team}, T} > 0
   \end{cases}$$

4. **Cycle Payout ($\text{Payout}_{u, T}$):**
   $$\text{Payout}_{u, T} = \text{round}\left( \frac{P_{u, T}}{P_{\text{Team}, T}} \times \text{PoolBudget}_T, \, 2 \right)$$

*(When $\text{PoolBudget}_T = 0$, the UI hides currency payout figures and highlights $\text{Share}_{u, T}(\%)$ and raw impact points $P_{u, T}$).*
