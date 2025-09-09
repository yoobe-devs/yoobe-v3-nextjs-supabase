import { NextResponse } from 'next/server'
import { getCurrentTimestamp } from '@/lib/date-utils'

export async function GET() {
  try {
    const timestamp = getCurrentTimestamp()

    // Verificar se os arquivos do sistema existem
    const fs = require('fs')
    const path = require('path')

    const systemFiles = [
      'lib/smart-docs-system.ts',
      'lib/error-memory.ts',
      'lib/error-prevention.ts',
      'lib/intelligent-docs.ts',
      'lib/docs-monitor.ts',
    ]

    const configFile = 'smart-docs.config.json'
    const templatesDir = 'docs/templates'
    const generatedDir = 'docs/generated'

    const status = {
      timestamp,
      system: {
        initialized: true,
        version: '1.0.0',
        status: 'active',
      },
      files: {
        systemFiles: systemFiles.map(file => ({
          name: file,
          exists: fs.existsSync(path.join(process.cwd(), file)),
        })),
        configFile: {
          name: configFile,
          exists: fs.existsSync(path.join(process.cwd(), configFile)),
        },
        templatesDir: {
          name: templatesDir,
          exists: fs.existsSync(path.join(process.cwd(), templatesDir)),
        },
        generatedDir: {
          name: generatedDir,
          exists: fs.existsSync(path.join(process.cwd(), generatedDir)),
        },
      },
      directories: {
        docs: fs.existsSync(path.join(process.cwd(), 'docs')),
        templates: fs.existsSync(path.join(process.cwd(), 'docs/templates')),
        generated: fs.existsSync(path.join(process.cwd(), 'docs/generated')),
        backups: fs.existsSync(path.join(process.cwd(), 'docs/backups')),
        logs: fs.existsSync(path.join(process.cwd(), 'logs/smart-docs')),
        data: fs.existsSync(path.join(process.cwd(), 'data/smart-docs')),
      },
      scripts: {
        init: fs.existsSync(
          path.join(process.cwd(), 'scripts/init-smart-docs.js')
        ),
        start: fs.existsSync(
          path.join(process.cwd(), 'scripts/start-smart-docs.js')
        ),
      },
      npmScripts: {
        'smart-docs:init': true,
        'smart-docs:start': true,
        'smart-docs:status': true,
      },
      health: {
        overall: 'healthy',
        components: {
          systemFiles: systemFiles.every(file =>
            fs.existsSync(path.join(process.cwd(), file))
          ),
          configFile: fs.existsSync(path.join(process.cwd(), configFile)),
          directories:
            fs.existsSync(path.join(process.cwd(), 'docs/templates')) &&
            fs.existsSync(path.join(process.cwd(), 'docs/generated')),
          scripts:
            fs.existsSync(
              path.join(process.cwd(), 'scripts/init-smart-docs.js')
            ) &&
            fs.existsSync(
              path.join(process.cwd(), 'scripts/start-smart-docs.js')
            ),
        },
      },
      features: {
        autoStart: true,
        autoUpdate: true,
        consistencyCheck: true,
        reportGeneration: true,
        monitoring: true,
        errorPrevention: true,
      },
      documentation: {
        available: true,
        endpoints: [
          '/docs/SMART_DOCS_SYSTEM_COMPLETE',
          '/docs/SYSTEM_PROTECTION',
          '/docs/API_REFERENCE',
          '/docs/DATABASE_SCHEMA',
        ],
      },
    }

    // Calcular status geral
    const allComponentsHealthy = Object.values(status.health.components).every(
      healthy => healthy
    )
    status.health.overall = allComponentsHealthy ? 'healthy' : 'degraded'

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('Erro ao obter status do Smart Docs:', error)

    return NextResponse.json(
      {
        timestamp: getCurrentTimestamp(),
        error: 'Erro ao obter status do Smart Docs',
        details: error.message,
        system: {
          initialized: false,
          status: 'error',
        },
      },
      { status: 500 }
    )
  }
}

