import type {
  StagedLogRecord,
  UserPolicyContext,
} from "@volt/types";

export const AVAILABLE_PERSONAS: readonly UserPolicyContext[] = [
  {
    userId: "u-ashwin-01",
    handle: "ashwin",
    email: "hi.ashwinsharma@gmail.com",
    defaultDomain: "engineering",
    scopes: [
      "stage:write",
      "commit:create",
      "commit:verify_coauthor",
      "feed:read",
      "github:connect",
      "cycle:read",
      "cycle:manage",
      "commit:review_peer",
      "commit:flag_review",
      "user:manage",
      "policy:admin",
    ],
    groupSlugs: ["core-contributor", "peer-reviewer", "pool-manager", "policy-admin"],
    isActive: true,
  },
  {
    userId: "u-rohan-02",
    handle: "rohan",
    email: "rohan@volt.build",
    defaultDomain: "research",
    scopes: [
      "stage:write",
      "commit:create",
      "commit:verify_coauthor",
      "feed:read",
      "github:connect",
      "cycle:read",
      "commit:review_peer",
      "commit:flag_review",
    ],
    groupSlugs: ["core-contributor", "peer-reviewer"],
    isActive: true,
  },
  {
    userId: "u-priya-03",
    handle: "priya",
    email: "priya@volt.build",
    defaultDomain: "ops",
    scopes: [
      "stage:write",
      "commit:create",
      "commit:verify_coauthor",
      "feed:read",
      "cycle:read",
      "commit:review_peer",
    ],
    groupSlugs: ["core-contributor", "peer-reviewer"],
    isActive: true,
  },
];

export const INITIAL_USER_CONTEXT: UserPolicyContext = AVAILABLE_PERSONAS[0]!;

export const INITIAL_STAGED_LOGS: readonly StagedLogRecord[] = [
  {
    id: "stg-1",
    userId: "u-ashwin-01",
    clientLogId: "019295f4-8c1a-7000-8000-000000000001",
    rawText: "Implemented local SQLite WAL write-ahead queue (<4ms latency)",
    source: "cli",
    artifactId: null,
    githubPrUrl: "https://github.com/hi-ashwinsharma/volt/pull/1",
    commitId: null,
    committedAt: null,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "stg-2",
    userId: "u-ashwin-01",
    clientLogId: "019295f4-8c1a-7000-8000-000000000002",
    rawText: "Configured PBAC conflict-of-interest peer review guards in @volt/policy",
    source: "mcp",
    artifactId: null,
    githubPrUrl: null,
    commitId: null,
    committedAt: null,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
];
export { INITIAL_COMMITS_FEED } from "./seed-commits";

