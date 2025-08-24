import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days") || "1"

    // Mock chart data - replace with actual API calls
    const generateMockData = (days: string) => {
      const numPoints = days === "1" ? 24 : Number.parseInt(days) * 4
      const basePrice = 0.00002156
      const dataPoints = []

      for (let i = 0; i < numPoints; i++) {
        const timestamp = Date.now() - (numPoints - i) * (days === "1" ? 3600000 : 21600000)
        const variation = (Math.random() - 0.5) * 0.1
        const price = basePrice * (1 + variation)

        dataPoints.push({
          timestamp,
          price,
          marketCap: price * 93000000000000,
          volume: Math.random() * 50000000 + 10000000,
          date: new Date(timestamp).toISOString(),
        })
      }

      return dataPoints
    }

    const dataPoints = generateMockData(days)
    const startPrice = dataPoints[0]?.price || 0
    const endPrice = dataPoints[dataPoints.length - 1]?.price || 0
    const changePercent = ((endPrice - startPrice) / startPrice) * 100

    const mockData = {
      timeframe: `${days}d`,
      dataPoints,
      summary: {
        startPrice,
        endPrice,
        changePercent,
        changeAmount: endPrice - startPrice,
        highestPrice: Math.max(...dataPoints.map((d) => d.price)),
        lowestPrice: Math.min(...dataPoints.map((d) => d.price)),
        totalVolume: dataPoints.reduce((sum, d) => sum + d.volume, 0),
        avgVolume: dataPoints.reduce((sum, d) => sum + d.volume, 0) / dataPoints.length,
        highestVolume: Math.max(...dataPoints.map((d) => d.volume)),
        lowestVolume: Math.min(...dataPoints.map((d) => d.volume)),
      },
      metadata: {
        totalPoints: dataPoints.length,
        timeRange: `${days} days`,
        lastUpdated: new Date().toISOString(),
      },
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching BONK chart data:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
