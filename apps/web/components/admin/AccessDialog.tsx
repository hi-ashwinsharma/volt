"use client";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Label,
  Modal,
  toast,
} from "@heroui/react";
import { ApiRoutes, buildApiRoute, type AccessDialogProps } from "@volt/types";
import { useState } from "react";

import { apiRequest, errorMessage } from "@/lib/api-client";

export function AccessDialog({ member, groups, onClose, onSaved }: AccessDialogProps) {
  const [selected, setSelected] = useState<string[]>([...member.groupSlugs]);
  const [pending, setPending] = useState(false);

  const save = async () => {
    setPending(true);
    try {
      await apiRequest(buildApiRoute(ApiRoutes.policies.assignGroup, { userId: member.id }), {
        method: "PUT",
        body: { policyGroupSlugs: selected },
      });
      toast.success(`Access updated for @${member.handle}`);
      onSaved();
    } catch (err) {
      toast.danger("Could not update access", { description: errorMessage(err as Error) });
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
            <Modal.Heading>Edit access</Modal.Heading>
            <Description>
              {member.fullName} (@{member.handle})
            </Description>
          </Modal.Header>
          <Modal.Body>
            <CheckboxGroup value={selected} onChange={setSelected}>
              <Label>Policy groups</Label>
              <Description>Effective permissions are the union of all assigned groups.</Description>
              {groups.map((group) => (
                <Checkbox key={group.slug} value={group.slug}>
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    {group.name}
                  </Checkbox.Content>
                  <Description>{group.description}</Description>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button isPending={pending} onPress={() => void save()}>
              Save
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
