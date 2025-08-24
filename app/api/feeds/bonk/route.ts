import { type NextRequest, NextResponse } from "next/server"

// Mock feed data for narrative analysis
const mockFeeds = [
  {
    text: "BONK is showing strong momentum today! #BONK #bullish #solana",
    platform: "twitter",
    likes: 45,
    shares: 12,
    comments: 8,
    sentiment: 0.8,
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    text: "Market looking bearish for meme coins including #BONK",
    platform: "reddit",
    likes: 23,
    shares: 5,
    comments: 15,
    sentiment: -0.6,
    timestamp: Date.now() - 7200000, // 2 hours ago
  },
  {
    text: "BONK ecosystem growing rapidly! New partnerships announced #BONK #ecosystem #growth",
    platform: "telegram",
    likes: 67,
    shares: 23,
    comments: 12,
    sentiment: 0.9,
    timestamp: Date.now() - 1800000, // 30 minutes ago
  },
  {
    text: "DeFi integration with BONK looking promising #BONK #defi #solana",
    platform: "discord",
    likes: 34,
    shares: 8,
    comments: 6,
    sentiment: 0.7,
    timestamp: Date.now() - 5400000, // 1.5 hours ago
  },
  {
    text: "BONK price action consolidating, waiting for breakout #BONK #trading",
    platform: "twitter",
    likes: 28,
    shares: 7,
    comments: 4,
    sentiment: 0.2,
    timestamp: Date.now() - 10800000, // 3 hours ago
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Return mock data for now
    const feeds = mockFeeds.slice(0, Math.min(limit, mockFeeds.length))

    return NextResponse.json({
      feeds,
      total: feeds.length,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching BONK feeds:", error)
    return NextResponse.json({ error: "Failed to fetch feeds", success: false }, { status: 500 })
  }
}
