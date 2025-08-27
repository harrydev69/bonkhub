import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "CoinGecko API key not configured" },
        { status: 500 }
      )
    }

    const headers = {
      "x-cg-pro-api-key": apiKey,
      "Content-Type": "application/json",
    }

    // Step 1: Get all categories to find letsbonk-fun-ecosystem
    const categoriesResponse = await fetch(
      "https://pro-api.coingecko.com/api/v3/coins/categories",
      { headers }
    )

    if (!categoriesResponse.ok) {
      throw new Error(`Categories API error: ${categoriesResponse.status}`)
    }

    const categories = await categoriesResponse.json()
    const letsbonkCategory = categories.find(
      (cat: any) => cat.id === "letsbonk-fun-ecosystem"
    )

    if (!letsbonkCategory) {
      throw new Error("LetsBonk.fun ecosystem category not found")
    }

    // Step 2: Get all tokens in the letsbonk-fun-ecosystem category
    const marketsResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=letsbonk-fun-ecosystem&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d&locale=en`,
      { headers }
    )

    if (!marketsResponse.ok) {
      throw new Error(`Tokens API error: ${marketsResponse.status}`)
    }

    const tokens = await marketsResponse.json()

    // Step 3: Get detailed metadata for each token (batch request)
    const detailedTokens = await Promise.all(
      tokens.slice(0, 50).map(async (token: any) => {
        try {
          const detailResponse = await fetch(
            `https://pro-api.coingecko.com/api/v3/coins/${token.id}`,
            { headers }
          )
          
          if (detailResponse.ok) {
            const details = await detailResponse.json()
            return {
              ...token,
              description: details.description?.en || "",
              links: details.links || {},
              categories: details.categories || [],
              community_data: details.community_data || {},
              developer_data: details.developer_data || {},
              last_updated: details.last_updated || token.last_updated,
            }
          }
          return token
        } catch (error) {
          console.warn(`Failed to fetch details for ${token.id}:`, error)
          return token
        }
      })
    )

    // Calculate category totals
    const totalMarketCap = tokens.reduce((sum: number, token: any) => sum + token.market_cap, 0)
    const totalVolume = tokens.reduce((sum: number, token: any) => sum + token.total_volume, 0)
    const avgChange24h = tokens.reduce((sum: number, token: any) => sum + token.price_change_percentage_24h, 0) / tokens.length

    const ecosystemData = {
      category: {
        id: letsbonkCategory.id,
        name: letsbonkCategory.name,
        market_cap: totalMarketCap,
        market_cap_change_24h: letsbonkCategory.market_cap_change_24h,
        volume_24h: totalVolume,
        content: letsbonkCategory.content || "",
        top_3_coins: letsbonkCategory.top_3_coins || [],
        market_cap_change_percentage_24h: letsbonkCategory.market_cap_change_percentage_24h,
        updated_at: letsbonkCategory.updated_at,
      },
      tokens: detailedTokens,
      summary: {
        totalTokens: tokens.length,
        totalMarketCap,
        totalVolume,
        averageChange24h: avgChange24h,
        lastUpdated: new Date().toISOString(),
      },
      metadata: {
        dataSource: "CoinGecko Pro API",
        updateFrequency: "5 minutes",
        categoryId: "letsbonk-fun-ecosystem",
        totalTokensFound: tokens.length,
      }
    }

    return NextResponse.json(ecosystemData)
  } catch (error) {
    console.error("Error fetching LetsBonk ecosystem data:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch ecosystem data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
