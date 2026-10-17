import type { ReactNode } from "react";

import type { CliStatusOverviewResponse } from "./api.types";
import type { CommitRecord, ScoreAuditRecord, StagedLogRecord } from "./commit.types";
import type { AsyncResource, NavCounts, NavIconKey, StatusMeta } from "./ui.types";

export interface ChildrenProps {
  readonly children: ReactNode;
}

export interface RouteErrorProps {
  readonly error: Error;
  readonly reset: () => void;
}

export interface NavIconProps {
  readonly icon: NavIconKey;
}

export interface NavListProps {
  readonly pathname: string;
  readonly counts: NavCounts;
  readonly onNavigate?: () => void;
}

export interface Breadcrumb {
  readonly label: string;
  readonly href?: string;
}

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly breadcrumbs?: readonly Breadcrumb[];
}

export interface StatusChipProps {
  readonly meta: StatusMeta;
}

export interface StatTileProps {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly isLoading?: boolean;
}

export interface EmptyPanelProps {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}

export interface ErrorPanelProps {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
}

export interface ListSkeletonProps {
  readonly rows?: number;
}

export interface SelectOption {
  readonly id: string;
  readonly label: string;
}

export interface OptionSelectProps {
  readonly label: string;
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly description?: string;
  readonly onSurface?: boolean;
  readonly onChange: (value: string) => void;
}

export interface CommitsTableProps {
  readonly commits: readonly CommitRecord[];
  readonly ariaLabel: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly showAuthor?: boolean;
  readonly detailRoute?: string;
}

export interface CommitFiltersProps {
  readonly status: string;
  readonly domain: string;
  readonly onStatusChange: (value: string) => void;
  readonly onDomainChange: (value: string) => void;
}

export interface CommitFeedState {
  readonly resource: AsyncResource<{ readonly commits: readonly CommitRecord[] }>;
  readonly status: string;
  readonly domain: string;
  readonly setStatus: (value: string) => void;
  readonly setDomain: (value: string) => void;
}

export interface ScoreBreakdownProps {
  readonly audit: ScoreAuditRecord;
}

export interface HomeStatsProps {
  readonly overview: CliStatusOverviewResponse | null;
  readonly isLoading: boolean;
}

export interface StagingPanelProps {
  readonly logs: readonly StagedLogRecord[];
  readonly onChange: () => void;
}

export interface CommitDialogProps {
  readonly stagedCount: number;
  readonly onCommitted: () => void;
}

export interface AttentionCardProps {
  readonly handshakes: readonly CommitRecord[];
}
