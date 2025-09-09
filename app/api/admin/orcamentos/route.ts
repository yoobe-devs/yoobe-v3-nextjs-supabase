import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Função para verificar autenticação via header ou cookies
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Primeiro, tentar autenticação via cookies (padrão)
  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Se não funcionar, tentar via header Authorization
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        // Verificar token via service role
        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabaseService.auth.getUser(token)

        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }

  return { user, error: authError }
}

// GET - Listar todos os orçamentos (Admin Global)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      console.log('Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (
      userRole !== 'admin' &&
      userRole !== 'admin_global' &&
      userRole !== 'superadmin'
    ) {
      console.log('Usuário não autorizado:', {
        email: user.email,
        role: userRole,
      })
      return NextResponse.json(
        {
          error:
            'Acesso negado - Apenas administradores podem acessar orçamentos',
        },
        { status: 403 }
      )
    }

    console.log('Usuário autorizado:', { email: user.email, role: userRole })

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const companyId = searchParams.get('company_id') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Query base para orçamentos
    let query = supabaseService.from('budgets').select(
      `
        *,
        budget_items (
          id,
          base_product_id,
          quantity,
          custom_price,
          custom_points_cost,
          notes,
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
          )
        )
      `,
      { count: 'exact' }
    )

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }
    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const {
      data: budgets,
      error: budgetsError,
      count,
    } = await query.range(from, to).order('created_at', { ascending: false })

    if (budgetsError) {
      console.error('Erro ao buscar orçamentos:', budgetsError)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    // Buscar dados das empresas e managers separadamente
    const budgetsWithRelations = await Promise.all(
      (budgets || []).map(async budget => {
        try {
          // Buscar dados da empresa
          const { data: companyData, error: companyError } =
            await supabaseService
              .from('companies')
              .select(
                'id, name, email, phone, address, city, state, zip_code, status'
              )
              .eq('id', budget.company_id)
              .single()

          // Buscar dados do manager
          const { data: managerData, error: managerError } =
            await supabaseService.auth.admin.getUserById(budget.manager_id)

          return {
            ...budget,
            companies: companyData || null,
            managers: managerData?.user
              ? {
                  id: managerData.user.id,
                  email: managerData.user.email,
                  user_metadata: managerData.user.user_metadata,
                }
              : null,
          }
        } catch (error) {
          console.error('Erro ao buscar relacionamentos:', error)
          return {
            ...budget,
            companies: null,
            managers: null,
          }
        }
      })
    )

    return NextResponse.json({
      budgets: budgetsWithRelations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de orçamentos do admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
