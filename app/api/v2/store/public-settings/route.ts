import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { StoreSettingsSchema } from "@/lib/validators/storeSettings";
import { buildEffectiveTheme } from "@/lib/theme/tokens";

async function fetchSettings(store_id: string) {
  const { data } = await supabaseService
    .from("store_settings")
    .select("*")
    .eq("store_id", store_id)
    .single();
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

async function fetchOverrides(store_id: string, slug?: string | null) {
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
  const url = new URL(req.url);
  const store_id = url.searchParams.get("store_id");
  const campaign_slug = url.searchParams.get("campaign_slug");
  if (!store_id) return NextResponse.json({ error: "store_id required" }, { status: 400 });
  const settings = await fetchSettings(store_id);
  const overrides = await fetchOverrides(store_id, campaign_slug);
  const theme = buildEffectiveTheme(settings, overrides || undefined);
  return NextResponse.json({ settings, overrides: overrides || {}, theme });
}

