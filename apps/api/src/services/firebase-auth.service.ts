import type { VerifiedExternalIdentity } from "@volt/types";
import { type App, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseApp(projectId: string): App {
  const existing = getApps().find((app) => app.name === "volt-auth");
  return existing ?? initializeApp({ projectId }, "volt-auth");
}

/**
 * Verifies a Firebase ID token (signature, issuer, audience, expiry) against
 * FIREBASE_PROJECT_ID. Returns null for every invalid or unverified token.
 */
export async function verifyFirebaseIdToken(
  token: string
): Promise<VerifiedExternalIdentity | null> {
  const projectId = process.env["FIREBASE_PROJECT_ID"];
  if (!projectId) {
    console.warn("[WARN] FIREBASE_PROJECT_ID is not set; Firebase ID tokens are rejected.");
    return null;
  }
  try {
    const decoded = await getAuth(getFirebaseApp(projectId)).verifyIdToken(token);
    if (!decoded.email || decoded.email_verified !== true) {
      console.warn("[WARN] Firebase ID token rejected: email missing or not verified.");
      return null;
    }
    const name = typeof decoded["name"] === "string" ? decoded["name"] : undefined;
    return {
      providerUid: decoded.uid,
      email: decoded.email.toLowerCase(),
      ...(name ? { fullName: name } : {}),
    };
  } catch (err) {
    const code = (err as { code?: string }).code ?? (err as Error).message;
    console.warn(`[WARN] Firebase ID token rejected: ${code}`);
    return null;
  }
}
