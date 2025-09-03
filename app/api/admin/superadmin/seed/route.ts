import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabase = createClient(supabaseUrl, serviceKey)

export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Indisponível em produção' }, { status: 403 })
    }

    const email = 'superadmin@test.com'
    const password = 'superadmin123'

    // Criar usuário auth (se não existir)
    const { data: existing } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    let userId = existing?.id as string | undefined

    if (!userId) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'superadmin', full_name: 'Super Admin Test' },
      })
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
      userId = created.user.id
    } else {
      // Garantir metadata
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: 'superadmin', full_name: 'Super Admin Test' },
      })
    }

    // Upsert em public.users
    const { error: upErr } = await supabase
      .from('users')
      .upsert({ id: userId, email, full_name: 'Super Admin Test', role: 'superadmin', status: 'active' }, { onConflict: 'id' })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    return NextResponse.json({ success: true, email, password })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 })
  }
}

