import fs from 'fs'
import path from 'path'

interface DocumentationConfig {
  version: string
  lastUpdated: string
  autoUpdate: boolean
  files: Record<string, {
    path: string
    lastModified: Date
    dependencies: string[]
  }>
}

export class DocumentationUpdater {
  private config: DocumentationConfig
  private configPath: string
  private docsPath: string

  constructor() {
    this.configPath = path.join(process.cwd(), 'docs', 'config.json')
    this.docsPath = path.join(process.cwd(), 'docs')
    this.config = this.loadConfig()
  }

  private loadConfig(): DocumentationConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8')
        return JSON.parse(configData)
      }
    } catch (error) {
      console.warn('Could not load documentation config:', error)
    }

    // Configuração padrão
    return {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      autoUpdate: true,
      files: {}
    }
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error('Could not save documentation config:', error)
    }
  }

  // Detectar mudanças na API e atualizar documentação
  async updateApiDocumentation(): Promise<void> {
    const apiRoutes = this.scanApiRoutes()
    const apiDocContent = this.generateApiDocumentation(apiRoutes)
    
    const apiDocPath = path.join(this.docsPath, 'API_REFERENCE.md')
    await this.updateDocumentFile(apiDocPath, apiDocContent)
    
    console.log('✅ API documentation updated')
  }

  // Atualizar changelog com nova versão
  async updateChangelog(version: string, changes: string[]): Promise<void> {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')
    const currentChangelog = fs.existsSync(changelogPath) 
      ? fs.readFileSync(changelogPath, 'utf-8') 
      : ''
    
    const newEntry = this.generateChangelogEntry(version, changes)
    const updatedChangelog = newEntry + '\n\n' + currentChangelog
    
    fs.writeFileSync(changelogPath, updatedChangelog)
    
    // Atualizar também o changelog visual
    await this.updateVisualChangelog(version, changes)
    
    console.log(`✅ Changelog updated for version ${version}`)
  }

  // Escanear rotas da API
  private scanApiRoutes(): any[] {
    const apiPath = path.join(process.cwd(), 'app', 'api')
    const routes: any[] = []

    const scanDirectory = (dir: string, basePath: string = '') => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath, basePath + '/' + item)
        } else if (item === 'route.ts') {
          const content = fs.readFileSync(itemPath, 'utf-8')
          const methods = this.extractHttpMethods(content)
          
          routes.push({
            path: basePath,
            methods,
            file: itemPath,
            lastModified: stat.mtime
          })
        }
      }
    }

    if (fs.existsSync(apiPath)) {
      scanDirectory(apiPath)
    }

    return routes
  }

  // Extrair métodos HTTP do arquivo de rota
  private extractHttpMethods(content: string): string[] {
    const methods: string[] = []
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`)) {
        methods.push(method)
      }
    }
    
    return methods
  }

  // Gerar documentação da API
  private generateApiDocumentation(routes: any[]): string {
    const date = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let content = `# 📡 API Reference - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Códigos de Status](#códigos-de-status)

---

## 🎯 Visão Geral

A API da Yoobe Platform é baseada em REST e utiliza JSON para comunicação.

**Última atualização:** ${date}
**Versão:** ${this.config.version}

### Base URL

\`\`\`
Desenvolvimento: http://localhost:3001/api
Produção: https://api.yoobe.com
\`\`\`

---

## 🔐 Autenticação

### JWT Token

\`\`\`typescript
// Headers necessários
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
\`\`\`

---

## 📡 Endpoints

`

    // Agrupar rotas por categoria
    const groupedRoutes = this.groupRoutesByCategory(routes)
    
    for (const [category, categoryRoutes] of Object.entries(groupedRoutes)) {
      content += `\n### ${category}\n\n`
      
      for (const route of categoryRoutes as any[]) {
        content += `#### ${route.methods.join(', ')} ${route.path}\n\n`
        content += `\`\`\`bash\n`
        
        for (const method of route.methods) {
          content += `curl -X ${method} http://localhost:3001/api${route.path} \\\\\n`
          content += `  -H "Authorization: Bearer <token>"\n\n`
        }
        
        content += `\`\`\`\n\n`
      }
    }

    content += `
---

## 📊 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Erro de validação |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 500 | Erro interno |

**Versão:** ${this.config.version}  
**Status:** ✅ Ativo`

    return content
  }

  // Agrupar rotas por categoria
  private groupRoutesByCategory(routes: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {
      'Autenticação': [],
      'Usuários': [],
      'Produtos': [],
      'Pedidos': [],
      'Lojas': [],
      'Integrações': [],
      'Admin': [],
      'Gestor': [],
      'Outros': []
    }

    for (const route of routes) {
      if (route.path.includes('/auth')) {
        groups['Autenticação'].push(route)
      } else if (route.path.includes('/users')) {
        groups['Usuários'].push(route)
      } else if (route.path.includes('/products')) {
        groups['Produtos'].push(route)
      } else if (route.path.includes('/orders')) {
        groups['Pedidos'].push(route)
      } else if (route.path.includes('/stores')) {
        groups['Lojas'].push(route)
      } else if (route.path.includes('/admin')) {
        groups['Admin'].push(route)
      } else if (route.path.includes('/gestor')) {
        groups['Gestor'].push(route)
      } else if (route.path.includes('/cubbo') || route.path.includes('/integration')) {
        groups['Integrações'].push(route)
      } else {
        groups['Outros'].push(route)
      }
    }

    // Remover grupos vazios
    for (const [key, value] of Object.entries(groups)) {
      if (value.length === 0) {
        delete groups[key]
      }
    }

    return groups
  }

  // Gerar entrada do changelog
  private generateChangelogEntry(version: string, changes: string[]): string {
    const date = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let entry = `## [${version}] - ${date}\n\n`
    
    const groupedChanges = this.groupChangesByType(changes)
    
    for (const [type, typeChanges] of Object.entries(groupedChanges)) {
      entry += `### ${type}\n`
      for (const change of typeChanges as string[]) {
        entry += `- ${change}\n`
      }
      entry += '\n'
    }

    return entry
  }

  // Agrupar mudanças por tipo
  private groupChangesByType(changes: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      'Adicionado': [],
      'Alterado': [],
      'Corrigido': [],
      'Removido': [],
      'Segurança': []
    }

    for (const change of changes) {
      if (change.toLowerCase().includes('adiciona') || change.toLowerCase().includes('novo')) {
        groups['Adicionado'].push(change)
      } else if (change.toLowerCase().includes('corrig') || change.toLowerCase().includes('fix')) {
        groups['Corrigido'].push(change)
      } else if (change.toLowerCase().includes('remove') || change.toLowerCase().includes('delete')) {
        groups['Removido'].push(change)
      } else if (change.toLowerCase().includes('seguranç') || change.toLowerCase().includes('security')) {
        groups['Segurança'].push(change)
      } else {
        groups['Alterado'].push(change)
      }
    }

    // Remover grupos vazios
    for (const [key, value] of Object.entries(groups)) {
      if (value.length === 0) {
        delete groups[key]
      }
    }

    return groups
  }

  // Atualizar changelog visual
  private async updateVisualChangelog(version: string, changes: string[]): Promise<void> {
    const changelogPath = path.join(process.cwd(), 'app', 'admin', 'changelog', 'page.tsx')
    
    if (!fs.existsSync(changelogPath)) {
      console.warn('Visual changelog file not found')
      return
    }

    // Ler arquivo atual
    let content = fs.readFileSync(changelogPath, 'utf-8')
    
    // Criar nova entrada
    const newEntry = {
      version,
      date: new Date().toISOString().split('T')[0],
      title: `Versão ${version}`,
      description: 'Atualizações automáticas da plataforma',
      type: 'feature' as const,
      impact: 'medium' as const,
      author: 'Sistema Automático',
      tags: ['automático', 'atualização'],
      items: changes
    }

    // Inserir nova entrada no array
    const entryString = JSON.stringify(newEntry, null, 2)
    content = content.replace(
      'const changelog: ChangelogEntry[] = [',
      `const changelog: ChangelogEntry[] = [\n  ${entryString},`
    )

    fs.writeFileSync(changelogPath, content)
  }

  // Atualizar arquivo de documentação
  private async updateDocumentFile(filePath: string, newContent: string): Promise<void> {
    const oldContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
    
    if (oldContent !== newContent) {
      fs.writeFileSync(filePath, newContent)
      
      // Atualizar configuração
      const relativePath = path.relative(this.docsPath, filePath)
      this.config.files[relativePath] = {
        path: filePath,
        lastModified: new Date(),
        dependencies: []
      }
      
      this.config.lastUpdated = new Date().toISOString()
      this.saveConfig()
    }
  }

  // Verificar e atualizar automaticamente
  async autoUpdate(): Promise<void> {
    if (!this.config.autoUpdate) {
      return
    }

    console.log('🔄 Verificando atualizações na documentação...')

    try {
      await this.updateApiDocumentation()
      
      console.log('✅ Documentação atualizada automaticamente')
    } catch (error) {
      console.error('❌ Erro ao atualizar documentação:', error)
    }
  }

  // Atualizar versão da plataforma
  async updateVersion(newVersion: string, changes: string[]): Promise<void> {
    this.config.version = newVersion
    this.config.lastUpdated = new Date().toISOString()
    this.saveConfig()
    
    await this.updateChangelog(newVersion, changes)
    await this.updateApiDocumentation()
    
    console.log(`🎉 Plataforma atualizada para versão ${newVersion}`)
  }
}

// Instância singleton
export const documentationUpdater = new DocumentationUpdater()
