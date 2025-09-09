import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'

type ProblemSeverity = 'error' | 'warn' | 'info'

interface Problem {
  severity: ProblemSeverity
  code: string
  message: string
  details?: any
}

interface ProposedFix {
  code: string
  description: string
}

interface AuditResult {
  summary: {
    scannedFiles: number
    legacyRefs: number
    dbTablesChecked: number
    rlsChecked: boolean
  }
  problems: Problem[]
  proposed_fixes: ProposedFix[]
  findings: any
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../..')

function readAllFiles(
  dir: string,
  exts: string[] = ['.ts', '.tsx', '.js', '.json', '.sql']
): string[] {
  const results: string[] = []
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop() as string
    let entries: fs.Dirent[] = []
    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (
        entry.name.startsWith('.git') ||
        entry.name === 'node_modules' ||
        entry.name === 'coverage'
      )
        continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
      } else if (exts.includes(path.extname(entry.name))) {
        results.push(full)
      }
    }
  }
  return results
}

function scanLegacyRefs(files: string[]) {
  const matches: { file: string; line: number; content: string }[] = []
  const re = /(client_products|client_id)/
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8')
      const lines = content.split(/\r?\n/)
      lines.forEach((line, idx) => {
        if (re.test(line)) {
          matches.push({
            file: path.relative(ROOT, file),
            line: idx + 1,
            content: line.trim().slice(0, 300),
          })
        }
      })
    } catch {}
  }
  return matches
}

