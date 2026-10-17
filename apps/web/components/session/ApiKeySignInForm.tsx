"use client";

import { Button, Description, Form, Input, Label, TextField } from "@heroui/react";
import { type FormEvent, useState } from "react";

import { SignInAlert } from "@/components/session/SignInAlert";
import { useSession } from "@/hooks/useSession";

export function ApiKeySignInForm() {
  const { error, firebaseEnabled, signInWithApiKey } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const ok = await signInWithApiKey(apiKey);
    setPending(false);
    setFailed(!ok);
  };

  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField variant="secondary" isRequired name="apiKey" type="password" value={apiKey} onChange={setApiKey}>
        <Label>API key</Label>
        <Input autoComplete="off" placeholder="volt_sk_..." />
        <Description>Create one with `volt auth` or under Settings.</Description>
      </TextField>
      {failed ? (
        <SignInAlert status="danger" title="Sign-in failed" message={error ?? "The key was not accepted."} />
      ) : null}
      <Button fullWidth variant={firebaseEnabled ? "secondary" : "primary"} isDisabled={apiKey.trim().length === 0} isPending={pending} type="submit">
        Sign in with API key
      </Button>
    </Form>
  );
}
