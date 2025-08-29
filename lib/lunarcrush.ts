// bonkai-revbackend/lib/lunarcrush.ts
//
// Helper functions for interacting with the LunarCrush v4 API.
//
// The application relies on real‑time social and market data from LunarCrush
// to populate the BONK dashboard. Previous versions of this project either
// pointed at outdated endpoints or attempted to call routes that were never
// implemented. This module centralises all API interaction logic and can be
// imported from server‑side code (API routes, cron jobs, etc.).

/*
 * Base URL for all LunarCrush requests.
 *
 * The Individual plan uses the v4 API hosted at https://lunarcrush.com/api4.
 * A trailing slash is stripped to avoid accidental double slashes when
 * concatenating paths. An optional environment variable
 * `LUNARCRUSH_API_BASE` can override the base URL during development or
 * testing. See https://lunarcrush.com/developers for details.
 */
const API_BASE = (process.env.LUNARCRUSH_API_BASE || "https://lunarcrush.com/api4").replace(/\/+$/, "");

// API key used to authenticate with LunarCrush. The key must be provided
// via the `LUNARCRUSH_API_KEY` environment variable. Without a valid key
// requests will return HTTP 401. The Individual plan allows 10 requests
// per minute and 2,000 requests per day, so consumers of this module
// should implement caching or back‑off where appropriate.
const API_KEY = process.env.LUNARCRUSH_API_KEY || "";

/**
 * Build a set of request headers for all API calls.
 *
 * Both the `Authorization` and `x-api-key` headers are set when an API
 * key is available. LunarCrush accepts either header, but setting both
 * maximises compatibility across different plans. Consumers may pass
 * additional headers via the `init` parameter of `fetchJson` – those
 * headers take precedence over the defaults defined here.
 */
function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("accept", "application/json");
  if (API_KEY) {
    // Only set the header if the caller hasn't explicitly provided it.
    if (!headers.has("authorization")) headers.set("authorization", `Bearer ${API_KEY}`);
    if (!headers.has("x-api-key")) headers.set("x-api-key", API_KEY);
  }
  return headers;
}

/**
 * Perform a fetch request against the LunarCrush API and return the parsed
 * JSON body. When the response is not OK an Error is thrown containing
 * both the HTTP status and a truncated body for easier debugging.
 */
async function fetchJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(init?.headers),
  });

  if (!response.ok) {
    // Attempt to read a textual body from the error response. This is
    // particularly helpful when the server returns HTML (e.g. a 404 page)
    // which would otherwise cause JSON parsing to throw a second error.
    const text = await response.text().catch(() => "");
    const reason = text || response.statusText || "Request failed";
    const error = new Error(`LunarCrush ${response.status} on ${path} — ${reason.slice(0, 300)}`);
    (error as any).status = response.status;
    throw error;
  }

  // Some endpoints return no content on 204; return an empty object in
  // those cases so callers do not try to parse undefined.
  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

/**
 * Normalise various response shapes into a simple array. LunarCrush
 * sometimes returns an object with a `data` or `items` array property. In
 * other cases the top‑level response is already an array. This helper
 * ensures downstream consumers always receive an array.
 */
export function unwrapArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Fetch a social feed for a given topic (symbol). The v4 feed endpoint
 * accepts an optional `limit` query parameter, but it may be ignored by
 * LunarCrush. To guarantee the caller receives the desired number of
 * items, slice the response client‑side. Consumers should implement
 * caching or back‑off when calling this function to respect rate limits.
 *
 * @param symbol Cryptocurrency symbol or topic name. Case insensitive.
 * @param limit Maximum number of posts to return. Defaults to 50.
 */
export async function getCoinFeeds(symbol: string, limit: number = 50) {
  const topic = String(symbol).toLowerCase();
  const qp = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  const raw = await fetchJson(`/public/topic/${topic}/posts/v1${qp}`);
  const items = unwrapArray(raw);
  return items.slice(0, limit);
}

/**
 * Fetch the list of top influencers (creators) for a given topic. The
 * creators endpoint does not accept a limit query parameter, so callers
 * should specify a desired number of results which will be enforced via
 * array slicing.
 *
 * @param symbol Cryptocurrency symbol or topic name. Case insensitive.
 * @param limit Maximum number of influencers to return. Defaults to 25.
 */
export async function getCoinInfluencers(symbol: string, limit: number = 25) {
  const topic = String(symbol).toLowerCase();
  const raw = await fetchJson(`/public/topic/${topic}/creators/v1`);
  const items = unwrapArray(raw);
  return items.slice(0, limit);
}

/**
 * Fetch a snapshot of coin insights (e.g. social score, galaxy score).
 *
 * @param symbol Cryptocurrency symbol. Case insensitive but normalised to
 * uppercase as required by the API.
 */
export async function getCoinInsights(symbol: string) {
  const s = String(symbol).toUpperCase();
  return await fetchJson(`/public/coins/${s}/v1`);
}

/**
 * Fetch a time series for a coin's sentiment, volume, etc. See the
 * LunarCrush documentation for valid intervals ("hour" or "day") and
 * timestamp values. Timestamps are UNIX seconds.
 */
