// Sistema de rate limiting para proteger APIs
interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpeza automática a cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  // Verificar se a requisição está dentro do limite
  checkLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutos
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Nova janela de tempo
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      })

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      }
    }

    if (entry.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    if (entry.count >= maxRequests) {
      // Bloquear por 5 minutos
      entry.blocked = true
      entry.resetTime = now + 5 * 60 * 1000

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Incrementar contador
    entry.count++

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  // Limpar entradas expiradas
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`Rate limiter cleanup: ${cleanedCount} entradas removidas`)
    }
  }

  // Obter estatísticas
  getStats() {
    const now = Date.now()
    let activeCount = 0
    let blockedCount = 0

    for (const entry of this.limits.values()) {
      if (now <= entry.resetTime) {
        activeCount++
        if (entry.blocked) {
          blockedCount++
        }
      }
    }

    return {
      totalEntries: this.limits.size,
      activeEntries: activeCount,
      blockedEntries: blockedCount,
    }
  }

  // Limpar todas as entradas
  clear(): void {
    this.limits.clear()
  }

  // Destruir o rate limiter
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.limits.clear()
  }
}

// Instância global do rate limiter
export const rateLimiter = new RateLimiter()

// Middleware para rate limiting
export function withRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  return (req: any) => {
    const result = rateLimiter.checkLimit(identifier, maxRequests, windowMs)

    if (!result.allowed) {
      throw new Error('Rate limit exceeded')
    }

    return result
  }
}

// Função para obter identificador único da requisição
export function getRequestIdentifier(req: any): string {
  // Tentar obter IP do cliente
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.connection?.remoteAddress || 'unknown'

  // Tentar obter user ID se autenticado
  const userId = req.user?.id || 'anonymous'

  return `${ip}:${userId}`
}

// Configurações de rate limiting por endpoint
export const RATE_LIMITS = {
  // APIs públicas
  public: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },

  // APIs autenticadas
  authenticated: {
    maxRequests: 1000,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },

  // APIs de admin
  admin: {
    maxRequests: 2000,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },

  // Real-time updates
  realtime: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuto
  },

  // Upload de arquivos
  upload: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
} as const










