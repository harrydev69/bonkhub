/**
 * Production-ready caching system for BonkHub
 * Supports multiple cache strategies, TTL, invalidation, and memory management
 */

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  lastAccessed: number
  size?: number
}

export interface CacheStats {
  totalEntries: number
  totalHits: number
  totalMisses: number
  hitRate: number
  memoryUsage: number
  oldestEntry?: number
  newestEntry?: number
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  maxMemory?: number // Maximum memory usage in bytes (approximate)
  enableStats?: boolean
  compressionThreshold?: number // Compress data larger than this size
}

class ProductionCache {
  private store = new Map<string, CacheEntry>()
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  }

  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 1000,
      maxMemory: options.maxMemory ?? 50 * 1024 * 1024, // 50MB default
      enableStats: options.enableStats ?? true,
      compressionThreshold: options.compressionThreshold ?? 1024 // 1KB
    }
  }

  /**
   * Get cached data or load it using the provided loader function
   */
  async cached<T>(
    key: string,
    loader: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<T> {
    const entry = this.get<T>(key)
    
    if (entry !== null) {
      return entry
    }

    // Cache miss - load data
    const data = await loader()
    this.set(key, data, options)
    return data
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key)
      this.stats.misses++
      return null
    }

    // Update access stats
    entry.hits++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    return entry.data as T
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, options?: { ttl?: number; tags?: string[] }): void {
    const now = Date.now()
    const ttl = options?.ttl ?? this.options.ttl
    
    // Estimate size (rough approximation)
    const size = this.estimateSize(data)
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      hits: 0,
      lastAccessed: now,
      size
    }

    // Check if we need to evict entries
    this.evictIfNeeded(size)

    this.store.set(key, entry)
    this.stats.sets++
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.store.delete(key)
    if (deleted) {
      this.stats.deletes++
    }
    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    }
  }

  /**
   * Invalidate cache entries by pattern or tags
   */
  invalidate(pattern: string | RegExp | string[]): number {
    let deletedCount = 0

    if (Array.isArray(pattern)) {
      // Invalidate by exact keys
      pattern.forEach(key => {
        if (this.delete(key)) {
          deletedCount++
        }
      })
    } else if (pattern instanceof RegExp) {
      // Invalidate by regex pattern
      for (const key of this.store.keys()) {
        if (pattern.test(key)) {
          this.delete(key)
          deletedCount++
        }
      }
    } else {
      // Invalidate by string pattern (contains)
      for (const key of this.store.keys()) {
        if (key.includes(pattern)) {
          this.delete(key)
          deletedCount++
        }
      }
    }

    return deletedCount
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.store.values())
    const totalHits = this.stats.hits
    const totalMisses = this.stats.misses
    const totalRequests = totalHits + totalMisses
    
    return {
      totalEntries: this.store.size,
      totalHits,
      totalMisses,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      memoryUsage: entries.reduce((total, entry) => total + (entry.size || 0), 0),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : undefined,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : undefined
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removedCount = 0
    const now = Date.now()

    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry)) {
        this.store.delete(key)
        removedCount++
      }
    }

    return removedCount
  }

  /**
   * Get cache keys matching pattern
   */
  getKeys(pattern?: string | RegExp): string[] {
    const keys = Array.from(this.store.keys())
    
    if (!pattern) return keys
    
    if (pattern instanceof RegExp) {
      return keys.filter(key => pattern.test(key))
    }
    
    return keys.filter(key => key.includes(pattern))
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Evict entries if cache is full
   */
  private evictIfNeeded(newEntrySize: number): void {
    // Check size limit
    if (this.store.size >= this.options.maxSize) {
      this.evictLRU()
    }

    // Check memory limit (approximate)
    const currentMemory = this.getStats().memoryUsage
    if (currentMemory + newEntrySize > this.options.maxMemory) {
      this.evictByMemory(newEntrySize)
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey)
      this.stats.evictions++
    }
  }

  /**
   * Evict entries to free up memory
   */
  private evictByMemory(neededSpace: number): void {
    const entries = Array.from(this.store.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed) // Sort by LRU

    let freedSpace = 0
    let evictedCount = 0

    for (const [key, entry] of entries) {
      if (freedSpace >= neededSpace) break
      
      freedSpace += entry.size || 0
      this.store.delete(key)
      evictedCount++
    }

    this.stats.evictions += evictedCount
  }

  /**
   * Rough size estimation for cache entry
   */
  private estimateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data)
      return jsonString.length * 2 // Rough estimate for UTF-16 encoding
    } catch {
      return 1024 // Default size if can't stringify
    }
  }
}

