import {
  DEFAULT_POLICY_GROUPS,
  isValidPermissionScope,
  resolveEffectiveScopes,
} from "@volt/policy";
import type {
  PermissionScope,
  PolicyDirectoryResponse,
  PolicyGroupRecord,
} from "@volt/types";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../client";
import { policyGroups, userPolicyGroups, users } from "../schema";

export async function seedDefaultPolicyGroups(): Promise<void> {
  const db = getDb();
  for (const group of DEFAULT_POLICY_GROUPS) {
    await db
      .insert(policyGroups)
      .values({
        slug: group.slug,
        name: group.name,
        description: group.description,
        scopes: [...group.scopes],
        isSystem: group.isSystem,
      })
      .onConflictDoUpdate({
        target: policyGroups.slug,
        set: {
          name: group.name,
          description: group.description,
          scopes: [...group.scopes],
        },
      });
  }
}

export async function getPolicyDirectory(): Promise<PolicyDirectoryResponse> {
  const db = getDb();
  const groupRows = await db.select().from(policyGroups);
  const userRows = await db.select().from(users);
  const assignmentRows = await db
    .select({
      userId: userPolicyGroups.userId,
      slug: policyGroups.slug,
      scopes: policyGroups.scopes,
    })
    .from(userPolicyGroups)
    .innerJoin(
      policyGroups,
      eq(userPolicyGroups.policyGroupId, policyGroups.id)
    );

  const groups: PolicyGroupRecord[] = groupRows.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.name,
    description: g.description,
    scopes: g.scopes.filter(isValidPermissionScope),
    isSystem: g.isSystem,
    createdAt: g.createdAt.toISOString(),
  }));

  const directoryUsers = userRows.map((u) => {
    const userAssigns = assignmentRows.filter((a) => a.userId === u.id);
    const directScopes = u.directScopes.filter(isValidPermissionScope);
    const effectiveScopes = resolveEffectiveScopes({
      directScopes,
      groupScopesList: userAssigns.map((a) => a.scopes),
    });

    return {
      id: u.id,
      handle: u.handle,
      fullName: u.fullName,
      email: u.email,
      defaultDomain: u.defaultDomain,
      groupSlugs: userAssigns.map((a) => a.slug),
      directScopes,
      effectiveScopes,
    };
  });

  return { groups, users: directoryUsers };
}

export async function updateUserPolicyGroups(params: {
  readonly userId: string;
  readonly groupSlugs: readonly string[];
  readonly assignedByUserId: string;
}): Promise<void> {
  const db = getDb();
  const matchingGroups = await db
    .select()
    .from(policyGroups)
    .where(inArray(policyGroups.slug, [...params.groupSlugs]));

  await db
    .delete(userPolicyGroups)
    .where(eq(userPolicyGroups.userId, params.userId));

  for (const grp of matchingGroups) {
    await db.insert(userPolicyGroups).values({
      userId: params.userId,
      policyGroupId: grp.id,
      assignedBy: params.assignedByUserId,
    });
  }
}

export async function updateUserDirectScopes(params: {
  readonly userId: string;
  readonly directScopes: readonly PermissionScope[];
}): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({
      directScopes: [...params.directScopes],
      updatedAt: new Date(),
    })
    .where(eq(users.id, params.userId));
}
