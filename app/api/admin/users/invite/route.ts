import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendEmployeeInvite, sendManagerInvite } from '@/lib/email'

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

export async function POST(request: NextRequest) {
  try {
    const { user: admin, error } = await authenticateAdmin(request)
    if (error || !admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role = 'user', company_id, name } = body || {}
    if (!email || !company_id) {
      return NextResponse.json({ error: 'email e company_id são obrigatórios' }, { status: 400 })
    }

    // Opcional: pré-criar perfil básico
    const { data: maybeUser } = await supabaseService
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    let targetId = maybeUser?.id || null

    if (!maybeUser) {
      const ins = await supabaseService.from('users')
        .insert({
          email,
          full_name: name || null,
          name: name || null,
          role,
          company_id,
          status: 'pending'
        })
        .select('id')
        .single()
      if (!ins.error) targetId = ins.data.id
    }

    // Enviar convite por email
    try {
      const emailRes = role === 'manager'
        ? await sendManagerInvite({ email, name, company_id })
        : await sendEmployeeInvite({ email, name, company_id })

      // Auditoria sucesso
      try {
        await supabaseService.rpc('log_user_invite', {
          p_actor: admin.id,
          p_target: targetId,
          p_details: { email, role, company_id, email_message_id: emailRes?.messageId || null }
        })
      } catch {}

      if (emailRes?.success === false) {
        throw new Error(emailRes?.error || 'email_send_failed')
      }

      return NextResponse.json({ message: 'Convite enviado com sucesso' }, { status: 201 })
    } catch (err: any) {
      const devFallback = process.env.EMAIL_DEV_FALLBACK === 'true'
      if (devFallback) {
        // Fallback em desenvolvimento: registra auditoria e retorna 201 sem enviar email real
        try {
          await supabaseService.rpc('log_user_invite', {
            p_actor: admin.id,
            p_target: targetId,
            p_details: { email, role, company_id, dev_fallback: true, error: err?.message || 'unknown' }
          })
        } catch {}
        return NextResponse.json({ message: 'Convite registrado (dev)', devFallback: true }, { status: 201 })
      }
      return NextResponse.json({ error: 'Falha ao enviar convite (SMTP)' }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


