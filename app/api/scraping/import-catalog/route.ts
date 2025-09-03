import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseServiceKey as supabaseAdmin } from '@/lib/supabase-admin'
import { CatalogScraper } from '@/lib/services/catalog-scraper'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação de admin
    let user = null
    const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !cookieUser) {
      // Tentar verificar via header Authorization
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
        if (tokenError || !tokenUser) {
          return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }
        user = tokenUser
      } else {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
    } else {
      user = cookieUser
    }

    // Verificar permissões de admin através dos metadados do usuário
    const userRole = user.user_metadata?.role
    const allowed = ['admin', 'admin_global', 'superadmin']
    if (!allowed.includes(userRole)) {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores podem importar catálogos' }, { status: 403 })
    }

    const body = await request.json()
    const { page = 1, limit = 50, category, importAllCategories = false } = body

    console.log(`🚀 Iniciando importação${category ? ` da categoria ${category}` : ''}${importAllCategories ? ' de todas as categorias' : ''}...`)

    const scraper = new CatalogScraper()
    
    if (importAllCategories) {
      // Importar todas as categorias
      console.log('📋 Iniciando importação de todas as categorias...')
      const categoryResults = await scraper.scrapeAllCategories()
      
      let totalImported = 0
      let totalErrors = 0
      const allDetails: string[] = []
      
      for (const categoryResult of categoryResults) {
        if (categoryResult.products.length > 0) {
          const result = await scraper.integrateToDatabase(categoryResult.products)
          totalImported += result.success
          totalErrors += result.errors
          allDetails.push(`Categoria ${categoryResult.category}: ${result.success} produtos importados, ${result.errors} erros`)
          allDetails.push(...result.details)
        }
      }
      
      console.log(`✅ Importação de todas as categorias concluída: ${totalImported} produtos importados, ${totalErrors} erros`)
      
      return NextResponse.json({
        message: `Importação de todas as categorias concluída! ${totalImported} produtos importados`,
        totalImported,
        totalErrors,
        categoriesProcessed: categoryResults.length,
        details: allDetails
      })
    } else {
      // Fazer scraping dos produtos da página especificada
      const scrapedProducts = await scraper.scrapeProducts(page, category)
      
      if (scrapedProducts.length === 0) {
        return NextResponse.json({ 
          message: 'Nenhum produto encontrado para importar',
          page,
          category,
          imported: 0,
          errors: 0,
          details: []
        })
      }

      // Integrar produtos ao banco de dados
      const result = await scraper.integrateToDatabase(scrapedProducts)

      console.log(`✅ Importação concluída: ${result.success} produtos importados, ${result.errors} erros`)

      return NextResponse.json({
        message: `Importação concluída com sucesso! ${result.success} produtos importados${category ? ` da categoria ${category}` : ''} da página ${page}`,
        page,
        category,
        totalScraped: scrapedProducts.length,
        imported: result.success,
        errors: result.errors,
        details: result.details,
        nextPage: result.success > 0 ? page + 1 : null
      })
    }

  } catch (error) {
    console.error('❌ Erro na importação:', error)
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}
