import { NextResponse } from 'next/server';
import { CoinGecko } from '@/lib/services/coingecko';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

type PerfPayload = {
  base: 'usd';
  changes: {
    '1h': number | null;
    '24h': number | null;
    '7d': number | null;
    '14d': number | null;
    '30d': number | null;
    '1y': number | null;
  };
  lastUpdated: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const vs  = (url.searchParams.get('vs') || 'usd').toLowerCase();

    const rows = await CoinGecko.coinsMarkets({
      vs_currency: vs,
      ids: 'bonk',
      price_change_percentage: '1h,24h,7d,14d,30d,1y',
      per_page: 1,
      page: 1,
      sparkline: 'false',
    });

    const row: any = Array.isArray(rows) && rows[0] ? rows[0] : {};

    const payload: PerfPayload = {
      base: 'usd',
      changes: {
        '1h' : typeof row.price_change_percentage_1h_in_currency  === 'number' ? row.price_change_percentage_1h_in_currency  : null,
        '24h': typeof row.price_change_percentage_24h_in_currency === 'number' ? row.price_change_percentage_24h_in_currency : null,
        '7d' : typeof row.price_change_percentage_7d_in_currency  === 'number' ? row.price_change_percentage_7d_in_currency  : null,
        '14d': typeof row.price_change_percentage_14d_in_currency === 'number' ? row.price_change_percentage_14d_in_currency : null,
        '30d': typeof row.price_change_percentage_30d_in_currency === 'number' ? row.price_change_percentage_30d_in_currency : null,
        '1y' : typeof row.price_change_percentage_1y_in_currency  === 'number' ? row.price_change_percentage_1y_in_currency  : null,
      },
      lastUpdated: row.last_updated || new Date().toISOString(),
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    console.error('Error in /api/bonk/performance:', e?.message || e);
    return NextResponse.json({
      base: 'usd',
      changes: { '1h': null, '24h': null, '7d': null, '14d': null, '30d': null, '1y': null },
      lastUpdated: new Date().toISOString(),
    } satisfies PerfPayload, { status: 200 });
  }
}
