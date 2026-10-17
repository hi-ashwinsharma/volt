"use client";

import { CodeCommit } from "@gravity-ui/icons";
import {
  Button,
  Description,
  Form,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import {
  ApiRoutes,
  COMMIT_TYPES,
  WORK_DOMAINS,
  type CommitDialogProps,
  type CommitType,
  type CreateCommitRequest,
  type CreateCommitResponse,
  type WorkDomain,
} from "@volt/types";
import { type FormEvent, useState } from "react";

import { OptionSelect } from "@/components/common/OptionSelect";

import { useSession } from "@/hooks/useSession";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { COMMIT_TYPE_LABELS, DOMAIN_LABELS } from "@/lib/labels";

const TYPE_OPTIONS = COMMIT_TYPES.map((id) => ({ id, label: COMMIT_TYPE_LABELS[id] }));
const DOMAIN_OPTIONS = WORK_DOMAINS.map((id) => ({ id, label: DOMAIN_LABELS[id] }));

export function CommitDialog({ stagedCount, onCommitted }: CommitDialogProps) {
  const { me } = useSession();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CommitType>("output");
  const [domain, setDomain] = useState<WorkDomain>(me?.user.defaultDomain ?? "engineering");
  const [summary, setSummary] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [coAuthors, setCoAuthors] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body: CreateCommitRequest = {
      type,
      domain,
      summary: summary.trim(),
      githubPrUrl: prUrl.trim() || null,
      coAuthorHandles: coAuthors
        .split(",")
        .map((handle) => handle.trim().replace(/^@/, ""))
        .filter(Boolean),
    };
    setPending(true);
    try {
      const res = await apiRequest<CreateCommitResponse>(ApiRoutes.commits.create, {
        method: "POST",
        body,
      });
      toast.success(`Committed ${res.shortHash}`, {
        description: `${res.bundledLogsCount} staged items bundled and sent for scoring.`,
      });
      setSummary("");
      setPrUrl("");
      setCoAuthors("");
      setOpen(false);
      onCommitted();
    } catch (err) {
      toast.danger("Commit failed", { description: errorMessage(err as Error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button isDisabled={stagedCount === 0} size="sm" onPress={() => setOpen(true)}>
        <CodeCommit className="size-4" />
        Commit {stagedCount > 0 ? `(${stagedCount})` : ""}
      </Button>
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Commit staged work</Modal.Heading>
              <Description>
                Bundles {stagedCount} staged items into one deliverable for scoring.
              </Description>
            </Modal.Header>
            <Form className="contents" onSubmit={submit}>
              <Modal.Body className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <OptionSelect
                    onSurface
                    label="Type"
                    options={TYPE_OPTIONS}
                    value={type}
                    onChange={(v) => setType(v as CommitType)}
                  />
                  <OptionSelect
                    onSurface
                    label="Domain"
                    options={DOMAIN_OPTIONS}
                    value={domain}
                    onChange={(v) => setDomain(v as WorkDomain)}
                  />
                </div>
                <TextField variant="secondary" isRequired value={summary} onChange={setSummary}>
                  <Label>Summary</Label>
                  <TextArea placeholder="What was delivered and why it matters" rows={3} />
                </TextField>
                <TextField variant="secondary" type="url" value={prUrl} onChange={setPrUrl}>
                  <Label>GitHub pull request</Label>
                  <Input placeholder="https://github.com/org/repo/pull/123" />
                  <Description>Verified PRs raise the evidence multiplier to 1.0x or 1.2x.</Description>
                </TextField>
                <TextField variant="secondary" value={coAuthors} onChange={setCoAuthors}>
                  <Label>Co-authors</Label>
                  <Input placeholder="@handle, @handle" />
                  <Description>Each co-author has 24 hours to confirm.</Description>
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  Cancel
                </Button>
                <Button isDisabled={summary.trim().length < 5} isPending={pending} type="submit">
                  Commit
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
