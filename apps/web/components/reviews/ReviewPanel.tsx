"use client";

import { Alert, Button, Card, Description, Label, Slider, TextArea, TextField, toast } from "@heroui/react";
import {
  ApiRoutes,
  buildApiRoute,
  type PeerReviewCommitRequest,
  type ReviewPanelProps,
} from "@volt/types";
import { useState } from "react";

import { ReviewOverrides } from "./ReviewOverrides";

import { useSession } from "@/hooks/useSession";
import { apiRequest, errorMessage } from "@/lib/api-client";

export function ReviewPanel({ commit, onReviewed }: ReviewPanelProps) {
  const { me } = useSession();
  const [consensus, setConsensus] = useState(1);
  const [overrides, setOverrides] = useState({ c: "keep", i: "keep", e: "keep" });
  const [reasoning, setReasoning] = useState("");
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);

  const userId = me?.user.userId;
  const conflict =
    commit.authorId === userId || commit.coAuthors.some((author) => author.userId === userId);

  if (commit.status !== "pending_peer") {
    return null;
  }
  if (conflict) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>You cannot review this deliverable</Alert.Title>
          <Alert.Description>
            Conflict of interest: you are its author or a co-author. Another reviewer must decide.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  const decide = async (decision: "approve" | "reject") => {
    const body: PeerReviewCommitRequest = {
      decision,
      vConsensus: consensus,
      overrideComplexity: overrides.c === "keep" ? null : (Number(overrides.c) as PeerReviewCommitRequest["overrideComplexity"]),
      overrideImpact: overrides.i === "keep" ? null : (Number(overrides.i) as PeerReviewCommitRequest["overrideImpact"]),
      overrideEvidence: overrides.e === "keep" ? null : (Number(overrides.e) as PeerReviewCommitRequest["overrideEvidence"]),
      reasoning: reasoning.trim(),
    };
    setPending(decision);
    try {
      await apiRequest(buildApiRoute(ApiRoutes.commits.peerReview, { shortHash: commit.shortHash }), {
        method: "POST",
        body,
      });
      toast.success(decision === "approve" ? "Approved" : "Rejected", {
        description: "Your decision was added to the audit trail.",
      });
      onReviewed();
    } catch (err) {
      toast.danger("Review failed", { description: errorMessage(err as Error) });
    } finally {
      setPending(null);
    }
  };

  const noteTooShort = reasoning.trim().length < 5;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Your review</Card.Title>
        <Card.Description>Calibrate the AI score, then approve or reject.</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5">
        <Slider
          maxValue={1.3}
          minValue={0.7}
          step={0.05}
          value={consensus}
          onChange={(value) => {
            if (typeof value === "number") {
              setConsensus(value);
            }
          }}
        >
          <Label>Consensus (V)</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
        <ReviewOverrides value={overrides} onChange={setOverrides} />
        <TextField variant="secondary" isRequired value={reasoning} onChange={setReasoning}>
          <Label>Audit note</Label>
          <TextArea placeholder="Why this decision? Recorded permanently." rows={3} />
          <Description>At least 5 characters. Visible in the immutable audit trail.</Description>
        </TextField>
      </Card.Content>
      <Card.Footer className="flex gap-2">
        <Button
          className="flex-1"
          isDisabled={noteTooShort || pending !== null}
          isPending={pending === "reject"}
          variant="danger-soft"
          onPress={() => void decide("reject")}
        >
          Reject
        </Button>
        <Button
          className="flex-1"
          isDisabled={noteTooShort || pending !== null}
          isPending={pending === "approve"}
          onPress={() => void decide("approve")}
        >
          Approve
        </Button>
      </Card.Footer>
    </Card>
  );
}
