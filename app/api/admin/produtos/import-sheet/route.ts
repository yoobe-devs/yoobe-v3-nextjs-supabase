import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Criar cliente Supabase com service key
const supabaseService = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function ean13FromSku(sku: string): string {
  const digits = (sku || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .split('')
    .map(ch => (/\d/.test(ch) ? parseInt(ch) : ((ch.charCodeAt(0) - 55) % 10)))
  const base: number[] = []
  for (let i = 0; i < 12; i++) base[i] = digits[i % digits.length] ?? 0
  const sum = base.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0)
  const check = (10 - (sum % 10)) % 10
  return base.join('') + String(check)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação de admin
    let user = null
    const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !cookieUser) {
      // Tentar verificar via header Authorization
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
        if (tokenError || !tokenUser) {
          return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }
        user = tokenUser
      } else {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
    } else {
      user = cookieUser
    }

    // Verificar permissões de admin através dos metadados do usuário
    const userRole = (user.user_metadata as any)?.role
    const allowed = ['admin', 'admin_global', 'superadmin']
    if (!allowed.includes(userRole)) {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores podem importar produtos' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const rows: any[] = Array.isArray(body?.rows) ? body.rows : []
    if (!rows.length) return NextResponse.json({ error: 'Nenhuma linha' }, { status: 400 })

    const inserts = rows.map((r) => ({
      name: r.name,
      description: r.description || '',
      category_id: r.category_id || null,
      base_price: parseFloat(r.base_price) || 0,
      base_points_cost: Math.round((parseFloat(r.base_price) || 0) * 10),
      image_url: r.image_url || null,
      specifications: {
        sku: r.sku || '',
        ncm: r.ncm || '00000000',
        ean13: ean13FromSku(r.sku || '')
      },
      status: 'active'
    })).filter(i => i.name && i.base_price > 0)

    const { data, error } = await supabaseService.from('base_products').insert(inserts).select('id')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ inserted: data?.length || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 })
  }
}

