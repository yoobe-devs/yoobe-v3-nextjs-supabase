import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/user-utils'

// Schema de validação para query parameters
const BaseProductsQuerySchema = z.object({
  q: z.string().optional(),
  category_id: z.string().uuid().optional(),
  tags: z.string().optional(),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  sort: z
    .enum(['name', 'base_price', 'lead_time_days', 'created_at'])
    .default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
})

// Schema de resposta
const BaseProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  description_long: z.string().nullable(),
  base_price: z.number(),
  base_points_cost: z.number(),
  images: z.array(z.string()),
  specifications: z.record(z.any()),
  features: z.array(z.string()),
  available_colors: z.array(z.string()),
  available_sizes: z.array(z.string()),
  customization_options: z.record(z.any()),
  lead_time_days: z.number(),
  min_quantity: z.number(),
  max_quantity: z.number(),
  is_featured: z.boolean(),
  tags: z.array(z.string()),
  status: z.string(),
  category_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  product_categories: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      icon: z.string().nullable(),
      color: z.string().nullable(),
    })
    .nullable(),
})

/**
 * @api {get} /api/base-products Listar produtos base
 * @apiName ListBaseProducts
 * @apiGroup BaseProducts
 * @apiDescription Lista produtos base com filtros avançados e visualização rica
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const queryParams = BaseProductsQuerySchema.parse({
      q: searchParams.get('q') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      tags: searchParams.get('tags') || undefined,
      colors: searchParams.get('colors') || undefined,
      sizes: searchParams.get('sizes') || undefined,
      featured: searchParams.get('featured') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sort: searchParams.get('sort') || 'name',
      order: searchParams.get('order') || 'asc',
    })

    const { page, limit, sort, order, ...filters } = queryParams
    const offset = (page - 1) * limit

    // Construir query base
    let query = supabaseService
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
      `,
        { count: 'exact' }
      )
      .eq('status', 'active')

    // Aplicar filtros
    if (filters.q) {
      query = query.or(
        `name.ilike.%${filters.q}%,description.ilike.%${filters.q}%,description_long.ilike.%${filters.q}%`
      )
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters.tags) {
      const tagArray = filters.tags.split(',').map(tag => tag.trim())
      query = query.overlaps('tags', tagArray)
    }

    if (filters.colors) {
      const colorArray = filters.colors.split(',').map(color => color.trim())
      query = query.overlaps('available_colors', colorArray)
    }

    if (filters.sizes) {
      const sizeArray = filters.sizes.split(',').map(size => size.trim())
      query = query.overlaps('available_sizes', sizeArray)
    }

    if (filters.featured !== undefined) {
      query = query.eq('is_featured', filters.featured === 'true')
    }

    // Aplicar ordenação
    query = query.order(sort, { ascending: order === 'asc' })

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Erro ao buscar produtos base:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar produtos base',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const stats = {
      total: count || 0,
      featured: products?.filter(p => p.is_featured).length || 0,
      byCategory: {} as Record<string, number>,
      avgLeadTime: 0,
      priceRange: { min: 0, max: 0 },
    }

    if (products && products.length > 0) {
      // Estatísticas por categoria
      products.forEach(product => {
        const categoryName = product.product_categories?.name || 'Sem categoria'
        stats.byCategory[categoryName] =
          (stats.byCategory[categoryName] || 0) + 1
      })

      // Lead time médio
      const leadTimes = products.map(p => p.lead_time_days).filter(t => t > 0)
      stats.avgLeadTime =
        leadTimes.length > 0
          ? Math.round(
              leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length
            )
          : 0

      // Faixa de preços
      const prices = products.map(p => p.base_price)
      stats.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        filters: {
          applied: filters,
          available: {
            categories: stats.byCategory,
            colors: [
              ...new Set(products?.flatMap(p => p.available_colors) || []),
            ],
            sizes: [
              ...new Set(products?.flatMap(p => p.available_sizes) || []),
            ],
            tags: [...new Set(products?.flatMap(p => p.tags) || [])],
          },
        },
        stats,
      },
    })
  } catch (error) {
    console.error('Erro na API de produtos base:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parâmetros de consulta inválidos',
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
