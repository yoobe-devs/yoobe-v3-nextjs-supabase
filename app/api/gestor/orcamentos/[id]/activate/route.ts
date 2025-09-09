import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const service = createClient(supabaseUrl, serviceKey)

function isUuid(v: any) {
  return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v)
}

async function authUser(request: NextRequest) {
  const sb = createRouteHandlerClient({ cookies })
  let { data: { user }, error } = await sb.auth.getUser()
  if (!user) {
    const h = request.headers.get('authorization')
    if (h?.startsWith('Bearer ')) {
      const tok = h.substring(7)
      const info = await service.auth.getUser(tok)
      user = info.data.user || null
      error = info.error || null
    }
  }
  return { user, error }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authUser(request)
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = (user.user_metadata as any)?.role
    if (!['gestor', 'manager', 'admin', 'admin_global', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const budgetId = params.id
    if (!isUuid(budgetId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    const companyId = (user.user_metadata as any)?.company_id
    if (!isUuid(companyId)) return NextResponse.json({ error: 'Empresa inválida' }, { status: 400 })

    // Carregar itens do orçamento
    const { data: items, error: iErr } = await service
      .from('budget_items')
      .select('base_product_id')
      .eq('budget_id', budgetId)
    if (iErr) return NextResponse.json({ error: 'Erro ao carregar itens' }, { status: 500 })

    const baseIds = (items || []).map(it => it.base_product_id)
    if (baseIds.length === 0) return NextResponse.json({ success: true, updated: 0 })

    // Ativar produtos replicados correspondentes
    const { data: upd, error: uErr } = await service
      .from('client_products')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('client_id', companyId)
      .in('base_product_id', baseIds)
      .select('id')

    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 })

    return NextResponse.json({ success: true, updated: (upd || []).length })
  } catch (e) {
    console.error('activate budget products error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

