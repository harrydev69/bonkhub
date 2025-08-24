import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // Mock news data - replace with actual API calls
    const mockArticles = [
      {
        id: "1",
        title: "BONK Reaches New All-Time High as Solana Ecosystem Thrives",
        summary:
          "The popular Solana-based meme coin BONK has surged to new heights, driven by increased adoption and ecosystem growth.",
        link: "https://example.com/bonk-ath",
        source: "CryptoNews",
        published: new Date(Date.now() - 2 * 3600000).toISOString(),
        relativeTime: "2 hours ago",
        readingTime: "3 min read",
        category: "Price",
        subCategory: "ATH",
        sentiment: { label: "positive" as const, score: 0.8 },
        sourceCount: 3,
      },
      {
        id: "2",
        title: "Major Exchange Announces BONK Listing",
        summary:
          "A leading cryptocurrency exchange has announced support for BONK trading pairs, expanding accessibility for traders.",
        link: "https://example.com/bonk-listing",
        source: "BlockchainDaily",
        published: new Date(Date.now() - 6 * 3600000).toISOString(),
        relativeTime: "6 hours ago",
        readingTime: "2 min read",
        category: "Exchange",
        sentiment: { label: "positive" as const, score: 0.7 },
        sourceCount: 2,
      },
      {
        id: "3",
        title: "BONK Community Launches New DeFi Protocol",
        summary:
          "The BONK community has unveiled a new decentralized finance protocol built on Solana, offering yield farming opportunities.",
        link: "https://example.com/bonk-defi",
        source: "DeFi Pulse",
        published: new Date(Date.now() - 12 * 3600000).toISOString(),
        relativeTime: "12 hours ago",
        readingTime: "4 min read",
        category: "DeFi",
        subCategory: "Launch",
        sentiment: { label: "positive" as const, score: 0.6 },
        sourceCount: 1,
      },
    ]

    return NextResponse.json({
      articles: mockArticles.slice((page - 1) * limit, page * limit),
      lastUpdated: new Date().toISOString(),
      isFallback: false,
    })
  } catch (error) {
    console.error("Error fetching BONK news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
