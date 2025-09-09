import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar estatísticas de uma loja específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const storeId = params.id

    // Buscar estatísticas da loja
    const { data: storeStats, error: statsError } = await supabase
      .from('store_stats')
      .select(
        `
        *,
        stores!inner(
          id,
          name,
          company_id,
          companies!inner(
            id,
            name,
            domain
          )
        )
      `
      )
      .eq('store_id', storeId)
      .single()

    if (statsError) {
      console.error('Erro ao buscar estatísticas da loja:', statsError)
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Buscar dados reais para verificação de consistência
    const { data: realStats, error: realStatsError } = await supabase
      .from('store_products')
      .select('status')
      .eq('store_id', storeId)

    if (realStatsError) {
      console.warn('Erro ao buscar dados reais:', realStatsError)
    }

    // Calcular estatísticas reais
    const realProductsTotal = realStats?.length || 0
    const realProductsDraft =
      realStats?.filter(p => p.status === 'draft').length || 0
    const realProductsLiberado =
      realStats?.filter(p => p.status === 'liberado').length || 0
    const realProductsAtivo =
      realStats?.filter(p => p.status === 'ativo').length || 0
    const realProductsInativo =
      realStats?.filter(p => p.status === 'inativo').length || 0

    // Verificar consistência
    const isConsistent =
      storeStats.products_total === realProductsTotal &&
      storeStats.products_draft === realProductsDraft &&
      storeStats.products_liberado === realProductsLiberado &&
      storeStats.products_ativo === realProductsAtivo &&
      storeStats.products_inativo === realProductsInativo

    return NextResponse.json({
      success: true,
      data: {
        store: {
          id: storeStats.stores.id,
          name: storeStats.stores.name,
          company_id: storeStats.stores.company_id,
          company: {
            id: storeStats.stores.companies.id,
            name: storeStats.stores.companies.name,
            email: storeStats.stores.companies.email,
          },
        },
        stats: {
          products_total: storeStats.products_total,
          products_draft: storeStats.products_draft,
          products_liberado: storeStats.products_liberado,
          products_ativo: storeStats.products_ativo,
          products_inativo: storeStats.products_inativo,
          updated_at: storeStats.updated_at,
        },
        consistency: {
          is_consistent: isConsistent,
          real_stats: {
            products_total: realProductsTotal,
            products_draft: realProductsDraft,
            products_liberado: realProductsLiberado,
            products_ativo: realProductsAtivo,
            products_inativo: realProductsInativo,
          },
          differences: {
            products_total: storeStats.products_total - realProductsTotal,
            products_draft: storeStats.products_draft - realProductsDraft,
            products_liberado:
              storeStats.products_liberado - realProductsLiberado,
            products_ativo: storeStats.products_ativo - realProductsAtivo,
            products_inativo: storeStats.products_inativo - realProductsInativo,
          },
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de estatísticas da loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Forçar recálculo das estatísticas da loja
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const storeId = params.id

    // Executar recálculo das estatísticas
    const { data: recomputedStats, error: recomputeError } = await supabase.rpc(
      'recompute_store_stats',
      { store_id_param: parseInt(storeId) }
    )

    if (recomputeError) {
      console.error('Erro ao recalcular estatísticas:', recomputeError)
      return NextResponse.json(
        { error: 'Erro ao recalcular estatísticas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Estatísticas recalculadas com sucesso',
      data: recomputedStats?.[0] || null,
    })
  } catch (error) {
    console.error('Erro na API de recálculo de estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
