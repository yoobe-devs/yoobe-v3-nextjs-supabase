import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'

type TableInfo = {
  name: string
  exists: boolean
  columns?: { name: string; type: string; is_nullable: boolean }[]
  rls_enabled?: boolean
  policies?: { name: string; command: string; roles: string[] }[]
}

const SUPABASE_URL =
  process.env.SUPABASE_SERVICE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

const LEGACY_PATTERNS = [
  /client_products/,
  /client_id/,
  /mocks?\//,
  /fixtures?\//,
]

const V31_TABLES = [
  'companies',
  'stores',
  'base_products',
  'company_products',
  'product_categories',
]

const V33_FEATURE_TABLES = [
  'budgets',
  'budget_items',
  'budget_costs',
  'budget_versions',
  'charges',
  'payments',
  'invoices',
  'budget_files',
  'replications',
  'artworks',
  'budget_item_artworks',
  'budget_item_customizations',
  'budget_tracking_events',
  'production_orders',
  'tags',
  'user_tags',
  'company_product_tags',
  'sku_counters',
]

async function querySql(sql: string) {
  const client = new Client({
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 54322),
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  })
  try {
    await client.connect()
    const res = await client.query(sql)
    return res.rows
  } catch (e) {
    return []
  } finally {
    try {
      await client.end()
    } catch {}
  }
}

async function getTableInfo(table: string): Promise<TableInfo> {
  const existsRows = await querySql(`
    select to_regclass('public.${table}') is not null as exists
  `)
  const exists = existsRows[0]?.exists === true
  const info: TableInfo = { name: table, exists }
  if (!exists) return info
  const columns = await querySql(`
    select column_name as name, data_type as type, is_nullable = 'YES' as is_nullable
    from information_schema.columns where table_schema='public' and table_name='${table}' order by ordinal_position
  `)
  const rls = await querySql(`
    select relrowsecurity as rls_enabled from pg_class where relname='${table}' and relnamespace = 'public'::regnamespace
  `)
  const policies = await querySql(`
    select polname as name, polcmd as command, array(select rolname from pg_roles where oid = any(polroles)) as roles
    from pg_policies where schemaname='public' and tablename='${table}'
  `)
  info.columns = columns
  info.rls_enabled = rls[0]?.rls_enabled === true
  info.policies = policies
  return info
}

function scanLegacyRefs(): { file: string; matches: string[] }[] {
  const root = process.cwd()
  const files: string[] = []
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      if (entry.startsWith('.')) continue
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        if (['node_modules', 'coverage', 'supabase/.temp'].includes(entry))
          continue
        walk(full)
      } else if (/\.(ts|tsx|sql|js)$/.test(entry)) {
        files.push(full)
      }
    }
  }
  walk(root)
  const results: { file: string; matches: string[] }[] = []
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const matches = LEGACY_PATTERNS.filter(re => re.test(content)).map(String)
    if (matches.length)
      results.push({ file: path.relative(root, file), matches })
  }
  return results
}

function listRoutesAndScreens() {
  const routes: string[] = []
  const appDir = path.join(process.cwd(), 'app')
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) walk(full)
      else if (/route\.ts$/.test(entry))
        routes.push(path.relative(appDir, full))
    }
  }
  walk(appDir)
  const screens = routes
    .filter(r => !r.includes('/api/'))
    .map(r => r.replace(/\/route\.ts$/, ''))
  return { routes, screens }
}

async function linterAndTypecheck() {
  const results: any = {}
  try {
    execSync('npm run lint:ci', { stdio: 'pipe' })
    results.eslint = { ok: true }
  } catch (e: any) {
    results.eslint = { ok: false, output: e.stdout?.toString() || e.message }
  }
  try {
    execSync('npm run typecheck', { stdio: 'pipe' })
    results.tsc = { ok: true }
  } catch (e: any) {
    results.tsc = { ok: false, output: e.stdout?.toString() || e.message }
  }
  return results
}

async function main() {
  const dbTables = [...V31_TABLES, ...V33_FEATURE_TABLES]
  const tables: TableInfo[] = []
  for (const t of dbTables) {
    tables.push(await getTableInfo(t))
  }
  const legacyRefs = scanLegacyRefs()
  const { routes, screens } = listRoutesAndScreens()
  const lintType = await linterAndTypecheck()

  const output = {
    version: 'rollback_v31_audit_v1',
    timestamp: new Date().toISOString(),
    legacyRefs,
    routes,
    screens,
    tables,
    lintType,
  }

  const outFile = '/tmp/audit-rollback-v31.json'
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2))

  // Console table summaries
  console.log('\n=== Legacy Refs ===')
  console.table(legacyRefs.slice(0, 20))
  console.log('\n=== Tables (exists, rls) ===')
  console.table(
    tables.map(t => ({
      table: t.name,
      exists: t.exists,
      rls: t.rls_enabled,
      cols: t.columns?.length || 0,
      policies: t.policies?.length || 0,
    }))
  )
  console.log('\n=== Routes count ===', routes.length)
  console.log('\n=== Lint/Type ===')
  console.log(lintType)
  console.log(`\nJSON salvo em ${outFile}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
