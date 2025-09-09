import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'

type AuditResult = {
  errors: number
  warnings: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    file?: string
    line?: number
    message: string
    suggestion?: string
  }>
  summary: {
    totalFiles: number
    budgetItemsRefs: number
    productIdRefs: number
    baseProductIdRefs: number
    legacyRefs: number
    schemaIssues: number
  }
}

const SUPABASE_URL =
  process.env.SUPABASE_SERVICE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

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

function scanCodebase(): AuditResult['issues'] {
  const issues: AuditResult['issues'] = []
  const root = process.cwd()
  const files: string[] = []

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      if (entry.startsWith('.')) continue
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        if (
          ['node_modules', 'coverage', 'supabase/.temp', '.next'].includes(
            entry
          )
        )
          continue
        walk(full)
      } else if (/\.(ts|tsx|sql|js)$/.test(entry)) {
        files.push(full)
      }
    }
  }

  walk(root)

  // Padrões problemáticos
  const problematicPatterns = [
    {
      pattern:
        /product_id:\s*[^,}]+.*budget_items|budget_items.*product_id:\s*[^,}]+/,
      message: 'Uso de product_id em budget_items - deve usar base_product_id',
      category: 'schema_mismatch',
      type: 'error' as const,
      excludeFiles: [
        'scripts/audit/full_review.ts',
        'app/gestor/base-products/page.tsx',
        'feature-patches/app/gestor/base-products/page.tsx',
      ], // Excluir falsos positivos
    },
    {
      pattern: /client_products/,
      message: 'Referência a client_products (legacy)',
      category: 'legacy_ref',
      type: 'warning' as const,
    },
    {
      pattern: /client_id/,
      message: 'Referência a client_id (legacy)',
      category: 'legacy_ref',
      type: 'warning' as const,
    },
    {
      pattern: /mocks?\//,
      message: 'Arquivo de mock detectado',
      category: 'mock_file',
      type: 'warning' as const,
    },
    {
      pattern: /fixtures?\//,
      message: 'Arquivo de fixture detectado',
      category: 'fixture_file',
      type: 'warning' as const,
    },
  ]

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      for (const {
        pattern,
        message,
        category,
        type,
        excludeFiles,
      } of problematicPatterns) {
        if (pattern.test(line)) {
          const relativeFile = path.relative(root, file)
          if (
            excludeFiles &&
            excludeFiles.some(exclude => relativeFile.includes(exclude))
          ) {
            continue
          }
          issues.push({
            type,
            category,
            file: relativeFile,
            line: i + 1,
            message,
            suggestion:
              category === 'schema_mismatch'
                ? 'Substituir product_id por base_product_id'
                : undefined,
          })
        }
      }
    }
  }

  return issues
}

