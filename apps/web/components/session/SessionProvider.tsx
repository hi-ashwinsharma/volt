"use client";

import {
  ApiRoutes,
  type AuthMeResponse,
  type ChildrenProps,
  type PermissionScope,
  type SessionContextValue,
  type SessionStatus,
} from "@volt/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SessionContext } from "@/hooks/useSession";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { clearStoredApiKey, readStoredApiKey, writeStoredApiKey } from "@/lib/session-storage";

export function SessionProvider({ children }: ChildrenProps) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (apiKey: string | null): Promise<boolean> => {
    if (!apiKey) {
      setMe(null);
      setStatus("anonymous");
      return false;
    }
    try {
      const result = await apiRequest<AuthMeResponse>(ApiRoutes.auth.me, {}, apiKey);
      setMe(result);
      setError(null);
      setStatus("authenticated");
      return true;
    } catch (err) {
      setMe(null);
      setError(errorMessage(err as Error));
      setStatus("anonymous");
      return false;
    }
  }, []);

  useEffect(() => {
    void load(readStoredApiKey());
  }, [load]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      me,
      error,
      signIn: async (apiKey: string) => {
        const ok = await load(apiKey.trim());
        if (ok) {
          writeStoredApiKey(apiKey.trim());
        }
        return ok;
      },
      signOut: () => {
        clearStoredApiKey();
        setMe(null);
        setStatus("anonymous");
      },
      hasScope: (scope: PermissionScope) => me?.user.scopes.includes(scope) ?? false,
      refresh: () => void load(readStoredApiKey()),
    }),
    [status, me, error, load],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
