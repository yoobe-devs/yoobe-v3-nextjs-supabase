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

    // Buscar produtos da empresa
    const { data: products, error: productsError } = await service
      .from('company_products')
      .select('id, name, stock_quantity, status, is_active')
      .eq('company_id', companyId)

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

    // Calcular estatísticas
    let totalItems = 0
    let low = 0
    let out = 0
    let active = 0
    let inactive = 0
    const threshold = 5 // Threshold padrão

    for (const product of products || []) {
      const stockQuantity = product.stock_quantity || 0
      totalItems += stockQuantity

      if (product.is_active) {
        active++
      } else {
        inactive++
      }

      if (stockQuantity === 0) {
        out++
      } else if (stockQuantity < threshold) {
        low++
      }
    }

    // Buscar informações de sincronização
    const productIds = (products || []).map((p: any) => p.id)
    const { data: inventorySync, error: syncError } = productIds.length
      ? await service
          .from('inventory_sync')
          .select('product_id, cubbo_quantity, olist_quantity, local_quantity, sync_status')
          .in('product_id', productIds)
      : { data: [] }

    if (syncError) {
      console.error('Erro ao buscar sincronização:', syncError)
    }

    // Calcular totais de sincronização
    let totalCubbo = 0
    let totalOlist = 0
    let totalLocal = 0
    let syncedCount = 0
    let pendingCount = 0
    let conflictCount = 0

    for (const sync of inventorySync || []) {
      totalCubbo += sync.cubbo_quantity || 0
      totalOlist += sync.olist_quantity || 0
      totalLocal += sync.local_quantity || 0

      switch (sync.sync_status) {
        case 'synced':
          syncedCount++
          break
        case 'pending':
          pendingCount++
          break
        case 'conflict':
          conflictCount++
          break
      }
    }

    const summary = {
      total_products: products?.length || 0,
      total_available: totalItems,
      low_stock: low,
      out_of_stock: out,
      active_products: active,
      inactive_products: inactive,
      sync_summary: {
        total_cubbo: totalCubbo,
        total_olist: totalOlist,
        total_local: totalLocal,
        synced_products: syncedCount,
        pending_sync: pendingCount,
        conflict_sync: conflictCount,
      },
      company_id: companyId,
    }

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error('Erro na API de summary de estoque:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
      },
      { status: 500 }
    )
  }
}

