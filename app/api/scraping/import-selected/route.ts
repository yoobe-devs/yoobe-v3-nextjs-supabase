import { NextRequest, NextResponse } from 'next/server'
import { CatalogScraper, ScrapedProduct } from '@/lib/services/catalog-scraper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const products: ScrapedProduct[] = Array.isArray(body?.products) ? body.products : []
    if (!products.length) return NextResponse.json({ error: 'Lista vazia' }, { status: 400 })

    const scraper = new CatalogScraper()
    const result = await scraper.integrateToDatabase(products)
    return NextResponse.json({ imported: result.success, errors: result.errors, details: result.details })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro na importação' }, { status: 500 })
  }
}

