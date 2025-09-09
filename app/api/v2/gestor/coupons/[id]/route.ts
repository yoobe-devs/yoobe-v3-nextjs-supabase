import { NextRequest, NextResponse } from "next/server";
import { CouponSchema } from "@/lib/validators/storeSettings";
import { supabaseService } from "@/lib/supabase/service";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const body = await req.json();
  const parsed = CouponSchema.partial({ id: true, store_id: true }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  // Ensure coupon belongs to user's store/company
  const { data: c } = await supabaseService.from('coupons').select('store_id').eq('id', id).single()
  if (!c?.store_id) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', c.store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const upd = await supabaseService.from("coupons").update(parsed.data).eq("id", id).select("*").single();
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
  return NextResponse.json(upd.data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  // Ownership check
  const { data: c } = await supabaseService.from('coupons').select('store_id').eq('id', id).single()
  if (!c?.store_id) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', c.store_id).single()
  if (!storeRec || !me || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const del = await supabaseService.from("coupons").delete().eq("id", id);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
