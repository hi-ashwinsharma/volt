"use client";

import type { ReviewOverridesProps } from "@volt/types";

import { OptionSelect } from "@/components/common/OptionSelect";

const KEEP = { id: "keep", label: "Keep AI value" };
const C_OPTIONS = [KEEP, ...["1", "2", "3", "5", "8", "13"].map((v) => ({ id: v, label: v }))];
const I_OPTIONS = [KEEP, ...["0.5", "1", "1.5", "2", "3"].map((v) => ({ id: v, label: `${v}x` }))];
const E_OPTIONS = [KEEP, ...["0.5", "1", "1.2"].map((v) => ({ id: v, label: `${v}x` }))];

export function ReviewOverrides({ value, onChange }: ReviewOverridesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
      <OptionSelect
        onSurface
        label="Complexity (C)"
        options={C_OPTIONS}
        value={value.c}
        onChange={(c) => onChange({ ...value, c })}
      />
      <OptionSelect
        onSurface
        label="Impact (I)"
        options={I_OPTIONS}
        value={value.i}
        onChange={(i) => onChange({ ...value, i })}
      />
      <OptionSelect
        onSurface
        label="Evidence (E)"
        options={E_OPTIONS}
        value={value.e}
        onChange={(e) => onChange({ ...value, e })}
      />
    </div>
  );
}
