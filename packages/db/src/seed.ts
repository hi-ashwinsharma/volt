import { formatDateInTimezone } from "@volt/math";
import { eq, inArray } from "drizzle-orm";
import { closeDbConnection, getDb } from "./client";
import { createPersonalApiKey } from "./repositories/api-keys.repo";
import { seedDefaultPolicyGroups } from "./repositories/policy-admin.repo";
import { billingCycles, policyGroups, userPolicyGroups, users } from "./schema";

export async function seedInitialWorkspace(params?: {
  readonly adminHandle?: string;
  readonly adminFullName?: string;
  readonly adminEmail?: string;
  readonly createInitialApiKey?: boolean;
}): Promise<{
  readonly adminUserId: string;
  readonly adminHandle: string;
  readonly initialApiKey?: string;
}> {
  const db = getDb();
  await seedDefaultPolicyGroups();

  const handle = params?.adminHandle ?? "ashwin";
  const fullName = params?.adminFullName ?? "Ashwin Sharma";
  const email = params?.adminEmail ?? "hi.ashwinsharma@gmail.com";

  const [upsertedAdmin] = await db
    .insert(users)
    .values({
      handle,
      fullName,
      email,
      defaultDomain: "engineering",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.handle,
      set: {
        fullName,
        email,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!upsertedAdmin) {
    throw new Error("Failed to seed admin user");
  }

  const groupRows = await db
    .select()
    .from(policyGroups)
    .where(
      inArray(policyGroups.slug, [
        "core-contributor",
        "peer-reviewer",
        "pool-manager",
        "policy-admin",
      ])
    );

  for (const grp of groupRows) {
    await db
      .insert(userPolicyGroups)
      .values({
        userId: upsertedAdmin.id,
        policyGroupId: grp.id,
        assignedBy: upsertedAdmin.id,
      })
      .onConflictDoNothing();
  }

  const existingCycles = await db
    .select()
    .from(billingCycles)
    .where(eq(billingCycles.status, "active"))
    .limit(1);

  if (existingCycles.length === 0) {
    const todayIst = formatDateInTimezone(new Date(), "Asia/Kolkata");
    const endDateObj = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const endDateIst = formatDateInTimezone(endDateObj, "Asia/Kolkata");

    await db.insert(billingCycles).values({
      name: `Sprint Cycle (${todayIst} to ${endDateIst})`,
      startDate: todayIst,
      endDate: endDateIst,
      poolBudget: "25000.00",
      currency: "USD",
      status: "active",
      createdBy: upsertedAdmin.id,
    });
  }

  let initialApiKey: string | undefined;
  if (params?.createInitialApiKey) {
    const createdKey = await createPersonalApiKey(
      upsertedAdmin.id,
      "Bootstrap CLI & MCP Key"
    );
    initialApiKey = createdKey.rawSecretKey;
  }

  return {
    adminUserId: upsertedAdmin.id,
    adminHandle: upsertedAdmin.handle,
    initialApiKey,
  };
}

if (import.meta.main) {
  seedInitialWorkspace({ createInitialApiKey: true })
    .then(async (res) => {
      console.log(
        `[OK] Seeded policy groups, active cycle, and admin @${res.adminHandle}.`
      );
      if (res.initialApiKey) {
        console.log(`[KEY] Initial Personal API Key: ${res.initialApiKey}`);
      }
      await closeDbConnection();
    })
    .catch(async (err: Error) => {
      console.error("[ERROR] Seed failed:", err.message);
      await closeDbConnection();
      process.exit(1);
    });
}
