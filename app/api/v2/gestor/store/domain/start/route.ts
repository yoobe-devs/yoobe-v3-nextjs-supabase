import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function normalizeDomain(d: string) {
  return d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { store_id: providedStoreId, domain } = await req.json();
  const store_id = providedStoreId || (session.user.user_metadata as any)?.store_id
  if (!store_id || !domain) {
    return NextResponse.json({ error: "store_id and domain required" }, { status: 400 });
  }
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const d = normalizeDomain(domain);
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(d)) {
    return NextResponse.json({ error: "invalid_domain" }, { status: 400 });
  }
  const dns_txt = `yoobe-${store_id}-${Math.random().toString(36).slice(2, 10)}`;
  const cname_target = `cname.yoobe.app`;
  const { error } = await supabaseService
    .from("domain_verifications")
    .upsert({ store_id, domain: d, status: "pending", dns_txt, cname_target }, { onConflict: "store_id,domain" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Optionally patch store_settings.domain_whitelabel
  await supabaseService.from("store_settings").upsert({ store_id, domain_whitelabel: d }, { onConflict: "store_id" });
  return NextResponse.json({ dns_txt, cname_target, status: "pending", domain: d });
}
