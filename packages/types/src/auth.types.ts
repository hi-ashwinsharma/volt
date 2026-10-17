/** Identity proven by an external provider (Firebase Auth today). volt owns users and scopes. */
export interface VerifiedExternalIdentity {
  readonly providerUid: string;
  readonly email: string;
  readonly fullName?: string;
}

/** Public Firebase web app config (safe to ship to the browser). */
export interface FirebaseWebConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly appId: string;
}

/** Where the bearer credential for API calls comes from. */
export type SessionCredentialSource = "firebase" | "api_key";

export interface SignInActions {
  readonly signInWithApiKey: (apiKey: string) => Promise<boolean>;
  readonly signInWithGoogle: () => Promise<boolean>;
  readonly sendEmailSignInLink: (email: string) => Promise<boolean>;
}

export interface SignInAlertProps {
  readonly status: "danger" | "success";
  readonly title: string;
  readonly message: string;
}
