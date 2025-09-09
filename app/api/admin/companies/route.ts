import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cache, createCacheKey, withCache } from '@/lib/cache'
import {
  rateLimiter,
  getRequestIdentifier,
  RATE_LIMITS,
} from '@/lib/rate-limiter'

// GET - Listar empresas com contadores de produtos
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRequestIdentifier(request)
    const rateLimitResult = rateLimiter.checkLimit(
      identifier,
      RATE_LIMITS.admin.maxRequests,
      RATE_LIMITS.admin.windowMs
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.admin.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      )
    }

    // Verificar cache primeiro
    const cacheKey = createCacheKey('admin', 'companies', 'list')
    const cachedData = cache.getWithStats(cacheKey)
    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Verificar autenticação via cookies ou token
    let user = null
    let supabase = createRouteHandlerClient({ cookies })

    // Tentar autenticação via cookies primeiro
    const {
      data: { user: cookieUser },
      error: cookieError,
    } = await supabase.auth.getUser()

    if (cookieUser) {
      user = cookieUser
    } else {
      // Tentar autenticação via token no header
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const supabaseService = createClient(
          'http://localhost:54321',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        )

        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabaseService.auth.getUser(token)
        if (tokenUser) {
          user = tokenUser
          supabase = supabaseService
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Query básica de empresas
    let query = supabase.from('companies').select(`
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        status,
        created_at,
        updated_at
      `)

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Aplicar ordenação
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Aplicar paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: companies, error, count } = await query

    if (error) {
      console.error('Erro ao buscar empresas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar empresas' },
        { status: 500 }
      )
    }

    // Formatar resposta básica
    const baseCompanies =
      companies?.map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        state: company.state,
        status: company.status,
        created_at: company.created_at,
        updated_at: company.updated_at,
        products_total: 0, // Será calculado abaixo
        products_draft: 0,
        products_liberado: 0,
        products_ativo: 0,
        products_inativo: 0,
      })) || []

    // Enriquecer com stores_count e products_count
    let storesCountByCompany: Record<string, number> = {}
    let productsCountByCompany: Record<string, number> = {}

    try {
      const companyIds = baseCompanies.map(c => c.id)
      if (companyIds.length > 0) {
        // Contar lojas
        const { data: storesRows, error: storesErr } = await supabase
          .from('stores')
          .select('id, company_id')
          .in('company_id', companyIds)

        if (!storesErr && storesRows) {
          storesCountByCompany = storesRows.reduce(
            (acc: Record<string, number>, row: any) => {
              const cid = row.company_id
              acc[cid] = (acc[cid] || 0) + 1
              return acc
            },
            {}
          )
        }

        // Contar produtos
        const { data: productsRows, error: productsErr } = await supabase
          .from('company_products')
          .select('id, company_id, status')
          .in('company_id', companyIds)

        if (!productsErr && productsRows) {
          productsCountByCompany = productsRows.reduce(
            (acc: Record<string, number>, row: any) => {
              const cid = row.company_id
              if (!acc[cid]) acc[cid] = 0
              acc[cid]++
              return acc
            },
            {}
          )
        }
      }
    } catch (e) {
      console.warn('Falha ao calcular contadores:', e)
    }

    const formattedCompanies = baseCompanies.map(c => ({
      ...c,
      stores_count: storesCountByCompany[c.id] || 0,
      products_total: productsCountByCompany[c.id] || 0,
    }))

    const response = {
      success: true,
      data: formattedCompanies,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    }

    // Armazenar no cache por 2 minutos
    cache.set(cacheKey, response, 2 * 60 * 1000)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova empresa
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
    const { name, email, status = 'active' } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar empresa
    const { data: company, error: createError } = await supabase
      .from('companies')
      .insert([
        {
          name,
          email,
          status,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar empresa:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      )
    }

    // Estatísticas serão calculadas automaticamente quando produtos forem criados

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        products_total: 0,
        products_draft: 0,
        products_liberado: 0,
        products_ativo: 0,
        products_inativo: 0,
      },
    })
  } catch (error) {
    console.error('Erro na API de criação de empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
