import { getCoinTimeseries } from "@/lib/lunarcrush";
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/public/coins/[coin]/time-series/v2
 *
 * Returns time series analytics data for a specific coin from LunarCrush.
 * Includes sentiment, social dominance, market dominance, contributors, interactions, and posts data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coin: string }> }
) {
  try {
    const { coin } = await params;
    const { searchParams } = new URL(request.url);
    
    // Map common token IDs to their actual symbols for LunarCrush API
    const tokenMapping: Record<string, string> = {
      'bonk': 'BONK',
      'useless-3': 'USELESS',
      'useless': 'USELESS',
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'cardano': 'ADA',
      'polkadot': 'DOT',
      'chainlink': 'LINK',
      'uniswap': 'UNI',
      'avalanche-2': 'AVAX',
      'terra-luna': 'LUNA',
      'shiba-inu': 'SHIB',
      'dogecoin': 'DOGE',
      'polygon': 'MATIC'
    };
    
    const coinSymbol = tokenMapping[coin.toLowerCase()] || coin.toUpperCase();
    
    // Get time range from query params (default to 7 days)
    const days = parseInt(searchParams.get("days") || "7", 10);
    const interval = searchParams.get("interval") || "1d"; // 1h, 1d, 1w
    
    console.log(`📊 Fetching time series data for ${coinSymbol} (from coin: ${coin}) - ${days} days, ${interval} interval`);
    
    // Calculate timestamps for the time range
    const now = Math.floor(Date.now() / 1000);
    const start = now - (days * 24 * 60 * 60); // days ago
    const intervalType = interval === "1h" ? "hour" : "day";
    
    console.log(`📈 Fetching ${intervalType} data from ${start} to ${now}`);
    
    // Fetch actual time series data from LunarCrush
    const timeSeriesData = await getCoinTimeseries(coinSymbol, intervalType as "hour" | "day", start, now);
    
    // Debug: Log the actual response structure
    console.log(`🔍 LunarCrush response for ${coinSymbol}:`, JSON.stringify(timeSeriesData, null, 2));
    
    return NextResponse.json({ 
      success: true,
      data: {
        coin: coinSymbol,
        timeframe: `${days}d`,
        interval: interval,
        metrics: {
          sentiment: timeSeriesData.data || timeSeriesData || [],
          social_dominance: timeSeriesData.data || timeSeriesData || [],
          market_dominance: timeSeriesData.data || timeSeriesData || [],
          contributors_active: timeSeriesData.data || timeSeriesData || [],
          contributors_created: timeSeriesData.data || timeSeriesData || [],
          interactions: timeSeriesData.data || timeSeriesData || [],
          posts_active: timeSeriesData.data || timeSeriesData || [],
          posts_created: timeSeriesData.data || timeSeriesData || []
        },
        summary: {
          sentiment_avg: calculateAverageFromArray(timeSeriesData.data || timeSeriesData, 'sentiment'),
          social_dominance_avg: calculateAverageFromArray(timeSeriesData.data || timeSeriesData, 'social_dominance'),
          market_dominance_avg: calculateAverageFromArray(timeSeriesData.data || timeSeriesData, 'market_dominance'),
          total_interactions: calculateSumFromArray(timeSeriesData.data || timeSeriesData, 'interactions'),
          total_posts_created: calculateSumFromArray(timeSeriesData.data || timeSeriesData, 'posts_created'),
          active_contributors: calculateAverageFromArray(timeSeriesData.data || timeSeriesData, 'contributors_active')
        },
        last_updated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error(`❌ Error fetching time series data for coin:`, error);
    const message = String(error?.message || "Failed to fetch time series data");
    
    return NextResponse.json({ 
      success: false,
      error: message,
      data: {
        coin: null,
        timeframe: null,
        interval: null,
        metrics: {
          sentiment: [],
          social_dominance: [],
          market_dominance: [],
          contributors_active: [],
          contributors_created: [],
          interactions: [],
          posts_active: [],
          posts_created: []
        },
        summary: {
          sentiment_avg: 0,
          social_dominance_avg: 0,
          market_dominance_avg: 0,
          total_interactions: 0,
          total_posts_created: 0,
          active_contributors: 0
        },
        last_updated: null
      }
    }, { status: 500 });
  }
}

// Helper functions for calculating metrics from time series array
function calculateAverageFromArray(data: any[], field: string): number {
  if (!data || data.length === 0) return 0;
  const validValues = data
    .map(item => item[field])
    .filter(val => val !== null && val !== undefined && !isNaN(val));
  
  if (validValues.length === 0) return 0;
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
}

function calculateSumFromArray(data: any[], field: string): number {
  if (!data || data.length === 0) return 0;
  return data
    .map(item => item[field])
    .filter(val => val !== null && val !== undefined && !isNaN(val))
    .reduce((acc, val) => acc + val, 0);
}

// Legacy helper functions (keeping for compatibility)
function calculateAverage(data: any[]): number {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (item.value || item || 0), 0);
  return sum / data.length;
}

function calculateSum(data: any[]): number {
  if (!data || data.length === 0) return 0;
  return data.reduce((acc, item) => acc + (item.value || item || 0), 0);
}
