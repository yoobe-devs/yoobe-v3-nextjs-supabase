#!/usr/bin/env node

/**
 * Script para migrar a base de conhecimento de erros para o Spec Kit
 * Yoobe v3.1.0 - Error Base Migration to Spec Kit
 */

const fs = require('fs')
const path = require('path')

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Estrutura de especificação para erros
function createErrorSpecification(error) {
  const spec = {
    id: `error-spec-${error.id}`,
    title: `Error Prevention: ${error.title}`,
    description: `Specification for preventing and handling: ${error.description}`,
    category: 'error-prevention',
    priority: mapSeverityToPriority(error.severity),
    status: error.resolved ? 'completed' : 'active',
    tags: [
      'error-prevention',
      error.errorType,
      error.severity,
      ...(error.tags || []),
    ],
    requirements: [
      {
        id: `req-${error.id}-prevention`,
        title: 'Prevention Measures',
        description: 'Implement prevention steps to avoid this error',
        acceptanceCriteria: error.preventionSteps.map((step, index) => ({
          id: `ac-${error.id}-prevention-${index}`,
          description: step,
          status: 'pending',
        })),
        status: 'pending',
      },
      {
        id: `req-${error.id}-detection`,
        title: 'Error Detection',
        description: 'Implement detection mechanisms for this error type',
        acceptanceCriteria: [
          {
            id: `ac-${error.id}-detection-1`,
            description: 'Error is logged with proper context',
            status: 'pending',
          },
          {
            id: `ac-${error.id}-detection-2`,
            description: 'Error is categorized correctly',
            status: 'pending',
          },
        ],
        status: 'pending',
      },
      {
        id: `req-${error.id}-resolution`,
        title: 'Error Resolution',
        description: 'Implement resolution procedures for this error',
        acceptanceCriteria: [
          {
            id: `ac-${error.id}-resolution-1`,
            description: 'Solution is documented and accessible',
            status: error.resolved ? 'completed' : 'pending',
          },
          {
            id: `ac-${error.id}-resolution-2`,
            description: 'Resolution is tracked and monitored',
            status: 'pending',
          },
        ],
        status: error.resolved ? 'completed' : 'pending',
      },
    ],
    implementation: {
      codeSnippet: error.codeSnippet,
      filePath: error.filePath,
      solution: error.solution,
      relatedErrors: error.relatedErrors,
      documentationLinks: error.documentationLinks,
    },
    metadata: {
      originalErrorId: error.id,
      errorType: error.errorType,
      severity: error.severity,
      developer: error.developer,
      timestamp: error.timestamp,
      resolutionDate: error.resolutionDate,
      migratedAt: new Date().toISOString(),
    },
  }

  return spec
}

function mapSeverityToPriority(severity) {
  const mapping = {
    critical: 'high',
    high: 'high',
    medium: 'medium',
    low: 'low',
  }
  return mapping[severity] || 'medium'
}

function createErrorCategorySpecification(errorType, errors) {
  const resolvedCount = errors.filter(e => e.resolved).length
  const totalCount = errors.length
  const resolutionRate = totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0

  return {
    id: `error-category-${errorType}`,
    title: `Error Category: ${errorType.replace('_', ' ').toUpperCase()}`,
    description: `Comprehensive error prevention and handling for ${errorType} errors`,
    category: 'error-prevention',
    priority:
      resolutionRate < 50 ? 'high' : resolutionRate < 80 ? 'medium' : 'low',
    status: 'active',
    tags: ['error-prevention', 'category', errorType],
    requirements: [
      {
        id: `req-${errorType}-monitoring`,
        title: 'Error Monitoring',
        description: `Monitor and track ${errorType} errors`,
        acceptanceCriteria: [
          {
            id: `ac-${errorType}-monitoring-1`,
            description: `All ${errorType} errors are logged and categorized`,
            status: 'pending',
          },
          {
            id: `ac-${errorType}-monitoring-2`,
            description: `Error trends are tracked and reported`,
            status: 'pending',
          },
        ],
        status: 'pending',
      },
      {
        id: `req-${errorType}-prevention`,
        title: 'Prevention Strategy',
        description: `Implement prevention strategies for ${errorType} errors`,
        acceptanceCriteria: [
          {
            id: `ac-${errorType}-prevention-1`,
            description: `Prevention measures are documented and implemented`,
            status: 'pending',
          },
          {
            id: `ac-${errorType}-prevention-2`,
            description: `Team is trained on prevention strategies`,
            status: 'pending',
          },
        ],
        status: 'pending',
      },
    ],
    metrics: {
      totalErrors: totalCount,
      resolvedErrors: resolvedCount,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      averageSeverity: calculateAverageSeverity(errors),
    },
    metadata: {
      errorType,
      migratedAt: new Date().toISOString(),
      relatedSpecifications: errors.map(e => `error-spec-${e.id}`),
    },
  }
}

