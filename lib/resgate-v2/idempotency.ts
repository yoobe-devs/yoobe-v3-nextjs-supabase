// Lightweight idempotency helper (in-memory fallback).
// Tries to persist in DB when table api_idempotency exists; otherwise, uses process memory.

import { createClient } from '@supabase/supabase-js'

type MemoEntry = { key: string; user_id?: string; created_at: number }
const memo = new Map<string, MemoEntry>()

export async function ensureIdempotency(key: string, userId?: string): Promise<'ok' | 'duplicate'> {
  if (!key) return 'ok'
  // Attempt DB write first
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!url || !service) throw new Error('missing supabase env')
    const supabase = createClient(url, service)
    const { error } = await supabase.from('api_idempotency').insert({
      key,
      user_id: userId || null,
    })
    if (!error) return 'ok'
    if (error?.message?.includes('duplicate') || error?.code === '23505') return 'duplicate'
  } catch {}

  // Fallback memory window
  const k = userId ? `${userId}:${key}` : key
  if (memo.has(k)) return 'duplicate'
  memo.set(k, { key: k, user_id: userId, created_at: Date.now() })
  // cleanup later
  setTimeout(() => memo.delete(k), 5 * 60 * 1000).unref?.()
  return 'ok'
}

