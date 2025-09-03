import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || []
    const rel = slug.join('/')
    const v3base = path.join(process.cwd(), 'docs', 'v3')
    const mainbase = path.join(process.cwd(), 'docs')
    const screensBase = path.join(process.cwd(), 'docs', 'screens')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const service = createClient(supabaseUrl, serviceKey)
    const tryPaths = [
      path.join(v3base, rel.endsWith('.md') ? rel : `${rel}.md`),
      path.join(mainbase, rel.endsWith('.md') ? rel : `${rel}.md`),
      // Permitir servir documentação de telas: /api/docs/v3/screens/<screen>
      path.join(screensBase, rel.endsWith('.md') ? rel : `${rel}.md`),
    ]

    // 1) Tentar Supabase Storage primeiro (bucket 'docs')
    const storageCandidates = [
      rel.endsWith('.md') ? rel : `${rel}.md`,
      `v3/${rel.endsWith('.md') ? rel : `${rel}.md`}`,
      `screens/${rel.endsWith('.md') ? rel : `${rel}.md`}`,
    ]
    for (const sp of storageCandidates) {
      try {
        const { data, error } = await service.storage.from('docs').download(sp)
        if (!error && data) {
          const content = await data.text()
          return NextResponse.json({ content, path: `[storage]/${sp}` })
        }
      } catch {}
    }
    for (const p of tryPaths) {
      try {
        const content = await fs.readFile(p, 'utf-8')
        return NextResponse.json({ content, path: p.replace(process.cwd(), '') })
      } catch {}
    }
    throw new Error('Arquivo não encontrado')
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Arquivo não encontrado' }, { status: 404 })
  }
}