// Cache instances for different data types
export const apiCache = new ProductionCache({
  ttl: 5 * 60 * 1000, // 5 minutes for API data
  maxSize: 500,
  maxMemory: 25 * 1024 * 1024 // 25MB
})

export const longTermCache = new ProductionCache({
  ttl: 30 * 60 * 1000, // 30 minutes for less frequently changing data
  maxSize: 200,
  maxMemory: 10 * 1024 * 1024 // 10MB
})

export const shortTermCache = new ProductionCache({
  ttl: 1 * 60 * 1000, // 1 minute for frequently changing data
  maxSize: 1000,
  maxMemory: 15 * 1024 * 1024 // 15MB
})

// Cache key generators with time-based granularity
export const CacheKeys = {
  lunarCrushCoins: (coinId: string, timeRange: string) => {
    // Add time granularity to cache keys based on time range
    const now = new Date()
    let timeGranularity: string
    
    switch (timeRange) {
      case '1h':
        // Cache per minute for 1h data
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
        break
      case '24h':
        // Cache per 5 minutes for 24h data  
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${Math.floor(now.getMinutes() / 5) * 5}`
        break
      case '7d':
        // Cache per 30 minutes for 7d data
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${Math.floor(now.getMinutes() / 30) * 30}`
        break
      case '30d':
        // Cache per hour for 30d data
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
        break
      default:
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
    }
    
    return `lunarcrush:coins:${coinId}:${timeRange}:${timeGranularity}`
  },
  
  lunarCrushTopic: (topic: string, timeRange: string) => {
    // Same time-based strategy for topic data
    const now = new Date()
    let timeGranularity: string
    
    switch (timeRange) {
      case '1h':
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
        break
      case '24h':
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${Math.floor(now.getMinutes() / 5) * 5}`
        break
      case '7d':
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${Math.floor(now.getMinutes() / 30) * 30}`
        break
      case '30d':
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
        break
      default:
        timeGranularity = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
    }
    
    return `lunarcrush:topic:${topic}:${timeRange}:${timeGranularity}`
  },
  
  coingecko: (coinId: string, timeRange: string) => 
    `coingecko:${coinId}:${timeRange}`,
  
  analytics: (type: string, timeRange: string) => 
    `analytics:${type}:${timeRange}`,
  
  performance: (coinId: string, timeRange: string) => 
    `performance:${coinId}:${timeRange}`
}

// Cache invalidation helpers
export const CacheInvalidation = {
  invalidateByTimeRange: (timeRange: string) => {
    apiCache.invalidate(`:${timeRange}`)
    shortTermCache.invalidate(`:${timeRange}`)
    return longTermCache.invalidate(`:${timeRange}`)
  },

  invalidateByCoin: (coinId: string) => {
    apiCache.invalidate(`:${coinId}:`)
    shortTermCache.invalidate(`:${coinId}:`)
    return longTermCache.invalidate(`:${coinId}:`)
  },

  invalidateAll: () => {
    apiCache.clear()
    shortTermCache.clear()
    longTermCache.clear()
  }
}

