import { NextResponse } from 'next/server'
import { getTopicData } from '@/lib/lunarcrush'

/**
 * GET /api/analytics/bonk/topic
 * Returns BONK topic data from LunarCrush API
 * Cached for 30 minutes to respect rate limits
 */

export async function GET() {
  try {
    console.log('🔍 Fetching BONK topic data from LunarCrush')
    const topicData = await getTopicData('bonk')
    
    if (!topicData || !topicData.data) {
      throw new Error('Invalid topic data structure from LunarCrush')
    }

    console.log('✅ BONK topic data fetched successfully')
    
    const response = NextResponse.json(topicData)
    
    // Set cache headers for 30 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=900')
    response.headers.set('X-Data-Source', 'LunarCrush Topic API')
    response.headers.set('X-Update-Frequency', 'Every 30 minutes')
    response.headers.set('X-Last-Updated', new Date().toISOString())
    
    return response

  } catch (error) {
    console.error('Error in /api/analytics/bonk/topic:', error)
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch topic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
