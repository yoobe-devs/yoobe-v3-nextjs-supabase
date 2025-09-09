"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StoreSettingsSchema,
  StoreSettingsPatchSchema,
  type StoreSettings,
  CouponSchema,
  CampaignSchema,
} from "@/lib/validators/storeSettings";
import ColorField from "@/components/store-editor/ColorField";
import ImageUpload from "@/components/store-editor/ImageUpload";
import PreviewFrame from "@/components/store-editor/PreviewFrame";

type Tab = "identidade" | "cores" | "midia" | "layout" | "cupons" | "campanhas";

export default function StoreEditorPage() {
  const [storeId, setStoreId] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("identidade");
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<StoreSettings | null>(null);
  const [domain, setDomain] = useState<{ domain: string | null; status: string; dns_txt?: string; cname_target?: string } | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(StoreSettingsPatchSchema),
    defaultValues: { store_id: storeId },
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/v2/gestor/store/settings`);
      const data = await res.json();
      if (res.ok) {
        const s = StoreSettingsSchema.parse(data.settings);
        setInitial(s);
        setDomain(data.domain_verification || null);
        setStoreId(s.store_id);
        reset({
          store_id: s.store_id,
          store_name: s.store_name,
          domain_whitelabel: s.domain_whitelabel ?? undefined,
          theme_primary: s.theme_primary,
          theme_secondary: s.theme_secondary,
          theme_bg: s.theme_bg,
          theme_text: s.theme_text,
          button_variant: s.button_variant,
          border_radius: s.border_radius,
          logo_url: s.logo_url ?? undefined,
          favicon_url: s.favicon_url ?? undefined,
          banner_hero_url: s.banner_hero_url ?? undefined,
          banner_secondary_url: s.banner_secondary_url ?? undefined,
          header_variant: s.header_variant,
          home_layout: s.home_layout,
          product_card_variant: s.product_card_variant,
        });
      }
      setLoading(false);
    })();
  }, [storeId, reset]);

  async function onSubmit(values: any) {
    const res = await fetch("/api/v2/gestor/store/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) console.error(await res.json());
  }

  const formValues = watch();

  async function reloadLists() {
    const [c1, c2] = await Promise.all([
      fetch(`/api/v2/gestor/coupons?store_id=${storeId}`).then((r) => r.json()),
      fetch(`/api/v2/gestor/campaigns?store_id=${storeId}`).then((r) => r.json()),
    ]);
    if (c1?.items) setCoupons(c1.items);
    if (c2?.items) setCampaigns(c2.items);
  }

  useEffect(() => {
    if (!loading) reloadLists();
  }, [loading]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "identidade", label: "Identidade" },
    { key: "cores", label: "Cores & Botões" },
    { key: "midia", label: "Banners & Logos" },
    { key: "layout", label: "Layout" },
    { key: "cupons", label: "Cupons" },
    { key: "campanhas", label: "Campanhas" },
  ];

  if (loading || !initial) return <div className="p-6">Carregando…</div>;

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <aside className="col-span-2 space-y-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`w-full text-left px-3 py-2 rounded border ${tab === t.key ? "bg-gray-100" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <div className="pt-4">
          <button className="btn solid" onClick={handleSubmit(onSubmit)}>Salvar</button>
          <button
            className="btn outline ml-2"
            disabled={!domain || domain.status !== "verified"}
            onClick={async () => {
              const res = await fetch("/api/v2/gestor/store/settings/publish", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ store_id: storeId }),
              });
              if (!res.ok) {
                const j = await res.json();
                alert(j.error || "Falha ao publicar");
              } else {
                alert("Publicado e cache invalidado");
              }
            }}
            title={!domain || domain.status !== "verified" ? "Domínio não verificado" : "Publicar"}
          >
            Publicar
          </button>
        </div>
      </aside>
      <section className="col-span-6">
        {tab === "identidade" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nome da loja</label>
              <input className="w-full border rounded px-2 py-1" {...register("store_name")} />
            </div>
            <div>
              <label className="block text-sm font-medium">Domínio</label>
              <input className="w-full border rounded px-2 py-1" placeholder="loja.minhaempresa.com" {...register("domain_whitelabel")} />
              <div className="text-xs text-gray-600 mt-1">
                Status: <b>{domain?.status || "pending"}</b>
                {domain?.domain ? ` • ${domain.domain}` : ""}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 border rounded"
                  onClick={async () => {
                    const d = formValues.domain_whitelabel || initial?.domain_whitelabel;
                    const res = await fetch("/api/v2/gestor/store/domain/start", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ store_id: storeId, domain: d }),
                    });
                    const j = await res.json();
                    if (res.ok) setDomain(j);
                  }}
                >
                  Iniciar verificação
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={async () => {
                    const res = await fetch("/api/v2/gestor/store/domain/verify", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ store_id: storeId }),
                    });
                    const j = await res.json();
                    if (res.ok) setDomain((d) => ({ ...(d || { domain: null as any }), status: j.status }));
                  }}
                >
                  Verificar DNS
                </button>
              </div>
              {domain?.dns_txt && (
                <div className="text-xs text-gray-500 mt-2">
                  Crie um registro TXT com valor: <code>{domain.dns_txt}</code>
                  {domain?.cname_target ? (
                    <>
                      <br />Ou um CNAME apontando para: <code>{domain.cname_target}</code>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "cores" && (
          <div className="grid grid-cols-2 gap-4">
            <ColorField name="theme_primary" label="Primária" control={control} bgRef="theme_bg" />
            <ColorField name="theme_secondary" label="Secundária" control={control} bgRef="theme_bg" />
            <ColorField name="theme_bg" label="Fundo" control={control} />
            <ColorField name="theme_text" label="Texto" control={control} bgRef="theme_bg" />
            <div>
              <label className="block text-sm font-medium">Variante do botão</label>
              <select className="w-full border rounded px-2 py-1" {...register("button_variant")}>
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Raio da borda ({formValues.border_radius ?? 14}px)</label>
              <input type="range" min={0} max={32} defaultValue={14} onChange={(e) => setValue("border_radius", Number(e.target.value))} />
            </div>
          </div>
        )}

        {tab === "midia" && (
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload label="Logo" value={formValues.logo_url} onChange={(url) => setValue("logo_url", url)} kind="logo" />
            <ImageUpload label="Favicon" value={formValues.favicon_url} onChange={(url) => setValue("favicon_url", url)} kind="favicon" />
            <ImageUpload label="Banner Hero" value={formValues.banner_hero_url} onChange={(url) => setValue("banner_hero_url", url)} kind="banner_hero" />
            <ImageUpload label="Banner Secundário" value={formValues.banner_secondary_url} onChange={(url) => setValue("banner_secondary_url", url)} kind="banner_secondary" />
          </div>
        )}

        {tab === "layout" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Header</label>
              <select className="w-full border rounded px-2 py-1" {...register("header_variant")}>
                <option value="logo-left">Logo à esquerda</option>
                <option value="logo-center">Logo centralizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Home layout</label>
              <select className="w-full border rounded px-2 py-1" {...register("home_layout")}>
                <option value="hero+grid+featured">Hero + Grid + Destaques</option>
                <option value="hero+grid">Hero + Grid</option>
                <option value="hero+featured">Hero + Destaques</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Card do produto</label>
              <select className="w-full border rounded px-2 py-1" {...register("product_card_variant")}>
                <option value="default">Padrão</option>
                <option value="compact">Compacto</option>
                <option value="media-heavy">Mídia primeiro</option>
              </select>
            </div>
          </div>
        )}

        {tab === "cupons" && (
          <div className="space-y-4">
            <form
              className="grid grid-cols-6 gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const payload = {
                  store_id: storeId,
                  code: String(fd.get("code") || "").toUpperCase(),
                  kind: String(fd.get("kind") || "percent"),
                  value: Number(fd.get("value") || 0),
                  min_order: fd.get("min_order") ? Number(fd.get("min_order")) : undefined,
                  start_at: fd.get("start_at") ? new Date(String(fd.get("start_at"))).toISOString() : undefined,
                  end_at: fd.get("end_at") ? new Date(String(fd.get("end_at"))).toISOString() : undefined,
                  status: "active",
                };
                const v = CouponSchema.safeParse(payload);
                if (!v.success) return alert("Dados inválidos do cupom");
                const res = await fetch("/api/v2/gestor/coupons", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
                if (res.ok) reloadLists();
                else alert("Erro ao criar cupom");
              }}
            >
              <div className="col-span-2">
                <label className="block text-sm">Código</label>
                <input name="code" className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm">Tipo</label>
                <select name="kind" className="w-full border rounded px-2 py-1">
                  <option value="percent">Percentual</option>
                  <option value="fixed">Valor fixo</option>
                  <option value="free_shipping">Frete grátis</option>
                  <option value="points_bonus">Bônus de pontos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Valor</label>
                <input name="value" type="number" step="0.01" className="w-full border rounded px-2 py-1" defaultValue={0} />
              </div>
              <div>
                <label className="block text-sm">Pedido mínimo</label>
                <input name="min_order" type="number" step="0.01" className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Início</label>
                <input name="start_at" type="datetime-local" className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Fim</label>
                <input name="end_at" type="datetime-local" className="w-full border rounded px-2 py-1" />
              </div>
              <div className="col-span-6">
                <button className="px-3 py-1 border rounded">Criar cupom</button>
              </div>
            </form>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Código</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2 font-mono">{c.code}</td>
                    <td>{c.kind}</td>
                    <td>{c.value}</td>
                    <td>
                      {c.start_at ? new Date(c.start_at).toLocaleString() : ""} - {c.end_at ? new Date(c.end_at).toLocaleString() : ""}
                    </td>
                    <td>{c.status}</td>
                    <td className="text-right">
                      <button
                        className="px-2 py-1 text-xs border rounded mr-2"
                        onClick={async () => {
                          const status = c.status === "paused" ? "active" : "paused";
                          const res = await fetch(`/api/v2/gestor/coupons/${c.id}`, {
                            method: "PATCH",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ status }),
                          });
                          if (res.ok) reloadLists();
                        }}
                      >
                        {c.status === "paused" ? "Retomar" : "Pausar"}
                      </button>
                      <button
                        className="px-2 py-1 text-xs border rounded"
                        onClick={async () => {
                          const res = await fetch(`/api/v2/gestor/coupons/${c.id}`, { method: "DELETE" });
                          if (res.ok) reloadLists();
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "campanhas" && (
          <div className="space-y-4">
            <form
              className="grid grid-cols-6 gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const payload: any = {
                  store_id: storeId,
                  name: String(fd.get("name") || ""),
                  slug: String(fd.get("slug") || ""),
                  starts_at: fd.get("starts_at") ? new Date(String(fd.get("starts_at"))).toISOString() : undefined,
                  ends_at: fd.get("ends_at") ? new Date(String(fd.get("ends_at"))).toISOString() : undefined,
                  theme_overrides: {
                    primary: fd.get("primary") || undefined,
                    bg: fd.get("bg") || undefined,
                    banner_hero_url: fd.get("banner_hero_url") || undefined,
                  },
                };
                const v = CampaignSchema.safeParse(payload);
                if (!v.success) return alert("Dados inválidos da campanha");
                const res = await fetch("/api/v2/gestor/campaigns", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (res.ok) reloadLists();
                else alert("Erro ao criar campanha");
              }}
            >
              <div className="col-span-2">
                <label className="block text-sm">Nome</label>
                <input name="name" className="w-full border rounded px-2 py-1" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm">Slug</label>
                <input name="slug" className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm">Início</label>
                <input name="starts_at" type="datetime-local" className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Fim</label>
                <input name="ends_at" type="datetime-local" className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Cor primária (override)</label>
                <input name="primary" type="color" className="w-16 h-9 border rounded" />
              </div>
              <div>
                <label className="block text-sm">Fundo (override)</label>
                <input name="bg" type="color" className="w-16 h-9 border rounded" />
              </div>
              <div className="col-span-3">
                <label className="block text-sm">Banner Hero URL</label>
                <input name="banner_hero_url" className="w-full border rounded px-2 py-1" />
              </div>
              <div className="col-span-6">
                <button className="px-3 py-1 border rounded">Criar campanha</button>
              </div>
            </form>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Nome</th>
                  <th>Slug</th>
                  <th>Período</th>
                  <th>Ativa</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.name}</td>
                    <td>{c.slug}</td>
                    <td>
                      {c.starts_at ? new Date(c.starts_at).toLocaleString() : ""} - {c.ends_at ? new Date(c.ends_at).toLocaleString() : ""}
                    </td>
                    <td>{c.is_active ? "Sim" : "Não"}</td>
                    <td className="text-right">
                      <button
                        className="px-2 py-1 text-xs border rounded mr-2"
                        onClick={async () => {
                          const url = c.is_active ? `/api/v2/gestor/campaigns/${c.id}/deactivate` : `/api/v2/gestor/campaigns/${c.id}/activate`;
                          const res = await fetch(url, { method: "POST" });
                          if (res.ok) reloadLists();
                        }}
                      >
                        {c.is_active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        className="px-2 py-1 text-xs border rounded"
                        onClick={() => {
                          const iframeUrl = new URL(`/api/v2/store/preview`, window.location.origin);
                          iframeUrl.searchParams.set("store_id", String(storeId));
                          iframeUrl.searchParams.set("campaign_slug", c.slug);
                          window.open(iframeUrl.toString(), "_blank");
                        }}
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <aside className="col-span-4">
        <PreviewFrame storeId={storeId} />
      </aside>
    </div>
  );
}
