import { NextRequest, NextResponse } from 'next/server'
import { apiCache, shortTermCache, longTermCache, CacheInvalidation } from '@/lib/cache'

/**
 * Cache management API endpoint
 * GET: Get cache statistics
 * DELETE: Clear cache or invalidate specific patterns
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'
    const pattern = searchParams.get('pattern')

    switch (action) {
      case 'stats':
        const stats = {
          apiCache: apiCache.getStats(),
          shortTermCache: shortTermCache.getStats(),
          longTermCache: longTermCache.getStats(),
          timestamp: new Date().toISOString()
        }

        return NextResponse.json({
          success: true,
          stats,
          totalMemory: stats.apiCache.memoryUsage + stats.shortTermCache.memoryUsage + stats.longTermCache.memoryUsage,
          totalEntries: stats.apiCache.totalEntries + stats.shortTermCache.totalEntries + stats.longTermCache.totalEntries,
          averageHitRate: (stats.apiCache.hitRate + stats.shortTermCache.hitRate + stats.longTermCache.hitRate) / 3
        })

      case 'keys':
        const keys = {
          apiCache: apiCache.getKeys(pattern || undefined),
          shortTermCache: shortTermCache.getKeys(pattern || undefined),
          longTermCache: longTermCache.getKeys(pattern || undefined)
        }

        return NextResponse.json({
          success: true,
          keys,
          totalKeys: keys.apiCache.length + keys.shortTermCache.length + keys.longTermCache.length
        })

      case 'cleanup':
        const cleaned = {
          apiCache: apiCache.cleanup(),
          shortTermCache: shortTermCache.cleanup(),
          longTermCache: longTermCache.cleanup()
        }

        return NextResponse.json({
          success: true,
          message: 'Cache cleanup completed',
          entriesRemoved: cleaned.apiCache + cleaned.shortTermCache + cleaned.longTermCache,
          details: cleaned
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, keys, or cleanup' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Cache API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cache API error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'clear'
    const pattern = searchParams.get('pattern')
    const timeRange = searchParams.get('timeRange')
    const coinId = searchParams.get('coinId')

    let result = { success: true, message: '', entriesRemoved: 0 }

    switch (action) {
      case 'clear':
        // Clear all caches
        CacheInvalidation.invalidateAll()
        result.message = 'All caches cleared'
        result.entriesRemoved = -1 // Indicate complete clear
        break

      case 'pattern':
        if (!pattern) {
          return NextResponse.json(
            { error: 'Pattern parameter required for pattern invalidation' },
            { status: 400 }
          )
        }
        
        const patternRemoved = 
          apiCache.invalidate(pattern) +
          shortTermCache.invalidate(pattern) +
          longTermCache.invalidate(pattern)
        
        result.message = `Invalidated entries matching pattern: ${pattern}`
        result.entriesRemoved = patternRemoved
        break

      case 'timerange':
        if (!timeRange) {
          return NextResponse.json(
            { error: 'timeRange parameter required for timerange invalidation' },
            { status: 400 }
          )
        }
        
        const timeRangeRemoved = CacheInvalidation.invalidateByTimeRange(timeRange)
        result.message = `Invalidated entries for time range: ${timeRange}`
        result.entriesRemoved = timeRangeRemoved
        break

      case 'coin':
        if (!coinId) {
          return NextResponse.json(
            { error: 'coinId parameter required for coin invalidation' },
            { status: 400 }
          )
        }
        
        const coinRemoved = CacheInvalidation.invalidateByCoin(coinId)
        result.message = `Invalidated entries for coin: ${coinId}`
        result.entriesRemoved = coinRemoved
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: clear, pattern, timerange, or coin' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Cache DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cache DELETE error' },
      { status: 500 }
    )
  }
}
