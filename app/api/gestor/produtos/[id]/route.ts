import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Função para verificar autenticação via header ou cookies
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

// PATCH - Atualizar produto do gestor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado - Apenas gestores podem atualizar produtos' }, { status: 403 })
    }

    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não encontrado' }, { status: 400 })
    }

    const productId = params.id
    const body = await request.json()
    const { price, points_cost, stock_quantity, description } = body

    // Verificar se o produto pertence à empresa do gestor
    const { data: existingProduct, error: checkError } = await supabaseService
      .from('company_products')
      .select('id, company_id')
      .eq('id', productId)
      .eq('company_id', companyId)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado ou não pertence à sua empresa' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ error: 'Preço deve ser um número positivo' }, { status: 400 })
      }
      updateData.price = price
    }

    if (points_cost !== undefined) {
      if (typeof points_cost !== 'number' || points_cost < 0) {
        return NextResponse.json({ error: 'Pontos devem ser um número positivo' }, { status: 400 })
      }
      updateData.points_cost = points_cost
    }

    if (stock_quantity !== undefined) {
      if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
        return NextResponse.json({ error: 'Estoque deve ser um número positivo' }, { status: 400 })
      }
      updateData.stock_quantity = stock_quantity
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return NextResponse.json({ error: 'Descrição deve ser uma string' }, { status: 400 })
      }
      updateData.description = description
    }

    // Atualizar produto
    const { data: updatedProduct, error: updateError } = await supabaseService
      .from('company_products')
      .update(updateData)
      .eq('id', productId)
      .eq('company_id', companyId)
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
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Produto atualizado com sucesso',
      company_product: updatedProduct
    })

  } catch (error) {
    console.error('Erro na API de atualização de produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
