import type { AuthMeResponse } from "./api.types";
import type { PermissionScope } from "./pbac.types";

export type SemanticColor = "default" | "accent" | "success" | "warning" | "danger";

export type NavIconKey =
  | "home"
  | "work"
  | "handshake"
  | "ledger"
  | "review"
  | "cycles"
  | "members"
  | "policies"
  | "integrations"
  | "settings";

export type NavBadgeKey = "handshakes" | "reviews";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: NavIconKey;
  readonly scope: PermissionScope | null;
  readonly badge?: NavBadgeKey;
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}

export interface StatusMeta {
  readonly label: string;
  readonly color: SemanticColor;
  readonly description: string;
}

export interface ScoreFactor {
  readonly symbol: string;
  readonly label: string;
  readonly value: string;
  readonly description: string;
}

export interface AsyncResource<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly reload: () => void;
}

export type SessionStatus = "loading" | "anonymous" | "authenticated";

export interface SessionContextValue {
  readonly status: SessionStatus;
  readonly me: AuthMeResponse | null;
  readonly error: string | null;
  readonly signIn: (apiKey: string) => Promise<boolean>;
  readonly signOut: () => void;
  readonly hasScope: (scope: PermissionScope) => boolean;
  readonly refresh: () => void;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  readonly method?: HttpMethod;
  readonly body?: object;
}

export interface NavCounts {
  readonly handshakes: number;
  readonly reviews: number;
}
