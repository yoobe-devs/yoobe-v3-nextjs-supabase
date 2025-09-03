import { NextRequest, NextResponse } from 'next/server'
import { CatalogScraper } from '@/lib/services/catalog-scraper'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category') || undefined
    const scraper = new CatalogScraper()
    const products = await scraper.scrapeProducts(page, category)
    return NextResponse.json({ page, category, products })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro no preview' }, { status: 500 })
  }
}

