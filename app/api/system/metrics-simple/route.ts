import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Dados simulados para teste
    const metricsData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: 1250,
        totalMCPRequests: 519,
        totalErrors: 4,
        errorRate: 0.32,
        activeOperations: 3,
      },
      middleware: {
        totalRequests: 1250,
        blockedRequests: 5,
        redirects: 45,
        errors: 2,
        averageResponseTime: 120,
      },
      mcps: {
        MCP_DOCKER: {
          totalRequests: 150,
          successfulRequests: 148,
          failedRequests: 2,
          averageResponseTime: 250,
          healthStatus: 'healthy',
          lastHealthCheck: Date.now(),
        },
        context7: {
          totalRequests: 89,
          successfulRequests: 89,
          failedRequests: 0,
          averageResponseTime: 180,
          healthStatus: 'healthy',
          lastHealthCheck: Date.now(),
        },
        'gemini-mcp-tool': {
          totalRequests: 67,
          successfulRequests: 65,
          failedRequests: 2,
          averageResponseTime: 320,
          healthStatus: 'healthy',
          lastHealthCheck: Date.now(),
        },
        playwright: {
          totalRequests: 34,
          successfulRequests: 34,
          failedRequests: 0,
          averageResponseTime: 450,
          healthStatus: 'healthy',
          lastHealthCheck: Date.now(),
        },
        'spec-kit': {
          totalRequests: 23,
          successfulRequests: 23,
          failedRequests: 0,
          averageResponseTime: 200,
          healthStatus: 'healthy',
          lastHealthCheck: Date.now(),
        },
        'yoobe-v3-filesystem': {
          totalRequests: 156,
          successfulRequests: 156,
          failedRequests: 0,
          averageResponseTime: 80,
          healthStatus: 'healthy',
          lastHealthCheck: Date.now(),
        },
      },
      activeOperations: [
        {
          id: 'MCP_DOCKER_1757360437512_abc123',
          mcpName: 'MCP_DOCKER',
          operation: 'create_repository',
          duration: 30000,
          metadata: { repoName: 'test-repo' },
        },
        {
          id: 'context7_1757360437513_def456',
          mcpName: 'context7',
          operation: 'search_documentation',
          duration: 15000,
          metadata: { query: 'middleware protection' },
        },
        {
          id: 'yoobe-v3-filesystem_1757360437514_ghi789',
          mcpName: 'yoobe-v3-filesystem',
          operation: 'read_file',
          duration: 5000,
          metadata: { path: '/docs/SYSTEM_PROTECTION.md' },
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: metricsData,
    })
  } catch (error: any) {
    console.error('Erro ao obter métricas simples:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, target } = body

    // Simular ações de reset
    let message = ''
    switch (action) {
      case 'reset_middleware':
        message = 'Métricas do middleware resetadas com sucesso'
        break
      case 'reset_mcp':
        if (target) {
          message = `Métricas do MCP ${target} resetadas com sucesso`
        } else {
          message = 'Métricas de todos os MCPs resetadas com sucesso'
        }
        break
      case 'cleanup_operations':
        message = 'Operações antigas limpas com sucesso'
        break
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação não reconhecida',
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error: any) {
    console.error('Erro ao executar ação nas métricas:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

