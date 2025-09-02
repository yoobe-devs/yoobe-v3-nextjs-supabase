import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseService = createClient(supabaseUrl, serviceKey)

async function authenticateAdmin(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  let { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    const header = request.headers.get('authorization')
    if (header?.startsWith('Bearer ')) {
      const token = header.substring(7)
      const { data: { user: tokenUser } } = await supabaseService.auth.getUser(token)
      user = tokenUser || null
    }
  }
  if (!user || user.user_metadata?.role !== 'admin') {
    return { user: null, error: 'forbidden' }
  }
  return { user, error: null }
}

// POST - Criar usuário (admin)
export async function POST(request: NextRequest) {
  try {
    const { user: admin, error } = await authenticateAdmin(request)
    if (error || !admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, role = 'user', company_id, full_name, name } = body || {}
    if (!email || !password) {
      return NextResponse.json({ error: 'email e password são obrigatórios' }, { status: 400 })
    }

    const { data: authUser, error: aerr } = await supabaseService.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, company_id, name: full_name || name || email }
    })
    if (aerr) {
      return NextResponse.json({ error: aerr.message }, { status: 400 })
    }

    await supabaseService
      .from('users')
      .upsert({
        id: authUser.user.id,
        email,
        full_name: full_name || name || null,
        name: name || full_name || null,
        role,
        company_id: company_id || null,
        status: 'active'
      }, { onConflict: 'id' })

    // Auditoria
    try {
      await supabaseService.rpc('log_user_create', {
        p_actor: admin.id,
        p_target: authUser.user.id,
        p_details: { email, role, company_id, source: 'api_admin' }
      })
    } catch {}

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: { id: authUser.user.id, email, role, company_id }
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


