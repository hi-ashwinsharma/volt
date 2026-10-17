"use client";

import {
  ApiRoutes,
  type AuthMeResponse,
  type ChildrenProps,
  type PermissionScope,
  type SessionContextValue,
  type SessionStatus,
} from "@volt/types";
import { onIdTokenChanged } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SessionContext } from "@/hooks/useSession";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { getFirebaseAuth, isFirebaseConfigured, readFirebaseIdToken } from "@/lib/firebase-client";
import {
  completeEmailLinkSignIn,
  signOutOfFirebase,
  startEmailLinkSignIn,
  startGoogleSignIn,
} from "@/lib/firebase-sign-in";
import { clearStoredApiKey, readStoredApiKey, writeStoredApiKey } from "@/lib/session-storage";

export function SessionProvider({ children }: ChildrenProps) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (bearer: string | null): Promise<boolean> => {
    if (!bearer) {
      setMe(null);
      setStatus("anonymous");
      return false;
    }
    try {
      const result = await apiRequest<AuthMeResponse>(ApiRoutes.auth.me, {}, bearer);
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

  const runFirebaseStep = useCallback(async (step: () => Promise<void>): Promise<boolean> => {
    try {
      await step();
      setError(null);
      return true;
    } catch (err) {
      setError(errorMessage(err as Error));
      return false;
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      void load(readStoredApiKey());
      return undefined;
    }
    void completeEmailLinkSignIn().catch((err: Error) => setError(errorMessage(err)));
    // Fires on sign-in, sign-out and every hourly token refresh.
    return onIdTokenChanged(auth, (user) => {
      void (async () => load(user ? await user.getIdToken() : readStoredApiKey()))();
    });
  }, [load]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      me,
      error,
      firebaseEnabled: isFirebaseConfigured,
      signInWithApiKey: async (apiKey: string) => {
        const ok = await load(apiKey.trim());
        if (ok) {
          writeStoredApiKey(apiKey.trim());
        }
        return ok;
      },
      signInWithGoogle: () => runFirebaseStep(startGoogleSignIn),
      sendEmailSignInLink: (email: string) => runFirebaseStep(() => startEmailLinkSignIn(email.trim())),
      signOut: () => {
        clearStoredApiKey();
        void signOutOfFirebase();
        setMe(null);
        setStatus("anonymous");
      },
      hasScope: (scope: PermissionScope) => me?.user.scopes.includes(scope) ?? false,
      refresh: () => void (async () => load((await readFirebaseIdToken()) ?? readStoredApiKey()))(),
    }),
    [status, me, error, load, runFirebaseStep],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