function calculateAverageSeverity(errors) {
  const severityValues = { low: 1, medium: 2, high: 3, critical: 4 }
  const total = errors.reduce(
    (sum, error) => sum + (severityValues[error.severity] || 2),
    0
  )
  const average = total / errors.length
  return (
    Object.keys(severityValues).find(
      key => severityValues[key] === Math.round(average)
    ) || 'medium'
  )
}

async function migrateErrorBase() {
  try {
    log(
      '🚀 Iniciando migração da base de conhecimento de erros para Spec Kit...',
      'bright'
    )

    // Carregar base de erros existente
    const errorMemoryPath = path.join(
      process.cwd(),
      'data',
      'error-memory.json'
    )

    if (!fs.existsSync(errorMemoryPath)) {
      logError('Arquivo de memória de erros não encontrado!')
      return
    }

    const errorData = JSON.parse(fs.readFileSync(errorMemoryPath, 'utf8'))
    logInfo(`Carregados ${errorData.length} erros da base de conhecimento`)

    // Agrupar erros por tipo
    const errorsByType = {}
    errorData.forEach(error => {
      if (!errorsByType[error.errorType]) {
        errorsByType[error.errorType] = []
      }
      errorsByType[error.errorType].push(error)
    })

    logInfo(`Encontrados ${Object.keys(errorsByType).length} tipos de erro`)

    // Criar especificações para cada erro
    const errorSpecs = errorData.map(createErrorSpecification)
    logSuccess(`Criadas ${errorSpecs.length} especificações de erro`)

    // Criar especificações por categoria
    const categorySpecs = Object.entries(errorsByType).map(
      ([errorType, errors]) =>
        createErrorCategorySpecification(errorType, errors)
    )
    logSuccess(`Criadas ${categorySpecs.length} especificações de categoria`)

    // Criar especificação geral de sistema de erros
    const systemSpec = {
      id: 'error-management-system',
      title: 'Error Management System',
      description:
        'Comprehensive error management and prevention system for Yoobe v3',
      category: 'system',
      priority: 'high',
      status: 'active',
      tags: ['error-management', 'system', 'prevention', 'monitoring'],
      requirements: [
        {
          id: 'req-error-logging',
          title: 'Error Logging System',
          description: 'Implement comprehensive error logging system',
          acceptanceCriteria: [
            {
              id: 'ac-error-logging-1',
              description: 'All errors are logged with proper context',
              status: 'completed',
            },
            {
              id: 'ac-error-logging-2',
              description: 'Error logs are searchable and filterable',
              status: 'pending',
            },
          ],
          status: 'pending',
        },
        {
          id: 'req-error-prevention',
          title: 'Error Prevention Framework',
          description: 'Implement proactive error prevention framework',
          acceptanceCriteria: [
            {
              id: 'ac-error-prevention-1',
              description: 'Prevention rules are defined and implemented',
              status: 'pending',
            },
            {
              id: 'ac-error-prevention-2',
              description: 'Team follows prevention best practices',
              status: 'pending',
            },
          ],
          status: 'pending',
        },
      ],
      metrics: {
        totalErrors: errorData.length,
        resolvedErrors: errorData.filter(e => e.resolved).length,
        errorTypes: Object.keys(errorsByType).length,
        averageResolutionTime: 'TBD',
      },
      metadata: {
        migratedAt: new Date().toISOString(),
        sourceSystem: 'error-memory.json',
        relatedSpecifications: [
          'error-management-system',
          ...categorySpecs.map(s => s.id),
          ...errorSpecs.map(s => s.id),
        ],
      },
    }

    // Criar estrutura de diretórios para Spec Kit
    const specKitDir = path.join(process.cwd(), 'spec-kit')
    const errorSpecsDir = path.join(specKitDir, 'error-prevention')

    if (!fs.existsSync(specKitDir)) {
      fs.mkdirSync(specKitDir, { recursive: true })
    }

    if (!fs.existsSync(errorSpecsDir)) {
      fs.mkdirSync(errorSpecsDir, { recursive: true })
    }

    // Salvar especificações
    const allSpecs = [systemSpec, ...categorySpecs, ...errorSpecs]

    // Salvar especificação do sistema
    fs.writeFileSync(
      path.join(specKitDir, 'error-management-system.json'),
      JSON.stringify(systemSpec, null, 2)
    )

    // Salvar especificações por categoria
    categorySpecs.forEach(spec => {
      fs.writeFileSync(
        path.join(errorSpecsDir, `${spec.id}.json`),
        JSON.stringify(spec, null, 2)
      )
    })

    // Salvar especificações individuais de erro
    errorSpecs.forEach(spec => {
      fs.writeFileSync(
        path.join(errorSpecsDir, `${spec.id}.json`),
        JSON.stringify(spec, null, 2)
      )
    })

    // Criar índice de especificações
    const indexSpec = {
      id: 'error-prevention-index',
      title: 'Error Prevention Specifications Index',
      description: 'Index of all error prevention specifications',
      category: 'index',
      priority: 'medium',
      status: 'active',
      specifications: allSpecs.map(spec => ({
        id: spec.id,
        title: spec.title,
        category: spec.category,
        priority: spec.priority,
        status: spec.status,
      })),
      metadata: {
        totalSpecifications: allSpecs.length,
        categories: [...new Set(allSpecs.map(s => s.category))],
        priorities: [...new Set(allSpecs.map(s => s.priority))],
        migratedAt: new Date().toISOString(),
      },
    }

    fs.writeFileSync(
      path.join(specKitDir, 'index.json'),
      JSON.stringify(indexSpec, null, 2)
    )

    // Criar relatório de migração
    const migrationReport = {
      migrationDate: new Date().toISOString(),
      sourceFile: 'data/error-memory.json',
      totalErrors: errorData.length,
      resolvedErrors: errorData.filter(e => e.resolved).length,
      errorTypes: Object.keys(errorsByType),
      specificationsCreated: {
        system: 1,
        categories: categorySpecs.length,
        individual: errorSpecs.length,
        total: allSpecs.length,
      },
      filesCreated: [
        'spec-kit/error-management-system.json',
        'spec-kit/index.json',
        ...categorySpecs.map(s => `spec-kit/error-prevention/${s.id}.json`),
        ...errorSpecs.map(s => `spec-kit/error-prevention/${s.id}.json`),
      ],
      nextSteps: [
        'Review specifications in Spec Kit dashboard',
        'Update error prevention workflows',
        'Implement monitoring for error categories',
        'Train team on new error management system',
      ],
    }

    fs.writeFileSync(
      path.join(specKitDir, 'migration-report.json'),
      JSON.stringify(migrationReport, null, 2)
    )

    // Log de sucesso
    log('='.repeat(60), 'cyan')
    logSuccess('Migração da base de conhecimento de erros concluída!')
    log('', 'reset')
    log('📊 Estatísticas da migração:', 'bright')
    log(`  • Total de erros migrados: ${errorData.length}`, 'green')
    log(`  • Especificações criadas: ${allSpecs.length}`, 'green')
    log(`  • Categorias de erro: ${Object.keys(errorsByType).length}`, 'green')
    log(
      `  • Taxa de resolução: ${Math.round(
        (errorData.filter(e => e.resolved).length / errorData.length) * 100
      )}%`,
      'green'
    )
    log('', 'reset')
    log('📁 Arquivos criados:', 'bright')
    log(`  • spec-kit/error-management-system.json`, 'blue')
    log(`  • spec-kit/index.json`, 'blue')
    log(
      `  • spec-kit/error-prevention/ (${allSpecs.length - 1} arquivos)`,
      'blue'
    )
    log(`  • spec-kit/migration-report.json`, 'blue')
    log('', 'reset')
    log('🎯 Próximos passos:', 'bright')
    log(
      '  1. Acesse o Spec Kit dashboard para revisar as especificações',
      'yellow'
    )
    log('  2. Implemente workflows de prevenção de erros', 'yellow')
    log('  3. Configure monitoramento para categorias de erro', 'yellow')
    log('  4. Treine a equipe no novo sistema', 'yellow')
    log('', 'reset')
  } catch (error) {
    logError(`Falha na migração: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateErrorBase()
}

module.exports = { migrateErrorBase }