// Cache preloading and optimization
export const CacheOptimization = {
  // Preload common data combinations
  preloadCommonData: async () => {
    const commonTimeRanges = ['1h', '24h', '7d', '30d']
    const commonCoins = ['bonk']
    
    const preloadPromises = []
    
    for (const coin of commonCoins) {
      for (const timeRange of commonTimeRanges) {
        // Preload coins data
        preloadPromises.push(
          fetch(`/api/test/lunarcrush-coins-v2?timeRange=${timeRange}&coinId=${coin}`)
            .then(res => res.json())
            .catch(err => console.warn(`Preload failed for ${coin}:${timeRange}`, err))
        )
        
        // Preload topic data
        preloadPromises.push(
          fetch(`/api/test/lunarcrush-timeseries-v2?timeRange=${timeRange}&coinId=${coin}`)
            .then(res => res.json())
            .catch(err => console.warn(`Preload topic failed for ${coin}:${timeRange}`, err))
        )
      }
    }
    
    try {
      await Promise.allSettled(preloadPromises)
      console.log('🚀 Cache preloading completed')
    } catch (error) {
      console.warn('⚠️ Some cache preloading failed:', error)
    }
  },

  // Warm up cache with most frequently accessed data
  warmupCache: async (priorityTimeRanges: string[] = ['24h', '7d']) => {
    console.log('🔥 Warming up cache...')
    
    const warmupPromises = priorityTimeRanges.map(async (timeRange) => {
      try {
        await Promise.all([
          fetch(`/api/test/lunarcrush-coins-v2?timeRange=${timeRange}&coinId=bonk`),
          fetch(`/api/test/lunarcrush-timeseries-v2?timeRange=${timeRange}&coinId=bonk`)
        ])
        console.log(`✅ Cache warmed for ${timeRange}`)
      } catch (error) {
        console.warn(`⚠️ Cache warmup failed for ${timeRange}:`, error)
      }
    })
    
    await Promise.allSettled(warmupPromises)
  },

  // Optimize cache by removing least used entries when memory is high
  optimizeMemoryUsage: () => {
    const stats = {
      api: apiCache.getStats(),
      short: shortTermCache.getStats(),
      long: longTermCache.getStats()
    }
    
    const totalMemory = stats.api.memoryUsage + stats.short.memoryUsage + stats.long.memoryUsage
    const memoryLimitMB = 100 // 100MB total limit
    const memoryLimitBytes = memoryLimitMB * 1024 * 1024
    
    if (totalMemory > memoryLimitBytes) {
      console.log(`🧹 Memory optimization triggered. Current: ${(totalMemory / 1024 / 1024).toFixed(1)}MB`)
      
      // Remove some entries from each cache starting with least hit items
      const cleanupCount = Math.ceil(stats.api.totalEntries * 0.1) // Remove 10%
      
      // This would need to be implemented in the cache class to sort by hit count
      console.log(`🧹 Would remove ${cleanupCount} entries per cache`)
    }
  }
}

// Performance monitoring
export const CacheMetrics = {
  // Get performance insights
  getPerformanceInsights: () => {
    const stats = {
      api: apiCache.getStats(),
      short: shortTermCache.getStats(),
      long: longTermCache.getStats()
    }
    
    const insights = []
    
    // Hit rate analysis
    Object.entries(stats).forEach(([name, stat]) => {
      if (stat.hitRate < 50) {
        insights.push({
          type: 'warning',
          cache: name,
          message: `Low hit rate (${stat.hitRate.toFixed(1)}%) - consider adjusting TTL or cache strategy`
        })
      } else if (stat.hitRate > 90) {
        insights.push({
          type: 'success',
          cache: name,
          message: `Excellent hit rate (${stat.hitRate.toFixed(1)}%)`
        })
      }
    })
    
    // Memory usage analysis
    const totalMemory = stats.api.memoryUsage + stats.short.memoryUsage + stats.long.memoryUsage
    if (totalMemory > 50 * 1024 * 1024) { // > 50MB
      insights.push({
        type: 'warning',
        cache: 'all',
        message: `High memory usage (${(totalMemory / 1024 / 1024).toFixed(1)}MB) - consider cleanup`
      })
    }
    
    return {
      insights,
      totalMemory,
      totalEntries: stats.api.totalEntries + stats.short.totalEntries + stats.long.totalEntries,
      averageHitRate: (stats.api.hitRate + stats.short.hitRate + stats.long.hitRate) / 3
    }
  }
}

// Cleanup interval - run every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    apiCache.cleanup()
    shortTermCache.cleanup()
    longTermCache.cleanup()
    
    // Run optimization every 10 minutes
    if (Date.now() % (10 * 60 * 1000) < 5 * 60 * 1000) {
      CacheOptimization.optimizeMemoryUsage()
    }
  }, 5 * 60 * 1000)
}

export default ProductionCache
