"use client";

import { Button, Description, Form, Label, Modal, TextArea, TextField, toast } from "@heroui/react";
import {
  ApiRoutes,
  buildApiRoute,
  type HandshakeDialogProps,
  type VerifyCoAuthorRequest,
  type VerifyCoAuthorResponse,
} from "@volt/types";
import { type FormEvent, useState } from "react";

import { apiRequest, errorMessage } from "@/lib/api-client";

export function HandshakeDialog({ commit, action, onClose, onDone }: HandshakeDialogProps) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const verifying = action === "verify";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body: VerifyCoAuthorRequest = { action, contributionNote: note.trim() || undefined };
    setPending(true);
    try {
      const res = await apiRequest<VerifyCoAuthorResponse>(
        buildApiRoute(ApiRoutes.commits.verifyCoAuthor, { shortHash: commit.shortHash }),
        { method: "POST", body },
      );
      if (verifying && !res.aiValidated) {
        toast.warning("Recorded, but not validated", { description: res.aiValidationReason });
      } else {
        toast.success(verifying ? "Contribution confirmed" : "Tag declined");
      }
      onDone();
    } catch (err) {
      toast.danger("Could not submit", { description: errorMessage(err as Error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => (open ? undefined : onClose())}>
      <Modal.Container placement="auto">
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{verifying ? "Confirm your contribution" : "Decline co-author tag"}</Modal.Heading>
            <Description>{commit.summary}</Description>
          </Modal.Header>
          <Form className="contents" onSubmit={submit}>
            <Modal.Body>
              <TextField variant="secondary" isRequired={verifying} value={note} onChange={setNote}>
                <Label>{verifying ? "What did you contribute?" : "Reason (optional)"}</Label>
                <TextArea rows={3} />
                <Description>
                  {verifying
                    ? "One line. The AI judge checks it against the deliverable before awarding points."
                    : "Helps the author correct the tag."}
                </Description>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button
                isDisabled={verifying && note.trim().length < 5}
                isPending={pending}
                type="submit"
                variant={verifying ? "primary" : "danger"}
              >
                {verifying ? "Confirm" : "Decline"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
