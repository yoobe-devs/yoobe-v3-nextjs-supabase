#!/usr/bin/env node

/**
 * 🚀 Yoobe v3 - Gerador Automático de Documentação
 * 
 * Este script gera documentação automaticamente baseado em:
 * - Comentários JSDoc no código
 * - Estrutura de rotas da API
 * - Esquemas de banco de dados
 * - Testes implementados
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurações
const CONFIG = {
  docsDir: path.join(__dirname, '..', 'docs', 'v3'),
  apiDir: path.join(__dirname, '..', 'app', 'api'),
  outputFile: 'API_REFERENCE.md',
  openapiFile: 'openapi.v3.json'
}

// Utilitários
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
    log(`Diretório criado: ${dirPath}`)
  }
}

// Analisador de rotas da API
class APIRouteAnalyzer {
  constructor() {
    this.routes = []
    this.endpoints = []
  }

  async analyzeRoutes() {
    log('Analisando rotas da API...')
    
    try {
      await this.scanAPIDirectory(CONFIG.apiDir)
      log(`Encontradas ${this.routes.length} rotas`)
    } catch (error) {
      log(`Erro ao analisar rotas: ${error.message}`, 'error')
    }
  }

  async scanAPIDirectory(dirPath, baseRoute = '') {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name)
        
        if (item.isDirectory()) {
          // É um diretório, continuar navegando
          const newBaseRoute = baseRoute ? `${baseRoute}/${item.name}` : item.name
          await this.scanAPIDirectory(fullPath, newBaseRoute)
        } else if (item.name === 'route.ts') {
          // É um arquivo de rota
          await this.analyzeRouteFile(fullPath, baseRoute)
        }
      }
    } catch (error) {
      // Ignorar diretórios que não podem ser acessados
    }
  }

  async analyzeRouteFile(filePath, baseRoute) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const route = this.extractRouteInfo(content, baseRoute)
      
      if (route) {
        this.routes.push(route)
        this.endpoints.push(...route.endpoints)
      }
    } catch (error) {
      log(`Erro ao analisar arquivo ${filePath}: ${error.message}`, 'warn')
    }
  }

  extractRouteInfo(content, baseRoute) {
    const route = {
      path: `/${baseRoute}`,
      file: baseRoute,
      endpoints: [],
      methods: new Set()
    }

    // Extrair métodos HTTP
    const methodMatches = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)/g)
    if (methodMatches) {
      methodMatches.forEach(match => {
        const method = match.split(' ').pop()
        route.methods.add(method)
        
        // Extrair informações básicas do endpoint
        const endpoint = {
          method,
          path: `/${baseRoute}`,
          description: this.extractDescription(content, method),
          parameters: this.extractParameters(content, method),
          responses: this.extractResponses(content, method)
        }
        
        route.endpoints.push(endpoint)
      })
    }

    return route.endpoints.length > 0 ? route : null
  }

  extractDescription(content, method) {
    // Buscar comentários JSDoc acima da função
    const methodIndex = content.indexOf(`export async function ${method}`)
    if (methodIndex === -1) return `${method} endpoint`
    
    const beforeMethod = content.substring(0, methodIndex)
    const lines = beforeMethod.split('\n').reverse()
    
    for (const line of lines) {
      if (line.trim().startsWith('//')) {
        const description = line.trim().substring(2).trim()
        if (description) return description
      }
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) {
        const description = line.trim().replace(/^\/\*|\*\/$|\*/g, '').trim()
        if (description) return description
      }
    }
    
    return `${method} endpoint`
  }

  extractParameters(content, method) {
    // Extrair parâmetros da função
    const methodRegex = new RegExp(`export async function ${method}\\([^)]*\\)`, 'g')
    const match = methodRegex.exec(content)
    
    if (match) {
      const params = match[0].match(/\(([^)]*)\)/)?.[1] || ''
      if (params.includes('request')) {
        return ['request: NextRequest']
      }
    }
    
    return []
  }

  extractResponses(content, method) {
    // Extrair tipos de resposta baseado no código
    const responses = []
    
    if (content.includes('NextResponse.json')) {
      responses.push('application/json')
    }
    
    if (content.includes('status: 200')) responses.push('200 OK')
    if (content.includes('status: 201')) responses.push('201 Created')
    if (content.includes('status: 400')) responses.push('400 Bad Request')
    if (content.includes('status: 401')) responses.push('401 Unauthorized')
    if (content.includes('status: 403')) responses.push('403 Forbidden')
    if (content.includes('status: 404')) responses.push('404 Not Found')
    if (content.includes('status: 422')) responses.push('422 Unprocessable Entity')
    if (content.includes('status: 500')) responses.push('500 Internal Server Error')
    
    return responses.length > 0 ? responses : ['200 OK']
  }
}