function parseImports(files: string[]) {
  const importRe = /import\s+(?:[^'"\n]+)\s+from\s+['\"]([^'\"]+)['\"]/g
  const requiresRe = /require\(\s*['\"]([^'\"]+)['\"]\s*\)/g
  const usedModules = new Set<string>()
  for (const file of files) {
    if (
      !file.endsWith('.ts') &&
      !file.endsWith('.tsx') &&
      !file.endsWith('.js')
    )
      continue
    try {
      const content = fs.readFileSync(file, 'utf8')
      let m: RegExpExecArray | null
      while ((m = importRe.exec(content))) {
        const mod = m[1]
        if (!mod.startsWith('.') && !mod.startsWith('/'))
          usedModules.add(
            mod.split('/')[0] === '@'
              ? mod.split('/').slice(0, 2).join('/')
              : mod.split('/')[0]
          )
      }
      while ((m = requiresRe.exec(content))) {
        const mod = m[1]
        if (!mod.startsWith('.') && !mod.startsWith('/'))
          usedModules.add(
            mod.split('/')[0] === '@'
              ? mod.split('/').slice(0, 2).join('/')
              : mod.split('/')[0]
          )
      }
    } catch {}
  }
  return Array.from(usedModules)
}

function runCommand(cmd: string, args: string[], cwd: string) {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8' })
  return {
    code: res.status ?? 0,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  }
}

async function checkDb(supabaseUrl?: string, serviceKey?: string) {
  const problems: Problem[] = []
  const findings: any = {
    tables: {},
    rls: { enabled: false, policies: [] as any[] },
  }
  if (!supabaseUrl || !serviceKey) {
    problems.push({
      severity: 'warn',
      code: 'DB_CONFIG_MISSING',
      message: 'Supabase URL/Service key ausentes; pulando checagens de DB/RLS',
    })
    return { problems, findings }
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const tables = [
    'companies',
    'base_products',
    'company_products',
    'budgets',
    'budget_items',
    'budget_costs',
    'budget_versions',
    'charges',
    'payments',
    'invoices',
    'budget_files',
    'replications',
    'tags',
    'user_tags',
    'company_product_tags',
    'artworks',
    'budget_item_artworks',
    'budget_item_customizations',
    'budget_tracking_events',
    'production_orders',
    'sku_counters',
  ]

  for (const t of tables) {
    try {
      const { error } = await supabase
        .from(t)
        .select('*', { head: true, count: 'exact' })
        .limit(1)
      findings.tables[t] = { exists: !error, error: error?.message }
      if (error)
        problems.push({
          severity: t === 'sku_counters' ? 'info' : 'warn',
          code: 'TABLE_MISSING',
          message: `Tabela ausente: ${t}`,
          details: error.message,
        })
    } catch (e: any) {
      findings.tables[t] = { exists: false, error: String(e?.message || e) }
      problems.push({
        severity: 'warn',
        code: 'TABLE_CHECK_ERROR',
        message: `Falha ao checar tabela: ${t}`,
        details: String(e),
      })
    }
  }

  // RLS snapshot (melhor-esforço). Requer DATABASE_URL para consultar pg_catalog
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    problems.push({
      severity: 'info',
      code: 'RLS_SKIPPED',
      message: 'RLS snapshot pulado (faltando DATABASE_URL)',
    })
  } else {
    try {
      // Dynamic import to avoid hard dependency (ignore TS resolution)
      // @ts-ignore
      const { Client } = await import('pg')
      const client = new Client({ connectionString: dbUrl })
      await client.connect()
      const r = await client.query(
        `select schemaname, tablename, rowsecurity from pg_tables where schemaname in ('public');`
      )
      const p = await client.query(
        `select polname as policy_name, schemaname, tablename, cmd, qual, with_check from pg_policies where schemaname in ('public');`
      )
      findings.rls.enabled = true
      findings.rls.tables = r.rows
      findings.rls.policies = p.rows
      await client.end()
    } catch (e: any) {
      problems.push({
        severity: 'info',
        code: 'RLS_FAILED',
        message: 'Não foi possível coletar snapshot de RLS',
        details: String(e?.message || e),
      })
    }
  }

  return { problems, findings }
}

function listApiEndpoints() {
  const apiDir = path.join(ROOT, 'app', 'api')
  const endpoints: string[] = []
  const files = readAllFiles(apiDir, ['.ts', '.tsx'])
  for (const f of files) {
    if (path.basename(f) === 'route.ts') {
      endpoints.push(
        '/' +
          path
            .relative(path.join(ROOT, 'app'), path.dirname(f))
            .replace(/\\/g, '/')
      )
    }
  }
  return endpoints.sort()
}

async function main() {
  const problems: Problem[] = []
  const proposed_fixes: ProposedFix[] = []

  const files = readAllFiles(ROOT)
  const legacy = scanLegacyRefs(files)

  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')
  )
  const deps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ])
  const used = parseImports(files)
  const missing = used.filter(
    m => !deps.has(m) && !m.startsWith('@supabase/auth-helpers-nextjs')
  )
  const unused = Array.from(deps).filter(
    d => !used.includes(d) && !d.startsWith('@types/')
  )

  if (legacy.length)
    problems.push({
      severity: 'warn',
      code: 'LEGACY_REFS',
      message: `Foram encontradas ${legacy.length} referências a client_products/client_id`,
      details: legacy.slice(0, 50),
    })

  if (missing.length)
    problems.push({
      severity: 'warn',
      code: 'MISSING_DEPS',
      message: `Módulos utilizados e ausentes no package.json: ${missing.join(
        ', '
      )}`,
    })
  if (unused.length)
    problems.push({
      severity: 'info',
      code: 'UNUSED_DEPS',
      message: `Dependências possivelmente não usadas: ${unused
        .slice(0, 20)
        .join(', ')}${unused.length > 20 ? '…' : ''}`,
    })

  // Run ESLint and TSC
  const eslintCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const tscRes = runCommand(eslintCmd, ['tsc', '--noEmit'], ROOT)
  if (tscRes.code !== 0)
    problems.push({
      severity: 'error',
      code: 'TYPECHECK_FAILED',
      message: 'TypeScript typecheck falhou',
      details: tscRes.stdout || tscRes.stderr,
    })

  const eslintRes = runCommand(
    eslintCmd,
    ['eslint', '.', '--format', 'json'],
    ROOT
  )
  let eslintReport: any[] = []
  try {
    eslintReport = JSON.parse(eslintRes.stdout || '[]')
  } catch {}
  const eslintErrors = Array.isArray(eslintReport)
    ? eslintReport.reduce((acc, f: any) => acc + (f.errorCount || 0), 0)
    : 0
  if (eslintErrors > 0 || eslintRes.code !== 0)
    problems.push({
      severity: 'error',
      code: 'LINT_FAILED',
      message: `ESLint encontrou erros (${eslintErrors})`,
      details: (eslintReport || []).slice(0, 10),
    })

  // Highlight known file errors (store-config)
  const storeConfigPath = 'app/api/gestor/store-config/route.ts'
  const hasStoreConfig = files.some(
    f => path.relative(ROOT, f) === storeConfigPath
  )
  if (hasStoreConfig && (eslintErrors > 0 || tscRes.code !== 0)) {
    proposed_fixes.push({
      code: 'FIX_STORE_CONFIG_IMPORTS',
      description:
        'Adicionar imports de createRouteHandlerClient e cookies ao store-config/route.ts',
    })
  }

  // DB checks
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const db = await checkDb(supabaseUrl, serviceKey)
  problems.push(...db.problems)

  const endpoints = listApiEndpoints()

  const result: AuditResult = {
    summary: {
      scannedFiles: files.length,
      legacyRefs: legacy.length,
      dbTablesChecked: Object.keys(db.findings.tables || {}).length,
      rlsChecked: !!db.findings.rls?.tables,
    },
    problems,
    proposed_fixes,
    findings: {
      legacyRefs: legacy,
      usedModules: used,
      missingDeps: missing,
      unusedDeps: unused,
      db: db.findings,
      endpoints,
    },
  }

  const outPath = '/tmp/audit-v33.json'
  try {
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
    // Console table summary
    console.log('\n=== v3.3 Audit Summary ===')
    console.table([
      {
        scannedFiles: result.summary.scannedFiles,
        legacyRefs: result.summary.legacyRefs,
        dbTablesChecked: result.summary.dbTablesChecked,
        rlsChecked: result.summary.rlsChecked,
      },
    ])
    console.log(`JSON salvo em: ${outPath}`)
  } catch (e) {
    console.error('Falha ao salvar JSON de auditoria:', e)
    process.exitCode = 1
  }
}

main().catch(err => {
  console.error('Erro na auditoria v3.3:', err)
  process.exit(1)
})
