import { describe, expect, test } from "bun:test";
import {
  AiJudgeEvaluationSchema,
  CreateCommitSchema,
  VerifyCoAuthorSchema,
} from "./index";

describe("@volt/config — Zod Validation Schemas", () => {
  test("normalizes coAuthorHandles by stripping leading @ and lowercasing", () => {
    const parsed = CreateCommitSchema.parse({
      type: "output",
      domain: "engineering",
      summary: "Implemented sliding window rate limiter with Upstash Redis",
      coAuthorHandles: ["@Rohan", "Alex"],
    });
    expect(parsed.coAuthorHandles).toEqual(["rohan", "alex"]);
  });

  test("enforces contributionNote when VerifyCoAuthorSchema action is verify", () => {
    expect(() =>
      VerifyCoAuthorSchema.parse({
        action: "verify",
      })
    ).toThrow();

    const validReject = VerifyCoAuthorSchema.parse({
      action: "reject",
    });
    expect(validReject.action).toBe("reject");
  });

  test("validates strict AI Judge JSON output schema", () => {
    const valid = AiJudgeEvaluationSchema.parse({
      c_complexity: 8,
      i_impact: 2.0,
      e_evidence: 1.2,
      reasoning: "Verified merged PR with passing CI check runs.",
      requires_human_review: true,
      anti_gaming_flag: false,
    });
    expect(valid.c_complexity).toBe(8);
  });
});
