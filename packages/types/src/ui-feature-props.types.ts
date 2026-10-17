import type { ReactNode } from "react";

import type { PolicyDirectoryResponse } from "./api.types";
import type { CoAuthorRecord, CommitRecord, ScoreAuditRecord } from "./commit.types";
import type { UserApiKeyRecord } from "./domain.types";
import type { CyclePoolShareSummary } from "./math.types";
import type { PolicyGroupRecord } from "./pbac.types";
import type { Breadcrumb } from "./ui-props.types";

export interface CommitDetailViewProps {
  readonly shortHash: string;
  readonly breadcrumbs: readonly Breadcrumb[];
  readonly renderAside?: (commit: CommitRecord, reload: () => void) => ReactNode;
}

export interface CommitDetailsCardProps {
  readonly commit: CommitRecord;
}

export interface CoAuthorsCardProps {
  readonly coAuthors: readonly CoAuthorRecord[];
}

export interface AuditTrailProps {
  readonly audits: readonly ScoreAuditRecord[];
}

export interface FlagButtonProps {
  readonly commit: CommitRecord;
  readonly onFlagged: () => void;
}

export type HandshakeAction = "verify" | "reject";

export interface HandshakeTarget {
  readonly commit: CommitRecord;
  readonly action: HandshakeAction;
}

export interface HandshakeDialogProps extends HandshakeTarget {
  readonly onClose: () => void;
  readonly onDone: () => void;
}

export interface ReviewPanelProps {
  readonly commit: CommitRecord;
  readonly onReviewed: () => void;
}

export interface ReviewOverrideValues {
  readonly c: string;
  readonly i: string;
  readonly e: string;
}

export interface ReviewOverridesProps {
  readonly value: ReviewOverrideValues;
  readonly onChange: (value: ReviewOverrideValues) => void;
}

export interface PoolShareTableProps {
  readonly summary: CyclePoolShareSummary;
}

export interface CycleStatsProps {
  readonly summary: CyclePoolShareSummary;
}

export interface CreateCycleDialogProps {
  readonly onCreated: () => void;
}

export type DirectoryMember = PolicyDirectoryResponse["users"][number];

export interface AccessDialogProps {
  readonly member: DirectoryMember;
  readonly groups: readonly PolicyGroupRecord[];
  readonly onClose: () => void;
  readonly onSaved: () => void;
}

export interface ApiKeysCardProps {
  readonly apiKeys: readonly UserApiKeyRecord[];
  readonly onChange: () => void;
}

export interface CreateKeyDialogProps {
  readonly onCreated: () => void;
}
