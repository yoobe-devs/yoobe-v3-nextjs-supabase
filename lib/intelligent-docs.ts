import fs from 'fs'
import path from 'path'
import { errorMemorySystem } from './error-memory'
import { errorPreventionSystem } from './error-prevention'

export interface DocumentationSection {
  id: string
  title: string
  content: string
  lastUpdated: Date
  dependencies: string[]
  tags: string[]
  version: string
}

export interface DocumentationTemplate {
  name: string
  sections: string[]
  format: 'markdown' | 'yaml' | 'json'
  variables: string[]
}

export class IntelligentDocumentationSystem {
  private docsPath: string
  private templatesPath: string
  private sections: Map<string, DocumentationSection> = new Map()
  private templates: Map<string, DocumentationTemplate> = new Map()

  constructor() {
    this.docsPath = path.join(process.cwd(), 'docs')
    this.templatesPath = path.join(process.cwd(), 'docs', 'templates')
    this.loadTemplates()
    this.loadSections()
  }

  private loadTemplates(): void {
    try {
      if (fs.existsSync(this.templatesPath)) {
        const files = fs.readdirSync(this.templatesPath)
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(this.templatesPath, file), 'utf-8')
            const template: DocumentationTemplate = JSON.parse(content)
            this.templates.set(template.name, template)
          }
        }
      }
    } catch (error) {
      console.warn('Could not load documentation templates:', error)
    }
  }

  private loadSections(): void {
    try {
      const sectionsPath = path.join(this.docsPath, 'sections.json')
      if (fs.existsSync(sectionsPath)) {
        const content = fs.readFileSync(sectionsPath, 'utf-8')
        const sectionsData = JSON.parse(content)
        for (const [id, section] of Object.entries(sectionsData)) {
          this.sections.set(id, {
            ...section as any,
            lastUpdated: new Date((section as any).lastUpdated)
          })
        }
      }
    } catch (error) {
      console.warn('Could not load documentation sections:', error)
    }
  }

  private saveSections(): void {
    try {
      const sectionsPath = path.join(this.docsPath, 'sections.json')
      const sectionsData: Record<string, any> = {}
      
      for (const [id, section] of this.sections) {
        sectionsData[id] = {
          ...section,
          lastUpdated: section.lastUpdated.toISOString()
        }
      }
      
      fs.writeFileSync(sectionsPath, JSON.stringify(sectionsData, null, 2))
    } catch (error) {
      console.error('Could not save documentation sections:', error)
    }
  }

  // Atualizar seção automaticamente
  async updateSection(sectionId: string, content: string, tags: string[] = []): Promise<void> {
    const existingSection = this.sections.get(sectionId)
    
    if (existingSection) {
      existingSection.content = content
      existingSection.lastUpdated = new Date()
      existingSection.tags = [...new Set([...existingSection.tags, ...tags])]
    } else {
      this.sections.set(sectionId, {
        id: sectionId,
        title: this.generateTitleFromId(sectionId),
        content,
        lastUpdated: new Date(),
        dependencies: [],
        tags,
        version: '1.0.0'
      })
    }
    
    this.saveSections()
    console.log(`📝 Seção atualizada: ${sectionId}`)
  }

  // Gerar documentação completa
  async generateCompleteDocumentation(): Promise<string> {
    const date = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let content = `# 📚 Documentação Completa - Yoobe Platform v3.1.0

**Última atualização:** ${date}  
**Versão:** 3.1.0  
**Status:** ✅ Ativo e Auto-atualizado

---

## 📋 Índice

`

    // Gerar índice baseado nas seções
    const sortedSections = Array.from(this.sections.values())
      .sort((a, b) => a.title.localeCompare(b.title))

    for (const section of sortedSections) {
      const anchor = section.title.toLowerCase().replace(/\s+/g, '-')
      content += `- [${section.title}](#${anchor})\n`
    }

    content += `\n---\n\n`

    // Adicionar conteúdo de cada seção
    for (const section of sortedSections) {
      content += `## ${section.title}\n\n`
      content += section.content
      content += `\n\n*Última atualização: ${section.lastUpdated.toLocaleDateString('pt-BR')}*\n\n---\n\n`
    }

    // Adicionar seção de erros corrigidos
    content += await this.generateErrorsSection()
    
    // Adicionar seção de prevenção
    content += await this.generatePreventionSection()

    return content
  }

  // Gerar seção de erros corrigidos
  private async generateErrorsSection(): Promise<string> {
    const errors = errorMemorySystem.getAllErrors()
    const resolvedErrors = errors.filter(e => e.resolved)
    
    let content = `## 🚨 Erros Corrigidos e Prevenções

### 📊 Estatísticas
- **Total de Erros Registrados:** ${errors.length}
- **Erros Resolvidos:** ${resolvedErrors.length}
- **Taxa de Resolução:** ${errors.length > 0 ? ((resolvedErrors.length / errors.length) * 100).toFixed(1) : 0}%

### 🔍 Erros por Categoria
`

    const errorsByType = errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    for (const [type, count] of Object.entries(errorsByType)) {
      content += `- **${type}:** ${count}\n`
    }

    content += `\n### 📝 Erros Mais Relevantes
`
    
    const relevantErrors = resolvedErrors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)

    for (const error of relevantErrors) {
      content += `#### ${error.title}
- **Tipo:** ${error.errorType}
- **Severidade:** ${error.severity}
- **Solução:** ${error.solution}
- **Prevenção:** ${error.preventionSteps.join(', ')}

`
    }

    return content
  }

  // Gerar seção de prevenção
  private async generatePreventionSection(): Promise<string> {
    let content = `## 🛡️ Sistema de Prevenção de Erros

### 🎯 Como Funciona
O sistema de prevenção analisa automaticamente o código em busca de padrões que podem causar erros conhecidos.

### 📋 Regras de Prevenção Ativas
`

    const preventionRules = [
      'SQL Performance: Evitar queries ineficientes',
      'Autenticação: Sempre validar tokens e permissões',
      'Validação: Validar dados de entrada',
      'Tratamento de Erros: Implementar catch adequados',
      'Segurança: Não hardcodar credenciais'
    ]

    for (const rule of preventionRules) {
      content += `- ✅ ${rule}\n`
    }

    content += `\n### 🔍 Análise Automática
O sistema analisa automaticamente:
- Novos arquivos de código
- Modificações em arquivos existentes
- Padrões de código de risco
- Similaridades com erros anteriores

### 🎯 Benefícios
- **Prevenção:** Evita erros antes de acontecerem
- **Aprendizado:** Aprende com cada erro corrigido
- **Consistência:** Mantém padrões de qualidade
- **Eficiência:** Reduz tempo de debugging
`

    return content
  }

  // Atualizar documentação baseada em mudanças no código
  async updateFromCodeChanges(changedFiles: string[]): Promise<void> {
    console.log('🔄 Atualizando documentação baseada em mudanças no código...')

    for (const filePath of changedFiles) {
      if (this.isCodeFile(filePath)) {
        await this.updateDocumentationFromFile(filePath)
      }
    }

    // Gerar documentação completa atualizada
    const completeDocs = await this.generateCompleteDocumentation()
    const mainDocPath = path.join(this.docsPath, 'COMPLETE_DOCUMENTATION.md')
    fs.writeFileSync(mainDocPath, completeDocs)

    console.log('✅ Documentação atualizada automaticamente')
  }

  // Atualizar documentação baseada em arquivo específico
  private async updateDocumentationFromFile(filePath: string): Promise<void> {
    const fileName = path.basename(filePath)
    const fileType = this.getFileType(filePath)
    
    // Analisar arquivo para detectar mudanças
    const analysis = await errorPreventionSystem.analyzeFile(filePath)
    
    // Atualizar seção correspondente
    const sectionId = this.getSectionIdForFile(filePath)
    let content = `# ${fileName}\n\n`
    
    if (analysis.alerts.length > 0) {
      content += `## ⚠️ Alertas de Prevenção\n\n`
      for (const alert of analysis.alerts) {
        content += `### ${alert.message}\n`
        content += `- **Tipo:** ${alert.type}\n`
        content += `- **Sugestão:** ${alert.suggestedFix}\n\n`
      }
    }
    
    if (analysis.suggestions.length > 0) {
      content += `## 💡 Sugestões\n\n`
      for (const suggestion of analysis.suggestions) {
        content += `- ${suggestion}\n`
      }
      content += `\n`
    }
    
    content += `## 🚨 Análise de Risco\n`
    content += `- **Nível de Risco:** ${analysis.riskLevel}\n`
    content += `- **Padrões Detectados:** ${analysis.alerts.length}\n`
    content += `- **Erros Similares:** ${analysis.similarErrors.length}\n`
    
    await this.updateSection(sectionId, content, [fileType, 'auto-updated'])
  }

  private getFileType(filePath: string): string {
    const ext = path.extname(filePath)
    switch (ext) {
      case '.ts': return 'typescript'
      case '.tsx': return 'typescript-react'
      case '.js': return 'javascript'
      case '.jsx': return 'javascript-react'
      case '.sql': return 'sql'
      default: return 'code'
    }
  }

  private getSectionIdForFile(filePath: string): string {
    const relativePath = path.relative(process.cwd(), filePath)
    return relativePath.replace(/[\/\\]/g, '_').replace(/\./g, '_')
  }

  private isCodeFile(filePath: string): boolean {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.sql']
    const ext = path.extname(filePath)
    return codeExtensions.includes(ext)
  }

  private generateTitleFromId(sectionId: string): string {
    return sectionId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim()
  }

  // Verificar consistência entre código e documentação
  async checkConsistency(): Promise<{
    isConsistent: boolean
    inconsistencies: string[]
    suggestions: string[]
  }> {
    const inconsistencies: string[] = []
    const suggestions: string[] = []
    
    // Verificar se arquivos de código têm documentação correspondente
    const codeFiles = this.scanCodeFiles()
    
    for (const codeFile of codeFiles) {
      const sectionId = this.getSectionIdForFile(codeFile)
      if (!this.sections.has(sectionId)) {
        inconsistencies.push(`Arquivo ${codeFile} não tem documentação correspondente`)
        suggestions.push(`Criar documentação para ${codeFile}`)
      }
    }
    
    // Verificar se seções de documentação têm arquivos correspondentes
    for (const [sectionId, section] of this.sections) {
      if (section.dependencies.length > 0) {
        for (const dependency of section.dependencies) {
          if (!fs.existsSync(dependency)) {
            inconsistencies.push(`Dependência ${dependency} da seção ${sectionId} não existe`)
            suggestions.push(`Remover dependência ${dependency} ou criar arquivo`)
          }
        }
      }
    }
    
    return {
      isConsistent: inconsistencies.length === 0,
      inconsistencies,
      suggestions
    }
  }

  private scanCodeFiles(): string[] {
    const codeFiles: string[] = []
    const scanDirectory = (dir: string) => {
      try {
        const items = fs.readdirSync(dir)
        for (const item of items) {
          const itemPath = path.join(dir, item)
          const stat = fs.statSync(itemPath)
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDirectory(itemPath)
          } else if (this.isCodeFile(itemPath)) {
            codeFiles.push(itemPath)
          }
        }
      } catch (error) {
        // Ignorar erros de permissão
      }
    }
    
    scanDirectory(process.cwd())
    return codeFiles
  }

  // Obter todas as seções
  getAllSections(): DocumentationSection[] {
    return Array.from(this.sections.values())
  }

  // Obter seção por ID
  getSection(sectionId: string): DocumentationSection | undefined {
    return this.sections.get(sectionId)
  }

  // Remover seção
  removeSection(sectionId: string): boolean {
    const removed = this.sections.delete(sectionId)
    if (removed) {
      this.saveSections()
      console.log(`🗑️ Seção removida: ${sectionId}`)
    }
    return removed
  }

  // Buscar seções por tag
  findSectionsByTag(tag: string): DocumentationSection[] {
    return Array.from(this.sections.values()).filter(section => 
      section.tags.includes(tag)
    )
  }

  // Buscar seções por conteúdo
  searchSections(query: string): DocumentationSection[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.sections.values()).filter(section => 
      section.title.toLowerCase().includes(lowerQuery) ||
      section.content.toLowerCase().includes(lowerQuery) ||
      section.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
}

// Instância singleton
export const intelligentDocs = new IntelligentDocumentationSystem()
