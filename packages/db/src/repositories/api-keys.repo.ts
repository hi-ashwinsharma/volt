import type { UserApiKeyRecord } from "@volt/types";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../client";
import { userApiKeys } from "../schema";
import { generateRawVoltApiKey } from "./users.repo";

export async function createPersonalApiKey(
  userId: string,
  label: string
): Promise<{
  readonly apiKey: UserApiKeyRecord;
  readonly rawSecretKey: string;
}> {
  const db = getDb();
  const { rawSecretKey, keyPrefix, keyHash } = generateRawVoltApiKey();
  const [inserted] = await db
    .insert(userApiKeys)
    .values({
      userId,
      label,
      keyPrefix,
      keyHash,
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to insert personal API key");
  }

  return {
    rawSecretKey,
    apiKey: {
      id: inserted.id,
      userId: inserted.userId,
      label: inserted.label,
      keyPrefix: inserted.keyPrefix,
      lastUsedAt: inserted.lastUsedAt?.toISOString() ?? null,
      revokedAt: inserted.revokedAt?.toISOString() ?? null,
      createdAt: inserted.createdAt.toISOString(),
    },
  };
}

export async function listUserApiKeys(
  userId: string
): Promise<UserApiKeyRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(userApiKeys)
    .where(eq(userApiKeys.userId, userId))
    .orderBy(desc(userApiKeys.createdAt));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    label: r.label,
    keyPrefix: r.keyPrefix,
    lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
    revokedAt: r.revokedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function revokeUserApiKey(
  userId: string,
  keyId: string
): Promise<boolean> {
  const db = getDb();
  const updated = await db
    .update(userApiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(userApiKeys.id, keyId), eq(userApiKeys.userId, userId)))
    .returning();
  return updated.length > 0;
}
