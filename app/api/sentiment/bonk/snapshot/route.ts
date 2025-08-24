import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock sentiment snapshot data
    const insights = {
      keywords: [
        { word: "bonk", count: 1250 },
        { word: "moon", count: 890 },
        { word: "hodl", count: 670 },
        { word: "dip", count: 450 },
        { word: "pump", count: 380 },
        { word: "solana", count: 320 },
        { word: "meme", count: 280 },
        { word: "diamond", count: 210 },
        { word: "hands", count: 180 },
        { word: "bullish", count: 150 },
      ],
      sentiment: {
        pos: 450,
        neg: 120,
        neu: 230,
      },
      totalPosts: 800,
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Error fetching sentiment snapshot:", error)
    return NextResponse.json({ error: "Failed to fetch sentiment data" }, { status: 500 })
  }
}
