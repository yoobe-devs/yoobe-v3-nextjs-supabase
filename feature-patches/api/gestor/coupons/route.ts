import { NextRequest, NextResponse } from "next/server";
import { CouponSchema } from "@/lib/validators/storeSettings";
import { supabaseService } from "@/lib/supabase/service";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const storeIdStr = req.nextUrl.searchParams.get("store_id") || (session.user.user_metadata as any)?.store_id;
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const q = req.nextUrl.searchParams.get("q") || undefined;
  if (!storeIdStr) return NextResponse.json({ error: "store_id required" }, { status: 400 });
  const store_id = storeIdStr;
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  let query = supabaseService.from("coupons").select("*").eq("store_id", store_id);
  if (status) query = query.eq("status", status);
  const { data, error } = await query.order("start_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const filtered = (data || []).filter((r: any) => !q || (r.code || "").toLowerCase().includes(q.toLowerCase()));
  return NextResponse.json({ items: filtered, total: filtered.length });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json();
  const parsed = CouponSchema.safeParse({ ...body, store_id: body.store_id || (session.user.user_metadata as any)?.store_id });
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }
  const coupon = parsed.data;
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', coupon.store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const insert = await supabaseService.from("coupons").insert(coupon).select("*").single();
  if (insert.error) {
    const msg = insert.error.message || "insert_error";
    const status = msg.toLowerCase().includes("duplicate") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
  return NextResponse.json(insert.data);
}
