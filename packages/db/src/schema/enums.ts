import { pgEnum } from "drizzle-orm/pg-core";

export const commitTypeEnum = pgEnum("commit_type", ["output", "insight"]);

export const workDomainEnum = pgEnum("work_domain", [
  "engineering",
  "research",
  "ops",
  "finance",
  "pitch",
]);

export const commitStatusEnum = pgEnum("commit_status", [
  "pending_coauthor",
  "pending_ai",
  "pending_peer",
  "approved",
  "rejected",
]);

export const coauthorStatusEnum = pgEnum("coauthor_status", [
  "pending",
  "verified",
  "rejected",
  "timed_out",
]);

export const captureSourceEnum = pgEnum("capture_source", [
  "cli",
  "mcp",
  "mac_overlay",
  "telegram",
  "web",
]);

export const artifactSourceTypeEnum = pgEnum("artifact_source_type", [
  "none",
  "github_app",
  "file_upload",
]);

export const cycleStatusEnum = pgEnum("cycle_status", [
  "upcoming",
  "active",
  "closed",
]);
