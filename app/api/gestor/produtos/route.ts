import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseService = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação (cookies ou header Authorization)
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data: { user: tokenUser } } = await supabaseService.auth.getUser(token)
        if (tokenUser) {
          user = tokenUser
          authError = null
        }
      }
    }
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é gestor
    if (user.user_metadata?.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar produtos replicados da empresa do gestor
    const { data: products, error } = await supabaseService
      .from('company_products')
      .select(`
        *,
        base_products (
          id,
          name,
          description,
          base_price,
          base_points_cost,
          product_categories (
            id,
            name,
            icon,
            color
          )
        ),
        budgets (
          id,
          title,
          status
        )
      `)
      .eq('company_id', user.user_metadata?.company_id)
      .order('status_fluxo', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
