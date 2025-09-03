import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @api {get} /api/gestor/produtos Listar produtos replicados
 * @apiName ListProducts
 * @apiGroup Gestor
 * @apiDescription Lista todos os produtos replicados para a loja do gestor
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    // Buscar produtos replicados da empresa
    const { data: products, error: productsError } = await supabase
      .from('product_store')
      .select(`
        *,
        budget_items (
          id,
          product_name,
          product_description,
          product_image,
          product_category
        )
      `)
      .eq('tenant_id', user.company_id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar produtos' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total: products?.length || 0,
        company_id: user.company_id
      }
    })

  } catch (error) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

/**
 * @api {post} /api/gestor/produtos Criar produto replicado
 * @apiName CreateProduct
 * @apiGroup Gestor
 * @apiDescription Cria um novo produto replicado na loja do gestor
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      budget_item_id, 
      name, 
      description, 
      price, 
      points, 
      category, 
      image_url, 
      is_active = false 
    } = body

    // Validação dos campos obrigatórios
    if (!budget_item_id || !name || !description || !price || !points || !category) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios não preenchidos' } },
        { status: 400 }
      )
    }

    // Criar produto replicado
    const { data: product, error: createError } = await supabase
      .from('product_store')
      .insert({
        budget_item_id,
        name,
        description,
        price,
        points,
        category,
        image_url,
        is_active,
        tenant_id: user.company_id,
        created_by: session.user.id,
        updated_by: session.user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar produto:', createError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao criar produto' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabase
      .from('audit_log')
      .insert({
        event_type: 'product_created',
        actor_id: session.user.id,
        role: user.role,
        tenant_id: user.company_id,
        target: 'product_store',
        payload: { product_id: product.id, action: 'create' }
      })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produto criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
