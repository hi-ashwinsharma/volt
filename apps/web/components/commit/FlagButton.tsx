"use client";

import { Flag } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import { ApiRoutes, buildApiRoute, type FlagButtonProps } from "@volt/types";
import { useState } from "react";

import { useSession } from "@/hooks/useSession";
import { apiRequest, errorMessage } from "@/lib/api-client";

export function FlagButton({ commit, onFlagged }: FlagButtonProps) {
  const { hasScope } = useSession();
  const [pending, setPending] = useState(false);

  if (!hasScope("commit:flag_review") || commit.status !== "approved") {
    return null;
  }

  const flag = async () => {
    setPending(true);
    try {
      await apiRequest(buildApiRoute(ApiRoutes.commits.flagForReview, { shortHash: commit.shortHash }), {
        method: "POST",
      });
      toast.warning("Sent to peer review", { description: "A reviewer will audit this score." });
      onFlagged();
    } catch (err) {
      toast.danger("Could not flag", { description: errorMessage(err as Error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button isPending={pending} size="sm" variant="secondary" onPress={() => void flag()}>
      <Flag className="size-4" />
      Flag for review
    </Button>
  );
}
