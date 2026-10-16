import { describe, expect, test } from "bun:test";
import { ApiRoutes } from "@volt/types";
import { signGitHubOAuthState, verifyGitHubOAuthState } from "./services/github.service";
import { buildApiServer } from "./server";

describe("@volt/api — Fastify 5 Server & Security Contracts", () => {
  test("GET /v1/health returns ok status", async () => {
    const app = await buildApiServer();
    const res = await app.inject({
      method: "GET",
      url: ApiRoutes.health,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { status: string; service: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("volt-api");
    await app.close();
  });

  test("rejects unauthenticated requests to protected routes with 401", async () => {
    const app = await buildApiServer();
    const res = await app.inject({
      method: "GET",
      url: ApiRoutes.stage.list,
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  test("signs and verifies GitHub App OAuth CSRF state tokens", () => {
    const signed = signGitHubOAuthState("user-uuid-123");
    const verifiedUserId = verifyGitHubOAuthState(signed);
    expect(verifiedUserId).toBe("user-uuid-123");
    expect(verifyGitHubOAuthState("tampered.token")).toBeNull();
  });
});
