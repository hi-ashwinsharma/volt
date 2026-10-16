import type {
  ArtifactMetadataPayload,
  StagedLogSnapshotItem,
} from "@volt/types";
import {
  boolean,
  date,
  index,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { artifacts } from "./artifacts-github";
import {
  artifactSourceTypeEnum,
  captureSourceEnum,
  coauthorStatusEnum,
  commitStatusEnum,
  commitTypeEnum,
  workDomainEnum,
} from "./enums";
import { users } from "./users-pbac";

export const stagedLogs = pgTable(
  "staged_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientLogId: varchar("client_log_id", { length: 64 }).unique(),
    rawText: text("raw_text").notNull(),
    source: captureSourceEnum("source").notNull(),
    artifactId: uuid("artifact_id").references(() => artifacts.id, {
      onDelete: "set null",
    }),
    githubPrUrl: text("github_pr_url"),
    commitId: uuid("commit_id"),
    committedAt: timestamp("committed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_staged_user_created").on(table.userId, table.createdAt)]
);

export const commits = pgTable(
  "commits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shortHash: varchar("short_hash", { length: 8 }).notNull().unique(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    type: commitTypeEnum("type").notNull().default("output"),
    domain: workDomainEnum("domain").notNull().default("engineering"),
    summary: text("summary").notNull(),
    stagedSnapshot: jsonb("staged_snapshot")
      .$type<readonly StagedLogSnapshotItem[]>()
      .notNull()
      .default([]),
    artifactType: artifactSourceTypeEnum("artifact_type")
      .notNull()
      .default("none"),
    githubPrUrl: text("github_pr_url"),
    uploadedArtifactId: uuid("uploaded_artifact_id").references(
      () => artifacts.id,
      { onDelete: "set null" }
    ),
    artifactMetadata: jsonb("artifact_metadata")
      .$type<ArtifactMetadataPayload>()
      .notNull()
      .default({}),
    status: commitStatusEnum("status").notNull().default("pending_ai"),
    currentWC: numeric("current_w_c", { precision: 8, scale: 2 }),
    authorAwardedPoints: numeric("author_awarded_points", {
      precision: 8,
      scale: 2,
    }),
    verifiedParticipantCount: smallint("verified_participant_count")
      .notNull()
      .default(1),
    workDate: date("work_date", { mode: "string" }).notNull(),
    coauthorDeadlineAt: timestamp("coauthor_deadline_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_commits_author_date").on(table.authorId, table.workDate),
    index("idx_commits_status").on(table.status),
    index("idx_commits_work_date").on(table.workDate),
  ]
);

export const commitCoauthors = pgTable(
  "commit_coauthors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commitId: uuid("commit_id")
      .notNull()
      .references(() => commits.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: coauthorStatusEnum("status").notNull().default("pending"),
    contributionNote: text("contribution_note"),
    aiValidated: boolean("ai_validated"),
    aiValidationReason: text("ai_validation_reason"),
    awardedPoints: numeric("awarded_points", { precision: 8, scale: 2 }),
    notifiedAt: timestamp("notified_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => [
    unique("uq_commit_coauthor").on(table.commitId, table.userId),
    index("idx_coauthors_user_status").on(table.userId, table.status),
  ]
);
