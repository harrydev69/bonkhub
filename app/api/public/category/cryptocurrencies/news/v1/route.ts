import { NextRequest, NextResponse } from 'next/server'
import { getTopicNews } from '@/lib/lunarcrush'

/**
 * GET /api/public/category/cryptocurrencies/news/v1
 * Returns general cryptocurrency news as fallback content
 * Uses a broad topic like 'cryptocurrency' or 'bitcoin' to get general crypto news
 */

export async function GET(request: NextRequest) {
  try {
    // Get limit parameter from query string (default 25)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      )
    }

    // Fetch general crypto news using broad topics
    console.log('🔍 Fetching general crypto news from LunarCrush')
    
    // Try multiple general crypto topics for better coverage
    const topics = ['cryptocurrency', 'bitcoin', 'ethereum', 'crypto']
    let allNews: any[] = []
    
    for (const topic of topics) {
      try {
        console.log(`📰 Fetching news for topic: ${topic}`)
        const newsData = await getTopicNews(topic)
        
        if (newsData && newsData.data && Array.isArray(newsData.data)) {
          allNews.push(...newsData.data)
        }
      } catch (topicError) {
        console.warn(`⚠️ Failed to fetch news for topic ${topic}:`, topicError)
        // Continue with other topics
      }
    }

    if (allNews.length === 0) {
      console.error('❌ No general crypto news found from any topic')
      return NextResponse.json({
        data: {
          data: []
        },
        metadata: {
          totalArticles: 0,
          source: 'LunarCrush API - General Crypto',
          message: 'No general cryptocurrency news available at this time'
        }
      })
    }

    // Remove duplicates based on ID and sort by creation time
    const uniqueArticles = allNews
      .filter((article: any, index: number, self: any[]) => 
        index === self.findIndex((a: any) => a.id === article.id)
      )
      .sort((a: any, b: any) => b.post_created - a.post_created) // Most recent first
      .slice(0, limit)
    
    console.log(`🔄 Processed ${allNews.length} total articles, ${uniqueArticles.length} unique articles`)

    // Transform to match expected format (same as token-specific news)
    const transformedNews = uniqueArticles.map((article: any) => ({
      id: article.id,
      post_type: article.post_type || 'news',
      post_title: article.post_title,
      post_link: article.post_link,
      post_image: article.post_image,
      post_created: article.post_created,
      post_sentiment: article.post_sentiment || 0,
      creator_id: article.creator_id,
      creator_name: article.creator_name,
      creator_display_name: article.creator_display_name || article.creator_name,
      creator_followers: article.creator_followers || 0,
      creator_avatar: article.creator_avatar,
      interactions_24h: article.interactions_24h || 0,
      interactions_total: article.interactions_total || 0,
    }))

    console.log('✅ Successfully transformed general crypto news')

    const response = NextResponse.json({
      data: {
        data: transformedNews
      },
      metadata: {
        totalArticles: uniqueArticles.length,
        source: 'LunarCrush API - General Crypto',
        topics: topics,
        lastUpdated: new Date().toISOString(),
        type: 'fallback_news'
      }
    })

    // Set cache headers for 30 minutes (shorter than token-specific news)
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=900')
    response.headers.set('X-Data-Source', 'LunarCrush API - General Crypto')
    response.headers.set('X-News-Type', 'fallback')

    return response

  } catch (error) {
    console.error('❌ Error in /api/public/category/cryptocurrencies/news/v1:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch general cryptocurrency news',
      details: error instanceof Error ? error.message : 'Unknown error',
      data: {
        data: []
      }
    }, { status: 500 })
  }
}
