import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function audit(action: string, entity: string, actorUserId: string, entityId?: string, metadata?: Record<string, any>) {
  try {
    await service.from('audit_logs').insert({
      action,
      entity,
      entity_id: entityId || null,
      actor_user_id: actorUserId,
      metadata: metadata || {}
    })
  } catch {}
}















