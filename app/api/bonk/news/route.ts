import { NextRequest, NextResponse } from 'next/server'
import { getTopicNews } from '@/lib/lunarcrush'

/**
 * GET /api/bonk/news
 * Returns real BONK news from LunarCrush API
 * Cached for 12 hours to respect rate limits
 */

export async function GET(request: NextRequest) {
  try {
    // Get limit parameter from query string (default 20)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      )
    }

    // Fetch real news from LunarCrush
    console.log('🔍 Fetching news from LunarCrush for topic: solana')
    const newsData = await getTopicNews('solana')
    console.log('📰 LunarCrush API response:', JSON.stringify(newsData, null, 2))
    
    if (!newsData || !newsData.data || !Array.isArray(newsData.data)) {
      console.error('❌ Invalid news data structure from LunarCrush:', newsData)
      throw new Error('Invalid news data structure from LunarCrush')
    }

    // Remove duplicate articles based on ID
    const uniqueArticles = newsData.data.filter((article: any, index: number, self: any[]) => 
      index === self.findIndex((a: any) => a.id === article.id)
    )
    
    console.log(`🔄 Removed ${newsData.data.length - uniqueArticles.length} duplicate articles`)
    console.log(`📰 Unique articles remaining: ${uniqueArticles.length}`)

    // Transform LunarCrush data to match our expected format
    const transformedNews = uniqueArticles.slice(0, limit).map((article: any) => ({
      id: article.id,
      title: article.post_title,
      summary: article.post_title, // Use title as summary since LunarCrush doesn't provide separate summary
      link: article.post_link,
      source: article.creator_display_name || article.creator_name,
      published: new Date(article.post_created * 1000).toISOString(),
      relativeTime: getRelativeTime(article.post_created * 1000),
      readingTime: '3 min read', // Estimated reading time
      category: getCategoryFromTitle(article.post_title),
      subCategory: getSubCategoryFromTitle(article.post_title),
      sentiment: {
        label: getSentimentLabel(article.post_sentiment),
        score: article.post_sentiment / 5 // Normalize to 0-1 scale
      },
      sourceCount: 1, // Each article is from one source
      image: article.post_image,
      interactions24h: article.interactions_24h,
      creatorFollowers: article.creator_followers
    }))

    console.log('🔄 Transformed news data:', JSON.stringify(transformedNews, null, 2))

    // Calculate real statistics
    const totalArticles = uniqueArticles.length
    const todayArticles = uniqueArticles.filter((article: any) => {
      const articleDate = new Date(article.post_created * 1000)
      const today = new Date()
      return articleDate.toDateString() === today.toDateString()
    }).length
    const positiveNews = uniqueArticles.filter((article: any) => article.post_sentiment >= 3).length
    const trendingTopics = getTrendingTopics(newsData.data)

    const response = NextResponse.json({
      articles: transformedNews,
      metadata: {
        totalArticles,
        todayArticles,
        positiveNews,
        trendingTopics: trendingTopics.length,
        lastUpdated: new Date().toISOString(),
        source: 'LunarCrush API',
        updateFrequency: 'Every 12 hours'
      }
    })

    // Set cache headers for 12 hours
    response.headers.set('Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=21600')
    response.headers.set('X-Data-Source', 'LunarCrush API')
    response.headers.set('X-Update-Frequency', 'Every 12 hours')
    response.headers.set('X-Last-Updated', new Date().toISOString())

    return response

  } catch (error) {
    console.error('Error in /api/bonk/news:', error)
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch BONK news',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function getSentimentLabel(sentiment: number): 'positive' | 'negative' | 'neutral' {
  if (sentiment >= 3) return 'positive'
  if (sentiment <= 2) return 'negative'
  return 'neutral'
}

function getCategoryFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('price') || lowerTitle.includes('market') || lowerTitle.includes('trading')) return 'Market Update'
  if (lowerTitle.includes('partnership') || lowerTitle.includes('integration')) return 'Partnerships'
  if (lowerTitle.includes('development') || lowerTitle.includes('update') || lowerTitle.includes('launch')) return 'Development'
  if (lowerTitle.includes('community') || lowerTitle.includes('dao') || lowerTitle.includes('governance')) return 'Community'
  if (lowerTitle.includes('ecosystem') || lowerTitle.includes('defi') || lowerTitle.includes('nft')) return 'Ecosystem'
  return 'General'
}

function getSubCategoryFromTitle(title: string): string | undefined {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('etf')) return 'ETF'
  if (lowerTitle.includes('defi')) return 'DeFi'
  if (lowerTitle.includes('nft')) return 'NFT'
  if (lowerTitle.includes('meme')) return 'Meme Coin'
  if (lowerTitle.includes('treasury')) return 'Treasury'
  return undefined
}

function getTrendingTopics(articles: any[]): any[] {
  // Extract common topics from article titles
  const topicCounts: { [key: string]: number } = {}
  
  articles.forEach(article => {
    const words = article.post_title.toLowerCase().split(' ')
    words.forEach((word: string) => {
      if (word.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will', 'been', 'bonk', 'solana'].includes(word)) {
        topicCounts[word] = (topicCounts[word] || 0) + 1
      }
    })
  })

  // Return top 5 trending topics
  return Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({
      topic: topic.charAt(0).toUpperCase() + topic.slice(1),
      mentions: count,
      sentiment: 'neutral' // Default sentiment for topics
    }))
}

/**
 * OPTIONS method for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
