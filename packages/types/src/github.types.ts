export type GitHubAccountType = "User" | "Organization";

export interface GitHubRepositorySummary {
  readonly id: number;
  readonly name: string;
  readonly fullName: string;
  readonly private: boolean;
  readonly htmlUrl: string;
}

export interface GitHubAppInstallationRecord {
  readonly id: string;
  readonly installedByUserId: string;
  readonly installationId: number;
  readonly accountLogin: string;
  readonly accountType: GitHubAccountType;
  readonly repositoriesSnapshot: readonly GitHubRepositorySummary[];
  readonly suspendedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PrVerificationMetadata {
  readonly provider: "github_app";
  readonly owner: string;
  readonly repo: string;
  readonly prNumber: number | null;
  readonly commitSha: string | null;
  readonly title: string;
  readonly state: "open" | "closed";
  readonly merged: boolean;
  readonly ciPassed: boolean;
  readonly additions: number;
  readonly deletions: number;
  readonly changedFiles: number;
  readonly authorLogin: string;
  readonly headSha: string;
  readonly htmlUrl: string;
}

export interface NotebookExtractedMetadata {
  readonly kind: "ipynb";
  readonly codeCellCount: number;
  readonly markdownCellCount: number;
  readonly executedCellCount: number;
  readonly outputSnippets: readonly string[];
}

export interface DocumentExtractedMetadata {
  readonly kind: "document" | "image" | "spreadsheet";
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256Checksum: string;
  readonly summaryHint?: string;
}

export type ArtifactMetadataPayload =
  | PrVerificationMetadata
  | NotebookExtractedMetadata
  | DocumentExtractedMetadata
  | Record<string, string | number | boolean | null>;

export interface UploadedArtifactRecord {
  readonly id: string;
  readonly uploaderId: string;
  readonly storageBucket: string;
  readonly storagePath: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256Checksum: string;
  readonly extractedMetadata: ArtifactMetadataPayload;
  readonly createdAt: string;
}
