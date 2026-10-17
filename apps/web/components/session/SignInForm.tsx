"use client";

import { Key, Person } from "@gravity-ui/icons";
import { Button, Card, Disclosure, Separator } from "@heroui/react";
import { AppRoutes } from "@volt/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiKeySignInForm } from "@/components/session/ApiKeySignInForm";
import { EmailLinkSignInForm } from "@/components/session/EmailLinkSignInForm";
import { SignInAlert } from "@/components/session/SignInAlert";
import { Brand } from "@/components/shell/Brand";
import { useSession } from "@/hooks/useSession";

export function SignInForm() {
  const { status, error, firebaseEnabled, signInWithGoogle } = useSession();
  const router = useRouter();
  const [googlePending, setGooglePending] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(AppRoutes.home);
    }
  }, [status, router]);

  const handleGoogle = async () => {
    setGooglePending(true);
    const ok = await signInWithGoogle();
    setGooglePending(false);
    setGoogleFailed(!ok);
  };

  return (
    <Card className="w-full max-w-sm">
      <Card.Header className="gap-3">
        <Brand />
        <div className="flex flex-col gap-1">
          <Card.Title>Sign in to your workspace</Card.Title>
          <Card.Description>
            {firebaseEnabled ? "Use your work Google account or an email link." : "Use a personal API key from the CLI or an admin."}
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {firebaseEnabled ? (
          <>
            <Button fullWidth isPending={googlePending} onPress={handleGoogle}>
              <Person />
              Continue with Google
            </Button>
            {googleFailed ? (
              <SignInAlert status="danger" title="Google sign-in failed" message={error ?? "Try again."} />
            ) : null}
            <Separator />
            <EmailLinkSignInForm />
            <Separator />
            <Disclosure>
              <Disclosure.Heading>
                <Button fullWidth slot="trigger" variant="ghost">
                  <Key />
                  Use a personal API key
                  <Disclosure.Indicator />
                </Button>
              </Disclosure.Heading>
              <Disclosure.Content>
                <Disclosure.Body className="pt-4">
                  <ApiKeySignInForm />
                </Disclosure.Body>
              </Disclosure.Content>
            </Disclosure>
          </>
        ) : (
          <ApiKeySignInForm />
        )}
      </Card.Content>
    </Card>
  );
}
