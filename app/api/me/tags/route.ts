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

// GET - Obter tags do usuário logado
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

    // Buscar tags do usuário usando a função SQL
    const { data: tags, error: tagsError } = await supabaseService
      .rpc('fn_get_user_tags', {
        p_tenant_id: companyId,
        p_user_id: user.id
      })

    if (tagsError) {
      console.error('Erro ao buscar tags do usuário:', tagsError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar tags do usuário'
        }
      }, { status: 500 })
    }

    // Agrupar tags por key para facilitar o uso no frontend
    const tagsByKey = tags?.reduce((acc: any, tag: any) => {
      if (!acc[tag.key]) {
        acc[tag.key] = []
      }
      acc[tag.key].push({
        value: tag.value,
        description: tag.description,
        color: tag.color
      })
      return acc
    }, {}) || {}

    return NextResponse.json({ 
      success: true,
      data: {
        tags: tags || [],
        tagsByKey,
        total: tags?.length || 0
      }
    })

  } catch (error) {
    console.error('Erro na API de tags do usuário:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

// POST - Atualizar tags do usuário (apenas para gestores/admins)
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

    const userRole = user.user_metadata?.role
    if (!['admin', 'manager', 'gestor'].includes(userRole)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Apenas gestores e administradores podem gerenciar tags'
        }
      }, { status: 403 })
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
    const { targetUserId, tagIds } = body

    if (!targetUserId || !Array.isArray(tagIds)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INVALID_PAYLOAD',
          message: 'targetUserId e tagIds são obrigatórios'
        }
      }, { status: 400 })
    }

    // Verificar se o usuário alvo existe e pertence à mesma empresa
    const { data: targetUser, error: userError } = await supabaseService
      .from('users')
      .select('id, company_id')
      .eq('id', targetUserId)
      .eq('company_id', companyId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado ou não pertence à empresa'
        }
      }, { status: 404 })
    }

    // Verificar se todas as tags existem e pertencem à empresa
    const { data: validTags, error: tagsError } = await supabaseService
      .from('employee_tags_system')
      .select('id')
      .in('id', tagIds)
      .eq('tenant_id', companyId)
      .eq('is_active', true)

    if (tagsError || !validTags || validTags.length !== tagIds.length) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INVALID_TAGS',
          message: 'Uma ou mais tags são inválidas'
        }
      }, { status: 400 })
    }

    // Remover tags existentes do usuário
    const { error: deleteError } = await supabaseService
      .from('user_employee_tags')
      .delete()
      .eq('user_id', targetUserId)
      .eq('tenant_id', companyId)

    if (deleteError) {
      console.error('Erro ao remover tags existentes:', deleteError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar tags do usuário'
        }
      }, { status: 500 })
    }

    // Inserir novas tags
    if (tagIds.length > 0) {
      const newTags = tagIds.map((tagId: string) => ({
        user_id: targetUserId,
        tag_id: tagId,
        tenant_id: companyId,
        assigned_by: user.id
      }))

      const { error: insertError } = await supabaseService
        .from('user_employee_tags')
        .insert(newTags)

      if (insertError) {
        console.error('Erro ao inserir novas tags:', insertError)
        return NextResponse.json({ 
          success: false,
          error: { 
            code: 'DATABASE_ERROR',
            message: 'Erro ao atualizar tags do usuário'
          }
        }, { status: 500 })
      }
    }

    // Buscar tags atualizadas
    const { data: updatedTags, error: fetchError } = await supabaseService
      .rpc('fn_get_user_tags', {
        p_tenant_id: companyId,
        p_user_id: targetUserId
      })

    if (fetchError) {
      console.error('Erro ao buscar tags atualizadas:', fetchError)
    }

    return NextResponse.json({ 
      success: true,
      data: {
        message: 'Tags atualizadas com sucesso',
        tags: updatedTags || []
      }
    })

  } catch (error) {
    console.error('Erro na API de atualização de tags:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}
