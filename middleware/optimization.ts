import { NextRequest, NextResponse } from 'next/server'
import { cache, createCacheKey } from '@/lib/cache'
import {
  rateLimiter,
  getRequestIdentifier,
  RATE_LIMITS,
} from '@/lib/rate-limiter'

// Middleware para otimização de performance
export function withOptimization(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    cacheKey?: string
    cacheTTL?: number
    rateLimit?: keyof typeof RATE_LIMITS
    skipCache?: boolean
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const {
      cacheKey,
      cacheTTL = 5 * 60 * 1000, // 5 minutos por padrão
      rateLimit = 'authenticated',
      skipCache = false,
    } = options

    try {
      // Rate limiting
      if (rateLimit) {
        const identifier = getRequestIdentifier(req)
        const limit = RATE_LIMITS[rateLimit]
        const rateLimitResult = rateLimiter.checkLimit(
          identifier,
          limit.maxRequests,
          limit.windowMs
        )

        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.maxRequests.toString(),
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              },
            }
          )
        }
      }

      // Cache check
      if (!skipCache && cacheKey) {
        const cachedData = cache.getWithStats(cacheKey)
        if (cachedData) {
          return NextResponse.json({
            ...cachedData,
            cached: true,
            timestamp: new Date().toISOString(),
          })
        }
      }

      // Executar handler original
      const response = await handler(req)

      // Cache response se for sucesso
      if (!skipCache && cacheKey && response.status === 200) {
        try {
          const responseData = await response.clone().json()
          cache.set(cacheKey, responseData, cacheTTL)
        } catch (error) {
          console.error('Erro ao armazenar no cache:', error)
        }
      }

      return response
    } catch (error) {
      console.error('Erro no middleware de otimização:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

// Função para invalidar cache
export function invalidateCache(pattern: string) {
  // Implementação simples - em produção usar Redis com pattern matching
  console.log(`Invalidando cache com padrão: ${pattern}`)
  // Por enquanto, limpar todo o cache
  cache.clear()
}

// Função para obter estatísticas de performance
export function getPerformanceStats() {
  return {
    cache: cache.getStats(),
    rateLimiter: rateLimiter.getStats(),
  }
}










