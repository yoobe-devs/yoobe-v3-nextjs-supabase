import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createOrcamento, listOrcamentosByClient, type CreateOrcamentoInput } from '@/lib/queries/orcamentos'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    const userCompanyId = user.user_metadata?.company_id
    if (userRole === 'manager' && userCompanyId !== params.clientId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const items = await listOrcamentosByClient(params.clientId)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error listing budgets:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (user.user_metadata?.role !== 'manager') {
      return NextResponse.json({ error: 'Apenas gestores podem criar orçamentos' }, { status: 403 })
    }

    const body = await request.json()
    const payload = body as Omit<CreateOrcamentoInput, 'client_id' | 'gestor_id'> & { client_id?: string, gestor_id?: string }
    if (!payload.title || !Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: 'Título e itens são obrigatórios' }, { status: 400 })
    }

    const created = await createOrcamento({
      client_id: params.clientId,
      gestor_id: user.id,
      title: payload.title,
      description: payload.description,
      gestor_notes: payload.gestor_notes,
      items: payload.items,
      attachments: payload.attachments
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


