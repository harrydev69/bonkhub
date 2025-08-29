import { NextRequest, NextResponse } from "next/server";
import { apiCache, CacheKeys } from '@/lib/cache';

/**
 * Test endpoint to explore the new LunarCrush /topic/:topic/time-series/v2 endpoint
 * This will help us understand what data structure and fields are available
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LUNARCRUSH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "LUNARCRUSH_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Test with BONK topic
    const topic = "bonk";
    
    // Define time range configurations using bucket parameter
    const timeRanges = {
      "1h": { bucket: "hour", description: "Last hour data" },
      "24h": { bucket: "hour", description: "Last 24 hours data" },
      "7d": { bucket: "day", description: "Last 7 days data" },
      "30d": { bucket: "day", description: "Last 30 days data" }
    };
    
    const selectedRange = timeRanges[timeRange as keyof typeof timeRanges] || timeRanges["24h"];
    
    // Generate cache key
    const cacheKey = CacheKeys.lunarCrushTopic(topic, timeRange);
    
    // Get TTL based on time range (more responsive caching)
    const getTTL = (range: string) => {
      switch (range) {
        case '1h': return 1 * 60 * 1000 // 1 minute - very fresh data needed
        case '24h': return 2 * 60 * 1000 // 2 minutes - still quite fresh  
        case '7d': return 5 * 60 * 1000 // 5 minutes - moderate freshness
        case '30d': return 10 * 60 * 1000 // 10 minutes - longer term data can be cached longer
        default: return 2 * 60 * 1000
      }
    };

    // Use cache with loader function
    const result = await apiCache.cached(
      cacheKey,
      async () => {
        // Use the selected time range configuration
        console.log(`🔍 [CACHE MISS] Testing LunarCrush /topic/${topic}/time-series/v2 with bucket=${selectedRange.bucket}`);
        
        // Build URL with bucket parameter and time constraints
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        
        let url = `https://lunarcrush.com/api4/public/topic/${topic}/time-series/v2?bucket=${selectedRange.bucket}`;
        
        // Add time constraints based on the selected range
        if (timeRange === "1h") {
          const oneHourAgo = now - (60 * 60); // 1 hour ago
          url += `&start=${oneHourAgo}&end=${now}`;
          console.log(`🔍 Time constraint: Last 1 hour (${new Date(oneHourAgo * 1000).toISOString()} to ${new Date(now * 1000).toISOString()})`);
        } else if (timeRange === "24h") {
          const oneDayAgo = now - (24 * 60 * 60); // 24 hours ago
          url += `&start=${oneDayAgo}&end=${now}`;
          console.log(`🔍 Time constraint: Last 24 hours (${new Date(oneDayAgo * 1000).toISOString()} to ${new Date(now * 1000).toISOString()})`);
        } else if (timeRange === "7d") {
          const sevenDaysAgo = now - (7 * 24 * 60 * 60); // 7 days ago
          url += `&start=${sevenDaysAgo}&end=${now}`;
          console.log(`🔍 Time constraint: Last 7 days (${new Date(sevenDaysAgo * 1000).toISOString()} to ${new Date(now * 1000).toISOString()})`);
        } else if (timeRange === "30d") {
          const thirtyDaysAgo = now - (30 * 24 * 60 * 60); // 30 days ago
          url += `&start=${thirtyDaysAgo}&end=${now}`;
          console.log(`🔍 Time constraint: Last 30 days (${new Date(thirtyDaysAgo * 1000).toISOString()} to ${new Date(now * 1000).toISOString()})`);
        }
        
        console.log(`🔍 Final URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`📡 Response status:`, response.status);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

        const results: any = {};
        let data: any = null;
        
        if (response.ok) {
          data = await response.json();
          console.log(`📊 Data received: ${data.data?.length || 0} data points`);
          console.log(`🔍 Requested bucket: ${selectedRange.bucket}, Actual data points: ${data.data?.length || 0}`);
          console.log(`🔍 First timestamp: ${data.data?.[0]?.time ? new Date(data.data[0].time * 1000).toISOString() : 'N/A'}`);
          console.log(`🔍 Last timestamp: ${data.data?.[data.data.length - 1]?.time ? new Date(data.data[data.data.length - 1].time * 1000).toISOString() : 'N/A'}`);
          
          // Log the actual fields available in the first data point
          if (data.data && data.data.length > 0) {
            console.log(`🔍 Available fields in topic data:`, Object.keys(data.data[0]));
            console.log(`🔍 Sample topic data point:`, data.data[0]);
          }
          
          results.hour = data; // Always use 'hour' key for consistency
        } else {
          const errorText = await response.text();
          console.error(`❌ Error:`, response.status, errorText);
          results.hour = { error: `${response.status}: ${errorText}` };
        }

        return {
          message: "LunarCrush v2 timeseries test completed",
          results: {
            hour: {
              config: data?.config,
              data: data?.data
            }
          },
          timestamp: new Date().toISOString(),
          timeRange,
          selectedRange,
          dataPoints: data?.data?.length || 0,
          bucket: selectedRange.bucket,
          cached: false
        };
      },
      { ttl: getTTL(timeRange) }
    );

    // Add cache hit indicator
    const response = {
      ...result,
      cached: result.cached !== false,
      timestamp: result.timestamp || new Date().toISOString()
    };

    if (response.cached) {
      console.log(`💾 [CACHE HIT] Served topic ${topic}:${timeRange} from cache`);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Error testing LunarCrush v2 timeseries:", error);
    return NextResponse.json(
      { error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
