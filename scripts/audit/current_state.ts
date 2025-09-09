import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function tableExists(table: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname=$1 limit 1`,
    params: [table],
  } as any)
  if (error) return false
  return Array.isArray(data) && data.length > 0
}

async function hasColumn(table: string, column: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `select 1 from pg_attribute where attrelid=('public.'||$1)::regclass and attname=$2 and attnum>0 and not attisdropped limit 1`,
    params: [table, column],
  } as any)
  if (error) return false
  return Array.isArray(data) && data.length > 0
}

async function run() {
  const result: any = { env: {}, tables: {}, apis: {}, notes: [] }

  // ENV
  const envKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PORT',
    'AUTH_MODE',
    'REPLICATION_SINK',
  ]
  for (const k of envKeys) result.env[k] = !!process.env[k]

  // Tables present
  const mustTables = [
    'client_products',
    'company_products',
    'product_store',
    'budgets',
    'budget_items',
  ]
  for (const t of mustTables) result.tables[t] = await tableExists(t)

  // Critical columns
  result.tables['budget_items.base_product_id'] = await hasColumn(
    'budget_items',
    'base_product_id'
  )
  result.tables['company_products.final_sku'] = await hasColumn(
    'company_products',
    'final_sku'
  )
  result.tables['company_products.ean_13'] = await hasColumn(
    'company_products',
    'ean_13'
  )

  fs.writeFileSync(
    '/tmp/audit-current-state.json',
    JSON.stringify(result, null, 2)
  )
  console.log('Wrote /tmp/audit-current-state.json')
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
