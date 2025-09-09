import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

type CreatedUser = { id: string; email: string }

async function ensureAuthUser(
  email: string,
  password: string,
  role: string,
  companyId: string
): Promise<CreatedUser> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, company_id: companyId },
  })
  if (
    error &&
    !String(error.message || '')
      .toLowerCase()
      .includes('already')
  ) {
    throw error
  }
  if (!data?.user) {
    const { data: found } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })
    const u = (found?.users || []).find(u => u.email === email)
    if (!u) throw new Error(`User not found after create: ${email}`)
    return { id: u.id, email }
  }
  return { id: data.user.id, email }
}

async function upsertPublicUser(
  id: string,
  email: string,
  role: string,
  companyId: string
) {
  const { error } = await supabase.from('users').upsert(
    {
      id,
      email,
      full_name: email.split('@')[0],
      name: email.split('@')[0],
      role,
      company_id: companyId,
      status: 'active',
    },
    { onConflict: 'id' }
  )
  if (error) throw error
}

async function main() {
  const mainCompany = '550e8400-e29b-41d4-a716-446655440001'
  const testCompany = '550e8400-e29b-41d4-a716-446655440002'

  const admin = await ensureAuthUser(
    'admin@yoobe.com',
    'ChangeMe123!',
    'admin_global',
    mainCompany
  )
  await upsertPublicUser(admin.id, admin.email, 'admin_global', mainCompany)

  const gestor = await ensureAuthUser(
    'gestor@yoobe.com',
    'ChangeMe123!',
    'gestor',
    testCompany
  )
  await upsertPublicUser(gestor.id, gestor.email, 'gestor', testCompany)

  const func = await ensureAuthUser(
    'funcionario@yoobe.com',
    'ChangeMe123!',
    'funcionario',
    testCompany
  )
  await upsertPublicUser(func.id, func.email, 'funcionario', testCompany)

  console.log('Seeded auth and public users successfully')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
