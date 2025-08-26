import { getCreatorTimeSeries } from "@/lib/lunarcrush";
import { NextResponse } from "next/server";

/**
 * GET /api/creator/[network]/[creatorId]/timeseries
 * 
 * Returns creator time series data from LunarCrush.
 * Implements smart caching to stay within rate limits.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ network: string; creatorId: string }> }
) {
  try {
    const { network, creatorId } = await params;
    const url = new URL(req.url);
    const interval = url.searchParams.get("interval") || "1w";
    
    if (!network || !creatorId) {
      return NextResponse.json(
        { error: "Network and creator ID are required" },
        { status: 400 }
      );
    }

    // Extract creator ID from the influencer data (e.g., "twitter::1755899659040555009" -> "1755899659040555009")
    const cleanCreatorId = creatorId.includes("::") ? creatorId.split("::")[1] : creatorId;
    
    const timeseriesData = await getCreatorTimeSeries(network, cleanCreatorId, interval);
    
    return NextResponse.json(
      timeseriesData, // Return the data directly, not wrapped in another data object
      { 
        headers: { 
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200" 
        } 
      }
    );
  } catch (error: any) {
    console.error(`GET /api/creator/${params}/timeseries error:`, error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch creator time series", 
        details: String(error?.message ?? "Unknown error") 
      },
      { status: 500 }
    );
  }
}
