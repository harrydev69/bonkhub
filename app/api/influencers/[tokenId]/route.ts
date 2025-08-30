import { getCoinInfluencers } from "@/lib/lunarcrush";
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/influencers/[tokenId]
 *
 * Returns the top influencers (creators) for a specific token from LunarCrush. 
 * An optional `limit` query parameter may be supplied to reduce the number of results.
 * The limit is clamped between 1 and 100.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.max(1, Math.min(100, isFinite(rawLimit) ? rawLimit : 10));

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
    
    const tokenSymbol = tokenMapping[tokenId.toLowerCase()] || tokenId.toUpperCase();
    
    console.log(`🌟 Fetching top ${limit} influencers for ${tokenSymbol} (from tokenId: ${tokenId})`);
    
    const influencers = await getCoinInfluencers(tokenSymbol, limit);
    
    // Log results for debugging
    console.log(`✅ Found ${influencers.length} influencers for ${tokenSymbol}`);
    
    return NextResponse.json({ 
      success: true,
      data: {
        influencers,
        token: tokenSymbol,
        count: influencers.length,
        limit: limit
      }
    });
  } catch (error: any) {
    console.error(`❌ Error fetching influencers for token:`, error);
    const message = String(error?.message || "Failed to fetch influencers");
    
    return NextResponse.json({ 
      success: false,
      error: message,
      data: {
        influencers: [],
        token: null,
        count: 0,
        limit: 0
      }
    }, { status: 500 });
  }
}