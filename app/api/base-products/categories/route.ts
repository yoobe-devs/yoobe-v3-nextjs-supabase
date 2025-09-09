import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/user-utils'

/**
 * @api {get} /api/base-products/categories Listar categorias de produtos base
 * @apiName ListBaseProductCategories
 * @apiGroup BaseProducts
 * @apiDescription Lista categorias de produtos base com contadores
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticação - gestores podem ver categorias
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

    // Buscar categorias com contadores de produtos
    const { data: categories, error } = await supabaseService
      .from('product_categories')
      .select(
        `
        id,
        name,
        icon,
        color,
        description,
        created_at,
        base_products!inner (
          id
        )
      `
      )
      .eq('base_products.status', 'active')

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar categorias',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    // Processar dados para incluir contadores
    const categoriesWithCounts =
      categories?.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description,
        created_at: category.created_at,
        products_count: category.base_products?.length || 0,
      })) || []

    // Buscar estatísticas gerais
    const { data: totalProducts, error: totalError } = await supabaseService
      .from('base_products')
      .select('id', { count: 'exact' })
      .eq('status', 'active')

    if (totalError) {
      console.warn('Erro ao buscar total de produtos:', totalError)
    }

    const { data: featuredProducts, error: featuredError } =
      await supabaseService
        .from('base_products')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
        .eq('is_featured', true)

    if (featuredError) {
      console.warn('Erro ao buscar produtos em destaque:', featuredError)
    }

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithCounts,
        stats: {
          total_categories: categoriesWithCounts.length,
          total_products: totalProducts?.length || 0,
          featured_products: featuredProducts?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de categorias:', error)
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
