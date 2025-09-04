#!/usr/bin/env node

/**
 * Script para atualizar automaticamente todas as referências de versão no projeto
 * Uso: node scripts/update-version.js [nova-versao]
 * Exemplo: node scripts/update-version.js 3.1.0
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configurações
const PROJECT_ROOT = path.resolve(__dirname, '..')
const OLD_VERSION = '3.1.0'
const NEW_VERSION = process.argv[2] || '3.1.0'

// Extensões de arquivos para processar
const FILE_EXTENSIONS = [
  '.md',
  '.tsx',
  '.ts',
  '.js',
  '.jsx',
  '.json',
  '.html',
  '.mdc',
]

// Arquivos específicos para atualizar
const SPECIFIC_FILES = [
  'package.json',
  'README.md',
  'CHANGELOG.md',
  'next.config.js',
]

// Padrões de busca para versão
const VERSION_PATTERNS = [
  /v3\.0\.0/g,
  /3\.0\.0/g,
  /"version":\s*"3\.0\.0"/g,
  /YOOBE v3\.0\.0/g,
  /Yoobe v3\.0\.0/g,
  /yoobe v3\.0\.0/g,
  /v3\.0\.0/g,
  /3\.0\.0/g,
]

// Padrões de substituição
const VERSION_REPLACEMENTS = [
  'v3.1.0',
  '3.1.0',
  '"version": "3.1.0"',
  'YOOBE v3.1.0',
  'Yoobe v3.1.0',
  'yoobe v3.1.0',
  'v3.1.0',
  '3.1.0',
]

console.log(`🚀 Atualizando versão de ${OLD_VERSION} para ${NEW_VERSION}...`)
console.log(`📁 Diretório raiz: ${PROJECT_ROOT}`)
console.log('')

// Função para verificar se arquivo deve ser processado
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath)
  const fileName = path.basename(filePath)

  // Ignorar node_modules, .git, .next, etc.
  if (
    filePath.includes('node_modules') ||
    filePath.includes('.git') ||
    filePath.includes('.next') ||
    filePath.includes('coverage') ||
    filePath.includes('.vercel')
  ) {
    return false
  }

  // Processar arquivos com extensões específicas
  if (FILE_EXTENSIONS.includes(ext)) {
    return true
  }

  // Processar arquivos específicos
  if (SPECIFIC_FILES.includes(fileName)) {
    return true
  }

  return false
}

// Função para atualizar conteúdo do arquivo
function updateFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let updatedContent = content
    let hasChanges = false

    // Aplicar todas as substituições
    VERSION_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(
          pattern,
          VERSION_REPLACEMENTS[index]
        )
        hasChanges = true
      }
    })

    // Se houve mudanças, salvar arquivo
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ ${path.relative(PROJECT_ROOT, filePath)}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message)
    return false
  }
}

// Função para processar diretório recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath)
  let totalUpdated = 0

  for (const item of items) {
    const fullPath = path.join(dirPath, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      totalUpdated += processDirectory(fullPath)
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      if (updateFileContent(fullPath)) {
        totalUpdated++
      }
    }
  }

  return totalUpdated
}

// Função principal
async function main() {
  try {
    console.log('🔍 Procurando arquivos para atualizar...')
    console.log('')

    // Processar diretório raiz
    const totalUpdated = processDirectory(PROJECT_ROOT)

    console.log('')
    console.log(`🎉 Atualização concluída!`)
    console.log(`📊 Total de arquivos atualizados: ${totalUpdated}`)
    console.log('')

    // Verificar se package.json foi atualizado
    const packagePath = path.join(PROJECT_ROOT, 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf8')
      const packageJson = JSON.parse(packageContent)

      if (packageJson.version === NEW_VERSION) {
        console.log(`✅ package.json atualizado para versão ${NEW_VERSION}`)
      } else {
        console.log(`⚠️  package.json ainda na versão ${packageJson.version}`)
      }
    }

    // Sugerir próximos passos
    console.log('')
    console.log('🚀 Próximos passos sugeridos:')
    console.log(`   1. Verificar se todas as versões foram atualizadas`)
    console.log(
      `   2. Commit das mudanças: git add . && git commit -m "chore: Atualizar versão para ${NEW_VERSION}"`
    )
    console.log(`   3. Push para o repositório: git push`)
    console.log('')
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { updateVersion: main }
