import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { createHmac, randomUUID } from "node:crypto";
import { ApiRoutes } from "@volt/types";
import { buildApiServer } from "./server";

const PROJECT_ID = "volt-auth-test";

function b64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function forgeToken(alg: "HS256" | "none"): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg, typ: "JWT", kid: "forged" });
  const payload = b64url({
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    sub: "attacker-uid",
    email: "admin@volt.dev",
    email_verified: true,
    iat: now,
    exp: now + 3600,
  });
  const signature =
    alg === "none"
      ? ""
      : createHmac("sha256", "guessable-secret").update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

async function getMe(headers: Record<string, string>): Promise<number> {
  const app = await buildApiServer();
  const res = await app.inject({ method: "GET", url: ApiRoutes.auth.me, headers });
  await app.close();
  return res.statusCode;
}

describe("@volt/api auth plugin", () => {
  const originalNodeEnv = process.env["NODE_ENV"];

  beforeAll(() => {
    process.env["FIREBASE_PROJECT_ID"] = PROJECT_ID;
  });

  afterEach(() => {
    process.env["NODE_ENV"] = originalNodeEnv;
  });

  test("rejects an HMAC-signed forged ID token", async () => {
    expect(await getMe({ authorization: `Bearer ${forgeToken("HS256")}` })).toBe(401);
  });

  test("rejects an unsigned (alg none) forged ID token", async () => {
    expect(await getMe({ authorization: `Bearer ${forgeToken("none")}` })).toBe(401);
  });

  test("rejects a malformed bearer token", async () => {
    expect(await getMe({ authorization: "Bearer not-a-jwt" })).toBe(401);
  });

  test("ignores the x-volt-user-id header in production", async () => {
    process.env["NODE_ENV"] = "production";
    expect(await getMe({ "x-volt-user-id": randomUUID() })).toBe(401);
  });

  test("ignores the x-volt-user-id header in test", async () => {
    process.env["NODE_ENV"] = "test";
    expect(await getMe({ "x-volt-user-id": randomUUID() })).toBe(401);
  });
});
