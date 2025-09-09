"use client";
import { useEffect, useState } from "react";

type Props = { storeId?: string; campaignSlug?: string | null };

const sizes = {
  mobile: 390,
  tablet: 768,
  desktop: 1200,
};

export default function PreviewFrame({ storeId, campaignSlug }: Props) {
  const [device, setDevice] = useState<keyof typeof sizes>("desktop");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!storeId) return;
    const u = new URL(`/api/v2/store/preview`, window.location.origin);
    u.searchParams.set("store_id", storeId);
    if (campaignSlug) u.searchParams.set("campaign_slug", campaignSlug);
    setUrl(u.toString());
  }, [storeId, campaignSlug]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Object.keys(sizes).map((k) => (
          <button
            key={k}
            className={`px-2 py-1 text-sm border rounded ${device === k ? "bg-gray-100" : ""}`}
            onClick={() => setDevice(k as any)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="border rounded overflow-hidden" style={{ width: sizes[device], height: 640 }}>
        {url ? <iframe key={url} src={url} className="w-full h-full" /> : (
          <div className="w-full h-full grid place-items-center text-sm text-gray-500">Carregando preview…</div>
        )}
      </div>
    </div>
  );
}
