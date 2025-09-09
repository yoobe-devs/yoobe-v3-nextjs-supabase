import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar orçamentos do cliente
export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é um contato de cliente
    const { data: contact } = await service
      .from('client_contacts')
      .select(
        `
        id,
        client_company_id,
        client_companies!inner(tenant_id)
      `
      )
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acesso negado - usuário não é contato de cliente',
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const offset = (page - 1) * limit

    let query = service
      .from('budgets')
      .select(
        `
        id,
        title,
        description,
        total_amount,
        total_points,
        status,
        valid_until,
        notes_client,
        created_at,
        updated_at,
        client_companies!inner(name),
        proposals!inner(id, version, grand_total, created_at)
      `,
        { count: 'exact' }
      )
      .eq('audience', 'external_b2b')
      .eq('client_company_id', contact.client_company_id)
      .order('created_at', { ascending: false })

    // Aplicar filtro de status
    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: budgets, error, count } = await query

    if (error) {
      await audit('client_budgets_list_error', 'budgets', userId, undefined, {
        clientCompanyId: contact.client_company_id,
        error: error.message,
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    await audit('client_budgets_listed', 'budgets', userId, undefined, {
      clientCompanyId: contact.client_company_id,
      count: budgets?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: budgets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error listing client budgets:', error)
    await audit('client_budgets_list_error', 'budgets', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
