import { NextResponse } from "next/server";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = (process.env.LUNARCRUSH_API_BASE || "https://lunarcrush.com/api4").replace(/\/+$/, "");
const API_KEY = process.env.LUNARCRUSH_API_KEY || "";

function buildHeaders(): Headers {
  const headers = new Headers();
  headers.set("accept", "application/json");
  if (API_KEY) {
    headers.set("authorization", `Bearer ${API_KEY}`);
    headers.set("x-api-key", API_KEY);
  }
  return headers;
}

async function fetchLunarCrushJson<T = any>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const reason = text || response.statusText || "Request failed";
    const error = new Error(`LunarCrush ${response.status} on ${path} — ${reason.slice(0, 300)}`);
    (error as any).status = response.status;
    throw error;
  }

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const url = new URL(req.url);
    const bucket = (url.searchParams.get("interval") as "hour" | "day") ?? "hour";
    const dataSource = url.searchParams.get("source") ?? "coins"; // "coins" or "topics"

    const rawPoints = Number(url.searchParams.get("points") ?? "24");
    // Clamp points (keep API light and within rate caps)
    const points = Number.isFinite(rawPoints)
      ? Math.max(1, Math.min(bucket === "day" ? 90 : 168, rawPoints))
      : 24;

    const now = Math.floor(Date.now() / 1000);
    const secondsPer = bucket === "day" ? 86_400 : 3_600;
    const start = now - points * secondsPer;
    const end = now;

    const cacheKey = `timeseries:${tokenId.toUpperCase()}:${dataSource}:${bucket}:${points}`;

    const series = await cached(cacheKey, 60_000, async () => {
      let lastErr: unknown;
      
      for (let i = 0; i < 3; i++) {
        try {
          let rawData: any;
          
          if (dataSource === "topics") {
            // Call LunarCrush topics endpoint: /public/topic/{topic}/time-series/v2
            const topicPath = `/public/topic/${tokenId.toLowerCase()}/time-series/v2?interval=${bucket}&start=${start}&end=${end}`;
            rawData = await fetchLunarCrushJson(topicPath);
          } else {
            // Call LunarCrush coins endpoint: /public/coins/{symbol}/time-series/v2  
            const coinsPath = `/public/coins/${tokenId.toUpperCase()}/time-series/v2?interval=${bucket}&start=${start}&end=${end}`;
            rawData = await fetchLunarCrushJson(coinsPath);
          }
          
          // Ensure we limit to the exact number of requested points
          if (rawData && rawData.data && Array.isArray(rawData.data)) {
            // Sort by time descending (most recent first) and take only the requested number of points
            const sortedData = rawData.data.sort((a: any, b: any) => b.time - a.time);
            const limitedData = sortedData.slice(0, points);
            
            console.log(`📊 LunarCrush returned ${rawData.data.length} points, limited to ${limitedData.length} points for ${tokenId} (${bucket}, ${points} requested)`);
            
            return {
              ...rawData,
              data: limitedData
            };
          }
          
          return rawData;
        } catch (e: any) {
          lastErr = e;
          const msg = String(e?.message ?? e);
          
          // Handle rate limiting
          if (msg.includes("429")) {
            await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
            continue;
          }
          break;
        }
      }
      
      if (lastErr) throw lastErr;
      
      // Final fallback attempt
      let rawData: any;
      if (dataSource === "topics") {
        const topicPath = `/public/topic/${tokenId.toLowerCase()}/time-series/v2?interval=${bucket}&start=${start}&end=${end}`;
        rawData = await fetchLunarCrushJson(topicPath);
      } else {
        const coinsPath = `/public/coins/${tokenId.toUpperCase()}/time-series/v2?interval=${bucket}&start=${start}&end=${end}`;
        rawData = await fetchLunarCrushJson(coinsPath);
      }
      
      // Apply the same limiting logic for fallback
      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        const sortedData = rawData.data.sort((a: any, b: any) => b.time - a.time);
        const limitedData = sortedData.slice(0, points);
        
        return {
          ...rawData,
          data: limitedData
        };
      }
      
      return rawData;
    });

    return NextResponse.json(
      { 
        timeseries: series,
        metadata: {
          tokenId: tokenId,
          dataSource: dataSource,
          interval: bucket,
          requestedPoints: points,
          actualDataPoints: series?.data?.length || 0,
          timeRange: `${start} - ${end}`,
          limitingApplied: series?.data?.length === points
        }
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error(`GET /api/sentiment/${(await params).tokenId}/timeseries error:`, err);
    const message = String(err?.message ?? "Timeseries failed");
    const status = /429/.test(message) ? 503 : /401/.test(message) ? 401 : 500;
    
    return NextResponse.json(
      { 
        error: message,
        tokenId: (await params).tokenId,
        timestamp: new Date().toISOString()
      }, 
      { status }
    );
  }
}
