import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const interval = searchParams.get("interval") || "hour"
    const points = Number.parseInt(searchParams.get("points") || "48")

    // Mock timeseries data
    const timeseries = Array.from({ length: points }, (_, i) => {
      const timestamp = Date.now() - (points - i) * 60 * 60 * 1000 // hourly intervals
      return {
        ts: timestamp,
        average_sentiment: 0.3 + Math.random() * 0.4, // 0.3 to 0.7 range
        sentiment: 0.3 + Math.random() * 0.4,
        social_volume: Math.floor(Math.random() * 1000) + 500,
        social_volume_24h: Math.floor(Math.random() * 2000) + 1000,
        social_score: Math.floor(Math.random() * 100) + 50,
        galaxy_score: Math.floor(Math.random() * 1000) + 200,
      }
    })

    return NextResponse.json({ timeseries })
  } catch (error) {
    console.error("Error fetching sentiment timeseries:", error)
    return NextResponse.json({ error: "Failed to fetch timeseries data" }, { status: 500 })
  }
}
