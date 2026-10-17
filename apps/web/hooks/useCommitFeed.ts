"use client";

import { ApiRoutes, type CommitFeedState, type CommitRecord } from "@volt/types";
import { useState } from "react";

import { useApiResource } from "./useApiResource";

export function useCommitFeed(limit: number): CommitFeedState {
  const [status, setStatus] = useState("all");
  const [domain, setDomain] = useState("all");
  const params = new URLSearchParams({ limit: String(limit) });
  if (status !== "all") {
    params.set("status", status);
  }
  if (domain !== "all") {
    params.set("domain", domain);
  }
  const resource = useApiResource<{ commits: readonly CommitRecord[] }>(
    `${ApiRoutes.commits.list}?${params.toString()}`,
  );
  return { resource, status, domain, setStatus, setDomain };
}
