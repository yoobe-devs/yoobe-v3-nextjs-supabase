import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-missing'
)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = user.user_metadata?.role
    if (!['manager','gestor','admin','admin_global','superadmin'].includes(role)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const form = await request.formData()
    const files = form.getAll('files') as File[]
    if (!files || files.length === 0) return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })

    const uploaded: any[] = []
    let sortOrderBase = 1

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = (file.name || 'img').split('.').pop() || 'jpg'
      const key = `client-products/${params.id}/${Date.now()}_${i}.${ext}`
      const arrayBuffer = await file.arrayBuffer()
      const { error: upErr } = await supabaseService.storage.from('product-images').upload(key, Buffer.from(arrayBuffer), {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })
      if (upErr) return NextResponse.json({ error: `Falha upload: ${upErr.message}` }, { status: 500 })
      const { data: pub } = supabaseService.storage.from('product-images').getPublicUrl(key)
      const { data: img, error: insErr } = await supabaseService
        .from('client_product_images')
        .insert({ client_product_id: params.id, image_url: pub.publicUrl, bucket_key: key, is_cover: false, sort_order: sortOrderBase + i })
        .select('*')
        .single()
      if (insErr) return NextResponse.json({ error: `Falha ao registrar imagem: ${insErr.message}` }, { status: 500 })
      uploaded.push(img)
    }

    return NextResponse.json({ images: uploaded })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

