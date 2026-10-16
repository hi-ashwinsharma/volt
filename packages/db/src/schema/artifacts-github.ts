import type {
  ArtifactMetadataPayload,
  GitHubRepositorySummary,
} from "@volt/types";
import {
  bigint,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users-pbac";

export const githubInstallations = pgTable("github_installations", {
  id: uuid("id").primaryKey().defaultRandom(),
  installedByUserId: uuid("installed_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  installationId: bigint("installation_id", { mode: "number" })
    .notNull()
    .unique(),
  accountLogin: varchar("account_login", { length: 100 }).notNull(),
  accountType: varchar("account_type", { length: 32 }).notNull(),
  repositoriesSnapshot: jsonb("repositories_snapshot")
    .$type<readonly GitHubRepositorySummary[]>()
    .notNull()
    .default([]),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const artifacts = pgTable("artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploaderId: uuid("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storageBucket: varchar("storage_bucket", { length: 100 })
    .notNull()
    .default("volt-artifacts"),
  storagePath: text("storage_path").notNull().unique(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  sha256Checksum: varchar("sha256_checksum", { length: 64 }).notNull(),
  extractedMetadata: jsonb("extracted_metadata")
    .$type<ArtifactMetadataPayload>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
