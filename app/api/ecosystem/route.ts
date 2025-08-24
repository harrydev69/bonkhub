import { NextResponse } from "next/server"

const mockEcosystemData = [
  {
    rank: 1,
    name: "Bonk",
    symbol: "BONK",
    price: 0.000034,
    change24h: 15.7,
    marketCap: 2340000000,
    volume24h: 145000000,
  },
  {
    rank: 2,
    name: "Useless",
    symbol: "USELESS",
    price: 0.000000234,
    change24h: 23.4,
    marketCap: 45000000,
    volume24h: 2300000,
  },
  {
    rank: 3,
    name: "Hosico",
    symbol: "HOSICO",
    price: 0.000006,
    change24h: -8.2,
    marketCap: 12000000,
    volume24h: 890000,
  },
  {
    rank: 4,
    name: "Samoyedcoin",
    symbol: "SAMO",
    price: 0.0234,
    change24h: 12.1,
    marketCap: 78000000,
    volume24h: 4500000,
  },
  { rank: 5, name: "Cope", symbol: "COPE", price: 0.0456, change24h: -5.7, marketCap: 34000000, volume24h: 1200000 },
  { rank: 6, name: "Rope", symbol: "ROPE", price: 0.000123, change24h: 18.9, marketCap: 23000000, volume24h: 890000 },
  {
    rank: 7,
    name: "Cheems",
    symbol: "CHEEMS",
    price: 0.00789,
    change24h: 7.3,
    marketCap: 56000000,
    volume24h: 2100000,
  },
  {
    rank: 8,
    name: "Doge Killer",
    symbol: "LEASH",
    price: 234.56,
    change24h: -3.4,
    marketCap: 89000000,
    volume24h: 3400000,
  },
  { rank: 9, name: "FLOKI", symbol: "FLOKI", price: 0.000234, change24h: 9.8, marketCap: 67000000, volume24h: 2800000 },
  {
    rank: 10,
    name: "Shiba Predator",
    symbol: "QOM",
    price: 0.00000089,
    change24h: 14.2,
    marketCap: 15000000,
    volume24h: 670000,
  },
]

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const updatedData = mockEcosystemData.map((token) => ({
      ...token,
      price: token.price * (1 + (Math.random() - 0.5) * 0.015),
      change24h: token.change24h + (Math.random() - 0.5) * 1.5,
      lastUpdated: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: updatedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch ecosystem data" }, { status: 500 })
  }
}
