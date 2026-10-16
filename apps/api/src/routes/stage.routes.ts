import {
  BatchSyncStageLogsSchema,
  CreateStageLogSchema,
} from "@volt/config";
import {
  batchInsertStagedLogs,
  deleteUncommittedStagedLog,
  insertSingleStagedLog,
  listUncommittedStagedLogs,
} from "@volt/db";
import {
  ApiRoutes,
  type StageLogsMutationResponse,
} from "@volt/types";
import type { FastifyInstance } from "fastify";
import { requireUserScope } from "../plugins/auth.plugin";
import { cacheStagedLogsSnapshot } from "../services/redis.service";

export async function registerStageRoutes(app: FastifyInstance): Promise<void> {
  app.get(ApiRoutes.stage.list, async (req, reply) => {
    const user = await requireUserScope(req, reply, "stage:write");
    if (!user) {
      return;
    }
    const logs = await listUncommittedStagedLogs(user.userId);
    await cacheStagedLogsSnapshot(user.userId, logs);
    return reply.send({ logs });
  });

  app.post(ApiRoutes.stage.create, async (req, reply) => {
    const user = await requireUserScope(req, reply, "stage:write");
    if (!user) {
      return;
    }

    const parsed = CreateStageLogSchema.parse(req.body);
    const created = await insertSingleStagedLog(user.userId, parsed);
    const allLogs = await listUncommittedStagedLogs(user.userId);
    await cacheStagedLogsSnapshot(user.userId, allLogs);

    const response: StageLogsMutationResponse = {
      stagedCount: allLogs.length,
      syncedClientLogIds: created.clientLogId ? [created.clientLogId] : [],
      logs: allLogs,
    };
    return reply.status(201).send(response);
  });

  app.post(ApiRoutes.stage.batchSync, async (req, reply) => {
    const user = await requireUserScope(req, reply, "stage:write");
    if (!user) {
      return;
    }

    const parsed = BatchSyncStageLogsSchema.parse(req.body);
    const result = await batchInsertStagedLogs(user.userId, parsed.logs);
    await cacheStagedLogsSnapshot(user.userId, result.logs);

    const response: StageLogsMutationResponse = {
      stagedCount: result.logs.length,
      syncedClientLogIds: result.syncedClientLogIds,
      logs: result.logs,
    };
    return reply.status(201).send(response);
  });

  app.delete(ApiRoutes.stage.delete, async (req, reply) => {
    const user = await requireUserScope(req, reply, "stage:write");
    if (!user) {
      return;
    }
    const params = req.params as { id: string };
    const deleted = await deleteUncommittedStagedLog(user.userId, params.id);
    const allLogs = await listUncommittedStagedLogs(user.userId);
    await cacheStagedLogsSnapshot(user.userId, allLogs);
    return reply.send({ deleted, stagedCount: allLogs.length });
  });
}
