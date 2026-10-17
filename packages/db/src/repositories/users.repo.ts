import { createHash, randomBytes } from "node:crypto";
import { resolveEffectiveScopes } from "@volt/policy";
import type { UserPolicyContext, VerifiedExternalIdentity } from "@volt/types";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../client";
import {
  policyGroups,
  userApiKeys,
  userPolicyGroups,
  users,
} from "../schema";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateRawVoltApiKey(): {
  readonly rawSecretKey: string;
  readonly keyPrefix: string;
  readonly keyHash: string;
} {
  const randomPart = randomBytes(24).toString("base64url");
  const rawSecretKey = `volt_sk_${randomPart}`;
  const keyPrefix = rawSecretKey.slice(0, 14);
  const keyHash = hashApiKey(rawSecretKey);
  return { rawSecretKey, keyPrefix, keyHash };
}

export async function resolveUserPolicyContextById(
  userId: string
): Promise<UserPolicyContext | null> {
  const db = getDb();
  const [userRow] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow) {
    return null;
  }

  const assignedRows = await db
    .select({
      slug: policyGroups.slug,
      scopes: policyGroups.scopes,
    })
    .from(userPolicyGroups)
    .innerJoin(
      policyGroups,
      eq(userPolicyGroups.policyGroupId, policyGroups.id)
    )
    .where(eq(userPolicyGroups.userId, userRow.id));

  const effectiveScopes = resolveEffectiveScopes({
    directScopes: userRow.directScopes,
    groupScopesList: assignedRows.map((r) => r.scopes),
  });

  return {
    userId: userRow.id,
    handle: userRow.handle,
    email: userRow.email,
    defaultDomain: userRow.defaultDomain,
    scopes: effectiveScopes,
    groupSlugs: assignedRows.map((r) => r.slug),
    isActive: userRow.isActive,
  };
}

export async function authenticateByApiKey(
  rawApiKey: string
): Promise<UserPolicyContext | null> {
  const db = getDb();
  const keyHash = hashApiKey(rawApiKey);
  const [keyRow] = await db
    .select()
    .from(userApiKeys)
    .where(and(eq(userApiKeys.keyHash, keyHash), isNull(userApiKeys.revokedAt)))
    .limit(1);

  if (!keyRow) {
    return null;
  }

  await db
    .update(userApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(userApiKeys.id, keyRow.id));

  return resolveUserPolicyContextById(keyRow.userId);
}

/**
 * Maps a provider-verified identity (Firebase today) to a volt user.
 * Lookup order: provider uid, then verified email (links a pre-provisioned row once).
 * Returns null when the email already belongs to a different provider uid.
 */
export async function findOrCreateUserByExternalIdentity(
  params: VerifiedExternalIdentity
): Promise<UserPolicyContext | null> {
  const db = getDb();
  const [byUid] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authProviderUid, params.providerUid))
    .limit(1);
  if (byUid) {
    return resolveUserPolicyContextById(byUid.id);
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, params.email))
    .limit(1);

  if (existing) {
    if (existing.authProviderUid && existing.authProviderUid !== params.providerUid) {
      return null;
    }
    await db
      .update(users)
      .set({ authProviderUid: params.providerUid, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    return resolveUserPolicyContextById(existing.id);
  }

  const baseHandle =
    params.email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9_]/g, "") || "member";

  const [created] = await db
    .insert(users)
    .values({
      authProviderUid: params.providerUid,
      handle: baseHandle,
      fullName: params.fullName ?? baseHandle,
      email: params.email,
      defaultDomain: "engineering",
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create user row");
  }

  const [coreGroup] = await db
    .select()
    .from(policyGroups)
    .where(eq(policyGroups.slug, "core-contributor"))
    .limit(1);

  if (coreGroup) {
    await db
      .insert(userPolicyGroups)
      .values({ userId: created.id, policyGroupId: coreGroup.id })
      .onConflictDoNothing();
  }

  const ctx = await resolveUserPolicyContextById(created.id);
  if (!ctx) {
    throw new Error("Failed to resolve newly created user policy context");
  }
  return ctx;
}
