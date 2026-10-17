"use client";

import { Alert, Button, Card, Description, Form, Input, Label, TextField } from "@heroui/react";
import { AppRoutes } from "@volt/types";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Brand } from "@/components/shell/Brand";
import { useSession } from "@/hooks/useSession";

export function SignInForm() {
  const { status, error, signIn } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(AppRoutes.home);
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const ok = await signIn(apiKey);
    setPending(false);
    setFailed(!ok);
  };

  return (
    <Card className="w-full max-w-sm">
      <Card.Header className="gap-3">
        <Brand />
        <div className="flex flex-col gap-1">
          <Card.Title>Sign in to your workspace</Card.Title>
          <Card.Description>Use a personal API key from the CLI or an admin.</Card.Description>
        </div>
      </Card.Header>
      <Card.Content>
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField variant="secondary" isRequired name="apiKey" type="password" value={apiKey} onChange={setApiKey}>
            <Label>API key</Label>
            <Input autoComplete="off" placeholder="volt_sk_..." />
            <Description>Create one with `volt auth` or under Settings.</Description>
          </TextField>
          {failed ? (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Sign-in failed</Alert.Title>
                <Alert.Description>{error ?? "The key was not accepted."}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
          <Button fullWidth isDisabled={apiKey.trim().length === 0} isPending={pending} type="submit">
            Continue
          </Button>
        </Form>
      </Card.Content>
    </Card>
  );
}
