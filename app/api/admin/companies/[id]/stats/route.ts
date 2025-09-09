import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar estatísticas de uma empresa específica
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

    const companyId = params.id

    // Buscar estatísticas da empresa
    const { data: companyStats, error: statsError } = await supabase
      .from('company_stats')
      .select(
        `
        *,
        companies!inner(
          id,
          name,
          email,
          status
        )
      `
      )
      .eq('company_id', companyId)
      .single()

    if (statsError) {
      console.error('Erro ao buscar estatísticas da empresa:', statsError)
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Buscar estatísticas detalhadas por loja
    const { data: storeStats, error: storeStatsError } = await supabase
      .from('v_store_products')
      .select('*')
      .eq('company_id', companyId)

    if (storeStatsError) {
      console.warn('Erro ao buscar estatísticas das lojas:', storeStatsError)
    }

    // Buscar dados reais para verificação de consistência
    const { data: realStats, error: realStatsError } = await supabase
      .from('store_products')
      .select(
        `
        status,
        stores!inner(
          company_id
        )
      `
      )
      .eq('stores.company_id', companyId)

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
      companyStats.products_total === realProductsTotal &&
      companyStats.products_draft === realProductsDraft &&
      companyStats.products_liberado === realProductsLiberado &&
      companyStats.products_ativo === realProductsAtivo &&
      companyStats.products_inativo === realProductsInativo

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: companyStats.companies.id,
          name: companyStats.companies.name,
          email: companyStats.companies.email,
          status: companyStats.companies.status,
        },
        stats: {
          products_total: companyStats.products_total,
          products_draft: companyStats.products_draft,
          products_liberado: companyStats.products_liberado,
          products_ativo: companyStats.products_ativo,
          products_inativo: companyStats.products_inativo,
          updated_at: companyStats.updated_at,
        },
        stores:
          storeStats?.map(store => ({
            id: store.store_id,
            name: store.store_name,
            products_total: store.products_total,
            products_draft: store.products_draft,
            products_liberado: store.products_liberado,
            products_ativo: store.products_ativo,
            products_inativo: store.products_inativo,
            stats_updated_at: store.stats_updated_at,
          })) || [],
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
            products_total: companyStats.products_total - realProductsTotal,
            products_draft: companyStats.products_draft - realProductsDraft,
            products_liberado:
              companyStats.products_liberado - realProductsLiberado,
            products_ativo: companyStats.products_ativo - realProductsAtivo,
            products_inativo:
              companyStats.products_inativo - realProductsInativo,
          },
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de estatísticas da empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Forçar recálculo das estatísticas da empresa
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

    const companyId = params.id

    // Executar recálculo das estatísticas
    const { data: recomputedStats, error: recomputeError } = await supabase.rpc(
      'recompute_company_stats',
      { company_id_param: parseInt(companyId) }
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
