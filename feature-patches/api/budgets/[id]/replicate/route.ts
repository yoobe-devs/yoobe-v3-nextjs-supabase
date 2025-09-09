import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// POST - Replicar produtos após aprovação do orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const budgetId = params.id

    // Verificar se o orçamento existe e está aprovado
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select(
        `
        id,
        company_id,
        status,
        budget_items (
          id,
          base_product_id,
          quantity,
          custom_price,
          custom_points_cost,
          notes,
          base_products (
            id,
            name,
            description,
            base_code,
            base_price,
            base_points_cost,
            specifications,
            images,
            product_categories (
              id,
              name
            )
          )
        )
      `
      )
      .eq('id', budgetId)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (budget.status !== 'approved') {
      return NextResponse.json(
        { error: 'Orçamento deve estar aprovado para replicação' },
        { status: 400 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'admin') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budget.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const replicatedProducts = []
    const errors = []

    // Replicar cada item do orçamento
    for (const item of budget.budget_items) {
      try {
        // Verificar se já existe produto replicado
        const { data: existingProduct, error: existingError } =
          await supabaseService
            .from('company_products')
            .select('id')
            .eq('base_product_id', item.base_product_id)
            .eq('company_id', budget.company_id)
            .single()

        if (existingProduct) {
          console.log(
            `Produto ${item.base_products.name} já replicado, pulando...`
          )
          continue
        }

        // Gerar SKU final usando as funções SQL
        const { data: skuData, error: skuError } = await supabaseService.rpc(
          'make_final_sku',
          {
            p_base_code: item.base_products.base_code,
            p_company_id: budget.company_id,
          }
        )

        if (skuError) {
          console.error('Erro ao gerar SKU:', skuError)
          errors.push(
            `Erro ao gerar SKU para ${item.base_products.name}: ${skuError.message}`
          )
          continue
        }

        // Gerar EAN-13 se não existir
        const { data: eanData, error: eanError } = await supabaseService.rpc(
          'gen_ean13',
          {
            p_company_id: budget.company_id,
          }
        )

        if (eanError) {
          console.error('Erro ao gerar EAN-13:', eanError)
          errors.push(
            `Erro ao gerar EAN-13 para ${item.base_products.name}: ${eanError.message}`
          )
          continue
        }

        // Criar produto replicado
        const productData = {
          company_id: budget.company_id,
          base_product_id: item.base_product_id,
          name: item.base_products.name,
          description: item.base_products.description,
          base_code: item.base_products.base_code,
          final_sku: skuData,
          ean_13: eanData,
          price: item.custom_price || item.base_products.base_price,
          points_cost:
            item.custom_points_cost || item.base_products.base_points_cost,
          specifications: item.base_products.specifications,
          images: item.base_products.images,
          category_id: item.base_products.product_categories?.id,
          status: 'active',
          is_replicated: true,
          source_budget_id: budgetId,
          source_budget_item_id: item.id,
          created_by: user.id,
          updated_by: user.id,
        }

        const { data: newProduct, error: createError } = await supabaseService
          .from('company_products')
          .insert(productData)
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar produto replicado:', createError)
          errors.push(
            `Erro ao criar produto ${item.base_products.name}: ${createError.message}`
          )
          continue
        }

        // Criar registro de replicação
        const { error: replicationError } = await supabaseService
          .from('product_replications')
          .insert({
            budget_id: budgetId,
            budget_item_id: item.id,
            company_id: budget.company_id,
            base_product_id: item.base_product_id,
            company_product_id: newProduct.id,
            final_sku: skuData,
            ean_13: eanData,
            replicated_at: new Date().toISOString(),
            replicated_by: user.id,
          })

        if (replicationError) {
          console.error(
            'Erro ao criar registro de replicação:',
            replicationError
          )
        }

        replicatedProducts.push(newProduct)
        console.log(
          `✅ Produto replicado: ${newProduct.name} (SKU: ${newProduct.final_sku})`
        )
      } catch (error) {
        console.error(`Erro ao replicar item ${item.id}:`, error)
        errors.push(
          `Erro ao replicar ${item.base_products.name}: ${error.message}`
        )
      }
    }

    // Atualizar status do orçamento para "replicado"
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update({
        status: 'replicated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId)

    if (updateError) {
      console.error('Erro ao atualizar status do orçamento:', updateError)
    }

    // Log de auditoria
    try {
      await supabaseService.from('audit_logs').insert({
        action: 'budget_replication',
        user_id: user.id,
        company_id: budget.company_id,
        resource_type: 'budget',
        resource_id: budgetId,
        details: {
          replicated_products: replicatedProducts.length,
          errors: errors.length,
          product_ids: replicatedProducts.map(p => p.id),
        },
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        budget_id: budgetId,
        replicated_products: replicatedProducts,
        total_replicated: replicatedProducts.length,
        errors: errors,
        has_errors: errors.length > 0,
      },
      message: `${replicatedProducts.length} produtos replicados com sucesso`,
    })
  } catch (error) {
    console.error('Erro na API de replicação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