export async function getCoinTimeseries(
  symbol: string,
  interval: "hour" | "day",
  start: number,
  end: number
) {
  const s = String(symbol).toUpperCase();
  const params = new URLSearchParams({ interval, start: String(start), end: String(end) });
  return await fetchJson(`/public/coins/${s}/time-series/v2?${params.toString()}`);
}

/**
 * Fetch comprehensive asset data including Galaxy Score, social metrics, and engagement data.
 * This combines multiple data points into a single API call to reduce rate limit usage.
 * Optimized for 10 calls per minute limit.
 *
 * @param symbol Cryptocurrency symbol. Case insensitive but normalised to uppercase.
 */
export async function getComprehensiveAssetData(symbol: string) {
  const s = String(symbol).toUpperCase();
  
  // Get comprehensive asset data including social metrics (1 API call)
  const assetData = await fetchJson(`/public/coins/${s}/v1`);
  
  // Get topic summary data (1 API call)
  const topicData = await fetchJson(`/public/topic/${s.toLowerCase()}/v1`);
  
  // Get time series data for the last 24 hours to calculate trends (1 API call)
  const now = Math.floor(Date.now() / 1000);
  const dayAgo = now - 86400; // 24 hours ago
  
  let timeseriesData = null;
  try {
    timeseriesData = await fetchJson(`/public/coins/${s}/time-series/v2?interval=hour&start=${dayAgo}&end=${now}`);
  } catch (error) {
    console.warn(`Failed to fetch timeseries for ${s}:`, error);
  }
  
  return {
    asset: assetData,
    topic: topicData,
    timeseries: timeseriesData,
    timestamp: now
  };
}

/**
 * Fetch detailed creator profile information including topic influence and metrics.
 * This provides comprehensive data about a specific creator's impact and reach.
 *
 * @param network Social network (e.g., "twitter", "youtube")
 * @param creatorId Creator's unique identifier (e.g., "theunipcs")
 */
export async function getCreatorProfile(network: string, creatorId: string) {
  const n = String(network).toLowerCase();
  const id = String(creatorId).toLowerCase();
  return await fetchJson(`/public/creator/${n}/${id}/v1`);
}

/**
 * Fetch creator time series data for historical analysis and trend visualization.
 * This provides hourly metrics over a configurable time period.
 *
 * @param network Social network (e.g., "twitter", "youtube")
 * @param creatorId Creator's unique identifier (e.g., "theunipcs")
 * @param interval Time interval ("1w" for 1 week, "1m" for 1 month)
 */
export async function getCreatorTimeSeries(network: string, creatorId: string, interval: string = "1w") {
  const n = String(network).toLowerCase();
  const id = String(creatorId).toLowerCase();
  const params = new URLSearchParams({ interval });
  return await fetchJson(`/public/creator/${n}/${id}/time-series/v1?${params.toString()}`);
}

/**
 * Fetch creator posts from LunarCrush API
 * @param network Social network (e.g., "twitter", "youtube")
 * @param creatorId Creator's unique identifier (e.g., "theunipcs")
 * @param limit Maximum number of posts to return. Defaults to 200.
 * @param start Unix timestamp to start from (optional, defaults to 30 days ago)
 * @returns Promise with creator posts data
 */
export async function getCreatorPosts(network: string, creatorId: string, limit: number = 200, start?: number) {
  const n = String(network).toLowerCase();
  const id = String(creatorId).toLowerCase();
  
  // If no start time provided, default to 30 days ago to get more posts
  const startTime = start || Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
  
  const params = new URLSearchParams();
  params.set('start', startTime.toString());
  // Note: LunarCrush creator posts endpoint doesn't accept limit parameter
  
  const raw = await fetchJson(`/public/creator/${n}/${id}/posts/v1?${params.toString()}`);
  const items = unwrapArray(raw);
  return items.slice(0, limit);
}

/**
 * Get topic news from LunarCrush API
 * @param topic - The topic to fetch news for (e.g., 'bonk', 'solana')
 * @returns Promise with news data
 */
export async function getTopicNews(topic: string) {
  try {
    console.log('🚀 Calling LunarCrush API for topic:', topic)
    console.log('🔑 API Base:', process.env.LUNARCRUSH_API_BASE)
    console.log('🔑 API Key exists:', !!process.env.LUNARCRUSH_API_KEY)
    
    const response = await fetch(
      `${process.env.LUNARCRUSH_API_BASE}/public/topic/${topic}/news/v1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 43200 }, // Cache for 12 hours (43200 seconds)
      }
    );

    console.log('📡 LunarCrush response status:', response.status)
    console.log('📡 LunarCrush response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      throw new Error(`LunarCrush API error: ${response.status}`)
    }

    const data = await response.json();
    console.log('📰 LunarCrush response data:', JSON.stringify(data, null, 2))
    return data;
  } catch (error) {
    console.error('❌ Error fetching topic news:', error)
    throw error
  }
}

export async function getTopicData(topic: string) {
  const url = `${API_BASE}/public/topic/${topic}/v1`
  
  try {
    console.log(`🔍 Fetching topic data for: ${topic}`)
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`LunarCrush API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Topic data fetched successfully for ${topic}`)
    return data
  } catch (error) {
    console.error(`❌ Error fetching topic data for ${topic}:`, error)
    throw error
  }
}