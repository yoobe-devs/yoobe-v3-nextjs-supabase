import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Recalcular company_stats diretamente (fallback manual/cron)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Opcional: aceitar company_id para recomputar só uma
    const body = await request.json().catch(() => ({}))
    const company_id: string | undefined = body?.company_id

    if (company_id) {
      const { data, error } = await supabase.rpc('recompute_company_stats_direct', { company_id_param: company_id })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, operation: 'recompute_company_stats_direct', affected: 1, data })
    }

    const { data, error } = await supabase.rpc('recompute_all_company_stats_direct')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, operation: 'recompute_all_company_stats_direct', affected: data?.length || 0, data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

