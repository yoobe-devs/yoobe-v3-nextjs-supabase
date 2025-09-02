import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function requireUser() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    const err: any = new Error('Não autenticado')
    err.status = 401
    throw err
  }
  return { userId: user.id, companyId: user.user_metadata?.company_id as string | undefined }
}

