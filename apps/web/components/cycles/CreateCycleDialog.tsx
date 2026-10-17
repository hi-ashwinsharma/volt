"use client";

import { Plus } from "@gravity-ui/icons";
import { Button, Description, Form, Input, Label, Modal, TextField, toast } from "@heroui/react";
import { ApiRoutes, type CreateBillingCycleRequest, type CreateCycleDialogProps } from "@volt/types";
import { type FormEvent, useState } from "react";

import { apiRequest, errorMessage } from "@/lib/api-client";

export function CreateCycleDialog({ onCreated }: CreateCycleDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [pending, setPending] = useState(false);

  const valid = name.trim() && startDate && endDate && endDate > startDate && Number(budget) > 0;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body: CreateBillingCycleRequest = {
      name: name.trim(),
      startDate,
      endDate,
      poolBudget: Number(budget),
    };
    setPending(true);
    try {
      await apiRequest(ApiRoutes.cycles.create, { method: "POST", body });
      toast.success(`Cycle "${body.name}" created`);
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.danger("Could not create cycle", { description: errorMessage(err as Error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button size="sm" onPress={() => setOpen(true)}>
        <Plus className="size-4" />
        New cycle
      </Button>
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New compensation cycle</Modal.Heading>
              <Description>Approved points in this window share the pool budget.</Description>
            </Modal.Header>
            <Form className="contents" onSubmit={submit}>
              <Modal.Body className="flex flex-col gap-4">
                <TextField variant="secondary" isRequired value={name} onChange={setName}>
                  <Label>Name</Label>
                  <Input placeholder="Q1 2027" />
                </TextField>
                <div className="grid grid-cols-2 gap-3">
                  <TextField variant="secondary" isRequired type="date" value={startDate} onChange={setStartDate}>
                    <Label>Start</Label>
                    <Input />
                  </TextField>
                  <TextField variant="secondary" isRequired type="date" value={endDate} onChange={setEndDate}>
                    <Label>End</Label>
                    <Input />
                  </TextField>
                </div>
                <TextField variant="secondary" isRequired type="number" value={budget} onChange={setBudget}>
                  <Label>Pool budget</Label>
                  <Input min={1} placeholder="100000" />
                  <Description>Distributed pro rata to approved points.</Description>
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  Cancel
                </Button>
                <Button isDisabled={!valid} isPending={pending} type="submit">
                  Create cycle
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
