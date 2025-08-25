import { NextResponse } from 'next/server';
import { CoinGecko } from '@/lib/services/coingecko';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

type Pt = [number, number];

export type ChartDataPoint = {
  timestamp: number;
  price: number;
  marketCap: number;
  volume: number;
};

export type ChartPayload = {
  timeframe: '24H'|'7D'|'30D'|'90D'|'1Y';
  dataPoints: ChartDataPoint[];
  summary: {
    startPrice: number;
    endPrice: number;
    changePercent: number;
    changeAmount: number;
    highestPrice: number;
    lowestPrice: number;
    totalVolume: number;
    avgVolume: number;
    highestVolume: number;
    lowestVolume: number;
  };
  metadata: {
    totalPoints: number;
    timeRange: string;
    lastUpdated: string;
  };
};

function mapTf(tfRaw?: string) {
  const tf = (tfRaw || '7d').toLowerCase();
  switch (tf) {
    case '24h': return { days: '1',   interval: undefined as 'daily' | 'hourly' | 'minutely' | undefined, label: '24H' as const };
    case '7d':  return { days: '7',   interval: undefined as 'daily' | 'hourly' | 'minutely' | undefined, label: '7D' as const };
    case '30d': return { days: '30',  interval: 'daily' as 'daily' | 'hourly' | 'minutely' | undefined,   label: '30D' as const };
    case '90d': return { days: '90',  interval: 'daily' as 'daily' | 'hourly' | 'minutely' | undefined,   label: '90D' as const };
    case '1y':  return { days: '365', interval: 'daily' as 'daily' | 'hourly' | 'minutely' | undefined,   label: '1Y' as const };
    default:    return { days: '7',   interval: undefined as 'daily' | 'hourly' | 'minutely' | undefined, label: '7D' as const };
  }
}

async function fetchChartSafe(vs: string, days: string, interval?: 'daily'|'hourly'|'minutely') {
  const params: any = { vs_currency: vs, days };
  if (interval) params.interval = interval; // only if defined
  console.log('[CHART] requesting', { vs, days, interval: interval ?? 'auto' });
  try {
    return await CoinGecko.marketChart('bonk', params);
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (/10005|exclusive to Enterprise|interval=/i.test(msg)) {
      console.warn('[CHART] retrying without interval due to plan gate');
      console.log('[CHART] requesting', { vs, days, interval: 'auto' });
      return await CoinGecko.marketChart('bonk', { vs_currency: vs, days });
    }
    throw err;
  }
}

// Forward-fill -> guarantees numbers (no nulls) for chart & summary
function forwardFill(nums: Array<number | null | undefined>): number[] {
  const out: number[] = new Array(nums.length);
  let idx = nums.findIndex(v => typeof v === 'number' && !Number.isNaN(v));
  let last = idx >= 0 ? (nums[idx] as number) : 0;
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    if (typeof v === 'number' && !Number.isNaN(v)) { last = v; out[i] = v; }
    else { out[i] = last; }
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const url  = new URL(req.url);
    const tfQ  = url.searchParams.get('tf') || url.searchParams.get('timeframe') || '7d';
    const vs   = (url.searchParams.get('vs') || 'usd').toLowerCase();

    const { days, interval, label } = mapTf(tfQ);
    const raw = await fetchChartSafe(vs, days, interval);

    const pricesRaw: Pt[]     = Array.isArray(raw?.prices)        ? raw.prices        : [];
    const marketCapsRaw: Pt[] = Array.isArray(raw?.market_caps)   ? raw.market_caps   : [];
    const volumesRaw: Pt[]    = Array.isArray(raw?.total_volumes) ? raw.total_volumes : [];

    const ts = pricesRaw.map(([t]) => t);
    const priceVals = forwardFill(pricesRaw.map(([,v]) => (typeof v === 'number' ? v : null)));
    const mcapVals  = forwardFill(marketCapsRaw.map(([,v]) => (typeof v === 'number' ? v : null)));
    const volVals   = forwardFill(volumesRaw.map(([,v]) => (typeof v === 'number' ? v : null)));

    const dataPoints: ChartDataPoint[] = ts.map((t, i) => ({
      timestamp: t,
      price: priceVals[i] ?? 0,
      marketCap: mcapVals[i] ?? 0,
      volume: volVals[i] ?? 0,
    }));

    const n = dataPoints.length;
    const startPrice = n ? dataPoints[0].price : 0;
    const endPrice   = n ? dataPoints[n - 1].price : 0;
    const changeAmount  = endPrice - startPrice;
    const changePercent = startPrice !== 0 ? (changeAmount / startPrice) * 100 : 0;

    const highestPrice  = n ? Math.max(...dataPoints.map(d => d.price)) : 0;
    const lowestPrice   = n ? Math.min(...dataPoints.map(d => d.price)) : 0;
    const totalVolume   = n ? dataPoints.reduce((s, d) => s + d.volume, 0) : 0;
    const avgVolume     = n ? totalVolume / n : 0;
    const highestVolume = n ? Math.max(...dataPoints.map(d => d.volume)) : 0;
    const lowestVolume  = n ? Math.min(...dataPoints.map(d => d.volume)) : 0;

    const firstTs = n ? dataPoints[0].timestamp : null;
    const lastTs  = n ? dataPoints[n - 1].timestamp : null;

    const last = n ? dataPoints[n - 1] : undefined;

    const payload: ChartPayload & {
      currentPrice: number;
      currentMarketCap: number;
      currentVolume: number;
    } = {
      timeframe: label,
      dataPoints,
      summary: {
        startPrice,
        endPrice,
        changePercent,
        changeAmount,
        highestPrice,
        lowestPrice,
        totalVolume,
        avgVolume,
        highestVolume,
        lowestVolume,
      },
      metadata: {
        totalPoints: n,
        timeRange: (firstTs && lastTs)
          ? `${new Date(firstTs).toISOString()} → ${new Date(lastTs).toISOString()}`
          : '—',
        lastUpdated: new Date().toISOString(),
      },
      currentPrice: last ? last.price : 0,
      currentMarketCap: last ? last.marketCap : 0,
      currentVolume: last ? last.volume : 0,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    console.error('Error in /api/bonk/chart:', e?.message || e);
    return NextResponse.json({
      timeframe: '7D',
      dataPoints: [],
      summary: {
        startPrice: 0, endPrice: 0, changePercent: 0, changeAmount: 0,
        highestPrice: 0, lowestPrice: 0, totalVolume: 0, avgVolume: 0,
        highestVolume: 0, lowestVolume: 0,
      },
      metadata: { totalPoints: 0, timeRange: '—', lastUpdated: new Date().toISOString() },
      currentPrice: 0, currentMarketCap: 0, currentVolume: 0,
    }, { status: 200 });
  }
}

/**
 * OPTIONS method for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
