import type { FirebaseWebConfig } from "@volt/types";
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";

// Dot access so Next.js inlines the public values at build time.
const config: FirebaseWebConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const isFirebaseConfigured = Object.values(config).every((value) => value.length > 0);

let cachedAuth: Auth | null = null;

/** Returns the Firebase Auth instance in the browser, or null when unconfigured or on the server. */
export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured || typeof window === "undefined") {
    return null;
  }
  if (!cachedAuth) {
    const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

/** Current Firebase ID token; the SDK refreshes it when it is near expiry. */
export async function readFirebaseIdToken(): Promise<string | null> {
  const user = getFirebaseAuth()?.currentUser;
  return user ? user.getIdToken() : null;
}
