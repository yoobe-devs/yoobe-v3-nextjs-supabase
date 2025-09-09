import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import dns from 'node:dns/promises'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { store_id } = await req.json();
  if (!store_id) return NextResponse.json({ error: "store_id required" }, { status: 400 });
  // Optional ownership check by joining with stores via domain_verifications.store_id
  const { data: st } = await supabaseService.from('stores').select('company_id').eq('id', store_id).single()
  if (!st) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { data, error } = await supabaseService
    .from("domain_verifications")
    .select("id,domain,dns_txt,cname_target")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "domain_not_started" }, { status: 400 });

  const { id, domain, dns_txt, cname_target } = data[0] as any
  // Try to resolve TXT and CNAME
  let txtOk = false, cnameOk = false
  try {
    const txts = await dns.resolveTxt(domain)
    txtOk = txts.some((arr) => arr.join('').includes(dns_txt))
  } catch {}
  try {
    const cnames = await dns.resolveCname(domain)
    cnameOk = cnames.some((c) => c.toLowerCase() === String(cname_target || '').toLowerCase())
  } catch {}
  if (!txtOk && !cnameOk) return NextResponse.json({ error: 'dns_not_verified', details: { txtOk, cnameOk } }, { status: 409 })

  const { error: upErr } = await supabaseService
    .from("domain_verifications")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("id", id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  return NextResponse.json({ status: "verified" });
}