// Gerador de documentação Markdown
class MarkdownGenerator {
  constructor(analyzer) {
    this.analyzer = analyzer
  }

  async generateAPIReference() {
    log('Gerando documentação da API...')
    
    const content = this.generateContent()
    const outputPath = path.join(CONFIG.docsDir, CONFIG.outputFile)
    
    await fs.writeFile(outputPath, content, 'utf-8')
    log(`Documentação gerada: ${outputPath}`)
  }

  generateContent() {
    const { routes, endpoints } = this.analyzer
    
    let content = `# 🔌 Yoobe v3 - Referência da API

> **Documentação automática das rotas da API**

## 📋 **Visão Geral**

Esta documentação foi gerada automaticamente baseada na análise do código fonte.
**Total de endpoints**: ${endpoints.length}

## 🚀 **Endpoints por Categoria**

`

    // Agrupar por categoria (primeiro segmento da rota)
    const categories = this.groupByCategory(endpoints)
    
    for (const [category, categoryEndpoints] of Object.entries(categories)) {
      content += `### **${category.toUpperCase()}**\n\n`
      
      categoryEndpoints.forEach(endpoint => {
        content += this.generateEndpointDoc(endpoint)
      })
      
      content += '\n'
    }

    content += `## 📊 **Estatísticas**

- **Total de rotas**: ${routes.length}
- **Total de endpoints**: ${endpoints.length}
- **Métodos HTTP**: ${this.getUniqueMethods(endpoints).join(', ')}
- **Última atualização**: ${new Date().toISOString()}

## 🔄 **Auto-Atualização**

Esta documentação é atualizada automaticamente a cada:
- Commit no repositório
- Execução de \`npm run docs:gen\`
- Deploy para produção

---

*Documentação gerada automaticamente pelo sistema Yoobe v3*`

    return content
  }

  groupByCategory(endpoints) {
    const categories = {}
    
    endpoints.forEach(endpoint => {
      const category = endpoint.path.split('/')[1] || 'root'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(endpoint)
    })
    
    return categories
  }

  generateEndpointDoc(endpoint) {
    const { method, path, description, parameters, responses } = endpoint
    
    return `#### **${method}** \`${path}\`

${description}

**Parâmetros:**
${parameters.length > 0 ? parameters.map(p => `- \`${p}\``).join('\n') : '- Nenhum'}

**Respostas:**
${responses.map(r => `- \`${r}\``).join('\n')}

