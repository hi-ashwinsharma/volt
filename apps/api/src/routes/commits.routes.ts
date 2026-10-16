import {
  CreateCommitSchema,
} from "@volt/config";
import {
  createCommitFromStagedLogs,
  getArtifactRecordById,
  getCommitByShortHash,
  listCommitFeed,
} from "@volt/db";
import {
  ApiRoutes,
  type ArtifactMetadataPayload,
  type ArtifactSourceType,
  type CommitStatus,
  type CreateCommitResponse,
  type WorkDomain,
} from "@volt/types";
import type { FastifyInstance } from "fastify";
import { requireUserScope } from "../plugins/auth.plugin";
import { verifyGitHubPrOrCommitUrl } from "../services/github-verifier.service";
import { cacheStagedLogsSnapshot } from "../services/redis.service";
import { enqueueEvaluateCommitTask } from "../services/tasks.service";

export async function registerCommitRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(ApiRoutes.commits.list, async (req, reply) => {
    const user = await requireUserScope(req, reply, "feed:read");
    if (!user) {
      return;
    }
    const query = req.query as {
      domain?: WorkDomain;
      status?: CommitStatus;
      limit?: string;
    };
    const commits = await listCommitFeed({
      domain: query.domain,
      status: query.status,
      limit: query.limit ? Number(query.limit) : 50,
    });
    return reply.send({ commits });
  });

  app.get(ApiRoutes.commits.detail, async (req, reply) => {
    const user = await requireUserScope(req, reply, "feed:read");
    if (!user) {
      return;
    }
    const params = req.params as { shortHash: string };
    const commit = await getCommitByShortHash(params.shortHash);
    if (!commit) {
      return reply.status(404).send({ error: "COMMIT_NOT_FOUND" });
    }
    return reply.send({ commit });
  });

  app.post(ApiRoutes.commits.create, async (req, reply) => {
    const user = await requireUserScope(req, reply, "commit:create");
    if (!user) {
      return;
    }

    const parsed = CreateCommitSchema.parse(req.body);
    let artifactType: ArtifactSourceType = "none";
    let artifactMetadata: ArtifactMetadataPayload = {};

    if (parsed.githubPrUrl) {
      artifactType = "github_app";
      artifactMetadata = await verifyGitHubPrOrCommitUrl(parsed.githubPrUrl);
    } else if (parsed.uploadedArtifactId) {
      const artifactRecord = await getArtifactRecordById(
        parsed.uploadedArtifactId
      );
      if (artifactRecord) {
        artifactType = "file_upload";
        artifactMetadata = artifactRecord.extractedMetadata;
      }
    }

    const commit = await createCommitFromStagedLogs({
      authorId: user.userId,
      type: parsed.type,
      domain: parsed.domain ?? user.defaultDomain,
      summary: parsed.summary,
      artifactType,
      githubPrUrl: parsed.githubPrUrl ?? null,
      uploadedArtifactId: parsed.uploadedArtifactId ?? null,
      artifactMetadata,
      coAuthorHandles: parsed.coAuthorHandles ?? [],
      workDate: parsed.workDate,
    });

    await cacheStagedLogsSnapshot(user.userId, []);

    if (commit.status === "pending_ai") {
      await enqueueEvaluateCommitTask(commit.shortHash);
    }

    const refreshed =
      (await getCommitByShortHash(commit.shortHash)) ?? commit;

    const response: CreateCommitResponse = {
      id: refreshed.id,
      shortHash: refreshed.shortHash,
      status: refreshed.status,
      type: refreshed.type,
      domain: refreshed.domain,
      summary: refreshed.summary,
      artifactType: refreshed.artifactType,
      bundledLogsCount: refreshed.stagedSnapshot.length,
      coAuthors: refreshed.coAuthors.map((c) => ({
        handle: c.handle,
        status: c.status,
      })),
      coauthorDeadlineAt: refreshed.coauthorDeadlineAt,
      commit: refreshed,
    };

    return reply.status(201).send(response);
  });
}
