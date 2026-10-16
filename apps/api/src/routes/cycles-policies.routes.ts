import {
  CreateBillingCycleSchema,
  UpdateDirectScopesSchema,
  UpdatePolicyGroupAssignmentSchema,
} from "@volt/config";
import {
  computeCyclePoolShareSummary,
  createBillingCycle,
  getPolicyDirectory,
  listBillingCycles,
  updateUserDirectScopes,
  updateUserPolicyGroups,
} from "@volt/db";
import { ApiRoutes } from "@volt/types";
import type { FastifyInstance } from "fastify";
import { requireUserScope } from "../plugins/auth.plugin";
import { invalidateUserPolicyCache } from "../services/redis.service";

export async function registerCyclesAndPoliciesRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(ApiRoutes.cycles.list, async (req, reply) => {
    const user = await requireUserScope(req, reply, "cycle:read");
    if (!user) {
      return;
    }
    const cycles = await listBillingCycles();
    return reply.send({ cycles });
  });

  app.get(ApiRoutes.cycles.activePoolShare, async (req, reply) => {
    const user = await requireUserScope(req, reply, "cycle:read");
    if (!user) {
      return;
    }
    const summary = await computeCyclePoolShareSummary();
    return reply.send({ summary });
  });

  app.get(ApiRoutes.cycles.detailPoolShare, async (req, reply) => {
    const user = await requireUserScope(req, reply, "cycle:read");
    if (!user) {
      return;
    }
    const params = req.params as { id: string };
    const summary = await computeCyclePoolShareSummary(params.id);
    if (!summary) {
      return reply.status(404).send({ error: "CYCLE_NOT_FOUND" });
    }
    return reply.send({ summary });
  });

  app.post(ApiRoutes.cycles.create, async (req, reply) => {
    const user = await requireUserScope(req, reply, "cycle:manage");
    if (!user) {
      return;
    }
    const parsed = CreateBillingCycleSchema.parse(req.body);
    const cycle = await createBillingCycle(user.userId, parsed);
    return reply.status(201).send({ cycle });
  });

  app.get(ApiRoutes.cycles.exportCsv, async (req, reply) => {
    const user = await requireUserScope(req, reply, "cycle:manage");
    if (!user) {
      return;
    }
    const params = req.params as { id: string };
    const summary = await computeCyclePoolShareSummary(params.id);
    if (!summary) {
      return reply.status(404).send({ error: "CYCLE_NOT_FOUND" });
    }

    const header =
      "Handle,FullName,ApprovedCommits,TotalCyclePoints,PoolSharePercent,CyclePayout,Currency";
    const lines = summary.leaderboard.map(
      (r) =>
        `${r.handle},"${r.fullName}",${r.approvedCommitsCount},${r.totalCyclePoints},${r.poolSharePercent},${r.cyclePayout},${summary.currency}`
    );
    const csv = [header, ...lines].join("\n");

    return reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header(
        "Content-Disposition",
        `attachment; filename="volt-cycle-${summary.cycleId}.csv"`
      )
      .send(csv);
  });

  app.get(ApiRoutes.policies.groups, async (req, reply) => {
    const user = await requireUserScope(req, reply, "feed:read");
    if (!user) {
      return;
    }
    const directory = await getPolicyDirectory();
    return reply.send(directory);
  });

  app.put(ApiRoutes.policies.assignGroup, async (req, reply) => {
    const user = await requireUserScope(req, reply, "policy:admin");
    if (!user) {
      return;
    }
    const params = req.params as { userId: string };
    const parsed = UpdatePolicyGroupAssignmentSchema.parse(req.body);
    await updateUserPolicyGroups({
      userId: params.userId,
      groupSlugs: parsed.policyGroupSlugs,
      assignedByUserId: user.userId,
    });
    await invalidateUserPolicyCache(params.userId);
    const directory = await getPolicyDirectory();
    return reply.send(directory);
  });

  app.put(ApiRoutes.policies.updateDirectScopes, async (req, reply) => {
    const user = await requireUserScope(req, reply, "policy:admin");
    if (!user) {
      return;
    }
    const params = req.params as { userId: string };
    const parsed = UpdateDirectScopesSchema.parse(req.body);
    await updateUserDirectScopes({
      userId: params.userId,
      directScopes: parsed.directScopes,
    });
    await invalidateUserPolicyCache(params.userId);
    const directory = await getPolicyDirectory();
    return reply.send(directory);
  });
}
