import { CreateArtifactUploadUrlSchema } from "@volt/config";
import {
  createArtifactRecord,
  listGitHubInstallations,
  upsertGitHubInstallation,
} from "@volt/db";
import {
  ApiRoutes,
  AppRoutes,
  type CreateArtifactUploadUrlResponse,
} from "@volt/types";
import type { FastifyInstance } from "fastify";
import { requireUserScope } from "../plugins/auth.plugin";
import {
  fetchInstallationRepositories,
  signGitHubOAuthState,
  verifyGitHubOAuthState,
} from "../services/github.service";

export async function registerIntegrationsAndArtifactsRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(ApiRoutes.integrations.githubStatus, async (req, reply) => {
    const user = await requireUserScope(req, reply, "feed:read");
    if (!user) {
      return;
    }
    const installations = await listGitHubInstallations();
    return reply.send({ installations });
  });

  app.get(ApiRoutes.integrations.githubInstallUrl, async (req, reply) => {
    const user = await requireUserScope(req, reply, "github:connect");
    if (!user) {
      return;
    }
    const appSlug = process.env["GITHUB_APP_SLUG"] ?? "volt-impact-engine";
    const state = signGitHubOAuthState(user.userId);
    const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${encodeURIComponent(state)}`;
    return reply.send({ installUrl, state });
  });

  app.get(ApiRoutes.integrations.githubCallback, async (req, reply) => {
    const query = req.query as {
      installation_id?: string;
      state?: string;
    };
    const userId = query.state ? verifyGitHubOAuthState(query.state) : null;
    if (!userId || !query.installation_id) {
      return reply.status(400).send({
        error: "INVALID_GITHUB_OAUTH_STATE",
        message: "GitHub App installation callback state or ID is invalid.",
      });
    }

    const installationId = Number(query.installation_id);
    const ghDetails = await fetchInstallationRepositories(installationId);

    await upsertGitHubInstallation({
      installedByUserId: userId,
      installationId,
      accountLogin: ghDetails.accountLogin,
      accountType: ghDetails.accountType,
      repositoriesSnapshot: ghDetails.repositories,
    });

    const webUrl = process.env["WEB_PUBLIC_URL"] ?? "http://localhost:3000";
    return reply.redirect(
      `${webUrl}${AppRoutes.adminIntegrations}?github=connected`
    );
  });

  app.post(ApiRoutes.artifacts.createUploadUrl, async (req, reply) => {
    const user = await requireUserScope(req, reply, "commit:create");
    if (!user) {
      return;
    }

    const parsed = CreateArtifactUploadUrlSchema.parse(req.body);
    const bucket = process.env["SUPABASE_STORAGE_BUCKET"] ?? "volt-artifacts";
    const storagePath = `${user.userId}/${Date.now()}-${parsed.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const record = await createArtifactRecord({
      uploaderId: user.userId,
      storageBucket: bucket,
      storagePath,
      originalFilename: parsed.filename,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      sha256Checksum: parsed.sha256Checksum,
      extractedMetadata: {
        kind: parsed.filename.endsWith(".ipynb") ? "ipynb" : "document",
        mimeType: parsed.mimeType,
        sizeBytes: parsed.sizeBytes,
        sha256Checksum: parsed.sha256Checksum,
      },
    });

    const supabaseUrl = process.env["SUPABASE_URL"] ?? "http://localhost:8080";
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;

    const response: CreateArtifactUploadUrlResponse = {
      artifactId: record.id,
      uploadUrl,
      storagePath,
      expiresInSeconds: 900,
    };

    return reply.status(201).send(response);
  });
}
