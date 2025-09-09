import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Listar opções de empresas para orçamentos baseado no papel do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'internal' // internal | b2b
    const search = searchParams.get('q') || ''

    // Get user from request headers (passed by the frontend)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userCompanyId = request.headers.get('x-user-company-id')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Informações de usuário não fornecidas' },
        { status: 400 }
      )
    }

    let query = supabase.from('companies').select('id, name, email, status')

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply role-based filtering
    if (userRole === 'gestor') {
      // Gestor: only their own company
      if (userCompanyId) {
        query = query.eq('id', userCompanyId)
      } else {
        return NextResponse.json({ items: [] })
      }
    } else if (userRole === 'admin_gestor' || userRole === 'admin') {
      // Admin/Gestor: active companies only
      query = query.eq('status', 'active')
    } else if (userRole === 'superadmin') {
      // Superadmin: all companies
      // No additional filter
    } else {
      // Unknown role: no access
      return NextResponse.json({ items: [] })
    }

    // Apply mode-specific filtering
    if (mode === 'b2b') {
      // For B2B, only show active companies
      if (userRole !== 'superadmin') {
        query = query.eq('status', 'active')
      }
    } else {
      // For internal, show active companies
      query = query.eq('status', 'active')
    }

    // Order by name
    query = query.order('name', { ascending: true })

    // Limit results for performance
    query = query.limit(100)

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar opções de empresas:', error)
      return NextResponse.json(
        {
          error: 'Erro ao buscar empresas',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data || [],
      mode,
      userRole,
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('Erro na API de opções de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
