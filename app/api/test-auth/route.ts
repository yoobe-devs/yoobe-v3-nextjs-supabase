import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando autenticação na API...')
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('📋 Resultado da verificação de autenticação:')
    console.log(`- Auth Error: ${authError?.message || 'Nenhum erro'}`)
    console.log(`- User: ${user ? 'Presente' : 'Ausente'}`)
    console.log(`- User ID: ${user?.id || 'N/A'}`)
    console.log(`- User Email: ${user?.email || 'N/A'}`)
    console.log(`- User Role: ${user?.user_metadata?.role || 'N/A'}`)
    console.log(`- User Company ID: ${user?.user_metadata?.company_id || 'N/A'}`)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Não autorizado',
        details: {
          authError: authError?.message,
          userPresent: !!user
        }
      }, { status: 401 })
    }

    return NextResponse.json({ 
      message: 'Autenticação bem-sucedida',
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        company_id: user.user_metadata?.company_id,
        store_id: user.user_metadata?.store_id
      }
    })

  } catch (error) {
    console.error('❌ Erro na API de teste:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
