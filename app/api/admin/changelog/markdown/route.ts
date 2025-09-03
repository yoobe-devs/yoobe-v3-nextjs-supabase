import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'CHANGELOG.md')
    const content = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json({ content })
  } catch (e) {
    return NextResponse.json({ error: 'CHANGELOG.md não encontrado' }, { status: 404 })
  }
}

