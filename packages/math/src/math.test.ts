import { describe, expect, test } from "bun:test";
import {
  calculateCommitWeightage,
  calculateCyclePoolShare,
  calculateParticipantAllocation,
  calculateTimelinessDecay,
  computeComplexityPower,
  enforceEvidenceCeiling,
} from "./index";

describe("@volt/math — Weightage Engine (W_c)", () => {
  test("computes exact Modified Fibonacci powers (C^1.4)", () => {
    expect(computeComplexityPower(1)).toBe(1.0);
    expect(computeComplexityPower(2)).toBe(2.64);
    expect(computeComplexityPower(3)).toBe(4.66);
    expect(computeComplexityPower(5)).toBe(9.52);
    expect(computeComplexityPower(8)).toBe(18.38);
    expect(computeComplexityPower(13)).toBe(36.26);
  });

  test("auto-approves commits with initial points <= 15.00", () => {
    const res = calculateCommitWeightage({
      complexity: 5,
      impact: 1.5,
      evidence: 1.0,
    });
    expect(res.initialPoints).toBe(14.28);
    expect(res.finalPoints).toBe(14.28);
    expect(res.requiresPeerReviewByThreshold).toBe(false);
  });

  test("routes commits with initial points > 15.00 to peer review", () => {
    const res = calculateCommitWeightage({
      complexity: 8,
      impact: 2.0,
      evidence: 1.2,
    });
    expect(res.initialPoints).toBe(44.11);
    expect(res.finalPoints).toBe(44.11);
    expect(res.requiresPeerReviewByThreshold).toBe(true);
  });

  test("applies consensus modifier V in [0.70, 1.30] and decay D in [0.50, 1.00]", () => {
    const res = calculateCommitWeightage({
      complexity: 8,
      impact: 1.5,
      evidence: 1.0,
      consensus: 1.2,
      decay: 0.9,
    });
    expect(res.initialPoints).toBe(27.57);
    expect(res.finalPoints).toBe(29.78);
  });

  test("enforces evidence ceiling based on artifact verification", () => {
    expect(
      enforceEvidenceCeiling({
        requestedEvidence: 1.2,
        artifactType: "none",
      })
    ).toBe(0.5);

    expect(
      enforceEvidenceCeiling({
        requestedEvidence: 1.0,
        artifactType: "github_app",
        githubMergedAndCiPassed: true,
      })
    ).toBe(1.2);

    expect(
      enforceEvidenceCeiling({
        requestedEvidence: 1.2,
        artifactType: "github_app",
        githubMergedAndCiPassed: false,
      })
    ).toBe(1.0);
  });
});

describe("@volt/math — Timeliness Decay (D)", () => {
  test("returns D = 1.00 for same-day commits in Asia/Kolkata", () => {
    const res = calculateTimelinessDecay({
      workDate: "2026-10-16",
      referenceTimestampIso: "2026-10-16T10:00:00.000Z",
    });
    expect(res.daysLate).toBe(0);
    expect(res.decayFactor).toBe(1.0);
  });

  test("applies -10% linear decay per day late and floors at 0.50", () => {
    const twoDaysLate = calculateTimelinessDecay({
      workDate: "2026-10-14",
      referenceTimestampIso: "2026-10-16T10:00:00.000Z",
    });
    expect(twoDaysLate.daysLate).toBe(2);
    expect(twoDaysLate.decayFactor).toBe(0.8);

    const tenDaysLate = calculateTimelinessDecay({
      workDate: "2026-10-01",
      referenceTimestampIso: "2026-10-16T10:00:00.000Z",
    });
    expect(tenDaysLate.daysLate).toBe(15);
    expect(tenDaysLate.decayFactor).toBe(0.5);
  });
});

describe("@volt/math — Co-Author Allocation & Group Split", () => {
  test("awards 100% point duplication for 1 to 3 verified participants", () => {
    const trio = calculateParticipantAllocation({
      finalCommitScore: 20.0,
      primaryAuthorId: "u1",
      coAuthors: [
        { userId: "u2", status: "verified" },
        { userId: "u3", status: "verified" },
      ],
    });
    expect(trio.verifiedParticipantCount).toBe(3);
    expect(trio.mode).toBe("duplication_100_percent");
    expect(trio.individualAwardPoints).toBe(20.0);
    expect(trio.awards.every((a) => a.awardedPoints === 20.0)).toBe(true);
  });

  test("switches to 3/N split mode when 4+ participants verify", () => {
    const quad = calculateParticipantAllocation({
      finalCommitScore: 20.0,
      primaryAuthorId: "u1",
      coAuthors: [
        { userId: "u2", status: "verified" },
        { userId: "u3", status: "verified" },
        { userId: "u4", status: "verified" },
      ],
    });
    expect(quad.verifiedParticipantCount).toBe(4);
    expect(quad.mode).toBe("group_split_3_over_n");
    expect(quad.individualAwardPoints).toBe(15.0);
  });

  test("excludes rejected or timed_out co-authors from N without penalizing verified trio", () => {
    const quadWithOneTimeout = calculateParticipantAllocation({
      finalCommitScore: 20.0,
      primaryAuthorId: "u1",
      coAuthors: [
        { userId: "u2", status: "verified" },
        { userId: "u3", status: "verified" },
        { userId: "u4", status: "timed_out" },
      ],
    });
    expect(quadWithOneTimeout.verifiedParticipantCount).toBe(3);
    expect(quadWithOneTimeout.mode).toBe("duplication_100_percent");
    expect(quadWithOneTimeout.individualAwardPoints).toBe(20.0);
    const timedOut = quadWithOneTimeout.awards.find((a) => a.userId === "u4");
    expect(timedOut?.awardedPoints).toBe(0);
  });
});

describe("@volt/math — Dynamic Bonus Pool Share", () => {
  test("computes accurate pool share % and payout across domains", () => {
    const summary = calculateCyclePoolShare({
      cycleId: "cycle-1",
      cycleName: "Sprint 14",
      startDate: "2026-10-16",
      endDate: "2026-10-31",
      poolBudget: 10000,
      currency: "USD",
      entries: [
        {
          userId: "u1",
          handle: "ashwin",
          fullName: "Ashwin Sharma",
          avatarUrl: null,
          commitId: "c1",
          domain: "engineering",
          awardedPoints: 60,
          isCollaborative: true,
        },
        {
          userId: "u2",
          handle: "rohan",
          fullName: "Rohan Verma",
          avatarUrl: null,
          commitId: "c2",
          domain: "research",
          awardedPoints: 40,
          isCollaborative: false,
        },
      ],
    });

    expect(summary.totalTeamPoints).toBe(100);
    expect(summary.leaderboard[0]?.handle).toBe("ashwin");
    expect(summary.leaderboard[0]?.poolSharePercent).toBe(60);
    expect(summary.leaderboard[0]?.cyclePayout).toBe(6000);
    expect(summary.leaderboard[1]?.poolSharePercent).toBe(40);
    expect(summary.leaderboard[1]?.cyclePayout).toBe(4000);
  });
});
