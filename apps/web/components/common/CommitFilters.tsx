"use client";

import { COMMIT_STATUSES, WORK_DOMAINS, type CommitFiltersProps } from "@volt/types";

import { OptionSelect } from "./OptionSelect";

import { COMMIT_STATUS_META, DOMAIN_LABELS } from "@/lib/labels";

const ALL = { id: "all", label: "All" };
const STATUS_OPTIONS = [ALL, ...COMMIT_STATUSES.map((id) => ({ id, label: COMMIT_STATUS_META[id].label }))];
const DOMAIN_OPTIONS = [ALL, ...WORK_DOMAINS.map((id) => ({ id, label: DOMAIN_LABELS[id] }))];

export function CommitFilters({ status, domain, onStatusChange, onDomainChange }: CommitFiltersProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-md">
      <OptionSelect label="Status" options={STATUS_OPTIONS} value={status} onChange={onStatusChange} />
      <OptionSelect label="Domain" options={DOMAIN_OPTIONS} value={domain} onChange={onDomainChange} />
    </div>
  );
}
