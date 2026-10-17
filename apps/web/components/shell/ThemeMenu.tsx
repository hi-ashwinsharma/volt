"use client";

import { Display, Moon, Sun } from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { id: "system", label: "System", Icon: Display },
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
] as const;

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((option) => option.id === theme) ?? OPTIONS[0];

  return (
    <Dropdown>
      <Button isIconOnly aria-label="Change appearance" size="sm" variant="ghost">
        {mounted ? <current.Icon className="size-4" /> : <Display className="size-4" />}
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label="Appearance"
          selectedKeys={mounted ? new Set([current.id]) : new Set()}
          selectionMode="single"
          onAction={(key) => setTheme(String(key))}
        >
          {OPTIONS.map(({ id, label, Icon }) => (
            <Dropdown.Item key={id} id={id} textValue={label}>
              <Icon className="size-4 shrink-0 text-muted" />
              <Label>{label}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
