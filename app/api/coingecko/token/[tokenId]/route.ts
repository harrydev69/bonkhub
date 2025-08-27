import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params
    const lowerTokenId = tokenId.toLowerCase()
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '7' // Default to 7 days
    
    if (!process.env.COINGECKO_API_KEY) {
      return NextResponse.json(
        { error: 'CoinGecko API key not configured' },
        { status: 500 }
      )
    }

    const headers = {
      'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
    }

    // Fetch detailed token information with price change percentages
    const tokenResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/${lowerTokenId}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=true&asset_platform_id=ethereum&asset_platform_id=solana&asset_platform_id=binance-smart-chain`,
      { headers }
    )

    if (!tokenResponse.ok) {
      throw new Error(`CoinGecko API error: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    // Fetch market chart data for the price chart with dynamic days parameter
    const chartResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/${lowerTokenId}/market_chart?vs_currency=usd&days=${days}`,
      { headers }
    )

    if (!chartResponse.ok) {
      throw new Error(`CoinGecko chart API error: ${chartResponse.status}`)
    }

    const chartData = await chartResponse.json()

    // Also fetch the markets data to get price change percentages
    const marketsResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${lowerTokenId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d,1y&locale=en`,
      { headers }
    )

    let marketsData = null
    if (marketsResponse.ok) {
      const markets = await marketsResponse.json()
      if (markets && markets.length > 0) {
        marketsData = markets[0]
      }
    }

    // Clean up the market data to only include USD values and essential fields
    const cleanMarketData = {
      ...tokenData.market_data,
      // Use markets data for price change percentages if available, fallback to token data
      price_change_percentage_1h_in_currency: marketsData?.price_change_percentage_1h_in_currency ?? tokenData.market_data?.price_change_percentage_1h_in_currency,
      price_change_percentage_24h_in_currency: marketsData?.price_change_percentage_24h_in_currency ?? tokenData.market_data?.price_change_percentage_24h_in_currency,
      price_change_percentage_7d_in_currency: marketsData?.price_change_percentage_7d_in_currency ?? tokenData.market_data?.price_change_percentage_7d_in_currency,
      price_change_percentage_30d_in_currency: marketsData?.price_change_percentage_30d_in_currency ?? tokenData.market_data?.price_change_percentage_30d_in_currency,
      price_change_percentage_1y_in_currency: marketsData?.price_change_percentage_1y_in_currency ?? tokenData.market_data?.price_change_percentage_1y_in_currency,
      // Also include the regular price change percentages as fallbacks
      price_change_percentage_1h: marketsData?.price_change_percentage_1h ?? tokenData.market_data?.price_change_percentage_1h,
      price_change_percentage_24h: marketsData?.price_change_percentage_24h ?? tokenData.market_data?.price_change_percentage_24h,
      price_change_percentage_7d: marketsData?.price_change_percentage_7d ?? tokenData.market_data?.price_change_percentage_7d,
      price_change_percentage_30d: marketsData?.price_change_percentage_30d ?? tokenData.market_data?.price_change_percentage_30d,
      price_change_percentage_1y: marketsData?.price_change_percentage_1y ?? tokenData.market_data?.price_change_percentage_1y,
      // Clean up ATH/ATL to only include USD values
      ath: tokenData.market_data?.ath?.usd ? { usd: tokenData.market_data.ath.usd } : undefined,
      ath_change_percentage: tokenData.market_data?.ath_change_percentage?.usd ? { usd: tokenData.market_data.ath_change_percentage.usd } : undefined,
      atl: tokenData.market_data?.atl?.usd ? { usd: tokenData.market_data.atl.usd } : undefined,
      atl_change_percentage: tokenData.market_data?.atl_change_percentage?.usd ? { usd: tokenData.market_data.atl_change_percentage.usd } : undefined,
    }

    // Combine token data with chart data and ensure price change percentages are available
    const combinedData = {
      ...tokenData,
      chartData: {
        prices: chartData.prices || [],
        market_caps: chartData.market_caps || [],
        total_volumes: chartData.total_volumes || []
      },
      market_data: cleanMarketData
    }

    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('Error fetching token data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 }
    )
  }
}
