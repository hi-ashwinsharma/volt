import type {
  AllocationBreakdown,
  ParticipantAward,
  ParticipantShareInput,
} from "@volt/types";
import { roundToTwoDecimals } from "./weightage";

export function calculateParticipantAllocation(
  input: ParticipantShareInput
): AllocationBreakdown {
  const uniqueCoAuthors = input.coAuthors.filter(
    (co) => co.userId !== input.primaryAuthorId
  );

  const verifiedCoAuthors = uniqueCoAuthors.filter(
    (co) => co.status === "verified"
  );

  const verifiedParticipantCount = 1 + verifiedCoAuthors.length;
  const isDuplicationMode = verifiedParticipantCount <= 3;
  const mode = isDuplicationMode
    ? "duplication_100_percent"
    : "group_split_3_over_n";

  const individualAwardPoints = isDuplicationMode
    ? roundToTwoDecimals(input.finalCommitScore)
    : roundToTwoDecimals(
        (input.finalCommitScore * 3) / verifiedParticipantCount
      );

  const awards: ParticipantAward[] = [
    {
      userId: input.primaryAuthorId,
      role: "primary_author",
      status: "verified",
      awardedPoints: individualAwardPoints,
    },
  ];

  for (const co of uniqueCoAuthors) {
    awards.push({
      userId: co.userId,
      role: "co_author",
      status: co.status,
      awardedPoints: co.status === "verified" ? individualAwardPoints : 0,
    });
  }

  return {
    finalCommitScore: roundToTwoDecimals(input.finalCommitScore),
    verifiedParticipantCount,
    mode,
    individualAwardPoints,
    awards,
  };
}
