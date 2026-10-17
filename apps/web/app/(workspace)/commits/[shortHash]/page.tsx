"use client";

import { AppRoutes } from "@volt/types";
import { useParams } from "next/navigation";

import { CommitDetailView } from "@/components/commit/CommitDetailView";

export default function CommitDetailPage() {
  const { shortHash } = useParams<{ shortHash: string }>();
  return (
    <CommitDetailView
      breadcrumbs={[{ label: "Ledger", href: AppRoutes.ledger }]}
      shortHash={shortHash}
    />
  );
}
