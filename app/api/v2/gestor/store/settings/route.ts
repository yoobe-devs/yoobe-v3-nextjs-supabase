import { NextRequest, NextResponse } from "next/server";
import { StoreSettingsPatchSchema, StoreSettingsSchema } from "@/lib/validators/storeSettings";
import { supabaseService } from "@/lib/supabase/service";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidateTag } from "next/cache";

// NOTE: Replace stubs with your DB access layer
async function getStoreSettings(store_id: number) {
  const { data, error } = await supabaseService
    .from("store_settings")
    .select("*")
    .eq("store_id", store_id)
    .single();
  if (error && error.code !== "PGRST116") throw error; // not found vs other errors
  if (!data) {
    // Minimal defaults if not configured yet
    return {
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
    } as any;
  }
  return data as any;
}

async function getDomainStatus(store_id: number) {
  const { data } = await supabaseService
    .from("domain_verifications")
    .select("domain,status,dns_txt,cname_target,created_at")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as any) || null;
}

async function getActiveCampaign(store_id: number) {
  const now = new Date().toISOString();
  const { data } = await supabaseService
    .from("campaign_versions")
    .select("id,slug,theme_overrides,starts_at,ends_at,is_active")
    .eq("store_id", store_id)
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1);
  return (data?.[0] as any) || null;
}

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  let store_id = url.searchParams.get('store_id') || (session.user.user_metadata as any)?.store_id
  if (!store_id) {
    const { data: s } = await supabase.from('stores').select('id').eq('company_id', (session.user.user_metadata as any)?.company_id).limit(1)
    store_id = s?.[0]?.id
  }
  if (!store_id) return NextResponse.json({ error: 'store_id required' }, { status: 400 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const settings = await getStoreSettings(store_id);
  const parsed = StoreSettingsSchema.parse(settings);
  const domain_verification = await getDomainStatus(store_id);
  const active_campaign = await getActiveCampaign(store_id);

  return NextResponse.json({ settings: parsed, domain_verification, active_campaign });
}

export async function PATCH(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json();
  const parsed = StoreSettingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }
  const patch = { ...parsed.data, store_id: parsed.data.store_id || (session.user.user_metadata as any)?.store_id };
  if (!patch.store_id) return NextResponse.json({ error: 'store_id required' }, { status: 400 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', patch.store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  // Upsert settings row by store_id
  const { error } = await supabaseService
    .from("store_settings")
    .upsert({ ...patch, updated_at: new Date().toISOString() }, { onConflict: "store_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try { revalidateTag(`store:${patch.store_id}`) } catch {}
  return NextResponse.json({ ok: true });
}
