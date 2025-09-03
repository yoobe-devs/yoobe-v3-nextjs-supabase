import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { productId } = params

    // Buscar produto com todos os campos
    const { data: product, error: fetchError } = await supabase
      .from('client_products')
      .select(
        `
        *,
        base_products (
          id, 
          name, 
          base_price, 
          base_points_cost, 
          image_url,
          description
        )
      `
      )
      .eq('id', productId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        {
          error: 'Produto não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { productId } = params
    const body = await request.json()

    // Validar campos obrigatórios
    const requiredFields = ['name', 'price', 'status']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `Campo ${field} é obrigatório`,
          },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name: body.name,
      description: body.description,
      advanced_description: body.advanced_description,
      price: parseFloat(body.price),
      status: body.status,
      stock_quantity: parseInt(body.stock_quantity) || 0,
      margin_pct: parseFloat(body.margin_pct) || 0,
      custom_sku: body.custom_sku,
      tags: body.tags || [],
      images: body.images || [],
      metadata: body.metadata || {},
      updated_at: new Date().toISOString(),
    }

    // Gerar EAN-13 se SKU foi alterado
    if (body.custom_sku && body.custom_sku !== body.current_sku) {
      const ean13 = generateEAN13(body.custom_sku)
      updateData.ean_13 = ean13
    }

    // Atualizar status ativo/inativo
    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active

      if (body.is_active) {
        updateData.activated_at = new Date().toISOString()
        updateData.deactivated_at = null
        updateData.deactivation_reason = null
      } else {
        updateData.deactivated_at = new Date().toISOString()
        updateData.deactivation_reason =
          body.deactivation_reason || 'Inativado pelo gestor'
      }
    }

    // Atualizar produto
    const { data: updatedProduct, error: updateError } = await supabase
      .from('client_products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        {
          error: 'Erro ao atualizar produto',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Produto atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { productId } = params

    // Soft delete - marcar como inativo
    const { error: deleteError } = await supabase
      .from('client_products')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: 'Produto removido pelo administrador',
      })
      .eq('id', productId)

    if (deleteError) {
      return NextResponse.json(
        {
          error: 'Erro ao remover produto',
          details: deleteError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Produto removido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover produto:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// Função para gerar EAN-13 (reutilizada da API anterior)
function generateEAN13(sku: string): string {
  const numericSku = sku.replace(/\D/g, '')
  let base = numericSku.padEnd(12, '0').substring(0, 12)

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i])
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return base + checkDigit
}
