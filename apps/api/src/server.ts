import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { registerHealthAndAuthRoutes } from "./routes/auth.routes";
import { registerCommitGovernanceRoutes } from "./routes/commits-governance.routes";
import { registerCommitRoutes } from "./routes/commits.routes";
import { registerCyclesAndPoliciesRoutes } from "./routes/cycles-policies.routes";
import { registerIntegrationsAndArtifactsRoutes } from "./routes/integrations.routes";
import { registerStageRoutes } from "./routes/stage.routes";
import { registerWebhooksAndWorkerRoutes } from "./workers/webhooks-workers.routes";

export async function buildApiServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env["NODE_ENV"] !== "test",
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.setErrorHandler((error: Error, _req, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        issues: error.issues,
      });
    }
    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  });

  await registerHealthAndAuthRoutes(app);
  await registerStageRoutes(app);
  await registerCommitRoutes(app);
  await registerCommitGovernanceRoutes(app);
  await registerIntegrationsAndArtifactsRoutes(app);
  await registerCyclesAndPoliciesRoutes(app);
  await registerWebhooksAndWorkerRoutes(app);

  return app;
}

if (import.meta.main) {
  const port = Number(process.env["PORT"] ?? 8080);
  buildApiServer()
    .then(async (app) => {
      await app.listen({ port, host: "0.0.0.0" });
      console.log(`[OK] Volt Fastify 5 API Server listening on port ${port}`);
    })
    .catch((err: Error) => {
      console.error("[FATAL] Failed to start API server:", err.message);
      process.exit(1);
    });
}
