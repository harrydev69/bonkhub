import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🔍 Fetching BONK whale list from Holderscan...');
    
    const HOLDERSCAN_API_KEY = '1c90892932f60e18e09f13d3a84b485ea87304f6443b503f1c8601820582d3d1';
    const BONK_TOKEN_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    
    // Get top holders from Holderscan (reasonable scale for monitoring)
    const response = await fetch(`https://api.holderscan.com/v0/sol/tokens/${BONK_TOKEN_ADDRESS}/holders?limit=1000`, {
      headers: {
        'x-api-key': HOLDERSCAN_API_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Holderscan API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Holderscan holders data received');
    
    if (!data.holders || !Array.isArray(data.holders)) {
      throw new Error('No holders data found in response');
    }

    // Process whale data
    const currentBonkPrice = 0.00002179; // Current BONK price
    const whaleThreshold = 1500000000; // 1.5B BONK tokens (~$32K USD)
    
    const whales = data.holders
      .filter(holder => holder.amount > whaleThreshold)
      .map(holder => {
        const bonkBalance = holder.amount;
        const usdValue = bonkBalance * currentBonkPrice;
        
        return {
          rank: holder.rank,
          address: holder.address,
          shortAddress: `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`,
          bonkBalance: bonkBalance,
          bonkBalanceFormatted: formatBonkAmount(bonkBalance),
          usdValue: usdValue,
          usdValueFormatted: formatUSDValue(usdValue),
          category: getWhaleCategory(bonkBalance),
          solscanLink: `https://solscan.io/account/${holder.address}`,
          splTokenAccount: holder.spl_token_account
        };
      });

    const summary = {
      totalWhales: whales.length,
      totalHolders: data.total,
      largestWhaleUSD: whales.length > 0 ? whales[0].usdValue : 0,
      totalWhaleValueUSD: whales.reduce((sum, whale) => sum + whale.usdValue, 0),
      lastUpdated: new Date().toISOString()
    };

    console.log(`✅ Found ${whales.length} BONK whales`);
    
    return NextResponse.json({
      success: true,
      data: {
        whales,
        summary,
        metadata: {
          dataSource: 'Holderscan API',
          whaleThreshold: '1.5B+ BONK tokens (~$32K+ USD)',
          totalHoldersScanned: data.total,
          updateFrequency: 'Real-time'
        }
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minute cache
        'X-Data-Source': 'Holderscan API',
        'X-Total-Whales': whales.length.toString()
      }
    });

  } catch (error: any) {
    console.error('❌ Whale list error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch whale list',
      message: error.message,
      data: {
        whales: [],
        summary: {
          totalWhales: 0,
          totalHolders: 0,
          largestWhaleUSD: 0,
          totalWhaleValueUSD: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    }, { status: 200 });
  }
}

// Helper functions
function formatBonkAmount(amount: number): string {
  if (amount >= 1e15) return `${(amount / 1e15).toFixed(1)}Q`; // Quadrillion
  if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T`; // Trillion
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B`;   // Billion
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;   // Million
  return amount.toLocaleString();
}

function formatUSDValue(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}

function getWhaleCategory(bonkBalance: number): string {
  const currentPrice = 0.00002179;
  const usdValue = bonkBalance * currentPrice;
  
  if (usdValue >= 10000000) return 'Ultra Whale';     // $10M+
  if (usdValue >= 1000000) return 'Mega Whale';       // $1M+
  if (usdValue >= 500000) return 'Super Whale';       // $500K+
  if (usdValue >= 250000) return 'Whale';             // $250K+
  if (usdValue >= 100000) return 'Large Holder';      // $100K+
  if (usdValue >= 50000) return 'Big Holder';         // $50K+
  return 'Holder';                                     // $32K+
}
