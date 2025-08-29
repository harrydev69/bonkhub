import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/search/suggestions?q=search_term
 * Returns search suggestions from CoinGecko API
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    // Validate query parameter
    if (!query || query.trim().length < 1) {
      return NextResponse.json({
        coins: [],
        categories: [],
        exchanges: []
      })
    }

    // Don't search for very short queries (less than 2 characters)
    if (query.trim().length < 2) {
      return NextResponse.json({
        coins: [],
        categories: [],
        exchanges: []
      })
    }

    if (!process.env.COINGECKO_API_KEY) {
      return NextResponse.json(
        { error: 'CoinGecko API key not configured' },
        { status: 500 }
      )
    }

    const headers = {
      'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
    }

    // Call CoinGecko search API
    const searchUrl = `https://pro-api.coingecko.com/api/v3/search?query=${encodeURIComponent(query.trim())}`
    const response = await fetch(searchUrl, { headers })

    if (!response.ok) {
      console.error(`CoinGecko search API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Search service temporarily unavailable' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform the response to include only what we need
    const suggestions = {
      coins: (data.coins || []).slice(0, 8).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol?.toUpperCase() || '',
        thumb: coin.thumb || coin.large || coin.small || '',
        market_cap_rank: coin.market_cap_rank || null
      })),
      categories: (data.categories || []).slice(0, 3).map((category: any) => ({
        id: category.id,
        name: category.name
      })),
      exchanges: (data.exchanges || []).slice(0, 3).map((exchange: any) => ({
        id: exchange.id,
        name: exchange.name,
        thumb: exchange.thumb || exchange.large || exchange.small || ''
      }))
    }

    console.log(`🔍 Search suggestions for "${query}": ${suggestions.coins.length} coins, ${suggestions.categories.length} categories, ${suggestions.exchanges.length} exchanges`)

    const apiResponse = NextResponse.json(suggestions)
    
    // Set cache headers for 5 minutes
    apiResponse.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=150')
    apiResponse.headers.set('X-Data-Source', 'CoinGecko Search API')

    return apiResponse

  } catch (error) {
    console.error('Error in /api/search/suggestions:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch search suggestions',
      coins: [],
      categories: [],
      exchanges: []
    }, { status: 500 })
  }
}
