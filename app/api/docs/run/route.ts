import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

async function runScript(command: string, args: string[] = []): Promise<{ ok: boolean, code: number | null, stdout: string, stderr: string }>{
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: process.cwd(), env: process.env })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { stdout += d.toString() })
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => {
      resolve({ ok: code === 0, code, stdout, stderr })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    // Apenas usuários autenticados podem executar
    await requireUser()

    // Verificar role admin e feature flag
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role
    const enabled = process.env.DOCS_RUN_ENABLED === 'true' || process.env.NODE_ENV !== 'production'
    if (!enabled) {
      return NextResponse.json({ error: 'Execução desabilitada em produção' }, { status: 403 })
    }
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem executar scripts de documentação' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const runScreens = !!body?.runScreens
    const runApiDocs = !!body?.runApiDocs
    const runSmartDocs = !!body?.runSmartDocs

    if (!runScreens && !runApiDocs && !runSmartDocs) {
      return NextResponse.json({ error: 'Selecione ao menos um script para executar' }, { status: 400 })
    }

    const results: Record<string, any> = {}

    if (runScreens) {
      const scriptPath = path.join(process.cwd(), 'scripts', 'generate-screen-docs.js')
      results.screens = await runScript('node', [scriptPath])
    }

    if (runApiDocs) {
      const scriptPath = path.join(process.cwd(), 'scripts', 'generate-docs.mjs')
      results.api = await runScript('node', [scriptPath])
    }

    if (runSmartDocs) {
      const scriptPath = path.join(process.cwd(), 'scripts', 'init-smart-docs.js')
      // Rodar em modo sem monitoramento (gera e finaliza)
      results.smart = await runScript('node', [scriptPath, '--no-watch'])
    }

    // Upload opcional para Supabase Storage (persistência em serverless)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const storage = createClient(supabaseUrl, serviceKey)

    const uploads: Array<{ path: string, ok: boolean, error?: string }> = []
    async function uploadIfExists(localPath: string, storagePath: string) {
      try {
        const data = await fs.readFile(localPath)
        const ext = localPath.split('.').pop()?.toLowerCase()
        const contentType = ext === 'md' ? 'text/markdown' : ext === 'json' ? 'application/json' : 'text/plain'
        const { error } = await storage.storage.from('docs').upload(storagePath, data, { upsert: true, contentType })
        uploads.push({ path: storagePath, ok: !error, ...(error ? { error: error.message } : {}) })
      } catch (e: any) {
        uploads.push({ path: storagePath, ok: false, error: e?.message || 'read/upload failed' })
      }
    }

    if (runScreens) {
      await uploadIfExists(path.join(process.cwd(), 'docs', 'screens', 'README.md'), 'screens/README.md')
      // Subir os principais arquivos gerados de telas (best-effort)
      // Para evitar listar todos, subimos os existentes no diretório
      try {
        const dir = await fs.readdir(path.join(process.cwd(), 'docs', 'screens'))
        for (const file of dir) {
          if (file.endsWith('.md')) {
            await uploadIfExists(path.join(process.cwd(), 'docs', 'screens', file), `screens/${file}`)
          }
        }
      } catch {}
    }

    if (runApiDocs) {
      await uploadIfExists(path.join(process.cwd(), 'docs', 'v3', 'API_REFERENCE.md'), 'v3/API_REFERENCE.md')
      await uploadIfExists(path.join(process.cwd(), 'docs', 'v3', 'openapi.v3.json'), 'v3/openapi.v3.json')
    }

    if (runSmartDocs) {
      await uploadIfExists(path.join(process.cwd(), 'docs', 'COMPLETE_DOCUMENTATION.md'), 'COMPLETE_DOCUMENTATION.md')
      await uploadIfExists(path.join(process.cwd(), 'docs', 'SYSTEM_REPORT.md'), 'SYSTEM_REPORT.md')
    }

    return NextResponse.json({ success: true, results, uploads })

  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json({ error: error?.message || 'Erro ao executar scripts' }, { status })
  }
}
