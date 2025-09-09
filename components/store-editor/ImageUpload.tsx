"use client";
import { useState } from "react";

type Props = {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  kind: "logo" | "favicon" | "banner_hero" | "banner_secondary";
};

export default function ImageUpload({ label, value, onChange, kind }: Props) {
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    form.set("kind", kind);
    setUploading(true);
    try {
      const res = await fetch("/api/v2/gestor/store/upload-asset", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) onChange(data.url);
      else console.error(data);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value && (
        <img src={value} alt={label} className="max-h-24 rounded border" />
      )}
      <input type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
    </div>
  );
}
