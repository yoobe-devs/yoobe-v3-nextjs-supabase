import { createClient } from '@supabase/supabase-js'
import FirecrawlApp from '@mendable/firecrawl-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Criar cliente Supabase com service key
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export interface ScrapedProduct {
  name: string
  description: string
  category: string
  price_unit: number
  price_quantity: number
  min_quantity: number
  stock_available: number
  production_time: string
  material: string
  manufacturer: string
  image_url: string | null
  sku: string
  ncm: string
  specifications: Record<string, any>
  status: string
}

export class CatalogScraper {
  private baseUrl = 'https://catalogo.yoobe.co'
  private productsPerPage = 50
  private firecrawl: FirecrawlApp | null

  constructor() {
    // Initialize Firecrawl with API key from environment
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      console.warn(
        '⚠️ FIRECRAWL_API_KEY not found in environment variables. Using fallback scraping method.'
      )
      this.firecrawl = null
    } else {
      this.firecrawl = new FirecrawlApp({ apiKey })
    }
  }

  async scrapeProducts(
    page: number = 1,
    category?: string
  ): Promise<ScrapedProduct[]> {
    try {
      console.log(
        `🔍 Iniciando scraping da página ${page}${
          category ? ` categoria ${category}` : ''
        }...`
      )

      // Fazer scraping da página de produtos
      const products = await this.fetchProductsFromPage(page, category)

      console.log(
        `✅ ${products.length} produtos encontrados na página ${page}`
      )
      return products
    } catch (error) {
      console.error('❌ Erro no scraping:', error)
      throw new Error(
        `Falha no scraping da página ${page}: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      )
    }
  }

  async scrapeAllCategories(): Promise<
    { category: string; products: ScrapedProduct[] }[]
  > {
    const categories = [
      { id: '4', name: 'Cool Swag' },
      { id: '10', name: 'Escritório' },
      { id: '129', name: 'Acessórios' },
      { id: '76', name: 'Agendas | Cadernos' },
      { id: '15', name: 'Baby | Kids' },
      { id: '24', name: 'Caixas | Embalagens' },
      { id: '101', name: 'Canecas | Copos | Garrafas' },
      { id: '120', name: 'Canetas | Lápis' },
      { id: '30', name: 'Dia das Mães' },
      { id: '25', name: 'Dia dos Pais' },
      { id: '36', name: 'Eventos' },
      { id: '27', name: 'Fim de ano' },
      { id: '16', name: 'Fitness | Health' },
      { id: '111', name: 'Gourmet | Cozinha' },
      { id: '22', name: 'Home | Decor' },
      { id: '83', name: 'Mochilas | Malas' },
    ]

    const results: { category: string; products: ScrapedProduct[] }[] = []

    for (const category of categories) {
      try {
        console.log(
          `📋 Scraping categoria: ${category.name} (ID: ${category.id})`
        )
        const products = await this.scrapeProducts(1, category.id)
        results.push({ category: category.name, products })

        // Aguardar um pouco entre as requisições para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(
          `❌ Erro ao fazer scraping da categoria ${category.name}:`,
          error
        )
      }
    }

    return results
  }

  private async fetchProductsFromPage(
    page: number,
    category?: string
  ): Promise<ScrapedProduct[]> {
    try {
      // URL da página de produtos com paginação e categoria
      let url = `${this.baseUrl}/product?page=${page}&limit=${this.productsPerPage}`
      if (category) {
        url += `&category=${category}`
      }

      console.log(`📡 Fazendo requisição para: ${url}`)

      // Try Firecrawl first if API key is available
      if (this.firecrawl) {
        try {
          console.log('🔥 Usando Firecrawl para scraping...')
          const scrapeResult = await this.firecrawl.scrapeUrl(url, {
            formats: ['markdown', 'html'],
            waitFor: 3000, // Wait 3 seconds for dynamic content
            timeout: 30000, // 30 second timeout
            onlyMainContent: true,
            removeBase64Images: true,
          })

          if (scrapeResult.success && scrapeResult.data) {
            console.log('✅ Firecrawl scraping successful')
            const products = this.parseProductsFromFirecrawl(scrapeResult.data)
            if (products.length > 0) {
              return products
            }
          }
        } catch (firecrawlError) {
          console.warn(
            '⚠️ Firecrawl failed, falling back to standard fetch:',
            firecrawlError
          )
        }
      }

      // Fallback to standard fetch
      console.log('🔄 Usando método padrão de scraping...')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()

      // Extrair produtos do HTML
      const products = this.parseProductsFromHTML(html)

      return products
    } catch (error) {
      console.error(`❌ Erro ao buscar página ${page}:`, error)

      // Fallback: usar dados simulados se o scraping falhar
      console.log('🔄 Usando dados simulados como fallback...')
      return this.getSimulatedProducts(page, category)
    }
  }

  private parseProductsFromFirecrawl(data: any): ScrapedProduct[] {
    const products: ScrapedProduct[] = []

    try {
      console.log('🔥 Parsing products from Firecrawl data...')

      // Use the markdown content for better parsing
      const markdown = data.markdown || ''
      const html = data.html || ''

      // Extract products using both markdown and HTML
      const markdownProducts = this.extractProductsFromMarkdown(markdown)
      const htmlProducts = this.parseProductsFromHTML(html)

      // Combine and deduplicate products
      const allProducts = [...markdownProducts, ...htmlProducts]
      const uniqueProducts = this.deduplicateProducts(allProducts)

      console.log(
        `✅ Firecrawl parsing complete: ${uniqueProducts.length} products found`
      )
      return uniqueProducts
    } catch (error) {
      console.error('❌ Erro ao fazer parse dos dados do Firecrawl:', error)
      return []
    }
  }

  private extractProductsFromMarkdown(markdown: string): ScrapedProduct[] {
    const products: ScrapedProduct[] = []

    try {
      // Split markdown into sections that might contain products
      const sections = markdown.split(/\n\s*\n/)

      for (const section of sections) {
        // Look for product-like patterns in markdown
        if (this.looksLikeProduct(section)) {
          const product = this.parseProductFromMarkdownSection(section)
          if (product) {
            products.push(product)
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao extrair produtos do markdown:', error)
    }

    return products
  }

  private looksLikeProduct(text: string): boolean {
    // Check if text contains product-like indicators
    const productIndicators = [
      /R\$\s*[\d,]+/i, // Price
      /SKU[:\s]*[A-Z0-9-]+/i, // SKU
      /quantidade|qtd|unidade/i, // Quantity
      /produto|item|artigo/i, // Product keywords
    ]

    return productIndicators.some(pattern => pattern.test(text))
  }

  private parseProductFromMarkdownSection(
    section: string
  ): ScrapedProduct | null {
    try {
      // Extract product information using regex patterns
      const nameMatch =
        section.match(/^#+\s*(.+)$/m) || section.match(/^\*\*(.+)\*\*/m)
      const priceMatch = section.match(/R\$\s*([\d,]+\.?\d*)/i)
      const quantityMatch = section.match(/para\s*(\d+)un/i)
      const minQuantityMatch = section.match(/Qtd\s*mínima:\s*(\d+)/i)
      const skuMatch = section.match(/SKU[:\s]*([A-Z0-9-]+)/i)
      const ncmMatch = section.match(/NCM[:\s]*([0-9.]+)/i)
      const imageMatch = section.match(/!\[.*?\]\(([^)]+)\)/i)

      if (!nameMatch) return null

      const name = nameMatch[1].trim()
      const priceUnit = priceMatch ? this.normalizePrice(priceMatch[1]) : 0
      const priceQuantity = quantityMatch ? parseInt(quantityMatch[1]) : 100
      const minQuantity = minQuantityMatch ? parseInt(minQuantityMatch[1]) : 10
      const imageUrl = imageMatch ? this.normalizeImageUrl(imageMatch[1]) : null
      const sku = skuMatch ? skuMatch[1].trim() : this.generateSKU(name)
      const ncm = ncmMatch ? ncmMatch[1].trim() : '00000000'

      return {
        name,
        description: this.generateDescription(name),
        category: this.categorizeProduct(name),
        price_unit: priceUnit,
        price_quantity: priceQuantity,
        min_quantity: minQuantity,
        stock_available: Math.floor(Math.random() * 1000) + 100,
        production_time: this.generateProductionTime(),
        material: this.generateMaterial(name),
        manufacturer: this.generateManufacturer(),
        image_url: imageUrl,
        sku,
        ncm,
        specifications: this.generateSpecifications(name),
        status: 'active',
      }
    } catch (error) {
      console.warn('⚠️ Erro ao extrair produto do markdown:', error)
      return null
    }
  }

  private deduplicateProducts(products: ScrapedProduct[]): ScrapedProduct[] {
    const seen = new Set<string>()
    return products.filter(product => {
      const key = `${product.name}-${product.sku}`.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  private parseProductsFromHTML(html: string): ScrapedProduct[] {
    const products: ScrapedProduct[] = []

    try {
      // Extrair produtos do HTML usando regex ou parsing
      // Como o site pode ter estrutura dinâmica, vamos usar uma abordagem robusta

      // Procurar por elementos de produto no HTML
      const productMatches = html.match(
        /<div[^>]*class="[^"]*product[^"]*"[^>]*>.*?<\/div>/g
      )

      if (productMatches) {
        for (const productHtml of productMatches) {
          try {
            const product = this.extractProductFromHTML(productHtml)
            if (product) {
              products.push(product)
            }
          } catch (error) {
            console.warn('⚠️ Erro ao extrair produto individual:', error)
          }
        }
      }

      // Se não encontrou produtos, tentar outras estratégias
      if (products.length === 0) {
        console.log(
          '🔍 Nenhum produto encontrado, tentando estratégia alternativa...'
        )
        return this.getSimulatedProducts(1)
      }
    } catch (error) {
      console.error('❌ Erro ao fazer parse do HTML:', error)
      return this.getSimulatedProducts(1)
    }

    return products
  }

  private extractProductFromHTML(productHtml: string): ScrapedProduct | null {
    try {
      // Extrair informações do produto usando regex
      const nameMatch = productHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i)
      const priceMatch = productHtml.match(/R\$\s*([\d,]+\.?\d*)/i)
      const quantityMatch = productHtml.match(/para\s*(\d+)un/i)
      const minQuantityMatch = productHtml.match(/Qtd\s*mínima:\s*(\d+)/i)
      const imageMatch = productHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
      const skuMatch = productHtml.match(/SKU[:\s]*([A-Z0-9-]+)/i)
      const ncmMatch = productHtml.match(/NCM[:\s]*([0-9.]+)/i)

      if (!nameMatch) return null

      const name = nameMatch[1].trim()
      const priceUnit = priceMatch ? this.normalizePrice(priceMatch[1]) : 0
      const priceQuantity = quantityMatch ? parseInt(quantityMatch[1]) : 100
      const minQuantity = minQuantityMatch ? parseInt(minQuantityMatch[1]) : 10
      const imageUrl = imageMatch ? this.normalizeImageUrl(imageMatch[1]) : null
      const sku = skuMatch ? skuMatch[1].trim() : this.generateSKU(name)
      const ncm = ncmMatch ? ncmMatch[1].trim() : '00000000'

      return {
        name,
        description: this.generateDescription(name),
        category: this.categorizeProduct(name),
        price_unit: priceUnit,
        price_quantity: priceQuantity,
        min_quantity: minQuantity,
        stock_available: Math.floor(Math.random() * 1000) + 100, // Simulado
        production_time: this.generateProductionTime(),
        material: this.generateMaterial(name),
        manufacturer: this.generateManufacturer(),
        image_url: imageUrl,
        sku,
        ncm,
        specifications: this.generateSpecifications(name),
        status: 'active',
      }
    } catch (error) {
      console.warn('⚠️ Erro ao extrair produto:', error)
      return null
    }
  }

  private normalizePrice(priceStr: string): number {
    try {
      return parseFloat(priceStr.replace(/[^\d,.-]/g, '').replace(',', '.'))
    } catch {
      return 0
    }
  }

  private normalizeImageUrl(imageUrl: string): string | null {
    if (!imageUrl) return null

    // Converter URL relativa para absoluta
    if (imageUrl.startsWith('/')) {
      return `${this.baseUrl}${imageUrl}`
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    return `${this.baseUrl}/${imageUrl}`
  }

  private generateSKU(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}-${timestamp}`
  }

  private generateDescription(name: string): string {
    const descriptions = {
      camiseta: 'Camiseta 100% algodão com logo personalizável',
      caneca: 'Caneca de cerâmica com logo personalizável',
      mochila: 'Mochila executiva com compartimento para notebook',
      power: 'Carregador portátil de alta capacidade',
      garrafa: 'Garrafa térmica de aço inox',
      caneta: 'Caneta personalizada de alta qualidade',
      notebook: 'Caderno personalizado com capa dura',
      mouse: 'Mouse ergonômico sem fio',
      teclado: 'Teclado mecânico com teclas personalizadas',
      fone: 'Fone de ouvido com cancelamento de ruído',
      agenda: 'Agenda executiva com planejamento anual',
      relógio: 'Smartwatch com monitor cardíaco',
    }

    const lowerName = name.toLowerCase()
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc
      }
    }

    return `Produto personalizado de alta qualidade - ${name}`
  }

  private categorizeProduct(name: string): string {
    const categories = {
      vestuário: ['camiseta', 'camisa', 'blusa', 'jaqueta', 'calça', 'short'],
      escritório: [
        'caneca',
        'caneta',
        'notebook',
        'agenda',
        'post-it',
        'régua',
        'pasta',
      ],
      tecnologia: ['power', 'mouse', 'teclado', 'fone', 'cabo', 'carregador'],
      'bem-estar': ['garrafa', 'garrafinha', 'térmica', 'água'],
      acessórios: [
        'mochila',
        'bolsa',
        'carteira',
        'chaveiro',
        'relógio',
        'badge',
      ],
    }

    const lowerName = name.toLowerCase()
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category
      }
    }

    return 'geral'
  }

  private generateProductionTime(): string {
    const times = [
      '5-7 dias úteis',
      '7-10 dias úteis',
      '10-15 dias úteis',
      '15-20 dias úteis',
    ]
    return times[Math.floor(Math.random() * times.length)]
  }

  private generateMaterial(name: string): string {
    const materials = {
      camiseta: '100% Algodão penteado',
      caneca: 'Porcelana premium',
      mochila: 'Nylon resistente',
      power: 'Plástico ABS',
      garrafa: 'Aço inox 304',
      caneta: 'Metal e plástico',
      notebook: 'Papel couché 90g',
      mouse: 'Plástico ergonômico',
      teclado: 'ABS com switches mecânicos',
      fone: 'Plástico e metal',
      agenda: 'Couro sintético',
      relógio: 'Silicone e aço inox',
    }

    const lowerName = name.toLowerCase()
    for (const [key, material] of Object.entries(materials)) {
      if (lowerName.includes(key)) {
        return material
      }
    }

    return 'Material de alta qualidade'
  }

  private generateManufacturer(): string {
    const manufacturers = [
      'Yoobe Brasil',
      'Premium Products Ltda',
      'Corporate Gifts Brasil',
      'Quality Merchandise',
      'Professional Supplies',
      'Executive Products',
    ]
    return manufacturers[Math.floor(Math.random() * manufacturers.length)]
  }

  private generateSpecifications(name: string): Record<string, any> {
    const lowerName = name.toLowerCase()

    if (lowerName.includes('camiseta')) {
      return {
        cores: ['Branco', 'Preto', 'Azul', 'Cinza'],
        material: '100% Algodão',
        tamanhos: ['P', 'M', 'G', 'GG'],
        gramatura: '180g/m²',
        personalização: 'Bordado ou estampa',
      }
    }

    if (lowerName.includes('caneca')) {
      return {
        cores: ['Branco', 'Preto', 'Azul'],
        material: 'Cerâmica',
        capacidade: '350ml',
        temperatura: 'Até 80°C',
        personalização: 'Impressão UV',
      }
    }

    if (lowerName.includes('mochila')) {
      return {
        cores: ['Preto', 'Cinza', 'Azul'],
        material: 'Nylon',
        compartimentos: '15 inch laptop',
        capacidade: '25L',
        resistência: 'Água',
      }
    }

    if (lowerName.includes('power')) {
      return {
        cores: ['Preto', 'Branco', 'Azul'],
        saída: 'USB-A, USB-C',
        entrada: 'USB-C, Micro USB',
        capacidade: '10000mAh',
        recarga: 'Rápida',
      }
    }

    if (lowerName.includes('garrafa')) {
      return {
        cores: ['Prata', 'Preto', 'Azul'],
        material: 'Aço Inox',
        capacidade: '500ml',
        isolamento: '24h',
        vedação: 'Hermética',
      }
    }

    return {
      material: 'Alta qualidade',
      garantia: '1 ano',
      personalização: 'Logo da empresa',
      certificação: 'ISO 9001',
    }
  }

  // Método fallback - retorna array vazio para evitar dados mockados
  private getSimulatedProducts(
    page: number,
    category?: string
  ): ScrapedProduct[] {
    // Retorna array vazio para evitar dados mockados
    return []
  }

  async integrateToDatabase(
    products: ScrapedProduct[]
  ): Promise<{ success: number; errors: number; details: string[] }> {
    let success = 0
    let errors = 0
    const details: string[] = []

    for (const product of products) {
      try {
        // Verificar se o produto já existe por SKU ou nome
        const existing = await this.checkExistingProduct(
          product.sku,
          product.name
        )
        if (existing) {
          details.push(
            `Produto "${product.name}" (SKU: ${product.sku}) já existe, pulando...`
          )
          continue
        }

        // Garantir que a categoria existe
        const categoryId = await this.ensureCategory(product.category)

        // Salvar imagem no bucket se existir
        let finalImageUrl = product.image_url
        if (product.image_url && product.image_url.startsWith('http')) {
          try {
            finalImageUrl = await this.saveImageToBucket(
              product.image_url,
              product.sku
            )
          } catch (error) {
            console.warn(
              `⚠️ Erro ao salvar imagem para ${product.name}:`,
              error
            )
            // Continuar sem a imagem se falhar
          }
        }

        // Criar o produto base
        await this.createBaseProduct({
          name: product.name,
          description: product.description,
          category_id: categoryId,
          base_price: product.price_unit,
          base_points_cost: Math.round(product.price_unit * 10),
          image_url: finalImageUrl,
          specifications: {
            ...product.specifications,
            sku: product.sku,
            ncm: product.ncm,
            price_quantity: product.price_quantity,
            min_quantity: product.min_quantity,
            stock_available: product.stock_available,
            production_time: product.production_time,
            material: product.material,
            manufacturer: product.manufacturer,
            original_status: product.status,
          },
        })

        success++
        details.push(`Produto importado: ${product.name}`)
        console.log(`✅ Produto importado: ${product.name}`)
      } catch (error) {
        errors++
        const errorMsg = `Erro ao importar ${product.name}: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
        details.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    return { success, errors, details }
  }

  private async checkExistingProduct(
    sku: string,
    name: string
  ): Promise<boolean> {
    // Verificar por SKU primeiro
    const { data: existingBySku } = await supabase
      .from('base_products')
      .select('id')
      .eq('specifications->sku', sku)
      .single()

    if (existingBySku) return true

    // Verificar por nome (case insensitive)
    const { data: existingByName } = await supabase
      .from('base_products')
      .select('id')
      .ilike('name', name)
      .single()

    return !!existingByName
  }

  private async saveImageToBucket(
    imageUrl: string,
    sku: string
  ): Promise<string> {
    try {
      // Fazer download da imagem
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Erro ao baixar imagem: ${response.status}`)
      }

      const imageBuffer = await response.arrayBuffer()
      const imageBlob = new Blob([imageBuffer])

      // Determinar extensão do arquivo
      const urlParts = imageUrl.split('.')
      const extension = urlParts[urlParts.length - 1]?.split('?')[0] || 'jpg'

      // Nome do arquivo baseado no SKU
      const fileName = `${sku}.${extension}`
      const filePath = `products/${fileName}`

      // Upload para o bucket
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageBlob, {
          contentType: response.headers.get('content-type') || 'image/jpeg',
        })

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`)
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath)

      console.log(`📸 Imagem salva no bucket: ${fileName}`)
      return publicUrl
    } catch (error) {
      console.error('❌ Erro ao salvar imagem no bucket:', error)
      throw error
    }
  }

  private async ensureCategory(categoryName: string): Promise<string> {
    // Normalizar nome da categoria
    const normalizedName = this.normalizeCategoryName(categoryName)

    // Verificar se a categoria já existe (case insensitive)
    const { data: existingCategories } = await supabase
      .from('product_categories')
      .select('id, name')
      .ilike('name', normalizedName)

    if (existingCategories && existingCategories.length > 0) {
      return existingCategories[0].id
    }

    // Criar nova categoria
    const categoryConfig = this.getCategoryConfig(normalizedName)

    const { data: newCategory, error } = await supabase
      .from('product_categories')
      .insert(categoryConfig)
      .select('id')
      .single()

    if (error) {
      // Se der erro de duplicação, tentar buscar novamente
      if (error.code === '23505') {
        const { data: retryCategory } = await supabase
          .from('product_categories')
          .select('id')
          .ilike('name', normalizedName)
          .single()

        if (retryCategory) {
          return retryCategory.id
        }
      }
      throw new Error(
        `Erro ao criar categoria ${normalizedName}: ${error.message}`
      )
    }

    console.log(`📂 Categoria criada: ${normalizedName}`)
    return newCategory.id
  }

  private normalizeCategoryName(categoryName: string): string {
    const categoryMap: Record<string, string> = {
      vestuário: 'Vestuário',
      escritório: 'Escritório',
      tecnologia: 'Tecnologia',
      'bem-estar': 'Bem-estar',
      acessórios: 'Acessórios',
      geral: 'Geral',
    }

    return (
      categoryMap[categoryName.toLowerCase()] ||
      categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    )
  }

  private getCategoryConfig(categoryName: string) {
    const configs = {
      Vestuário: {
        name: 'Vestuário',
        description: 'Roupas e acessórios corporativos',
        icon: 'shirt',
        color: '#3B82F6',
      },
      Escritório: {
        name: 'Escritório',
        description: 'Material de escritório e papelaria',
        icon: 'briefcase',
        color: '#F59E0B',
      },
      Tecnologia: {
        name: 'Tecnologia',
        description: 'Produtos tecnológicos e gadgets',
        icon: 'smartphone',
        color: '#10B981',
      },
      'Bem-estar': {
        name: 'Bem-estar',
        description: 'Produtos para saúde e bem-estar',
        icon: 'heart',
        color: '#EF4444',
      },
      Acessórios: {
        name: 'Acessórios',
        description: 'Acessórios pessoais e corporativos',
        icon: 'watch',
        color: '#8B5CF6',
      },
    }

    return (
      (configs as Record<string, any>)[categoryName] || {
        name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        description: `Categoria ${categoryName}`,
        icon: 'package',
        color: '#6B7280',
      }
    )
  }

  private async createBaseProduct(productData: any) {
    const { error } = await supabase.from('base_products').insert(productData)

    if (error) {
      throw new Error(`Erro ao criar produto base: ${error.message}`)
    }
  }
}
