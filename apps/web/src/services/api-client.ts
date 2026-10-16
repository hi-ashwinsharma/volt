import {
  ApiRoutes,
  buildApiRoute,
  type AuthMeResponse,
  type CommitRecord,
  type CreateApiKeyResponse,
  type CreateCommitRequest,
  type CreateCommitResponse,
  type CyclePoolShareSummary,
  type PeerReviewCommitRequest,
  type PeerReviewCommitResponse,
  type PolicyDirectoryResponse,
  type StageLogsMutationResponse,
  type StagedLogRecord,
  type VerifyCoAuthorRequest,
  type VerifyCoAuthorResponse,
} from "@volt/types";

const API_BASE =
  process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const storedKey = window.localStorage.getItem("volt_api_key");
    if (storedKey) {
      headers["Authorization"] = `Bearer ${storedKey}`;
    }
  }
  return headers;
}

export async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}${ApiRoutes.auth.me}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as AuthMeResponse;
  } catch {
    return null;
  }
}

export async function fetchStagedLogs(): Promise<StagedLogRecord[]> {
  try {
    const res = await fetch(`${API_BASE}${ApiRoutes.stage.list}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { logs: StagedLogRecord[] };
    return data.logs;
  } catch {
    return [];
  }
}

export async function postStageLog(
  rawText: string,
  githubPrUrl: string | null
): Promise<StageLogsMutationResponse | null> {
  const res = await fetch(`${API_BASE}${ApiRoutes.stage.create}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      rawText,
      source: "web",
      githubPrUrl,
    }),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as StageLogsMutationResponse;
}

export async function fetchCommitFeed(): Promise<CommitRecord[]> {
  try {
    const res = await fetch(`${API_BASE}${ApiRoutes.commits.list}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { commits: CommitRecord[] };
    return data.commits;
  } catch {
    return [];
  }
}

export async function postCreateCommit(
  payload: CreateCommitRequest
): Promise<CreateCommitResponse | null> {
  const res = await fetch(`${API_BASE}${ApiRoutes.commits.create}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as CreateCommitResponse;
}

export async function postVerifyCoAuthor(
  shortHash: string,
  payload: VerifyCoAuthorRequest
): Promise<VerifyCoAuthorResponse | null> {
  const path = buildApiRoute(ApiRoutes.commits.verifyCoAuthor, { shortHash });
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as VerifyCoAuthorResponse;
}

export async function postPeerReviewCommit(
  shortHash: string,
  payload: PeerReviewCommitRequest
): Promise<PeerReviewCommitResponse | null> {
  const path = buildApiRoute(ApiRoutes.commits.peerReview, { shortHash });
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as PeerReviewCommitResponse;
}

export async function fetchActivePoolShare(): Promise<CyclePoolShareSummary | null> {
  try {
    const res = await fetch(`${API_BASE}${ApiRoutes.cycles.activePoolShare}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { summary: CyclePoolShareSummary | null };
    return data.summary;
  } catch {
    return null;
  }
}

export async function fetchGitHubInstallUrl(): Promise<string | null> {
  const res = await fetch(
    `${API_BASE}${ApiRoutes.integrations.githubInstallUrl}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { installUrl: string };
  return data.installUrl;
}

export async function postCreateApiKey(
  label: string
): Promise<CreateApiKeyResponse | null> {
  const res = await fetch(`${API_BASE}${ApiRoutes.auth.apiKeys}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as CreateApiKeyResponse;
}

export async function fetchPolicyDirectoryClient(): Promise<PolicyDirectoryResponse | null> {
  try {
    const res = await fetch(`${API_BASE}${ApiRoutes.policies.groups}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as PolicyDirectoryResponse;
  } catch {
    return null;
  }
}
