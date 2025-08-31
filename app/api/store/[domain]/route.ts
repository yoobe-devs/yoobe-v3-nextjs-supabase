import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar dados da loja pública
export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Buscar loja pelo domínio
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select(`
        *,
        companies (
          id,
          name,
          email,
          phone,
          address,
          city,
          state
        )
      `)
      .eq('domain', params.domain)
      .eq('status', 'active')
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('Erro na API da loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
