import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseService = createClient(supabaseUrl, serviceKey)

async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Função para fazer scraping do catálogo externo
async function scrapeCatalogPage(page: number) {
  try {
    const url = `https://catalogo.yoobe.co/product?page=${page}`
    console.log(`🔍 Fazendo scraping da página ${page}: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extrair produtos do HTML (simulação - você precisará implementar o parsing real)
    const products = extractProductsFromHTML(html)
    
    console.log(`✅ Página ${page} processada: ${products.length} produtos encontrados`)
    return products
    
  } catch (error) {
    console.error(`❌ Erro ao fazer scraping da página ${page}:`, error)
    throw error
  }
}

// Função para extrair produtos do HTML (simulação)
function extractProductsFromHTML(html: string) {
  // Esta é uma simulação - você precisará implementar o parsing real do HTML
  // Por enquanto, vamos retornar produtos de exemplo
  const mockProducts = [
    {
      name: 'Camiseta Corporativa Premium',
      description: 'Camiseta de alta qualidade para uso corporativo',
      base_price: 45.90,
      base_points_cost: 459,
      sku: 'CAM-001',
      ncm: '6104.43.00',
      stock_quantity: 100,
      production_time: '5-7 dias úteis',
      material: '100% Algodão',
      producer: 'Yoobe Textil',
      image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
      category_name: 'Vestuário'
    },
    {
      name: 'Caneca Personalizada',
      description: 'Caneca de cerâmica com personalização',
      base_price: 25.50,
      base_points_cost: 255,
      sku: 'CAN-001',
      ncm: '6912.00.00',
      stock_quantity: 200,
      production_time: '3-5 dias úteis',
      material: 'Cerâmica',
      producer: 'Yoobe Cerâmica',
      image_url: 'https://via.placeholder.com/300x300?text=Caneca',
      category_name: 'Utensílios'
    },
    {
      name: 'Mochila Corporativa',
      description: 'Mochila resistente para uso profissional',
      base_price: 89.90,
      base_points_cost: 899,
      sku: 'MOC-001',
      ncm: '4202.12.00',
      stock_quantity: 50,
      production_time: '7-10 dias úteis',
      material: 'Nylon resistente',
      producer: 'Yoobe Acessórios',
      image_url: 'https://via.placeholder.com/300x300?text=Mochila',
      category_name: 'Acessórios'
    }
  ]
  
  return mockProducts
}

// Função para obter ou criar categoria
async function getOrCreateCategory(categoryName: string) {
  try {
    // Buscar categoria existente
    const { data: existingCategory } = await supabaseService
      .from('product_categories')
      .select('*')
      .eq('name', categoryName)
      .single()
    
    if (existingCategory) {
      return existingCategory
    }
    
    // Criar nova categoria
    const { data: newCategory, error } = await supabaseService
      .from('product_categories')
      .insert({
        name: categoryName,
        icon: 'package',
        color: '#3B82F6'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar categoria:', error)
      throw error
    }
    
    return newCategory
  } catch (error) {
    console.error('Erro ao obter/criar categoria:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores podem importar produtos' }, { status: 403 })
    }

    const body = await request.json()
    const { page = 1, batch_size = 50 } = body

    if (!page || page < 1) {
      return NextResponse.json({ error: 'Página inválida' }, { status: 400 })
    }

    console.log(`🚀 Iniciando importação da página ${page}`)

    // Fazer scraping da página
    const scrapedProducts = await scrapeCatalogPage(page)
    
    if (!scrapedProducts || scrapedProducts.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum produto encontrado na página especificada',
        imported_count: 0
      })
    }

    let importedCount = 0
    const errors: string[] = []

    // Processar cada produto
    for (const scrapedProduct of scrapedProducts) {
      try {
        // Verificar se o produto já existe (por SKU)
        const { data: existingProduct } = await supabaseService
          .from('base_products')
          .select('id')
          .eq('sku', scrapedProduct.sku)
          .single()

        if (existingProduct) {
          console.log(`⚠️ Produto com SKU ${scrapedProduct.sku} já existe, pulando...`)
          continue
        }

        // Obter ou criar categoria
        const category = await getOrCreateCategory(scrapedProduct.category_name)

        // Criar produto base
        const { data: newProduct, error: productError } = await supabaseService
          .from('base_products')
          .insert({
            name: scrapedProduct.name,
            description: scrapedProduct.description,
            base_price: scrapedProduct.base_price,
            base_points_cost: scrapedProduct.base_points_cost,
            sku: scrapedProduct.sku,
            ncm: scrapedProduct.ncm,
            stock_quantity: scrapedProduct.stock_quantity,
            production_time: scrapedProduct.production_time,
            material: scrapedProduct.material,
            producer: scrapedProduct.producer,
            image_url: scrapedProduct.image_url,
            category_id: category.id,
            status_fluxo: 'disponivel'
          })
          .select()
          .single()

        if (productError) {
          console.error(`❌ Erro ao criar produto ${scrapedProduct.sku}:`, productError)
          errors.push(`Erro ao criar produto ${scrapedProduct.sku}: ${productError.message}`)
          continue
        }

        console.log(`✅ Produto ${scrapedProduct.sku} importado com sucesso`)
        importedCount++

      } catch (error) {
        console.error(`❌ Erro ao processar produto:`, error)
        errors.push(`Erro ao processar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    console.log(`🎉 Importação concluída: ${importedCount} produtos importados`)

    return NextResponse.json({
      message: `Importação concluída com sucesso`,
      imported_count: importedCount,
      total_found: scrapedProducts.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Erro na API de importação:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
