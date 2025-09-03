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

// PATCH - Atualizar status de fluxo do produto
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
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores podem atualizar status de fluxo' }, { status: 403 })
    }

    const productId = params.id
    const body = await request.json()
    const { status_fluxo, notes } = body

    // Validar status
    const validStatuses = ['orcamento_aprovado', 'em_producao', 'enviado_logistica', 'disponivel']
    if (!status_fluxo || !validStatuses.includes(status_fluxo)) {
      return NextResponse.json({ 
        error: 'Status inválido. Use: orcamento_aprovado, em_producao, enviado_logistica, disponivel' 
      }, { status: 400 })
    }

    // Verificar se o produto existe
    const { data: existingProduct, error: fetchError } = await supabaseService
      .from('company_products')
      .select(`
        *,
        base_products (
          id,
          name
        ),
        companies (
          id,
          name
        )
      `)
      .eq('id', productId)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Atualizar status do produto
    const updateData = {
      status_fluxo,
      updated_at: new Date().toISOString()
    }

    const { data: updatedProduct, error: updateError } = await supabaseService
      .from('company_products')
      .update(updateData)
      .eq('id', productId)
      .select(`
        *,
        base_products (
          id,
          name
        ),
        companies (
          id,
          name
        )
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
    }

    // Criar notificação para o gestor se o status for 'disponivel'
    if (status_fluxo === 'disponivel') {
      try {
        await supabaseService
          .from('notifications')
          .insert({
            user_id: existingProduct.companies?.manager_id || existingProduct.company_id,
            company_id: existingProduct.company_id,
            type: 'estoque',
            title: 'Produto Disponível',
            message: `O produto "${existingProduct.base_products?.name}" está agora disponível para ativação na loja.`,
            data: {
              product_id: productId,
              base_product_name: existingProduct.base_products?.name,
              status: 'disponivel'
            }
          })
      } catch (error) {
        console.error('Erro ao criar notificação:', error)
        // Não falhar a operação principal por causa de erro na notificação
      }
    }

    return NextResponse.json({
      message: `Status do produto atualizado para "${status_fluxo}"`,
      product: updatedProduct
    })

  } catch (error) {
    console.error('Erro na API de status de fluxo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
