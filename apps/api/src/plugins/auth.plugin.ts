import { createHmac, timingSafeEqual } from "node:crypto";
import {
  authenticateByApiKey,
  findOrCreateUserBySupabaseAuth,
  resolveUserPolicyContextById,
} from "@volt/db";
import { evaluateScopeAccess } from "@volt/policy";
import type { PermissionScope, UserPolicyContext } from "@volt/types";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  cacheUserPolicyContext,
  getCachedUserPolicyContext,
} from "../services/redis.service";

function verifySupabaseJwt(token: string): {
  readonly sub: string;
  readonly email: string;
} | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return null;
  }
  const secret = process.env["SUPABASE_JWT_SECRET"];
  if (secret && !secret.includes("your-supabase-jwt-secret")) {
    const signingInput = `${parts[0]}.${parts[1]}`;
    const expectedSig = createHmac("sha256", secret)
      .update(signingInput)
      .digest("base64url");
    const bufA = Buffer.from(expectedSig);
    const bufB = Buffer.from(parts[2]);
    if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) {
      return null;
    }
  }
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    ) as { sub?: string; email?: string; exp?: number };
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    if (!payload.sub || !payload.email) {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function resolveRequestUser(
  req: FastifyRequest
): Promise<UserPolicyContext | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const devUserId = req.headers["x-volt-user-id"];
    if (typeof devUserId === "string" && devUserId.length > 0) {
      const cached = await getCachedUserPolicyContext(devUserId);
      if (cached) {
        return cached;
      }
      const resolved = await resolveUserPolicyContextById(devUserId);
      if (resolved) {
        await cacheUserPolicyContext(resolved);
      }
      return resolved;
    }
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (token.startsWith("volt_sk_")) {
    const ctx = await authenticateByApiKey(token);
    if (ctx) {
      await cacheUserPolicyContext(ctx);
    }
    return ctx;
  }

  const jwtClaims = verifySupabaseJwt(token);
  if (!jwtClaims) {
    return null;
  }

  const ctx = await findOrCreateUserBySupabaseAuth({
    supabaseAuthId: jwtClaims.sub,
    email: jwtClaims.email,
  });
  await cacheUserPolicyContext(ctx);
  return ctx;
}

export async function requireAuthenticatedUser(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<UserPolicyContext | null> {
  const user = await resolveRequestUser(req);
  if (!user || !user.isActive) {
    await reply.status(401).send({
      error: "UNAUTHORIZED",
      message:
        "Valid Bearer volt_sk_... Personal API Key or Supabase Auth JWT required.",
    });
    return null;
  }
  return user;
}

export async function requireUserScope(
  req: FastifyRequest,
  reply: FastifyReply,
  scope: PermissionScope
): Promise<UserPolicyContext | null> {
  const user = await requireAuthenticatedUser(req, reply);
  if (!user) {
    return null;
  }
  const check = evaluateScopeAccess(user, scope);
  if (!check.allowed) {
    await reply.status(403).send({
      error: check.reason ?? "FORBIDDEN",
      missingScope: check.missingScope,
      message: `Missing required PBAC permission scope: ${scope}`,
    });
    return null;
  }
  return user;
}
