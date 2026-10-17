"use client";

import { ArrowRightFromSquare, Gear } from "@gravity-ui/icons";
import { Avatar, Button, Description, Dropdown, Label } from "@heroui/react";
import { AppRoutes } from "@volt/types";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/useSession";
import { initials } from "@/lib/format";

export function UserMenu() {
  const { me, signOut } = useSession();
  const router = useRouter();

  if (!me) {
    return null;
  }

  const handleAction = (key: string | number) => {
    if (key === "settings") {
      router.push(AppRoutes.settings);
    } else if (key === "sign-out") {
      signOut();
      router.replace(AppRoutes.signIn);
    }
  };

  return (
    <Dropdown>
      <Button fullWidth className="justify-start gap-2.5" size="lg" variant="ghost">
        <Avatar size="sm">
          <Avatar.Fallback>{initials(me.user.handle)}</Avatar.Fallback>
        </Avatar>
        <span className="flex min-w-0 flex-col items-start">
          <span className="truncate text-sm font-medium">@{me.user.handle}</span>
          <span className="truncate text-xs text-muted">{me.user.email}</span>
        </span>
      </Button>
      <Dropdown.Popover placement="top start">
        <Dropdown.Menu aria-label="Account" onAction={handleAction}>
          <Dropdown.Item id="settings" textValue="Settings">
            <Gear className="size-4 shrink-0 text-muted" />
            <div className="flex flex-col">
              <Label>Settings</Label>
              <Description>Profile, API keys, appearance</Description>
            </div>
          </Dropdown.Item>
          <Dropdown.Item id="sign-out" textValue="Sign out" variant="danger">
            <ArrowRightFromSquare className="size-4 shrink-0 text-danger" />
            <Label>Sign out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
