import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    // Mock influencers data
    const influencers = [
      {
        handle: "@bonk_inu",
        username: "bonk_inu",
        display_name: "BONK Official",
        followers: 250000,
        followers_count: 250000,
        engagement: 85,
        engagement_score: 85,
        score: 95,
        sentiment: 0.8,
      },
      {
        handle: "@solana",
        username: "solana",
        display_name: "Solana",
        followers: 1200000,
        followers_count: 1200000,
        engagement: 78,
        engagement_score: 78,
        score: 88,
        sentiment: 0.6,
      },
      {
        handle: "@crypto_whale",
        username: "crypto_whale",
        display_name: "Crypto Whale",
        followers: 180000,
        followers_count: 180000,
        engagement: 72,
        engagement_score: 72,
        score: 82,
        sentiment: 0.7,
      },
      {
        handle: "@meme_lord",
        username: "meme_lord",
        display_name: "Meme Lord",
        followers: 95000,
        followers_count: 95000,
        engagement: 68,
        engagement_score: 68,
        score: 75,
        sentiment: 0.9,
      },
      {
        handle: "@defi_degen",
        username: "defi_degen",
        display_name: "DeFi Degen",
        followers: 75000,
        followers_count: 75000,
        engagement: 65,
        engagement_score: 65,
        score: 70,
        sentiment: 0.5,
      },
      {
        handle: "@bonk_trader",
        username: "bonk_trader",
        display_name: "BONK Trader",
        followers: 45000,
        followers_count: 45000,
        engagement: 62,
        engagement_score: 62,
        score: 68,
        sentiment: 0.8,
      },
    ].slice(0, limit)

    return NextResponse.json({ influencers })
  } catch (error) {
    console.error("Error fetching influencers:", error)
    return NextResponse.json({ error: "Failed to fetch influencers data" }, { status: 500 })
  }
}
