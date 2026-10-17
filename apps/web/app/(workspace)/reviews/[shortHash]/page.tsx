"use client";

import { AppRoutes } from "@volt/types";
import { useParams, useRouter } from "next/navigation";

import { CommitDetailView } from "@/components/commit/CommitDetailView";
import { ReviewPanel } from "@/components/reviews/ReviewPanel";

export default function ReviewDetailPage() {
  const { shortHash } = useParams<{ shortHash: string }>();
  const router = useRouter();
  return (
    <CommitDetailView
      breadcrumbs={[{ label: "Review queue", href: AppRoutes.reviews }]}
      renderAside={(commit) => (
        <ReviewPanel commit={commit} onReviewed={() => router.push(AppRoutes.reviews)} />
      )}
      shortHash={shortHash}
    />
  );
}
