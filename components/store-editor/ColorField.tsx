"use client";
import { useMemo } from "react";
import { useController, Control } from "react-hook-form";
import { hasAaContrast } from "@/lib/theme/contrast";

type Props = {
  name: string;
  label: string;
  control: Control<any>;
  bgRef?: string;
};

export default function ColorField({ name, label, control, bgRef }: Props) {
  const { field } = useController({ name, control });
  const ok = useMemo(() => {
    if (!bgRef) return true;
    const bg = (control._formValues as any)[bgRef];
    if (typeof field.value !== "string" || typeof bg !== "string") return true;
    return hasAaContrast(field.value, bg);
  }, [field.value, control, bgRef]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="color"
        value={field.value || "#000000"}
        onChange={(e) => field.onChange(e.target.value)}
        className="h-9 w-16 p-0 border rounded"
      />
      {!ok && (
        <p className="text-xs text-red-600">Contraste insuficiente (WCAG AA)</p>
      )}
    </div>
  );
}