async function checkSchema(): Promise<AuditResult['issues']> {
  const issues: AuditResult['issues'] = []

  // Verificar estrutura da tabela budget_items
  const budgetItemsSchema = await querySql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'budget_items'
    ORDER BY ordinal_position
  `)

  const hasBaseProductId = budgetItemsSchema.some(
    col => col.column_name === 'base_product_id'
  )
  const hasProductId = budgetItemsSchema.some(
    col => col.column_name === 'product_id'
  )

  if (!hasBaseProductId) {
    issues.push({
      type: 'error',
      category: 'schema_missing',
      message: 'Tabela budget_items não possui coluna base_product_id',
      suggestion: 'Adicionar coluna base_product_id à tabela budget_items',
    })
  }

  if (hasProductId) {
    issues.push({
      type: 'warning',
      category: 'schema_legacy',
      message: 'Tabela budget_items ainda possui coluna product_id (legacy)',
      suggestion: 'Considerar remover coluna product_id se não for mais usada',
    })
  }

  // Verificar índices críticos
  const indexes = await querySql(`
    SELECT indexname, indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('company_products', 'budgets', 'budget_items')
  `)

  const criticalIndexes = [
    'company_products_company_id_status_is_active_idx',
    'company_products_company_id_final_sku_unique',
    'company_products_ean_13_idx',
    'budgets_status_idx',
  ]

  for (const indexName of criticalIndexes) {
    const exists = indexes.some(idx => idx.indexname === indexName)
    if (!exists) {
      issues.push({
        type: 'warning',
        category: 'missing_index',
        message: `Índice crítico ausente: ${indexName}`,
        suggestion: 'Criar índice para otimizar consultas',
      })
    }
  }

  return issues
}

async function checkAPIs(): Promise<AuditResult['issues']> {
  const issues: AuditResult['issues'] = []

  // Verificar se APIs de budget estão usando base_product_id
  const budgetAPIs = [
    'app/api/admin/budgets/route.ts',
    'app/api/gestor/orcamentos/route.ts',
    'app/api/gestor/orcamentos/[id]/approve/route.ts',
  ]

  for (const apiFile of budgetAPIs) {
    const fullPath = path.join(process.cwd(), apiFile)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8')

      // Verificar se há uso incorreto de product_id em budget_items
      if (content.includes('product_id:') && content.includes('budget_items')) {
        const lines = content.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (line.includes('product_id:') && line.includes('budget_items')) {
            issues.push({
              type: 'error',
              category: 'api_schema_mismatch',
              file: apiFile,
              line: i + 1,
              message: 'API usando product_id em budget_items',
              suggestion: 'Atualizar para usar base_product_id',
            })
          }
        }
      }
    }
  }

  return issues
}

async function runLinterAndTypecheck(): Promise<{ eslint: any; tsc: any }> {
  const results: any = {}

  try {
    execSync('npm run lint:ci', { stdio: 'pipe' })
    results.eslint = { ok: true }
  } catch (e: any) {
    results.eslint = {
      ok: false,
      output: e.stdout?.toString() || e.message,
      errors: (e.stdout?.toString() || '')
        .split('\n')
        .filter((line: string) => line.includes('error')),
    }
  }

  try {
    execSync('npm run typecheck', { stdio: 'pipe' })
    results.tsc = { ok: true }
  } catch (e: any) {
    results.tsc = {
      ok: false,
      output: e.stdout?.toString() || e.message,
    }
  }

  return results
}

async function main() {
  console.log('🔍 Iniciando auditoria completa do sistema...')

  const codebaseIssues = scanCodebase()
  const schemaIssues = await checkSchema()
  const apiIssues = await checkAPIs()
  const lintResults = await runLinterAndTypecheck()

  const allIssues = [...codebaseIssues, ...schemaIssues, ...apiIssues]

  // Adicionar issues de linting apenas se houver erros críticos
  if (
    !lintResults.eslint.ok &&
    lintResults.eslint.errors &&
    lintResults.eslint.errors.length > 0
  ) {
    allIssues.push({
      type: 'error',
      category: 'linting',
      message: 'Erros críticos de ESLint encontrados',
      suggestion: 'Corrigir erros críticos de linting antes do go-live',
    })
  }

  if (!lintResults.tsc.ok) {
    allIssues.push({
      type: 'error',
      category: 'typescript',
      message: 'Erros de TypeScript encontrados',
      suggestion: 'Corrigir erros de TypeScript antes do go-live',
    })
  }

  const errors = allIssues.filter(i => i.type === 'error').length
  const warnings = allIssues.filter(i => i.type === 'warning').length

  const summary = {
    totalFiles: 0, // Será calculado
    budgetItemsRefs: allIssues.filter(i => i.message.includes('budget_items'))
      .length,
    productIdRefs: allIssues.filter(i => i.message.includes('product_id'))
      .length,
    baseProductIdRefs: 0, // Será calculado
    legacyRefs: allIssues.filter(i => i.category === 'legacy_ref').length,
    schemaIssues: allIssues.filter(i => i.category.startsWith('schema')).length,
  }

  const result: AuditResult = {
    errors,
    warnings,
    issues: allIssues,
    summary,
  }

  // Salvar resultado
  const outputFile = '/tmp/audit-final.json'
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2))

  // Relatório no console
  console.log('\n=== RELATÓRIO DE AUDITORIA ===')
  console.log(`❌ Erros: ${errors}`)
  console.log(`⚠️  Avisos: ${warnings}`)
  console.log(`📊 Total de issues: ${allIssues.length}`)

  if (errors > 0) {
    console.log('\n=== ERROS CRÍTICOS ===')
    allIssues
      .filter(i => i.type === 'error')
      .forEach(issue => {
        console.log(`❌ ${issue.category}: ${issue.message}`)
        if (issue.file) console.log(`   📁 ${issue.file}:${issue.line}`)
        if (issue.suggestion) console.log(`   💡 ${issue.suggestion}`)
      })
  }

  if (warnings > 0) {
    console.log('\n=== AVISOS ===')
    allIssues
      .filter(i => i.type === 'warning')
      .slice(0, 10)
      .forEach(issue => {
        console.log(`⚠️  ${issue.category}: ${issue.message}`)
        if (issue.file) console.log(`   📁 ${issue.file}:${issue.line}`)
      })
  }

  console.log(`\n📄 Relatório completo salvo em: ${outputFile}`)

  if (errors === 0) {
    console.log('\n✅ SISTEMA PRONTO PARA GO-LIVE!')
  } else {
    console.log('\n❌ SISTEMA NÃO ESTÁ PRONTO PARA GO-LIVE')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('❌ Erro na auditoria:', err)
  process.exit(1)
})
