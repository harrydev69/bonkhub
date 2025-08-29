/**
 * Client-side cache management hook
 * Provides functions to interact with the server-side cache
 */

import { useState, useCallback } from 'react'

export interface CacheStats {
  totalEntries: number
  totalHits: number
  totalMisses: number
  hitRate: number
  memoryUsage: number
  oldestEntry?: number
  newestEntry?: number
}

export interface CacheStatsResponse {
  success: boolean
  stats: {
    apiCache: CacheStats
    shortTermCache: CacheStats
    longTermCache: CacheStats
    timestamp: string
  }
  totalMemory: number
  totalEntries: number
  averageHitRate: number
}

export interface CacheInvalidationResponse {
  success: boolean
  message: string
  entriesRemoved: number
  details?: any
}

export const useCache = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCacheStats = useCallback(async (): Promise<CacheStatsResponse | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache?action=stats')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cache stats'
      setError(errorMessage)
      console.error('Cache stats error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getCacheKeys = useCallback(async (pattern?: string): Promise<string[] | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const url = pattern ? `/api/cache?action=keys&pattern=${encodeURIComponent(pattern)}` : '/api/cache?action=keys'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return [...data.keys.apiCache, ...data.keys.shortTermCache, ...data.keys.longTermCache]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cache keys'
      setError(errorMessage)
      console.error('Cache keys error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCache = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache?action=clear', {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: CacheInvalidationResponse = await response.json()
      return data.success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache'
      setError(errorMessage)
      console.error('Clear cache error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const invalidateByPattern = useCallback(async (pattern: string): Promise<number | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/cache?action=pattern&pattern=${encodeURIComponent(pattern)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: CacheInvalidationResponse = await response.json()
      return data.entriesRemoved
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invalidate cache by pattern'
      setError(errorMessage)
      console.error('Cache invalidation error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const invalidateByTimeRange = useCallback(async (timeRange: string): Promise<number | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/cache?action=timerange&timeRange=${timeRange}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: CacheInvalidationResponse = await response.json()
      return data.entriesRemoved
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invalidate cache by time range'
      setError(errorMessage)
      console.error('Cache invalidation error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const invalidateByCoin = useCallback(async (coinId: string): Promise<number | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/cache?action=coin&coinId=${coinId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: CacheInvalidationResponse = await response.json()
      return data.entriesRemoved
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invalidate cache by coin'
      setError(errorMessage)
      console.error('Cache invalidation error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const cleanupExpiredEntries = useCallback(async (): Promise<number | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache?action=cleanup')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: CacheInvalidationResponse = await response.json()
      return data.entriesRemoved
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup cache'
      setError(errorMessage)
      console.error('Cache cleanup error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const formatMemoryUsage = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const formatHitRate = useCallback((rate: number): string => {
    return `${rate.toFixed(1)}%`
  }, [])

  return {
    loading,
    error,
    getCacheStats,
    getCacheKeys,
    clearCache,
    invalidateByPattern,
    invalidateByTimeRange,
    invalidateByCoin,
    cleanupExpiredEntries,
    formatMemoryUsage,
    formatHitRate
  }
}
