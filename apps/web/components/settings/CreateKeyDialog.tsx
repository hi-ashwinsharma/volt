"use client";

import { Plus } from "@gravity-ui/icons";
import { Alert, Button, Description, Form, Input, Label, Modal, TextField, toast } from "@heroui/react";
import { ApiRoutes, type CreateApiKeyResponse, type CreateKeyDialogProps } from "@volt/types";
import { type FormEvent, useState } from "react";

import { apiRequest, errorMessage } from "@/lib/api-client";

export function CreateKeyDialog({ onCreated }: CreateKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSecret(null);
      setLabel("");
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      const res = await apiRequest<CreateApiKeyResponse>(ApiRoutes.auth.apiKeys, {
        method: "POST",
        body: { label: label.trim() },
      });
      setSecret(res.rawSecretKey);
      onCreated();
    } catch (err) {
      toast.danger("Could not create key", { description: errorMessage(err as Error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="secondary" onPress={() => setOpen(true)}>
        <Plus className="size-4" />
        New key
      </Button>
      <Modal.Backdrop isOpen={open} onOpenChange={close}>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{secret ? "Copy your new key" : "Create API key"}</Modal.Heading>
            </Modal.Header>
            {secret ? (
              <Modal.Body className="flex flex-col gap-3">
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>This is the only time the key is shown.</Alert.Title>
                  </Alert.Content>
                </Alert>
                <TextField variant="secondary" isReadOnly value={secret}>
                  <Label>Secret key</Label>
                  <Input className="font-mono" />
                </TextField>
                <Button
                  variant="secondary"
                  onPress={() => void navigator.clipboard.writeText(secret).then(() => toast.success("Copied"))}
                >
                  Copy to clipboard
                </Button>
              </Modal.Body>
            ) : (
              <Form className="contents" onSubmit={submit}>
                <Modal.Body>
                  <TextField variant="secondary" isRequired value={label} onChange={setLabel}>
                    <Label>Label</Label>
                    <Input placeholder="MacBook CLI" />
                    <Description>Name it after the device or client that will use it.</Description>
                  </TextField>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">
                    Cancel
                  </Button>
                  <Button isDisabled={!label.trim()} isPending={pending} type="submit">
                    Create key
                  </Button>
                </Modal.Footer>
              </Form>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
