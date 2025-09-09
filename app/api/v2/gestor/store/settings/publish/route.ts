import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { revalidateTag } from "next/cache";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json();
  const store_id = body?.store_id || (session.user.user_metadata as any)?.store_id
  if (!store_id) return NextResponse.json({ error: "store_id required" }, { status: 400 });
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Check domain verification
  const { data, error } = await supabaseService
    .from("domain_verifications")
    .select("status")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const status = data?.[0]?.status || "pending";
  if (status !== "verified") {
    return NextResponse.json({ error: "domain_not_verified" }, { status: 409 });
  }

  try { revalidateTag(`store:${store_id}`); } catch {}
  return NextResponse.json({ ok: true });
}
