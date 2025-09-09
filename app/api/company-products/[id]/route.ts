import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  points_cost: z.number().int().min(0).optional(),
  category_id: z.string().uuid().optional(),
  margin_pct: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).optional(),
  is_active: z.boolean().optional(),
  images: z.array(z.any()).optional(),
  specifications: z.record(z.any()).optional(),
  customizations: z.record(z.any()).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  min_stock_level: z.number().int().min(0).optional(),
  final_sku: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const productId = params.id

    let productQuery = supabaseService
      .from('company_products')
      .select(
        `
        id,
        company_id,
        base_product_id,
        final_sku,
        ean_13,
        name,
        description,
        price,
        points_cost,
        category_id,
        margin_pct,
        status,
        is_active,
        images,
        specifications,
        customizations,
        stock_quantity,
        min_stock_level,
        created_at,
        updated_at,
        created_by,
        companies (
          id,
          name,
          client_code
        ),
        base_products (
          id,
          name,
          base_code
        ),
        categories (
          id,
          name
        ),
        users (
          id,
          name,
          email
        )
      `
      )
      .eq('id', productId)
      .single()

    // Aplicar filtros de acesso baseados no role
    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      productQuery = productQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      productQuery = productQuery.eq('company_id', authResult.user.company_id)
    }

    const { data: product, error } = await productQuery

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { product },
    })
  } catch (error) {
    console.error('Erro na API de produto individual:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const productId = params.id
    const body = await request.json()
    const updateData = updateProductSchema.parse(body)

    // Verificar se o produto existe e se o usuário tem acesso
    let productQuery = supabaseService
      .from('company_products')
      .select('id, company_id, final_sku')
      .eq('id', productId)
      .single()

    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      productQuery = productQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      productQuery = productQuery.eq('company_id', authResult.user.company_id)
    }

    const { data: existingProduct, error: fetchError } = await productQuery

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado' } },
        { status: 404 }
      )
    }

    // Se final_sku foi alterado, validar unicidade
    if (
      updateData.final_sku &&
      updateData.final_sku !== existingProduct.final_sku
    ) {
      const { data: duplicateProduct, error: duplicateError } =
        await supabaseService
          .from('company_products')
          .select('id')
          .eq('company_id', existingProduct.company_id)
          .eq('final_sku', updateData.final_sku)
          .neq('id', productId)
          .single()

      if (duplicateProduct) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'SKU já existe para esta empresa' },
          },
          { status: 400 }
        )
      }
    }

    // Atualizar produto
    const { data: updatedProduct, error: updateError } = await supabaseService
      .from('company_products')
      .update(updateData)
      .eq('id', productId)
      .select(
        `
        id,
        company_id,
        base_product_id,
        final_sku,
        ean_13,
        name,
        description,
        price,
        points_cost,
        category_id,
        margin_pct,
        status,
        is_active,
        images,
        specifications,
        customizations,
        stock_quantity,
        min_stock_level,
        created_at,
        updated_at
      `
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar produto' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'update',
        table_name: 'company_products',
        record_id: productId,
        user_id: authResult.user.id,
        changes: updateData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      data: { product: updatedProduct },
    })
  } catch (error) {
    console.error('Erro na API de produto individual:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Dados inválidos', details: error.errors },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const productId = params.id

    // Verificar se o produto existe
    const { data: product, error: fetchError } = await supabaseService
      .from('company_products')
      .select('id, final_sku')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado' } },
        { status: 404 }
      )
    }

    // Deletar produto
    const { error: deleteError } = await supabaseService
      .from('company_products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Erro ao deletar produto:', deleteError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao deletar produto' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'delete',
        table_name: 'company_products',
        record_id: productId,
        user_id: authResult.user.id,
        changes: { deleted_final_sku: product.final_sku },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      message: 'Produto deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de produto individual:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

