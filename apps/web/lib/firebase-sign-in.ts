import { AppRoutes } from "@volt/types";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase-client";

const EMAIL_STORAGE_KEY = "volt.emailForSignIn";

export async function startGoogleSignIn(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Google sign-in is not configured for this deployment.");
  }
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function startEmailLinkSignIn(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Email sign-in is not configured for this deployment.");
  }
  await sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}${AppRoutes.signIn}`,
    handleCodeInApp: true,
  });
  try {
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
  } catch {
    // Without storage the link still works; the user is asked for the email again.
  }
}

/**
 * Completes an email-link sign-in when the current URL is one. Throws when the link
 * was opened in a different browser than the one that requested it.
 */
export async function completeEmailLinkSignIn(): Promise<boolean> {
  const auth = getFirebaseAuth();
  const href = window.location.href;
  if (!auth || !isSignInWithEmailLink(auth, href)) {
    return false;
  }
  let email: string | null = null;
  try {
    email = window.localStorage.getItem(EMAIL_STORAGE_KEY);
  } catch {
    email = null;
  }
  if (!email) {
    throw new Error("Open the sign-in link in the browser where you requested it, or request a new link.");
  }
  await signInWithEmailLink(auth, email, href);
  try {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
  window.history.replaceState(null, "", AppRoutes.signIn);
  return true;
}

export async function signOutOfFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}
