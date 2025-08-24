import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { trackId: string } }) {
  try {
    const trackId = params.trackId

    // In a real app, this would update the database
    // For now, we'll just return success

    return NextResponse.json({
      message: "Track liked successfully",
      trackId,
    })
  } catch (error) {
    console.error("Like track error:", error)
    return NextResponse.json({ error: "Failed to like track" }, { status: 500 })
  }
}
