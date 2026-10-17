import {
  authenticateByApiKey,
  findOrCreateUserByExternalIdentity,
  resolveUserPolicyContextById,
} from "@volt/db";
import { evaluateScopeAccess } from "@volt/policy";
import type { PermissionScope, UserPolicyContext } from "@volt/types";
import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyFirebaseIdToken } from "../services/firebase-auth.service";
import {
  cacheUserPolicyContext,
  getCachedUserPolicyContext,
} from "../services/redis.service";

async function resolveDevHeaderUser(
  req: FastifyRequest
): Promise<UserPolicyContext | null> {
  // Local-only impersonation shortcut; ignored in every other environment.
  if (process.env["NODE_ENV"] !== "development") {
    return null;
  }
  const devUserId = req.headers["x-volt-user-id"];
  if (typeof devUserId !== "string" || devUserId.length === 0) {
    return null;
  }
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

export async function resolveRequestUser(
  req: FastifyRequest
): Promise<UserPolicyContext | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return resolveDevHeaderUser(req);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (token.startsWith("volt_sk_")) {
    const ctx = await authenticateByApiKey(token);
    if (ctx) {
      await cacheUserPolicyContext(ctx);
    }
    return ctx;
  }

  const identity = await verifyFirebaseIdToken(token);
  if (!identity) {
    return null;
  }

  const ctx = await findOrCreateUserByExternalIdentity(identity);
  if (ctx) {
    await cacheUserPolicyContext(ctx);
  }
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
        "Valid Bearer volt_sk_... Personal API Key or Firebase ID token required.",
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
