export const ApiRoutes = {
  health: "/v1/health",
  auth: {
    me: "/v1/auth/me",
    statusOverview: "/v1/auth/status-overview",
    apiKeys: "/v1/auth/api-keys",
    revokeApiKey: "/v1/auth/api-keys/:id",
    cliDeviceStart: "/v1/auth/cli/start",
    cliDevicePoll: "/v1/auth/cli/poll",
  },
  stage: {
    list: "/v1/stage",
    create: "/v1/stage",
    batchSync: "/v1/stage/batch",
    delete: "/v1/stage/:id",
  },
  commits: {
    list: "/v1/commits",
    create: "/v1/commits",
    detail: "/v1/commits/:shortHash",
    verifyCoAuthor: "/v1/commits/:shortHash/verify",
    peerReview: "/v1/commits/:shortHash/review",
    flagForReview: "/v1/commits/:shortHash/flag",
  },
  artifacts: {
    createUploadUrl: "/v1/artifacts/upload-url",
    confirmUpload: "/v1/artifacts/:id/confirm",
  },
  integrations: {
    githubStatus: "/v1/integrations/github/status",
    githubInstallUrl: "/v1/integrations/github/install-url",
    githubCallback: "/v1/integrations/github/callback",
  },
  cycles: {
    list: "/v1/cycles",
    activePoolShare: "/v1/cycles/active/pool-share",
    detailPoolShare: "/v1/cycles/:id/pool-share",
    create: "/v1/cycles",
    update: "/v1/cycles/:id",
    exportCsv: "/v1/cycles/:id/export",
  },
  policies: {
    groups: "/v1/policies/groups",
    assignGroup: "/v1/policies/users/:userId/groups",
    updateDirectScopes: "/v1/policies/users/:userId/scopes",
  },
  webhooks: {
    telegram: "/v1/webhooks/telegram",
    github: "/v1/webhooks/github",
  },
  internalTasks: {
    evaluateCommit: "/v1/internal/tasks/evaluate-commit",
    resolveCoAuthorTimeout: "/v1/internal/tasks/resolve-coauthor-timeout",
    processTelegramVoice: "/v1/internal/tasks/process-telegram-voice",
    eveningSweep: "/v1/internal/tasks/evening-sweep",
  },
} as const;

export const AppRoutes = {
  signIn: "/sign-in",
  authCliVerify: "/auth/cli",
  home: "/",
  myWork: "/work",
  commitDetail: "/commits/:shortHash",
  handshakes: "/handshakes",
  ledger: "/ledger",
  reviews: "/reviews",
  reviewDetail: "/reviews/:shortHash",
  cycles: "/cycles",
  adminMembers: "/admin/members",
  adminPolicies: "/admin/policies",
  adminIntegrations: "/admin/integrations",
  settings: "/settings",
} as const;

export function buildApiRoute(
  template: string,
  params: Readonly<Record<string, string>>
): string {
  let resolved = template;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
  }
  return resolved;
}

export function buildAppRoute(
  template: string,
  params: Readonly<Record<string, string>>
): string {
  let resolved = template;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
  }
  return resolved;
}
