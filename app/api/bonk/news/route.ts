import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/bonk/news
 * Returns mock BONK news since CoinGecko doesn't have a news API
 * This prevents the 500 error from breaking the ecosystem page
 */

export async function GET(request: NextRequest) {
  try {
    // Get limit parameter from query string (default 10)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 50.' },
        { status: 400 }
      )
    }

    // Mock news data since CoinGecko doesn't have news
    const mockNews = [
      {
        id: 'bonk-news-1',
        title: 'BONK Reaches New Milestone as Solana Ecosystem Thrives',
        content: 'BONK continues to show strong performance within the Solana ecosystem...',
        summary: 'BONK continues to show strong performance within the Solana ecosystem...',
        url: 'https://example.com/bonk-news-1',
        source: 'BonkHub Analytics',
        publishedAt: new Date().toISOString(),
        sentiment: 'positive',
        relevanceScore: 0.9,
        category: 'Market Update'
      },
      {
        id: 'bonk-news-2',
        title: 'Major Developments in BONK Community and Development',
        content: 'The BONK community continues to grow with new initiatives...',
        summary: 'The BONK community continues to grow with new initiatives...',
        url: 'https://example.com/bonk-news-2',
        source: 'BonkHub Analytics',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        sentiment: 'positive',
        relevanceScore: 0.8,
        category: 'Community'
      },
      {
        id: 'bonk-news-3',
        title: 'BONK Trading Volume Surges as Market Sentiment Improves',
        content: 'Trading activity for BONK has increased significantly...',
        summary: 'Trading activity for BONK has increased significantly...',
        url: 'https://example.com/bonk-news-3',
        source: 'BonkHub Analytics',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        sentiment: 'positive',
        relevanceScore: 0.7,
        category: 'Trading'
      }
    ]
    
    // Limit the number of news items
    const limitedNews = mockNews.slice(0, limit)
    
    // Transform data to match the expected format
    const transformedNews = {
      articles: limitedNews,
      metadata: {
        totalArticles: limitedNews.length,
        lastUpdated: new Date().toISOString(),
        source: 'BonkHub Mock Data',
        updateFrequency: 'Every hour'
      }
    }

    // Set cache headers for hourly updates
    const response = NextResponse.json(transformedNews)
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800')
    response.headers.set('X-Data-Source', 'BonkHub Mock Data')
    response.headers.set('X-Update-Frequency', 'Hourly')
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
