import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseService = createClient(supabaseUrl, serviceKey)

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  let { data: { user }, error } = await supabase.auth.getUser()
  if (!user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const info = await supabaseService.auth.getUser(token)
      user = info.data.user || null
      error = info.error || null
    }
  }
  return { user, error }
}

// POST - Enviar orçamento para aprovação (muda status para 'pending')
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id
    if (!isValidUuid(budgetId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const { user, error } = await authenticateUser(request)
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const role = (user.user_metadata as any)?.role
    if (!['manager','gestor','admin','admin_global','superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se pertence à empresa e está editável
    const { data: existing, error: fetchError } = await supabaseService
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single()
    if (fetchError || !existing) return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })

    if (!['draft','submitted','reviewed','expired'].includes(existing.status)) {
      return NextResponse.json({ error: `Status atual não permite envio (${existing.status})` }, { status: 409 })
    }

    // Enviar como pendente para aprovação do Admin
    const { data: updated, error: updateError } = await supabaseService
      .from('budgets')
      .update({ status: 'pending', submitted_at: new Date().toISOString() })
      .eq('id', budgetId)
      .select('*')
      .single()
    if (updateError) return NextResponse.json({ error: 'Falha ao enviar orçamento' }, { status: 500 })

    return NextResponse.json({ success: true, budget: updated })
  } catch (e) {
    console.error('submit budget error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

