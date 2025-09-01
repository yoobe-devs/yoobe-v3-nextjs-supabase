import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores' }, { status: 403 })
    }

    const body = await request.json()
    const { client_product_id, ean_13 } = body as { client_product_id?: string, ean_13?: string }
    if (!client_product_id || !ean_13) {
      return NextResponse.json({ error: 'client_product_id e ean_13 são obrigatórios' }, { status: 400 })
    }

    // Validação via função SQL
    const { data: isValid, error: valErr } = await supabase.rpc('validate_ean13', { ean: ean_13 })
    if (valErr) throw valErr
    if (!isValid) {
      return NextResponse.json({ error: 'EAN-13 inválido' }, { status: 400 })
    }

    // Verificar unicidade
    const { data: exists, error: existsErr } = await supabase
      .from('ean_registry')
      .select('id')
      .eq('ean_13', ean_13)
      .maybeSingle()
    if (existsErr) throw existsErr
    if (exists) {
      return NextResponse.json({ error: 'EAN-13 já está registrado' }, { status: 409 })
    }

    // Atribuir ao produto e registrar
    const { error: updErr } = await supabase
      .from('client_products')
      .update({ ean_13 })
      .eq('id', client_product_id)
    if (updErr) throw updErr

    const { error: regErr } = await supabase
      .from('ean_registry')
      .insert({ ean_13, client_product_id, status: 'active' })
    if (regErr) throw regErr

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning EAN:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


