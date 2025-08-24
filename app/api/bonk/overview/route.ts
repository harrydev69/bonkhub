import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock data for now - replace with actual API calls
    const mockData = {
      price: 0.00002156,
      changePct: {
        h1: 2.3,
        h24: -5.2,
        d7: 12.8,
        d30: -8.4,
        y1: 1250.6,
      },
      marketCap: 1678853795,
      fdv: 2156000000,
      volume24h: 169061565,
      rank: 77,
      sparkline7d: [0.000021, 0.0000212, 0.0000208, 0.00002156],
      high24h: 0.0000228,
      low24h: 0.0000205,
      ath: {
        price: 0.00005825,
        date: "2024-11-20",
        changePct: -62.8,
      },
      atl: {
        price: 0.00000078,
        date: "2022-12-29",
        changePct: 25062.2,
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching BONK overview:", error)
    return NextResponse.json({ error: "Failed to fetch BONK overview" }, { status: 500 })
  }
}
