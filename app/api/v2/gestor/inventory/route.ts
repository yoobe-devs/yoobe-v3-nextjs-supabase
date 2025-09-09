import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const service = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(req, [
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
          error: { code: 'UNAUTHORIZED', message: authResult.error },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').toLowerCase()
    const page = Number(searchParams.get('page') || '1')
    const size = Number(searchParams.get('size') || '24')
    const idsOnly =
      (searchParams.get('ids_only') || '').toLowerCase() === 'true' ||
      searchParams.get('ids_only') === '1'

    // Buscar produtos da empresa com informações de estoque
    let query = service
      .from('company_products')
      .select(
        `
        id,
        name,
        price,
        stock_quantity,
        status,
        is_active,
        created_at,
        updated_at,
        base_products (
          id,
          name,
          base_price
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)

    // Aplicar filtro de busca
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    }

    // Aplicar paginação
    const start = (page - 1) * size
    const end = start + size - 1
    query = query.range(start, end).order('name')

    const { data: products, error: productsError, count } = await query

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar produtos',
            details: productsError.message,
          },
        },
        { status: 500 }
      )
    }

    // Se idsOnly, retornar apenas IDs
    if (idsOnly) {
      const ids = (products || []).map((p: any) => p.id)
      return NextResponse.json({
        success: true,
        data: { ids, total: count || ids.length },
      })
    }

    // Buscar informações de sincronização de estoque
    const productIds = (products || []).map((p: any) => p.id)
    const { data: inventorySync, error: syncError } = productIds.length
      ? await service
          .from('inventory_sync')
          .select('product_id, cubbo_quantity, olist_quantity, local_quantity, last_sync_at, sync_status')
          .in('product_id', productIds)
      : { data: [] }

    if (syncError) {
      console.error('Erro ao buscar sincronização de estoque:', syncError)
    }

    // Criar mapa de sincronização
    const syncMap = new Map(
      (inventorySync || []).map((sync: any) => [
        sync.product_id,
        {
          cubbo_quantity: sync.cubbo_quantity || 0,
          olist_quantity: sync.olist_quantity || 0,
          local_quantity: sync.local_quantity || 0,
          last_sync_at: sync.last_sync_at,
          sync_status: sync.sync_status,
        },
      ])
    )

    // Mapear produtos com informações de estoque
    const mapped = (products || []).map((product: any) => {
      const sync = syncMap.get(product.id) || {}
      const stockQuantity = product.stock_quantity || 0
      const threshold = 5 // Threshold padrão
      const badge =
        stockQuantity === 0
          ? 'sem_estoque'
          : stockQuantity < threshold
          ? 'baixo'
          : 'ok'

      return {
        product_id: product.id,
        name: product.name,
        price: product.price,
        status: product.status,
        is_active: product.is_active,
        stock_quantity: stockQuantity,
        available_qty: stockQuantity,
        badge_status: badge,
        low_stock_threshold: threshold,
        cubbo_quantity: sync.cubbo_quantity || 0,
        olist_quantity: sync.olist_quantity || 0,
        local_quantity: sync.local_quantity || 0,
        last_sync_at: sync.last_sync_at,
        sync_status: sync.sync_status || 'synced',
        base_product: product.base_products,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }
    })

    // Calcular estatísticas
    const stats = {
      total: count || 0,
      in_stock: mapped.filter((p: any) => p.stock_quantity > 0).length,
      out_of_stock: mapped.filter((p: any) => p.stock_quantity === 0).length,
      low_stock: mapped.filter((p: any) => p.badge_status === 'baixo').length,
      by_status: {},
    }

    mapped.forEach((product: any) => {
      stats.by_status[product.status] = (stats.by_status[product.status] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        items: mapped,
        pagination: {
          page,
          size,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / size),
        },
        stats,
        company_id: companyId,
      },
    })
  } catch (error) {
    console.error('Erro na API de estoque:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
      },
      { status: 500 }
    )
  }
}
