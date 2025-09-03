import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Tipos
interface ProductBase {
  id: string
  sku: string
  title: string
  description: string
  price_cash: number
  price_points: number
  category: string
  active: boolean
  tenant_id: string
  media: string[]
  variations: any[]
  created_at: string
  updated_at: string
}

interface CreateProductPayload {
  sku: string
  title: string
  description?: string
  price_cash: number
  price_points: number
  category: string
  active?: boolean
  media?: string[]
  variations?: any[]
}

interface UpdateProductPayload {
  title?: string
  description?: string
  price_cash?: number
  price_points?: number
  category?: string
  active?: boolean
  media?: string[]
  variations?: any[]
}

// Validação de payload
function validateCreatePayload(payload: any): payload is CreateProductPayload {
  if (!payload.sku || typeof payload.sku !== 'string') {
    throw new Error('SKU é obrigatório e deve ser uma string')
  }
  if (!payload.title || typeof payload.title !== 'string') {
    throw new Error('Título é obrigatório e deve ser uma string')
  }
  if (typeof payload.price_cash !== 'number' || payload.price_cash < 0) {
    throw new Error('Preço em dinheiro deve ser um número maior ou igual a zero')
  }
  if (typeof payload.price_points !== 'number' || payload.price_points < 0) {
    throw new Error('Preço em pontos deve ser um número maior ou igual a zero')
  }
  if (!payload.category || typeof payload.category !== 'string') {
    throw new Error('Categoria é obrigatória e deve ser uma string')
  }
  return true
}

function validateUpdatePayload(payload: any): payload is UpdateProductPayload {
  if (payload.title !== undefined && typeof payload.title !== 'string') {
    throw new Error('Título deve ser uma string')
  }
  if (payload.description !== undefined && typeof payload.description !== 'string') {
    throw new Error('Descrição deve ser uma string')
  }
  if (payload.price_cash !== undefined && (typeof payload.price_cash !== 'number' || payload.price_cash < 0)) {
    throw new Error('Preço em dinheiro deve ser um número maior ou igual a zero')
  }
  if (payload.price_points !== undefined && (typeof payload.price_points !== 'number' || payload.price_points < 0)) {
    throw new Error('Preço em pontos deve ser um número maior ou igual a zero')
  }
  if (payload.category !== undefined && typeof payload.category !== 'string') {
    throw new Error('Categoria deve ser uma string')
  }
  if (payload.active !== undefined && typeof payload.active !== 'boolean') {
    throw new Error('Status ativo deve ser um booleano')
  }
  return true
}

// Autenticação e autorização
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verificar token de autorização
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorização é obrigatório')
  }

  const token = authHeader.substring(7)
  
  // Verificar sessão
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    throw new Error('Token inválido ou expirado')
  }

  // Verificar se o usuário tem role de admin_global
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    throw new Error('Usuário não encontrado')
  }

  if (userData.role !== 'admin_global') {
    throw new Error('Acesso negado. Apenas administradores globais podem gerenciar produtos base.')
  }

  return { user, userData }
}

// GET /api/admin/products-base
export async function GET(request: NextRequest) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category') || ''
    const active = searchParams.get('active') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir query base
    let supabaseQuery = supabase
      .from('products_base')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,sku.ilike.%${query}%`)
    }
    
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category)
    }
    
    if (active !== '') {
      supabaseQuery = supabaseQuery.eq('active', active === 'true')
    }

    // Aplicar paginação
    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Executar query
    const { data: products, error, count } = await supabaseQuery

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DATABASE_ERROR', 
            message: 'Erro ao buscar produtos no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    // Buscar snapshots de estoque para cada produto
    const productsWithStock = await Promise.all(
      (products || []).map(async (product) => {
        const { data: stockData } = await supabase
          .from('stock_snapshots')
          .select('*')
          .eq('product_id', product.id)
        
        return {
          ...product,
          stock_snapshots: stockData || []
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: productsWithStock,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de produtos base:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/products-base
export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Validar payload
    const payload = await request.json()
    validateCreatePayload(payload)

    // Verificar se SKU já existe
    const { data: existingProduct, error: checkError } = await supabase
      .from('products_base')
      .select('id')
      .eq('sku', payload.sku)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DUPLICATE_SKU', 
            message: 'SKU já existe no sistema' 
          } 
        },
        { status: 409 }
      )
    }

    // Preparar dados para inserção
    const productData = {
      ...payload,
      tenant_id: userData.company_id || 'admin',
      created_by: user.id,
      updated_by: user.id,
      active: payload.active !== undefined ? payload.active : true,
      media: payload.media || [],
      variations: payload.variations || []
    }

    // Inserir produto
    const { data: newProduct, error: insertError } = await supabase
      .from('products_base')
      .insert(productData)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao inserir produto:', insertError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INSERT_ERROR', 
            message: 'Erro ao inserir produto no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabase
        .from('audit_log')
        .insert({
          event_type: 'product_base_created',
          actor_id: user.id,
          role: userData.role,
          tenant_id: userData.company_id,
          target: 'products_base',
          target_id: newProduct.id,
          payload: {
            action: 'create',
            product_data: productData
          },
          ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Produto base criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de produtos base:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('SKU é obrigatório')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: error.message 
            } 
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}
