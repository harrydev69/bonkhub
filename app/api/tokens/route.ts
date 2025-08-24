import { NextResponse } from "next/server"

// Mock data - in a real app, this would fetch from external APIs
const mockTokenData = [
  {
    symbol: "BONK",
    name: "Bonk",
    price: 0.00003435,
    change24h: 15.7,
    marketCap: 2340000000,
    volume24h: 45600000,
    sentiment: "Bullish",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "USELESS",
    name: "Useless",
    price: 0.000000234,
    change24h: 23.4,
    marketCap: 45000000,
    volume24h: 2300000,
    sentiment: "Bullish",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "HOSICO",
    name: "Hosico",
    price: 0.000006,
    change24h: -8.2,
    marketCap: 12000000,
    volume24h: 890000,
    sentiment: "Bearish",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "SAMO",
    name: "Samoyedcoin",
    price: 0.0234,
    change24h: 12.1,
    marketCap: 78000000,
    volume24h: 4500000,
    sentiment: "Bullish",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "COPE",
    name: "Cope",
    price: 0.0456,
    change24h: -5.7,
    marketCap: 34000000,
    volume24h: 1200000,
    sentiment: "Neutral",
    lastUpdated: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Add some random variation to simulate real-time data
    const updatedData = mockTokenData.map((token) => ({
      ...token,
      price: token.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
      change24h: token.change24h + (Math.random() - 0.5) * 2, // ±1% variation
      lastUpdated: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: updatedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch token data" }, { status: 500 })
  }
}
