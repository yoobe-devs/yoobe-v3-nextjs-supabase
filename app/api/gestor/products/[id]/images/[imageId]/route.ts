import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-missing'
)

export async function DELETE(_request: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = user.user_metadata?.role
    if (!['manager','gestor','admin','admin_global','superadmin'].includes(role)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    // obter bucket_key para apagar do storage
    const { data: img, error: selErr } = await supabaseService
      .from('client_product_images')
      .select('bucket_key')
      .eq('id', params.imageId)
      .eq('client_product_id', params.id)
      .single()
    if (selErr) return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })

    await supabaseService.from('client_product_images').delete().eq('id', params.imageId).eq('client_product_id', params.id)
    if (img?.bucket_key) await supabaseService.storage.from('product-images').remove([img.bucket_key as any])
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

