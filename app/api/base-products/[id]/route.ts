import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/user-utils'

// Schema de validação para parâmetros
const BaseProductParamsSchema = z.object({
  id: z.string().uuid(),
})

/**
 * @api {get} /api/base-products/:id Obter produto base por ID
 * @apiName GetBaseProduct
 * @apiGroup BaseProducts
 * @apiDescription Obtém detalhes completos de um produto base específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticação - gestores podem ver produtos base
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: authResult.error,
          },
        },
        { status: authResult.status }
      )
    }

    // Validar parâmetros
    const { id } = BaseProductParamsSchema.parse(params)

    // Buscar produto base com detalhes completos
    const { data: product, error } = await supabaseService
      .from('base_products')
      .select(
        `
        id,
        name,
        description,
        description_long,
        base_price,
        base_points_cost,
        images,
        specifications,
        features,
        available_colors,
        available_sizes,
        customization_options,
        lead_time_days,
        min_quantity,
        max_quantity,
        is_featured,
        tags,
        status,
        category_id,
        created_at,
        updated_at,
        product_categories (
          id,
          name,
          icon,
          color
        )
      `
      )
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Produto base não encontrado',
            },
          },
          { status: 404 }
        )
      }

      console.error('Erro ao buscar produto base:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar produto base',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    // Buscar produtos relacionados (mesma categoria, excluindo o atual)
    const { data: relatedProducts, error: relatedError } = await supabaseService
      .from('base_products')
      .select(
        `
        id,
        name,
        base_price,
        base_points_cost,
        images,
        lead_time_days,
        is_featured,
        tags
      `
      )
      .eq('category_id', product.category_id)
      .eq('status', 'active')
      .neq('id', id)
      .limit(4)

    if (relatedError) {
      console.warn('Erro ao buscar produtos relacionados:', relatedError)
    }

    // Buscar estatísticas de uso (quantas vezes foi replicado)
    const { data: replicationStats, error: statsError } = await supabaseService
      .from('company_products')
      .select('id')
      .eq('base_product_id', id)

    if (statsError) {
      console.warn('Erro ao buscar estatísticas de replicação:', statsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product,
          replication_count: replicationStats?.length || 0,
        },
        related: relatedProducts || [],
        meta: {
          last_updated: product.updated_at,
          replication_count: replicationStats?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de produto base:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID do produto inválido',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      { status: 500 }
    )
  }
}
