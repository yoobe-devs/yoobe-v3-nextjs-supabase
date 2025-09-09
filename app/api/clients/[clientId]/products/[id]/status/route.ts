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

// PATCH - Ativar/inativar produto replicado
export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string; id: string } }
) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = (user.user_metadata as any)?.role
    if (
      !['manager', 'gestor', 'admin', 'admin_global', 'superadmin'].includes(
        userRole
      )
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const companyId = user.user_metadata?.company_id
    const productId = params.id
    const requestedClientId = params.clientId

    // Verificar se o gestor está tentando acessar produtos da sua própria empresa
    if (companyId !== requestedClientId) {
      return NextResponse.json(
        {
          error:
            'Acesso negado - Você só pode gerenciar produtos da sua empresa',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validar parâmetro
    if (!status || !['active', 'inactive', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Parâmetro status deve ser active, inactive ou draft' },
        { status: 400 }
      )
    }

    // Verificar se o produto existe e pertence à empresa
    const { data: existingProduct, error: fetchError } = await supabaseService
      .from('client_products')
      .select('*')
      .eq('id', productId)
      .eq('client_id', companyId)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar status do produto
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedProduct, error: updateError } = await supabaseService
      .from('client_products')
      .update(updateData)
      .eq('id', productId)
      .eq('client_id', companyId)
      .select(
        `
        *,
        product_categories (
          id,
          name,
          icon,
          color
        ),
        base_products (
          id,
          name,
          base_price,
          base_points_cost
        )
      `
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Produto ${status === 'active' ? 'ativado' : 'inativado'} com sucesso`,
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Erro na API de status do produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
