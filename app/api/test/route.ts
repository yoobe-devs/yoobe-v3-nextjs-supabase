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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test API - Iniciando...')

    // Testar autenticação via cookies
    const supabase = createRouteHandlerClient({ cookies })
    let {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('🔐 Auth via cookies:', {
      user: user?.email,
      error: authError?.message,
    })

    // Se não funcionar, tentar via header
    if (authError || !user) {
      const authHeader = request.headers.get('authorization')
      console.log('🔐 Auth header:', authHeader ? 'Presente' : 'Ausente')

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log('🔐 Token:', token.substring(0, 20) + '...')

        try {
          const {
            data: { user: tokenUser },
            error: tokenError,
          } = await supabaseService.auth.getUser(token)
          console.log('🔐 Auth via token:', {
            user: tokenUser?.email,
            error: tokenError?.message,
          })

          if (!tokenError && tokenUser) {
            user = tokenUser
            authError = null
          }
        } catch (error) {
          console.log('🔐 Erro ao verificar token:', error)
        }
      }
    }

    if (authError || !user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('✅ Usuário autenticado:', user.email)
    console.log('📊 Role:', user.user_metadata?.role)

    // Testar consulta no banco
    const { data: companies, error: dbError } = await supabaseService
      .from('companies')
      .select('id, name, email')
      .limit(5)

    if (dbError) {
      console.log('❌ Erro no banco:', dbError.message)
      return NextResponse.json({ error: 'Erro no banco' }, { status: 500 })
    }

    console.log(
      '✅ Consulta no banco funcionou:',
      companies?.length || 0,
      'empresas'
    )

    return NextResponse.json({
      success: true,
      message: 'API funcionando!',
      user: {
        email: user.email,
        role: user.user_metadata?.role,
      },
      companies: companies?.length || 0,
    })
  } catch (error) {
    console.error('❌ Erro na API de teste:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}










