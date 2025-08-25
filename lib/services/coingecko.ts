/**
 * CoinGecko API Service for BONK Analytics
 * Based on CoinGecko Pro API documentation
 * Rate Limits: 500 calls/minute, 500k calls/month
 */

// lib/services/coingecko.ts
const API_BASE = process.env.COINGECKO_API_BASE || 'https://pro-api.coingecko.com/api/v3';
const API_KEY  = process.env.COINGECKO_API_KEY || '';
const USE_FALLBACK = process.env.FEATURE_COINGECKO_FALLBACK === 'true';
const FREE_BASE = process.env.COINGECKO_FALLBACK_FREE_BASE || 'https://api.coingecko.com/api/v3';

// Preserve /api/v3 and avoid leading-slash resets
function joinPath(base: string, path: string) {
  const b = base.endsWith('/') ? base : base + '/';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return b + p;
}

function buildUrl(base: string, path: string, params?: Record<string, string | number | undefined | null>) {
  const u = new URL(joinPath(base, path));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue; // include only defined params
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}

async function doFetch(url: string) {
  const headers: Record<string, string> = {};
  if (API_KEY && url.startsWith('https://pro-api.coingecko.com')) {
    headers['x-cg-pro-api-key'] = API_KEY;
  }
  console.log('[CG] GET', url);
  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText} :: ${text}`);
  }
  return res.json();
}

async function request(path: string, params?: Record<string, string | number | undefined | null>) {
  try {
    return await doFetch(buildUrl(API_BASE, path, params));
  } catch (err) {
    if (USE_FALLBACK) {
      console.warn('[CG] falling back to free API for', path);
      return await doFetch(buildUrl(FREE_BASE, path, params));
    }
    throw err;
  }
}

export const CoinGecko = {
  // 👇 IMPORTANT: no default interval here; pass exactly what the caller gives.
  marketChart: (id: string, params: {
    vs_currency: string;
    days: string | number;
    interval?: 'daily' | 'hourly' | 'minutely';
  }) => request(`coins/${id}/market_chart`, params),

  coin: (id: string) => request(`coins/${id}`, {
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'true',
    developer_data: 'true',
    sparkline: 'true',
  }),
};
