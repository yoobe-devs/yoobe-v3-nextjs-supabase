import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Executar jobs de reconciliação
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      type = 'all', // 'all', 'stores', 'companies', 'missing'
      company_id,
      store_id,
    } = body

    const results: any = {
      timestamp: new Date().toISOString(),
      type,
      operations: [],
    }

    try {
      switch (type) {
        case 'all':
          // Recalcular todas as estatísticas
          console.log('Iniciando recálculo completo de estatísticas...')

          // 1. Inicializar estatísticas faltantes
          const { data: missingStores, error: missingStoresError } =
            await supabase.rpc('initialize_missing_store_stats')

          if (missingStoresError) {
            console.warn(
              'Erro ao inicializar estatísticas de lojas:',
              missingStoresError
            )
          } else {
            results.operations.push({
              operation: 'initialize_missing_store_stats',
              success: true,
              affected: missingStores?.length || 0,
            })
          }

          const { data: missingCompanies, error: missingCompaniesError } =
            await supabase.rpc('initialize_missing_company_stats')

          if (missingCompaniesError) {
            console.warn(
              'Erro ao inicializar estatísticas de empresas:',
              missingCompaniesError
            )
          } else {
            results.operations.push({
              operation: 'initialize_missing_company_stats',
              success: true,
              affected: missingCompanies?.length || 0,
            })
          }

          // 2. Recalcular todas as estatísticas de lojas
          const { data: storeStats, error: storeStatsError } =
            await supabase.rpc('recompute_all_store_stats')

          if (storeStatsError) {
            console.error(
              'Erro ao recalcular estatísticas de lojas:',
              storeStatsError
            )
            results.operations.push({
              operation: 'recompute_all_store_stats',
              success: false,
              error: storeStatsError.message,
            })
          } else {
            results.operations.push({
              operation: 'recompute_all_store_stats',
              success: true,
              affected: storeStats?.length || 0,
            })
          }

          // 3. Recalcular todas as estatísticas de empresas
          // Recalcular estatísticas de empresas (com fallback direto)
          let companyStats: any = null
          let companyStatsError: any = null
          try {
            const r = await supabase.rpc('recompute_all_company_stats')
            companyStats = r.data
            companyStatsError = r.error
          } catch (e: any) {
            companyStatsError = e
          }

          if (companyStatsError) {
            console.warn('Falha em recompute_all_company_stats, tentando direct...')
            try {
              const r2 = await supabase.rpc('recompute_all_company_stats_direct')
              results.operations.push({
                operation: 'recompute_all_company_stats_direct',
                success: true,
                affected: r2.data?.length || 0,
              })
            } catch (e2: any) {
              results.operations.push({
                operation: 'recompute_all_company_stats_direct',
                success: false,
                error: e2?.message || 'Erro desconhecido',
              })
            }
          } else {
            results.operations.push({
              operation: 'recompute_all_company_stats',
              success: true,
              affected: companyStats?.length || 0,
            })
          }
          break

        case 'stores':
          // Recalcular apenas estatísticas de lojas
          const { data: storeStatsOnly, error: storeStatsOnlyError } =
            await supabase.rpc('recompute_all_store_stats')

          if (storeStatsOnlyError) {
            console.error(
              'Erro ao recalcular estatísticas de lojas:',
              storeStatsOnlyError
            )
            results.operations.push({
              operation: 'recompute_all_store_stats',
              success: false,
              error: storeStatsOnlyError.message,
            })
          } else {
            results.operations.push({
              operation: 'recompute_all_store_stats',
              success: true,
              affected: storeStatsOnly?.length || 0,
            })
          }
          break

        case 'companies':
          // Recalcular apenas estatísticas de empresas (com fallback direto)
          try {
            const { data, error } = await supabase.rpc('recompute_all_company_stats')
            if (error) throw error
            results.operations.push({
              operation: 'recompute_all_company_stats',
              success: true,
              affected: data?.length || 0,
            })
          } catch (err: any) {
            console.warn('Falha em recompute_all_company_stats, tentando direct...')
            const { data: d2, error: e2 } = await supabase.rpc(
              'recompute_all_company_stats_direct'
            )
            results.operations.push({
              operation: 'recompute_all_company_stats_direct',
              success: !e2,
              affected: d2?.length || 0,
              error: e2?.message,
            })
          }
          break

        case 'company':
          // Recalcular estatísticas de uma empresa específica
          if (!company_id) {
            return NextResponse.json(
              { error: 'company_id é obrigatório para type=company' },
              { status: 400 }
            )
          }

          // Tentar função padrão (UUID) e fallback para direct
          try {
            const { data, error } = await supabase.rpc('recompute_company_stats', {
              company_id_param: company_id,
            })
            if (error) throw error
            results.operations.push({
              operation: 'recompute_company_stats',
              success: true,
              affected: 1,
              company_id,
              data: data?.[0],
            })
          } catch (err: any) {
            const { data: d2, error: e2 } = await supabase.rpc(
              'recompute_company_stats_direct',
              { company_id_param: company_id }
            )
            results.operations.push({
              operation: 'recompute_company_stats_direct',
              success: !e2,
              affected: 1,
              company_id,
              data: d2?.[0],
              error: e2?.message,
            })
          }
          break

        case 'store':
          // Recalcular estatísticas de uma loja específica
          if (!store_id) {
            return NextResponse.json(
              { error: 'store_id é obrigatório para type=store' },
              { status: 400 }
            )
          }

          const { data: storeSpecific, error: storeSpecificError } =
            await supabase.rpc('recompute_store_stats', {
              store_id_param: parseInt(store_id),
            })

          if (storeSpecificError) {
            console.error(
              'Erro ao recalcular estatísticas da loja:',
              storeSpecificError
            )
            results.operations.push({
              operation: 'recompute_store_stats',
              success: false,
              error: storeSpecificError.message,
              store_id,
            })
          } else {
            results.operations.push({
              operation: 'recompute_store_stats',
              success: true,
              affected: 1,
              store_id,
              data: storeSpecific?.[0],
            })
          }
          break

        default:
          return NextResponse.json(
            { error: 'Tipo de recálculo inválido' },
            { status: 400 }
          )
      }

      // Verificar consistência após recálculo
      const { data: consistencyCheck, error: consistencyError } =
        await supabase.rpc('verify_stats_consistency')

      if (consistencyError) {
        console.warn('Erro ao verificar consistência:', consistencyError)
      } else {
        results.consistency = {
          total_checked: consistencyCheck?.length || 0,
          consistent:
            consistencyCheck?.filter(c => c.is_consistent).length || 0,
          inconsistent:
            consistencyCheck?.filter(c => !c.is_consistent).length || 0,
          details: consistencyCheck?.filter(c => !c.is_consistent) || [],
        }
      }

      const allOperationsSuccessful = results.operations.every(
        (op: any) => op.success
      )

      return NextResponse.json({
        success: allOperationsSuccessful,
        message: allOperationsSuccessful
          ? 'Recálculo executado com sucesso'
          : 'Recálculo executado com alguns erros',
        data: results,
      })
    } catch (rpcError) {
      console.error('Erro ao executar RPC:', rpcError)
      return NextResponse.json(
        { error: 'Erro ao executar recálculo: ' + rpcError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro na API de recálculo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Verificar consistência das estatísticas
export async function GET(request: NextRequest) {
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

    // Verificar consistência
    const { data: consistencyCheck, error: consistencyError } =
      await supabase.rpc('verify_stats_consistency')

    if (consistencyError) {
      console.error('Erro ao verificar consistência:', consistencyError)
      return NextResponse.json(
        { error: 'Erro ao verificar consistência' },
        { status: 500 }
      )
    }

    const totalChecked = consistencyCheck?.length || 0
    const consistent =
      consistencyCheck?.filter(c => c.is_consistent).length || 0
    const inconsistent =
      consistencyCheck?.filter(c => !c.is_consistent).length || 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_checked: totalChecked,
          consistent: consistent,
          inconsistent: inconsistent,
          consistency_percentage:
            totalChecked > 0
              ? Math.round((consistent / totalChecked) * 100)
              : 100,
        },
        details: consistencyCheck || [],
      },
    })
  } catch (error) {
    console.error('Erro na API de verificação de consistência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}









