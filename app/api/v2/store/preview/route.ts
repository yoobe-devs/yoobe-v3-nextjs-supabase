import { NextRequest, NextResponse } from "next/server";
import { StoreSettingsSchema } from "@/lib/validators/storeSettings";
import { buildEffectiveTheme, tokensToCssVars } from "@/lib/theme/tokens";
import { supabaseService } from "@/lib/supabase/service";

async function fetchSettings(store_id: number) {
  const { data, error } = await supabaseService
    .from("store_settings")
    .select("*")
    .eq("store_id", store_id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  const s =
    data ||
    ({
      store_id,
      store_name: `Loja ${store_id}`,
      domain_whitelabel: null,
      theme_primary: "#2B5BF6",
      theme_secondary: "#111827",
      theme_bg: "#FFFFFF",
      theme_text: "#0F172A",
      button_variant: "solid",
      border_radius: 14,
      logo_url: null,
      favicon_url: null,
      banner_hero_url: null,
      banner_secondary_url: null,
      header_variant: "logo-left",
      home_layout: "hero+grid+featured",
      product_card_variant: "default",
    } as any);
  return StoreSettingsSchema.parse(s);
}

async function fetchCampaignOverrides(store_id: number, slug?: string | null) {
  if (slug) {
    const { data } = await supabaseService
      .from("campaign_versions")
      .select("theme_overrides")
      .eq("store_id", store_id)
      .eq("slug", slug)
      .limit(1);
    return (data?.[0]?.theme_overrides as any) || null;
  }
  const now = new Date().toISOString();
  const { data } = await supabaseService
    .from("campaign_versions")
    .select("theme_overrides")
    .eq("store_id", store_id)
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1);
  return (data?.[0]?.theme_overrides as any) || null;
}

export async function GET(req: NextRequest) {
  const storeIdStr = req.nextUrl.searchParams.get("store_id");
  const campaign_slug = req.nextUrl.searchParams.get("campaign_slug");
  if (!storeIdStr) return NextResponse.json({ error: "store_id required" }, { status: 400 });
  const store_id = storeIdStr;

  const settings = await fetchSettings(store_id);
  const overrides = await fetchCampaignOverrides(store_id, campaign_slug);
  const theme = buildEffectiveTheme(settings, overrides ?? undefined);
  const css = tokensToCssVars(theme);

  const html = `<!doctype html>
  <html lang="pt-BR" data-store-theme="store-${store_id}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Preview Loja</title>
      ${theme.faviconUrl ? `<link rel="icon" href="${theme.faviconUrl}" />` : ""}
      <style>
        :root{${css}}
        body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;margin:0}
        .btn{display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 16px;border-radius:var(--radius);cursor:pointer;border:1px solid transparent}
        .btn.solid{background:var(--brand-primary);color:#fff}
        .btn.outline{background:transparent;border-color:var(--brand-primary);color:var(--brand-primary)}
        .btn.ghost{background:transparent;color:var(--brand-primary)}
        header{display:flex;gap:12px;align-items:center;padding:12px 16px}
        header.logo-left{justify-content:flex-start}
        header.logo-center{justify-content:center}
        .hero{display:grid;place-items:center;height:240px;background:#f5f6f8;margin:0}
        .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:16px}
        .card{border:1px solid #e5e7eb;border-radius:var(--radius);padding:12px}
      </style>
    </head>
    <body>
      <header class="${theme.headerVariant}">
        ${theme.logoUrl ? `<img src="${theme.logoUrl}" alt="logo" style="height:32px"/>` : ""}
        <strong style="margin-left:8px">${settings.store_name}</strong>
      </header>
      <main>
        ${theme.bannerHeroUrl ? `<img src="${theme.bannerHeroUrl}" alt="hero" style="width:100%;height:auto;display:block"/>` : `<section class="hero">Hero</section>`}
        <section class="grid">
          ${Array.from({length:8}).map((_,i)=>`<div class="card">Produto ${i+1}</div>`).join("")}
        </section>
      </main>
    </body>
  </html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html" } });
}
