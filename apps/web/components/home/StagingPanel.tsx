"use client";

import { TrashBin } from "@gravity-ui/icons";
import { Button, Card, Form, Input, ListBox, TextField, toast } from "@heroui/react";
import {
  ApiRoutes,
  buildApiRoute,
  type CreateStageLogRequest,
  type StagingPanelProps,
} from "@volt/types";
import { type FormEvent, useState } from "react";

import { CommitDialog } from "./CommitDialog";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";

export function StagingPanel({ logs, onChange }: StagingPanelProps) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  const stage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body: CreateStageLogRequest = { rawText: text.trim(), source: "web" };
    setPending(true);
    try {
      await apiRequest(ApiRoutes.stage.create, { method: "POST", body });
      setText("");
      onChange();
    } catch (err) {
      toast.danger("Could not stage item", { description: errorMessage(err as Error) });
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiRequest(buildApiRoute(ApiRoutes.stage.delete, { id }), { method: "DELETE" });
      onChange();
    } catch (err) {
      toast.danger("Could not remove item", { description: errorMessage(err as Error) });
    }
  };

  return (
    <Card>
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Card.Title>Staging</Card.Title>
          <Card.Description>
            Log small steps as you go. Bundle them into one scored deliverable when done.
          </Card.Description>
        </div>
        <CommitDialog stagedCount={logs.length} onCommitted={onChange} />
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <Form className="flex gap-2" onSubmit={stage}>
          <TextField variant="secondary" aria-label="New staged item" className="flex-1" value={text} onChange={setText}>
            <Input placeholder="What did you just finish?" />
          </TextField>
          <Button isDisabled={text.trim().length === 0} isPending={pending} type="submit" variant="secondary">
            Stage
          </Button>
        </Form>
        {logs.length === 0 ? (
          <EmptyPanel
            description="Items you log from the CLI, MCP, Mac overlay or here appear in this list."
            title="Nothing staged"
          />
        ) : (
          <ListBox aria-label="Staged items">
            {logs.map((log) => (
              <ListBox.Item key={log.id} id={log.id} textValue={log.rawText}>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{log.rawText}</span>
                  <span className="text-xs text-muted">
                    {log.source.replace("_", " ")} · {formatRelative(log.createdAt)}
                  </span>
                </div>
                <Button
                  isIconOnly
                  aria-label={`Remove "${log.rawText}"`}
                  size="sm"
                  variant="ghost"
                  onPress={() => void remove(log.id)}
                >
                  <TrashBin className="size-4" />
                </Button>
              </ListBox.Item>
            ))}
          </ListBox>
        )}
      </Card.Content>
    </Card>
  );
}
