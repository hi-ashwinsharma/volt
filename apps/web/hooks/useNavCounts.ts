"use client";

import {
  ApiRoutes,
  type CliStatusOverviewResponse,
  type CommitRecord,
  type NavCounts,
} from "@volt/types";

import { useApiResource } from "./useApiResource";
import { useSession } from "./useSession";

export function useNavCounts(): NavCounts {
  const { hasScope } = useSession();
  const overview = useApiResource<CliStatusOverviewResponse>(
    hasScope("stage:write") ? ApiRoutes.auth.statusOverview : null,
  );
  const reviews = useApiResource<{ commits: readonly CommitRecord[] }>(
    hasScope("commit:review_peer") ? `${ApiRoutes.commits.list}?status=pending_peer` : null,
  );
  return {
    handshakes: overview.data?.pendingHandshakes.length ?? 0,
    reviews: reviews.data?.commits.length ?? 0,
  };
}
