import { NextRequest, NextResponse } from 'next/server'
import { apiCache, CacheKeys } from '@/lib/cache'

const LUNARCRUSH_API_KEY = process.env.LUNARCRUSH_API_KEY

const timeRanges = {
  "1h": { bucket: "hour", description: "Last Hour" },
  "24h": { bucket: "hour", description: "Last 24 Hours" },
  "7d": { bucket: "day", description: "Last 7 Days" },
  "30d": { bucket: "day", description: "Last 30 Days" }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const coinId = searchParams.get('coinId') || 'bonk' // Default to BONK

    if (!LUNARCRUSH_API_KEY) {
      return NextResponse.json({ error: 'LunarCrush API key not configured' }, { status: 500 })
    }

    const selectedRange = timeRanges[timeRange as keyof typeof timeRanges]
    if (!selectedRange) {
      return NextResponse.json({ error: 'Invalid time range' }, { status: 400 })
    }

    // Generate cache key
    const cacheKey = CacheKeys.lunarCrushCoins(coinId, timeRange)
    
    // Get TTL based on time range (more responsive caching)
    const getTTL = (range: string) => {
      switch (range) {
        case '1h': return 1 * 60 * 1000 // 1 minute - very fresh data needed
        case '24h': return 2 * 60 * 1000 // 2 minutes - still quite fresh  
        case '7d': return 5 * 60 * 1000 // 5 minutes - moderate freshness
        case '30d': return 10 * 60 * 1000 // 10 minutes - longer term data can be cached longer
        default: return 2 * 60 * 1000
      }
    }

    // Use cache with loader function
    const result = await apiCache.cached(
      cacheKey,
      async () => {
        // Calculate start and end timestamps based on time range
        const now = Math.floor(Date.now() / 1000)
        let start: number
        let end: number

        switch (timeRange) {
          case "1h":
            start = now - 3600 // 1 hour ago
            end = now
            break
          case "24h":
            start = now - 86400 // 24 hours ago
            end = now
            break
          case "7d":
            start = now - 604800 // 7 days ago
            end = now
            break
          case "30d":
            start = now - 2592000 // 30 days ago
            end = now
            break
          default:
            start = now - 86400
            end = now
        }

        console.log(`🔍 [CACHE MISS] Fetching coins data for ${coinId}`)
        console.log(`🔍 Time Range: ${timeRange}`)
        console.log(`🔍 Bucket: ${selectedRange.bucket}`)
        console.log(`🔍 Start: ${new Date(start * 1000).toISOString()}`)
        console.log(`🔍 End: ${new Date(end * 1000).toISOString()}`)

        const url = `https://lunarcrush.com/api4/public/coins/${coinId}/time-series/v2?bucket=${selectedRange.bucket}&start=${start}&end=${end}`

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${LUNARCRUSH_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`LunarCrush API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        console.log(`🔍 Received ${data.data?.length || 0} data points`)
        console.log(`🔍 Sample data point:`, data.data?.[0])

        return {
          success: true,
          timeRange,
          bucket: selectedRange.bucket,
          start,
          end,
          data: data,
          cached: false,
          timestamp: new Date().toISOString()
        }
      },
      { ttl: getTTL(timeRange) }
    )

    // Add cache hit indicator
    const response = {
      ...result,
      cached: result.cached !== false, // If cached field doesn't exist, it was a cache hit
      timestamp: result.timestamp || new Date().toISOString()
    }

    if (response.cached) {
      console.log(`💾 [CACHE HIT] Served ${coinId}:${timeRange} from cache`)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error fetching LunarCrush coins data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
