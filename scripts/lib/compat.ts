import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export function resolvePathOrFallback(candidates: string[]): string {
  for (const p of candidates) {
    if (fs.existsSync(path.resolve(p))) return p
  }
  return candidates[0]
}

export async function tableExists(tableName: string): Promise<boolean> {
  const sql = `
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname = $1
    limit 1
  `
  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql,
    params: [tableName],
  } as any)
  if (error) return false
  return Array.isArray(data) && data.length > 0
}

export async function hasTableCol(
  tableName: string,
  columnName: string
): Promise<boolean> {
  const sql = `
    select 1
    from pg_attribute
    where attrelid = ('public.' || $1)::regclass
      and attname = $2
      and attnum > 0
      and not attisdropped
    limit 1
  `
  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql,
    params: [tableName, columnName],
  } as any)
  if (error) return false
  return Array.isArray(data) && data.length > 0
}

export async function indexExists(
  tableName: string,
  indexName: string
): Promise<boolean> {
  const sql = `
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = $1 and indexname = $2
    limit 1
  `
  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql,
    params: [tableName, indexName],
  } as any)
  if (error) return false
  return Array.isArray(data) && data.length > 0
}

export async function checkExistingAPI(
  endpointPathOrGlob: string
): Promise<boolean> {
  // Basic FS presence check; the caller should pass a file path like app/api/health/route.ts
  try {
    return fs.existsSync(path.resolve(endpointPathOrGlob))
  } catch {
    return false
  }
}
