import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Função para verificar autenticação
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Primeiro, tentar autenticação via cookies (padrão)
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Se não funcionar, tentar via header Authorization
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        // Verificar token via service role
        const { data: { user: tokenUser }, error: tokenError } = await supabaseService.auth.getUser(token)
        
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

// GET - Listar catálogo filtrado por elegibilidade
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(request)
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado'
        }
      }, { status: 401 })
    }

    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'MISSING_COMPANY',
          message: 'ID da empresa não encontrado no token'
        }
      }, { status: 400 })
    }

    // Extrair parâmetros da query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('q') || null
    const category = searchParams.get('category') || null
    const tagKey = searchParams.get('tagKey') || null
    const tagValue = searchParams.get('tagValue') || null
    const onlyEligible = searchParams.get('onlyEligible') === 'true'
    
    const offset = (page - 1) * pageSize

    // Buscar produtos com elegibilidade usando a função SQL
    const { data: products, error: productsError } = await supabaseService
      .rpc('fn_get_products_with_eligibility', {
        p_tenant_id: companyId,
        p_user_id: user.id,
        p_limit: pageSize,
        p_offset: offset,
        p_search: search,
        p_category: category
      })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar produtos'
        }
      }, { status: 500 })
    }

    // Filtrar por tags específicas se fornecido
    let filteredProducts = products || []
    if (tagKey && tagValue) {
      filteredProducts = filteredProducts.filter((product: any) => {
        return product.product_tags?.some((tag: any) => 
          tag.key === tagKey && tag.value === tagValue
        )
      })
    }

    // Filtrar apenas elegíveis se solicitado
    if (onlyEligible) {
      filteredProducts = filteredProducts.filter((product: any) => product.is_allowed)
    }

    // Buscar total de produtos para paginação
    const { data: totalProducts, error: totalError } = await supabaseService
      .from('products_base')
      .select('id', { count: 'exact' })
      .eq('tenant_id', companyId)
      .eq('active', true)
      .ilike('title', search ? `%${search}%` : '%')
      .eq(category ? 'category' : 'category', category || '')

    const total = totalProducts?.length || 0

    // Buscar tags disponíveis para filtros
    const { data: availableTags, error: tagsError } = await supabaseService
      .from('employee_tags_system')
      .select('key, value, description, color')
      .eq('tenant_id', companyId)
      .eq('is_active', true)
      .order('key, value')

    // Buscar categorias disponíveis
    const { data: categories, error: categoriesError } = await supabaseService
      .from('products_base')
      .select('category')
      .eq('tenant_id', companyId)
      .eq('active', true)
      .not('category', 'is', null)

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])]

    // Formatar resposta
    const formattedProducts = filteredProducts.map((product: any) => ({
      id: product.id,
      sku: product.sku,
      title: product.title,
      description: product.description,
      price_cash: product.price_cash,
      price_points: product.price_points,
      category: product.category,
      active: product.active,
      media: product.media || [],
      variations: product.variations || [],
      is_allowed: product.is_allowed,
      reason: product.reason,
      product_tags: product.product_tags || [],
      policy_mode: product.policy_mode,
      thumbnail: product.media?.[0] || null
    }))

    return NextResponse.json({ 
      success: true,
      data: {
        items: formattedProducts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: page * pageSize < total,
          hasPrev: page > 1
        },
        filters: {
          availableTags: availableTags || [],
          availableCategories: uniqueCategories,
          currentFilters: {
            search,
            category,
            tagKey,
            tagValue,
            onlyEligible
          }
        }
      }
    })

  } catch (error) {
    console.error('Erro na API de catálogo do funcionário:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

// POST - Verificar elegibilidade de produtos específicos
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(request)
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado'
        }
      }, { status: 401 })
    }

    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'MISSING_COMPANY',
          message: 'ID da empresa não encontrado no token'
        }
      }, { status: 400 })
    }

    const body = await request.json()
    const { productIds } = body

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INVALID_PAYLOAD',
          message: 'productIds deve ser um array não vazio'
        }
      }, { status: 400 })
    }

    // Verificar elegibilidade para cada produto
    const eligibilityResults = await Promise.all(
      productIds.map(async (productId: string) => {
        const { data: result, error } = await supabaseService
          .rpc('fn_is_product_allowed_for_employee', {
            p_tenant_id: companyId,
            p_user_id: user.id,
            p_product_id: productId
          })

        if (error) {
          console.error(`Erro ao verificar elegibilidade do produto ${productId}:`, error)
          return {
            productId,
            is_allowed: false,
            reason: 'Erro ao verificar elegibilidade'
          }
        }

        return {
          productId,
          is_allowed: result?.[0]?.is_allowed || false,
          reason: result?.[0]?.reason || 'Erro ao verificar elegibilidade'
        }
      })
    )

    return NextResponse.json({ 
      success: true,
      data: {
        eligibility: eligibilityResults
      }
    })

  } catch (error) {
    console.error('Erro na API de verificação de elegibilidade:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}
