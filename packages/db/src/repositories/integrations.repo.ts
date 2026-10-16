import type {
  ArtifactMetadataPayload,
  GitHubAppInstallationRecord,
  GitHubRepositorySummary,
  UploadedArtifactRecord,
} from "@volt/types";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../client";
import { artifacts, githubInstallations } from "../schema";

export async function upsertGitHubInstallation(params: {
  readonly installedByUserId: string;
  readonly installationId: number;
  readonly accountLogin: string;
  readonly accountType: "User" | "Organization";
  readonly repositoriesSnapshot: readonly GitHubRepositorySummary[];
}): Promise<GitHubAppInstallationRecord> {
  const db = getDb();
  const [upserted] = await db
    .insert(githubInstallations)
    .values({
      installedByUserId: params.installedByUserId,
      installationId: params.installationId,
      accountLogin: params.accountLogin,
      accountType: params.accountType,
      repositoriesSnapshot: params.repositoriesSnapshot,
    })
    .onConflictDoUpdate({
      target: githubInstallations.installationId,
      set: {
        accountLogin: params.accountLogin,
        repositoriesSnapshot: params.repositoriesSnapshot,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!upserted) {
    throw new Error("Failed to upsert GitHub installation");
  }

  return {
    id: upserted.id,
    installedByUserId: upserted.installedByUserId,
    installationId: upserted.installationId,
    accountLogin: upserted.accountLogin,
    accountType: upserted.accountType as "User" | "Organization",
    repositoriesSnapshot: upserted.repositoriesSnapshot,
    suspendedAt: upserted.suspendedAt?.toISOString() ?? null,
    createdAt: upserted.createdAt.toISOString(),
    updatedAt: upserted.updatedAt.toISOString(),
  };
}

export async function listGitHubInstallations(): Promise<
  GitHubAppInstallationRecord[]
> {
  const db = getDb();
  const rows = await db
    .select()
    .from(githubInstallations)
    .orderBy(desc(githubInstallations.createdAt));

  return rows.map((r) => ({
    id: r.id,
    installedByUserId: r.installedByUserId,
    installationId: r.installationId,
    accountLogin: r.accountLogin,
    accountType: r.accountType as "User" | "Organization",
    repositoriesSnapshot: r.repositoriesSnapshot,
    suspendedAt: r.suspendedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createArtifactRecord(params: {
  readonly uploaderId: string;
  readonly storageBucket: string;
  readonly storagePath: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256Checksum: string;
  readonly extractedMetadata?: ArtifactMetadataPayload;
}): Promise<UploadedArtifactRecord> {
  const db = getDb();
  const [inserted] = await db
    .insert(artifacts)
    .values({
      uploaderId: params.uploaderId,
      storageBucket: params.storageBucket,
      storagePath: params.storagePath,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      sha256Checksum: params.sha256Checksum,
      extractedMetadata: params.extractedMetadata ?? {},
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to insert artifact record");
  }

  return {
    id: inserted.id,
    uploaderId: inserted.uploaderId,
    storageBucket: inserted.storageBucket,
    storagePath: inserted.storagePath,
    originalFilename: inserted.originalFilename,
    mimeType: inserted.mimeType,
    sizeBytes: inserted.sizeBytes,
    sha256Checksum: inserted.sha256Checksum,
    extractedMetadata: inserted.extractedMetadata,
    createdAt: inserted.createdAt.toISOString(),
  };
}

export async function getArtifactRecordById(
  artifactId: string
): Promise<UploadedArtifactRecord | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(artifacts)
    .where(eq(artifacts.id, artifactId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    uploaderId: row.uploaderId,
    storageBucket: row.storageBucket,
    storagePath: row.storagePath,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    sha256Checksum: row.sha256Checksum,
    extractedMetadata: row.extractedMetadata,
    createdAt: row.createdAt.toISOString(),
  };
}
