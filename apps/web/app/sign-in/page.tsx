import type { Metadata } from "next";

import { SignInForm } from "@/components/session/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <SignInForm />
    </div>
  );
}
