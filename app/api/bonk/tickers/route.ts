import { NextResponse } from 'next/server';
import { CoinGecko } from '@/lib/services/coingecko';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

type TickerData = {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_volume: {
    btc: number;
    eth: number;
    usd: number;
  };
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
};

type TickersPayload = {
  name: string;
  tickers: TickerData[];
  last_updated: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const order = url.searchParams.get('order') || 'volume_desc'; // Sort by volume descending

    const response = await CoinGecko.tickers('bonk', {
      page: parseInt(page),
      order: order as string,
      include_exchange_logo: 'false',
    });

    const payload: TickersPayload = {
      name: response.name || 'BONK',
      tickers: response.tickers || [],
      last_updated: response.last_updated || new Date().toISOString(),
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    console.error('Error in /api/bonk/tickers:', e?.message || e);
    return NextResponse.json({
      name: 'BONK',
      tickers: [],
      last_updated: new Date().toISOString(),
    } satisfies TickersPayload, { status: 200 });
  }
}