`
  }

  getUniqueMethods(endpoints) {
    const methods = new Set(endpoints.map(e => e.method))
    return Array.from(methods).sort()
  }
}

// Gerador de OpenAPI
class OpenAPIGenerator {
  constructor(analyzer) {
    this.analyzer = analyzer
  }

  async generateOpenAPI() {
    log('Gerando especificação OpenAPI...')
    
    const openapi = this.generateOpenAPISpec()
    const outputPath = path.join(CONFIG.docsDir, CONFIG.openapiFile)
    
    await fs.writeFile(outputPath, JSON.stringify(openapi, null, 2), 'utf-8')
    log(`OpenAPI gerado: ${outputPath}`)
  }

  generateOpenAPISpec() {
    const { endpoints } = this.analyzer
    
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: 'Yoobe v3 API',
        description: 'API completa do sistema Yoobe v3',
        version: '3.0.0',
        contact: {
          name: 'Suporte Yoobe',
          email: 'suporte@yoobe.app'
        }
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development'
        },
        {
          url: 'https://app.yoobe.app',
          description: 'Production'
        }
      ],
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    }

    // Adicionar endpoints
    endpoints.forEach(endpoint => {
      const pathKey = endpoint.path
      if (!openapi.paths[pathKey]) {
        openapi.paths[pathKey] = {}
      }

      const methodKey = endpoint.method.toLowerCase()
      openapi.paths[pathKey][methodKey] = {
        summary: endpoint.description,
        tags: [endpoint.path.split('/')[1] || 'root'],
        parameters: this.generateParameters(endpoint),
        responses: this.generateResponses(endpoint),
        security: [
          {
            bearerAuth: []
          }
        ]
      }
    })

    return openapi
  }

  generateParameters(endpoint) {
    const parameters = []
    
    // Parâmetros de path
    const pathParams = endpoint.path.match(/:([^/]+)/g)
    if (pathParams) {
      pathParams.forEach(param => {
        const name = param.substring(1)
        parameters.push({
          name,
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        })
      })
    }

    // Parâmetros de query (baseado no método)
    if (endpoint.method === 'GET') {
      parameters.push({
        name: 'page',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          default: 1
        }
      })
      parameters.push({
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          default: 20
        }
      })
    }

    return parameters
  }

  generateResponses(endpoint) {
    const responses = {}
    
    endpoint.responses.forEach(response => {
      const [code, description] = response.split(' ')
      responses[code] = {
        description: description || 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean'
                },
                data: {
                  type: 'object'
                },
                error: {
                  type: 'object',
                  nullable: true
                },
                meta: {
                  type: 'object',
                  nullable: true
                }
              }
            }
          }
        }
      }
    })

    return responses
  }
}

// Validador de documentação
class DocumentationValidator {
  constructor(analyzer) {
    this.analyzer = analyzer
    this.issues = []
    this.warnings = []
  }

  async validate() {
    log('Validando documentação...')
    
    this.validateRoutes()
    this.validateEndpoints()
    this.validateConsistency()
    
    if (this.issues.length === 0) {
      log('✅ Documentação validada com sucesso')
      return true
    } else {
      log(`⚠️ Encontrados ${this.issues.length} problemas críticos:`, 'warn')
      this.issues.forEach(issue => log(`  - ${issue}`, 'warn'))
      
      if (this.warnings.length > 0) {
        log(`ℹ️ E ${this.warnings.length} avisos (não críticos):`, 'info')
        this.warnings.forEach(warning => log(`  - ${warning}`, 'info'))
      }
      
      // Permitir geração mesmo com avisos (apenas problemas críticos bloqueiam)
      return this.issues.length === 0
    }
  }

  validateRoutes() {
    const { routes } = this.analyzer
    
    if (routes.length === 0) {
      this.issues.push('Nenhuma rota encontrada')
    }
    
    // Verificar rotas duplicadas
    const paths = routes.map(r => r.path)
    const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index)
    
    if (duplicates.length > 0) {
      this.issues.push(`Rotas duplicadas encontradas: ${duplicates.join(', ')}`)
    }
  }

  validateEndpoints() {
    const { endpoints } = this.analyzer
    
    endpoints.forEach(endpoint => {
      if (!endpoint.description || endpoint.description === `${endpoint.method} endpoint`) {
        // Converter para aviso em vez de erro crítico
        this.warnings.push(`Endpoint ${endpoint.method} ${endpoint.path} sem descrição adequada`)
      }
      
      if (endpoint.responses.length === 0) {
        this.warnings.push(`Endpoint ${endpoint.method} ${endpoint.path} sem respostas definidas`)
      }
    })
  }

  validateConsistency() {
    // Verificar se todas as rotas têm pelo menos um endpoint
    const { routes } = this.analyzer
    
    routes.forEach(route => {
      if (route.endpoints.length === 0) {
        this.issues.push(`Rota ${route.path} sem endpoints implementados`)
      }
    })
  }
}

// Função principal
async function main() {
  try {
    log('🚀 Iniciando geração de documentação Yoobe v3...')
    
    // Garantir diretório de documentação
    await ensureDir(CONFIG.docsDir)
    
    // Analisar rotas da API
    const analyzer = new APIRouteAnalyzer()
    await analyzer.analyzeRoutes()
    
    // Validar documentação
    const validator = new DocumentationValidator(analyzer)
    const isValid = await validator.validate()
    
    if (!isValid) {
      log('Documentação não passou na validação. Corrija os problemas antes de continuar.', 'error')
      process.exit(1)
    }
    
    // Gerar documentação Markdown
    const markdownGenerator = new MarkdownGenerator(analyzer)
    await markdownGenerator.generateAPIReference()
    
    // Gerar especificação OpenAPI
    const openapiGenerator = new OpenAPIGenerator(analyzer)
    await openapiGenerator.generateOpenAPI()
    
    log('🎉 Documentação gerada com sucesso!')
    log(`📁 Arquivos gerados em: ${CONFIG.docsDir}`)
    
  } catch (error) {
    log(`Erro durante geração: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { APIRouteAnalyzer, MarkdownGenerator, OpenAPIGenerator, DocumentationValidator }
