"use client";

import { Envelope } from "@gravity-ui/icons";
import { Button, Form, Input, Label, TextField } from "@heroui/react";
import { type FormEvent, useState } from "react";

import { SignInAlert } from "@/components/session/SignInAlert";
import { useSession } from "@/hooks/useSession";

export function EmailLinkSignInForm() {
  const { error, sendEmailSignInLink } = useSession();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<"idle" | "sent" | "failed">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const ok = await sendEmailSignInLink(email);
    setPending(false);
    setOutcome(ok ? "sent" : "failed");
  };

  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField variant="secondary" isRequired name="email" type="email" value={email} onChange={setEmail}>
        <Label>Work email</Label>
        <Input autoComplete="email" placeholder="you@company.com" />
      </TextField>
      {outcome === "sent" ? (
        <SignInAlert status="success" title="Check your inbox" message={`We sent a sign-in link to ${email.trim()}.`} />
      ) : null}
      {outcome === "failed" ? (
        <SignInAlert status="danger" title="Could not send the link" message={error ?? "Try again shortly."} />
      ) : null}
      <Button fullWidth variant="secondary" isDisabled={email.trim().length === 0} isPending={pending} type="submit">
        <Envelope />
        Email me a sign-in link
      </Button>
    </Form>
  );
}
