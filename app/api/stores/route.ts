import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Listar lojas
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
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
          error: { code: 'UNAUTHORIZED', message: authResult.error },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const company_id = searchParams.get('company_id') || ''
    const sortBy = (searchParams.get('sortBy') || '').toLowerCase()
    const sortOrder =
      (searchParams.get('sortOrder') || 'desc').toLowerCase() === 'asc'
        ? 'asc'
        : 'desc'

    let query = supabaseService.from('stores').select(
      `
        id,
        name,
        domain,
        status,
        created_at,
        companies(
          id,
          name,
          logo_url
        )
      `,
      { count: 'exact' }
    )

    // Aplicar filtros
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,companies.name.ilike.%${search}%`
      )
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (company_id) {
      query = query.eq('company_id', company_id)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Ordenação por campos simples no banco
    const dbSortable = new Set(['name', 'created_at', 'status'])
    if (dbSortable.has(sortBy)) {
      query = query.order(sortBy as 'name' | 'created_at' | 'status', {
        ascending: sortOrder === 'asc',
      })
    } else {
      // default fallback
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Erro ao buscar lojas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar lojas' },
        { status: 500 }
      )
    }

    // Retornar dados básicos das lojas e sincronizar contadores via client_products
    const baseStores = (data || []).map(store => {
      const company = Array.isArray(store.companies)
        ? store.companies[0]
        : store.companies

      return {
        ...store,
        domain:
          store.domain ||
          `${store.name.toLowerCase().replace(/\s+/g, '-')}.yoobe.com`,
        logo_url: company?.logo_url || null,
        users_count: 0, // Simplificado para evitar problemas de RLS
        products_count: 0,
        orders_count: 0,
        revenue: 0,
      }
    })

    // Enriquecer contadores com base no client_products, auth.users e orders
    const serviceUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const service = createClient(serviceUrl, serviceKey)

    let enriched = await Promise.all(
      baseStores.map(async s => {
        try {
          const companyId =
            (s as any).company_id ||
            (Array.isArray((s as any).companies)
              ? (s as any).companies[0]?.id
              : (s as any).companies?.id)
          if (!companyId) return s

          // products_count
          const { count } = await supabaseService
            .from('company_products')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)

          // users_count
          let users_count = 0
          try {
            const { count: usersCnt } = await supabaseService
              .from('users')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', companyId)
            users_count = usersCnt || 0
          } catch {
            users_count = 0
          }

          // orders_count and revenue by company_id — best-effort
          let orders_count = 0
          let revenue = 0
          try {
            const [{ count: ordCnt }, { data: revRows }] = await Promise.all([
              supabaseService
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', companyId),
              supabaseService
                .from('orders')
                .select('total_amount')
                .eq('company_id', companyId)
                .eq('status', 'delivered'),
            ])
            orders_count = ordCnt || 0
            revenue = (revRows || []).reduce(
              (sum: number, r: any) => sum + (r.total_amount || 0),
              0
            )
          } catch {}

          return {
            ...s,
            products_count: count || 0,
            users_count,
            orders_count,
            revenue,
          }
        } catch {
          return s
        }
      })
    )

    // Ordenação por campos derivados (client-side)
    const derivedSortable = new Set([
      'products_count',
      'users_count',
      'orders_count',
      'revenue',
    ])
    if (derivedSortable.has(sortBy)) {
      enriched = enriched.sort((a: any, b: any) => {
        const av = a[sortBy as keyof typeof a] || 0
        const bv = b[sortBy as keyof typeof b] || 0
        return sortOrder === 'asc' ? av - bv : bv - av
      })
    }

    return NextResponse.json({
      stores: enriched,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar loja
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
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
          error: { code: 'UNAUTHORIZED', message: authResult.error },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    const body = await request.json()
    const { name, status } = body
    const companyId = user.company_id

    // Validações
    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nome é obrigatório',
          },
        },
        { status: 400 }
      )
    }

    // Verificar se já existe uma loja para esta empresa
    const { data: existingStore } = await supabaseService
      .from('stores')
      .select('id')
      .eq('company_id', companyId)
      .single()

    if (existingStore) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Já existe uma loja para esta empresa',
          },
        },
        { status: 409 }
      )
    }

    // Criar loja
    const { data, error } = await supabaseService
      .from('stores')
      .insert({
        name: name.trim(),
        company_id: companyId,
        status: status || 'active',
      })
      .select(
        `
        id,
        name,
        company_id,
        status,
        created_at,
        companies!inner(
          id,
          name,
          logo_url
        )
      `
      )
      .single()

    if (error) {
      console.error('Erro ao criar loja:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao criar loja',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { store: data },
      message: 'Loja criada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
