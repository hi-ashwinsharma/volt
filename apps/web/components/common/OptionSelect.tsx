"use client";

import { Description, Label, ListBox, Select } from "@heroui/react";
import type { OptionSelectProps } from "@volt/types";

export function OptionSelect({
  label,
  value,
  options,
  description,
  onSurface = false,
  onChange,
}: OptionSelectProps) {
  return (
    <Select
      className="w-full"
      value={value}
      variant={onSurface ? "secondary" : "primary"}
      onChange={(next) => {
        if (next !== null) {
          onChange(String(next));
        }
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {description ? <Description>{description}</Description> : null}
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
