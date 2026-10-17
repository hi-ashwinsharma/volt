import { CreateApiKeySchema } from "@volt/config";
import {
  computeCyclePoolShareSummary,
  createPersonalApiKey,
  listCommitFeed,
  listGitHubInstallations,
  listUncommittedStagedLogs,
  listUserApiKeys,
  revokeUserApiKey,
} from "@volt/db";
import {
  ApiRoutes,
  type AuthMeResponse,
  type CliStatusOverviewResponse,
  type HealthCheckResponse,
} from "@volt/types";
import type { FastifyInstance } from "fastify";
import {
  requireAuthenticatedUser,
  requireUserScope,
} from "../plugins/auth.plugin";

export async function registerHealthAndAuthRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(ApiRoutes.health, async (): Promise<HealthCheckResponse> => {
    return {
      status: "ok",
      service: "volt-api",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  });

  app.get(ApiRoutes.auth.me, async (req, reply) => {
    const user = await requireAuthenticatedUser(req, reply);
    if (!user) {
      return;
    }

    const [apiKeys, githubInstallations] = await Promise.all([
      listUserApiKeys(user.userId),
      listGitHubInstallations(),
    ]);

    const response: AuthMeResponse = {
      user,
      apiKeys,
      githubInstallations,
    };
    return reply.send(response);
  });

  app.get(ApiRoutes.auth.statusOverview, async (req, reply) => {
    const user = await requireUserScope(req, reply, "feed:read");
    if (!user) {
      return;
    }

    const [stagedLogs, allCommits, activeCycleSummary] = await Promise.all([
      listUncommittedStagedLogs(user.userId),
      listCommitFeed({ limit: 30 }),
      computeCyclePoolShareSummary(),
    ]);

    const pendingHandshakes = allCommits.filter(
      (c) =>
        c.status === "pending_coauthor" &&
        c.coAuthors.some(
          (co) => co.userId === user.userId && co.status === "pending"
        )
    );

    const recentCommits = allCommits.filter(
      (c) =>
        c.authorId === user.userId ||
        c.coAuthors.some((co) => co.userId === user.userId)
    );

    const overview: CliStatusOverviewResponse = {
      user,
      stagedLogs,
      pendingHandshakes,
      recentCommits,
      activeCycleSummary,
    };
    return reply.send(overview);
  });

  app.post(ApiRoutes.auth.apiKeys, async (req, reply) => {
    const user = await requireAuthenticatedUser(req, reply);
    if (!user) {
      return;
    }

    const parsed = CreateApiKeySchema.parse(req.body);
    const created = await createPersonalApiKey(user.userId, parsed.label);
    return reply.status(201).send(created);
  });

  app.delete(ApiRoutes.auth.revokeApiKey, async (req, reply) => {
    const user = await requireAuthenticatedUser(req, reply);
    if (!user) {
      return;
    }
    const params = req.params as { id: string };
    const revoked = await revokeUserApiKey(user.userId, params.id);
    return reply.send({ revoked });
  });
}
