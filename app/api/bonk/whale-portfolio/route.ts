import { NextResponse } from 'next/server';
import { WhaleMonitor } from '@/lib/services/whale-monitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🐋 Starting BONK whale portfolio analysis...');
    
    // Get whale portfolio activities
    const whaleActivities = await WhaleMonitor.getWhalePortfolioActivities();
    
    // Format activities for display
    const formattedActivities = whaleActivities.map(whale => ({
      whale: {
        address: whale.whale.address,
        shortAddress: `${whale.whale.address.slice(0, 6)}...${whale.whale.address.slice(-4)}`,
        bonkBalance: whale.whale.bonkBalance,
        bonkBalanceUSD: whale.whale.bonkBalanceUSD,
        whaleRank: whale.whale.whaleRank,
        category: whale.whale.bonkBalance > 100000000000 ? 'mega_whale' : 
                 whale.whale.bonkBalance > 10000000000 ? 'whale' : 'large_holder'
      },
      recentActivities: whale.activity.slice(0, 5).map(activity => ({
        ...activity,
        timeAgo: formatTimeAgo(activity.timestamp),
        formattedAmount: formatNumber(activity.amount),
        formattedUSD: formatUSDValue(activity.usdValue)
      }))
    }));

    // Calculate summary stats
    const totalActiveWhales = whaleActivities.length;
    const totalActivities = whaleActivities.reduce((sum, whale) => sum + whale.activity.length, 0);
    const uniqueTokens = new Set();
    
    whaleActivities.forEach(whale => {
      whale.activity.forEach(activity => {
        uniqueTokens.add(activity.token.mint);
      });
    });

    const response = {
      success: true,
      data: {
        whaleActivities: formattedActivities,
        summary: {
          totalActiveWhales,
          totalActivities,
          uniqueTokensTraded: uniqueTokens.size,
          lastUpdated: new Date().toISOString()
        },
        metadata: {
          dataSource: 'Solana Blockchain + Helius + Holderscan',
          updateFrequency: '5 minutes',
          monitoringDescription: 'Top 100 BONK whales trading other tokens',
          whaleThreshold: '1.5B+ BONK tokens (~$32K+ USD)',
          coverage: 'Top 100 out of 5,000+ identified whales'
        }
      }
    };

    console.log('✅ Whale portfolio analysis complete');
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minute cache
        'X-Data-Source': 'Real-time Whale Portfolio Data',
        'X-Active-Whales': totalActiveWhales.toString(),
        'X-Total-Activities': totalActivities.toString()
      }
    });

  } catch (error: any) {
    console.error('❌ Whale portfolio error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch whale portfolio data',
      message: error.message,
      data: {
        whaleActivities: [],
        summary: {
          totalActiveWhales: 0,
          totalActivities: 0,
          uniqueTokensTraded: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    }, { status: 200 });
  }
}

// Helper functions
function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(2);
}

function formatUSDValue(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}
