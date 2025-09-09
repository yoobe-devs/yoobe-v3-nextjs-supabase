// Sistema de cache em memória para otimizar performance
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 1000 // Máximo de itens no cache
  private defaultTTL = 5 * 60 * 1000 // 5 minutos por padrão

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Limpar cache se estiver cheio
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Limpar itens expirados
  cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    // Se ainda estiver cheio, remover os mais antigos
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)) // Remover 20%
      toRemove.forEach(([key]) => this.cache.delete(key))
    }

    console.log(`Cache cleanup: ${cleanedCount} itens removidos`)
  }

  // Estatísticas do cache
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let totalSize = 0

    for (const item of this.cache.values()) {
      totalSize += JSON.stringify(item.data).length
      if (now - item.timestamp > item.ttl) {
        expiredCount++
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
      totalSize,
      hitRate: this.calculateHitRate(),
    }
  }

  private hitCount = 0
  private missCount = 0

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? (this.hitCount / total) * 100 : 0
  }

  // Wrapper para métodos get/set com estatísticas
  getWithStats<T>(key: string): T | null {
    const result = this.get<T>(key)
    if (result !== null) {
      this.hitCount++
    } else {
      this.missCount++
    }
    return result
  }
}

// Instância global do cache
export const cache = new MemoryCache()

// Funções utilitárias para cache
export function createCacheKey(
  prefix: string,
  ...parts: (string | number)[]
): string {
  return `${prefix}:${parts.join(':')}`
}

export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Verificar cache primeiro
  const cached = cache.getWithStats<T>(key)
  if (cached !== null) {
    return Promise.resolve(cached)
  }

  // Buscar dados e armazenar no cache
  return fetcher().then(data => {
    cache.set(key, data, ttl)
    return data
  })
}

// Limpeza automática do cache a cada 10 minutos
setInterval(
  () => {
    cache.cleanup()
  },
  10 * 60 * 1000
)

// Log de estatísticas a cada 5 minutos
setInterval(
  () => {
    const stats = cache.getStats()
    if (stats.size > 0) {
      console.log('Cache stats:', stats)
    }
  },
  5 * 60 * 1000
)










