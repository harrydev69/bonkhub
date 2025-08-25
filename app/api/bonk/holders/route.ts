import { NextResponse } from 'next/server';
import { HolderScan } from '@/lib/services/holderscan';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const BONK_CONTRACT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

export async function GET() {
  try {
    // Fetch both holder deltas and breakdowns
    const [deltas, breakdowns] = await Promise.all([
      HolderScan.getHolderDeltas(BONK_CONTRACT_ADDRESS),
      HolderScan.getHolderBreakdowns(BONK_CONTRACT_ADDRESS),
    ]);

    const payload = {
      deltas,
      breakdowns,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching holder data:', error);
    
    // Return fallback data if API fails
    return NextResponse.json({
      deltas: {
        '1hour': 0,
        '2hours': 0,
        '4hours': 0,
        '12hours': 0,
        '1day': 0,
        '3days': 0,
        '7days': 0,
        '14days': 0,
        '30days': 0,
      },
      breakdowns: {
        total_holders: 0,
        holders_over_10_usd: 0,
        holders_over_100_usd: 0,
        holders_over_1000_usd: 0,
        holders_over_10000_usd: 0,
        holders_over_100k_usd: 0,
        holders_over_1m_usd: 0,
        categories: {
          shrimp: 0,
          crab: 0,
          fish: 0,
          dolphin: 0,
          whale: 0,
        },
      },
      last_updated: new Date().toISOString(),
    }, { status: 200 });
  }
}
