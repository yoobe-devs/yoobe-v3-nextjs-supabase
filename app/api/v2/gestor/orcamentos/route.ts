import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Criar orçamento B2B
export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const canCreate = await requireRole(userId, companyId, 'gestor')
    if (!canCreate) {
      await audit('budget_creation_denied', 'budgets', userId, undefined, {
        companyId,
        reason: 'insufficient_permissions',
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Permissão insuficiente para criar orçamentos',
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      store_id,
      audience = 'external_b2b',
      client_company_id,
      primary_contact_id,
      items = [],
      valid_until,
      notes_client,
      title,
      description,
    } = body

    // Validações para B2B
    if (audience === 'external_b2b') {
      if (!client_company_id || !primary_contact_id) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Para orçamentos B2B, empresa cliente e contato principal são obrigatórios',
          },
          { status: 400 }
        )
      }

      if (!valid_until) {
        return NextResponse.json(
          {
            success: false,
            error: 'Data de validade é obrigatória para orçamentos B2B',
          },
          { status: 400 }
        )
      }

      // Verificar se a data de validade é futura
      const validUntilDate = new Date(valid_until)
      if (validUntilDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Data de validade deve ser futura' },
          { status: 400 }
        )
      }
    }

    if (!store_id || !title || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Loja, título e itens são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a loja pertence à empresa
    const { data: store } = await service
      .from('stores')
      .select('id')
      .eq('id', store_id)
      .eq('company_id', companyId)
      .single()

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar empresa cliente e contato (se B2B)
    if (audience === 'external_b2b') {
      const { data: clientCompany } = await service
        .from('client_companies')
        .select('id')
        .eq('id', client_company_id)
        .eq('tenant_id', companyId)
        .single()

      if (!clientCompany) {
        return NextResponse.json(
          { success: false, error: 'Empresa cliente não encontrada' },
          { status: 404 }
        )
      }

      const { data: contact } = await service
        .from('client_contacts')
        .select('id')
        .eq('id', primary_contact_id)
        .eq('client_company_id', client_company_id)
        .eq('is_active', true)
        .single()

      if (!contact) {
        return NextResponse.json(
          { success: false, error: 'Contato principal não encontrado' },
          { status: 404 }
        )
      }
    }

    // Calcular totais
    let totalAmount = 0
    let totalPoints = 0

    for (const item of items) {
      if (item.store_product_id) {
        const { data: product } = await service
          .from('store_products')
          .select('price, points_cost')
          .eq('id', item.store_product_id)
          .single()

        if (product) {
          totalAmount += (product.price || 0) * item.qty
          totalPoints += (product.points_cost || 0) * item.qty
        }
      } else if (item.catalog_product_id) {
        const { data: product } = await service
          .from('base_products')
          .select('price, points_cost')
          .eq('id', item.catalog_product_id)
          .single()

        if (product) {
          totalAmount += (product.price || 0) * item.qty
          totalPoints += (product.points_cost || 0) * item.qty
        }
      }
    }

    // Criar orçamento
    const { data: budget, error: budgetError } = await service
      .from('budgets')
      .insert({
        tenant_id: companyId,
        company_id: companyId,
        manager_id: userId,
        title,
        description: description || null,
        total_amount: totalAmount,
        total_points: totalPoints,
        status: 'draft',
        audience,
        client_company_id:
          audience === 'external_b2b' ? client_company_id : null,
        primary_contact_id:
          audience === 'external_b2b' ? primary_contact_id : null,
        valid_until: audience === 'external_b2b' ? valid_until : null,
        notes_client: audience === 'external_b2b' ? notes_client : null,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single()

    if (budgetError) {
      await audit('budget_creation_failed', 'budgets', userId, undefined, {
        companyId,
        error: budgetError.message,
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar orçamento' },
        { status: 500 }
      )
    }

    // Criar itens do orçamento
    const budgetItems = items.map((item: any) => ({
      budget_id: budget.id,
      base_product_id: item.catalog_product_id || null,
      store_product_id: item.store_product_id || null,
      quantity: item.qty,
      custom_price: item.unit_amount || null,
      custom_points_cost: item.points_cost || null,
      notes: item.notes || null,
    }))

    const { error: itemsError } = await service
      .from('budget_items')
      .insert(budgetItems)

    if (itemsError) {
      // Rollback: deletar orçamento criado
      await service.from('budgets').delete().eq('id', budget.id)
      await audit('budget_creation_failed', 'budgets', userId, undefined, {
        companyId,
        error: 'items_creation_failed',
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar itens do orçamento' },
        { status: 500 }
      )
    }

    await audit('budget_created', 'budgets', userId, budget.id, {
      companyId,
      budgetTitle: title,
      audience,
      clientCompanyId: client_company_id,
    })

    return NextResponse.json({ success: true, data: budget }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating budget:', error)
    await audit('budget_creation_error', 'budgets', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
