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

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateAdmin(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || undefined
    const targetUserId = searchParams.get('target_user_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseService
      .from('user_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200))

    if (action) query = query.eq('action', action)
    if (targetUserId) query = query.eq('target_user_id', targetUserId)

    const { data, error: qErr } = await query
    if (qErr) {
      return NextResponse.json({ error: 'Erro ao listar auditoria' }, { status: 500 })
    }

    return NextResponse.json({ logs: data || [] })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


