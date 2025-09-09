import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Dados simulados para teste
    const healthData = {
      timestamp: new Date().toISOString(),
      overall: 'healthy' as const,
      middleware: {
        status: 'healthy',
        lastCheck: Date.now(),
        metrics: {
          totalRequests: 1250,
          blockedRequests: 5,
          redirects: 45,
          errors: 2,
          averageResponseTime: 120,
        },
      },
      mcps: {
        summary: {
          totalMCPs: 6,
          healthyMCPs: 6,
          degradedMCPs: 0,
          unhealthyMCPs: 0,
          activeOperations: 3,
        },
        details: {
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
      },
      activeOperations: [
        {
          id: 'MCP_DOCKER_1757360437512_abc123',
          mcpName: 'MCP_DOCKER',
          operation: 'create_repository',
          startTime: Date.now() - 30000,
          metadata: { repoName: 'test-repo' },
        },
        {
          id: 'context7_1757360437513_def456',
          mcpName: 'context7',
          operation: 'search_documentation',
          startTime: Date.now() - 15000,
          metadata: { query: 'middleware protection' },
        },
        {
          id: 'yoobe-v3-filesystem_1757360437514_ghi789',
          mcpName: 'yoobe-v3-filesystem',
          operation: 'read_file',
          startTime: Date.now() - 5000,
          metadata: { path: '/docs/SYSTEM_PROTECTION.md' },
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: healthData,
    })
  } catch (error: any) {
    console.error('Erro no health check simples:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        data: {
          timestamp: new Date().toISOString(),
          overall: 'unhealthy',
          error: error.message,
        },
      },
      { status: 500 }
    )
  }
}

