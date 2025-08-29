import { NextRequest, NextResponse } from "next/server";
import { getCoinTimeseries } from "@/lib/lunarcrush";

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = params;

    if (!process.env.LUNARCRUSH_API_KEY) {
      return NextResponse.json(
        { error: "LunarCrush API key not configured" },
        { status: 500 }
      );
    }

    // First, get the ticker from the coingecko API if tokenId is a contract address
    let ticker = tokenId;
    if (tokenId.startsWith("0x") || tokenId.length > 10) { // Basic check for contract address
      try {
        const tokenRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/coingecko/token/${tokenId}`,
          {
            cache: "no-store",
          }
        );
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          ticker = tokenData.symbol || tokenId;
        }
      } catch (error) {
        console.warn(
          "Failed to get ticker from coingecko, using tokenId:",
          error
        );
      }
    }

    // Set time range for the last 90 days
    const end = Math.floor(Date.now() / 1000);
    const start = end - 90 * 24 * 60 * 60; // 90 days ago

    // Fetch coin time series data from LunarCrush
    const response = await getCoinTimeseries(ticker, "day", start, end);
    
    const timeSeriesData = response.data || [];

    return NextResponse.json({
      data: timeSeriesData,
    });
  } catch (error) {
    console.error("Error fetching coin time series data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch coin time series data", details: errorMessage },
      { status: 500 }
    );
  }
}