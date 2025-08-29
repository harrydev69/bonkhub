import { NextRequest, NextResponse } from 'next/server'
import { getComprehensiveAssetData } from '@/lib/lunarcrush'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params
    const { searchParams } = new URL(request.url)
    
    if (!process.env.LUNARCRUSH_API_KEY) {
      return NextResponse.json(
        { error: 'LunarCrush API key not configured' },
        { status: 500 }
      )
    }

    // First, get the ticker from the coingecko API if tokenId is a contract address
    let ticker = tokenId
    try {
      const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coingecko/token/${tokenId}`, {
        cache: "no-store",
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        ticker = tokenData.symbol || tokenId;
      }
    } catch (error) {
      console.warn("Failed to get ticker from coingecko, using tokenId:", error);
    }
    
    // Fetch comprehensive asset data from LunarCrush
    const data = await getComprehensiveAssetData(ticker);
    
    // Extract time series data for social dominance
    const timeSeriesData = data.timeseries?.data || [];
    
    return NextResponse.json({
      data: timeSeriesData
    });
  } catch (error) {
    console.error('Error fetching social dominance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social dominance data' },
      { status: 500 }
    )
  }
}