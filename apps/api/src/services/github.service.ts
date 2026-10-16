import { createHmac, createSign } from "node:crypto";
import type { GitHubRepositorySummary } from "@volt/types";
import { redisGet, redisSetEx } from "./redis.service";

export function signGitHubOAuthState(userId: string): string {
  const secret =
    process.env["GITHUB_STATE_SIGNING_SECRET"] ??
    "volt-default-github-state-signing-secret-key";
  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Date.now() + 15 * 60 * 1000 })
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyGitHubOAuthState(state: string): string | null {
  const secret =
    process.env["GITHUB_STATE_SIGNING_SECRET"] ??
    "volt-default-github-state-signing-secret-key";
  const [payloadPart, sigPart] = state.split(".");
  if (!payloadPart || !sigPart) {
    return null;
  }
  const expectedSig = createHmac("sha256", secret)
    .update(payloadPart)
    .digest("base64url");
  if (expectedSig !== sigPart) {
    return null;
  }
  const decoded = JSON.parse(
    Buffer.from(payloadPart, "base64url").toString("utf-8")
  ) as { userId: string; exp: number };
  return Date.now() > decoded.exp ? null : decoded.userId;
}

function createGitHubAppJwt(): string | null {
  const appId = process.env["GITHUB_APP_ID"];
  const keyBase64 = process.env["GITHUB_APP_PRIVATE_KEY_BASE64"];
  if (!appId || !keyBase64 || keyBase64.length < 64) {
    return null;
  }
  const pem = Buffer.from(keyBase64, "base64").toString("utf-8");
  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iat: nowSec - 60, exp: nowSec + 540, iss: appId })
  ).toString("base64url");
  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  return `${signingInput}.${signer.sign(pem, "base64url")}`;
}

export async function getInstallationAccessToken(
  installationId: number
): Promise<string | null> {
  const cacheKey = `volt:gh:inst_token:${installationId}`;
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }
  const appJwt = createGitHubAppJwt();
  if (!appJwt) {
    return null;
  }
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { token: string };
  await redisSetEx(cacheKey, data.token, 3000);
  return data.token;
}

export async function fetchInstallationRepositories(
  installationId: number
): Promise<{
  readonly accountLogin: string;
  readonly accountType: "User" | "Organization";
  readonly repositories: readonly GitHubRepositorySummary[];
}> {
  const token = await getInstallationAccessToken(installationId);
  if (!token) {
    return {
      accountLogin: `github-org-${installationId}`,
      accountType: "Organization",
      repositories: [],
    };
  }
  const res = await fetch(
    "https://api.github.com/installation/repositories?per_page=100",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) {
    return {
      accountLogin: `github-org-${installationId}`,
      accountType: "Organization",
      repositories: [],
    };
  }
  const body = (await res.json()) as {
    repositories: readonly {
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      html_url: string;
      owner: { login: string; type: "User" | "Organization" };
    }[];
  };
  const firstOwner = body.repositories[0]?.owner;
  return {
    accountLogin: firstOwner?.login ?? `github-${installationId}`,
    accountType: firstOwner?.type ?? "Organization",
    repositories: body.repositories.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      htmlUrl: r.html_url,
    })),
  };
}
