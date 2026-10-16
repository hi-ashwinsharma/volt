import {
  boolean,
  date,
  index,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { commits } from "./commits-ledger";
import { cycleStatusEnum } from "./enums";
import { users } from "./users-pbac";

export const scoreAudits = pgTable(
  "score_audits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commitId: uuid("commit_id")
      .notNull()
      .references(() => commits.id, { onDelete: "cascade" }),
    gradedByUserId: uuid("graded_by_user_id").references(() => users.id),
    isAiGrade: boolean("is_ai_grade").notNull().default(true),
    cComplexity: smallint("c_complexity").notNull(),
    iImpact: numeric("i_impact", { precision: 3, scale: 2 }).notNull(),
    eEvidence: numeric("e_evidence", { precision: 3, scale: 2 }).notNull(),
    vConsensus: numeric("v_consensus", { precision: 3, scale: 2 })
      .notNull()
      .default("1.00"),
    dDecay: numeric("d_decay", { precision: 3, scale: 2 })
      .notNull()
      .default("1.00"),
    initialPoints: numeric("initial_points", {
      precision: 8,
      scale: 2,
    }).notNull(),
    finalPoints: numeric("final_points", { precision: 8, scale: 2 }).notNull(),
    antiGamingFlag: boolean("anti_gaming_flag").notNull().default(false),
    reasoning: text("reasoning").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_score_audits_commit").on(table.commitId, table.createdAt),
  ]
);

export const billingCycles = pgTable(
  "billing_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    poolBudget: numeric("pool_budget", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    currency: varchar("currency", { length: 10 }).notNull().default("USD"),
    status: cycleStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_billing_cycles_dates").on(table.startDate, table.endDate),
  ]
);
