import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseService } from "@/lib/supabase/service";
import { getImageSizeFromBuffer } from "@/lib/images/dimensions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart_required" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "");
  let storeId = String(form.get("store_id") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_missing" }, { status: 400 });
  }
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: me } = await supabase.from('users').select('role, company_id, store_id').eq('id', session.user.id).single()
  if (!me || !['manager','gestor'].includes(me.role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  if (!storeId) storeId = (session.user.user_metadata as any)?.store_id || me.store_id
  if (!storeId) return NextResponse.json({ error: 'store_id required' }, { status: 400 })
  const { data: storeRec } = await supabaseService.from('stores').select('company_id').eq('id', storeId).single()
  if (!storeRec || storeRec.company_id !== me.company_id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  if (!/[a-z_]+/.test(kind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  const info = getImageSizeFromBuffer(buf);
  if (!info) return NextResponse.json({ error: 'invalid_image' }, { status: 400 })
  // Validate by kind
  if (kind === 'logo') {
    if (info.width < 64 || info.height < 64 || info.width > 2048 || info.height > 2048) {
      return NextResponse.json({ error: 'logo_dimensions_invalid' }, { status: 400 })
    }
  } else if (kind === 'favicon') {
    if (info.width !== info.height || info.width < 32 || info.width > 128) {
      return NextResponse.json({ error: 'favicon_dimensions_invalid' }, { status: 400 })
    }
  } else if (kind === 'banner_hero') {
    const ratio = info.width && info.height ? info.width / info.height : 0;
    if (info.width < 1200 || ratio < 1.75 || ratio > 1.85) { // approx 16:9
      return NextResponse.json({ error: 'banner_hero_dimensions_invalid' }, { status: 400 })
    }
  }

  const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `${storeId}/${kind}/${name}`
  const bucket = 'store-themes'
  const { error: upErr } = await supabaseService.storage.from(bucket).upload(path, buf, { contentType: file.type, upsert: true })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  const { data: pub } = supabaseService.storage.from(bucket).getPublicUrl(path)
  const url = pub.publicUrl

  return NextResponse.json({ url, kind });
}
