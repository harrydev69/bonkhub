import { NextResponse } from "next/server";
import { 
  getComprehensiveAssetData
} from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fallback data when LunarCrush API is not available
function getFallbackData() {
  return {
    overall_sentiment: {
      label: "neutral",
      percentage: 50,
      score: 50
    },
    social_volume: {
      mentions_24h: 1250,
      trend: "stable"
    },
    engagement_score: {
      value: 65,
      max: 100,
      description: "Higher = stronger community reaction"
    },
    viral_score: {
      value: 72,
      max: 100,
      description: "Galaxy Score™"
    },
    galaxy_score: {
      value: 78,
      max: 100,
      description: "LunarCrush proprietary asset health metric"
    },
    additional_metrics: {
      correlation_rank: 45,
      alt_rank: 23,
      social_impact: 67
    },
    timestamp: Math.floor(Date.now() / 1000),
    data_source: "Fallback Data (API key required for real data)"
  };
}

export async function GET() {
  try {
    // Check if API key is available
    const apiKey = process.env.LUNARCRUSH_API_KEY;
    
    if (!apiKey) {
      console.warn("LUNARCRUSH_API_KEY not found, using fallback data");
      return NextResponse.json(
        { 
          data: getFallbackData(),
          warning: "API key not configured. Set LUNARCRUSH_API_KEY for real data."
        },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const comprehensiveData = await cached("comprehensive:BONK", 300_000, async () => {
      try {
        // Get comprehensive asset data (Galaxy Score, social metrics, etc.)
        // This uses only 3 API calls: coins, topic, and timeseries
        const assetData = await getComprehensiveAssetData("BONK");
        
        // Check if we got valid data
        if (!assetData || !assetData.asset) {
          console.warn("No valid asset data received, using fallback");
          return getFallbackData();
        }
        
        // Calculate derived metrics from the consolidated data
        const engagementScore = Math.min(Math.max(assetData.asset?.social_score || 0, 0), 100);
        const viralScore = Math.min(Math.max(assetData.asset?.galaxy_score || 0, 0), 100);
        
        // Extract key metrics from asset data
        const galaxyScore = assetData.asset?.galaxy_score || 0;
        const socialVolume = assetData.topic?.social_volume || assetData.asset?.social_volume || 0;
        const socialScore = assetData.asset?.social_score || 0;
        const correlationRank = assetData.asset?.correlation_rank || 0;
        const altRank = assetData.asset?.alt_rank || 0;
        
        // If all values are 0, use fallback data
        if (socialScore === 0 && socialVolume === 0 && galaxyScore === 0) {
          console.warn("All API values are 0, using fallback data");
          return getFallbackData();
        }
        
        // Calculate overall sentiment percentage
        let sentimentPercentage = 50; // Default neutral
        if (socialScore > 0) {
          // Normalize social score to 0-100 percentage
          sentimentPercentage = Math.min(Math.max((socialScore / 100) * 100, 0), 100);
        }
        
        // Determine sentiment label
        let sentimentLabel = "neutral";
        if (sentimentPercentage > 60) sentimentLabel = "positive";
        else if (sentimentPercentage < 40) sentimentLabel = "negative";
        
        return {
          overall_sentiment: {
            label: sentimentLabel,
            percentage: Math.round(sentimentPercentage),
            score: socialScore
          },
          social_volume: {
            mentions_24h: socialVolume,
            trend: assetData.timeseries ? "stable" : "unknown"
          },
          engagement_score: {
            value: engagementScore,
            max: 100,
            description: "Higher = stronger community reaction"
          },
          viral_score: {
            value: viralScore,
            max: 100,
            description: "Galaxy Score™"
          },
          galaxy_score: {
            value: galaxyScore,
            max: 100,
            description: "LunarCrush proprietary asset health metric"
          },
          additional_metrics: {
            correlation_rank: correlationRank,
            alt_rank: altRank,
            social_impact: assetData.asset?.social_impact || 0
          },
          timestamp: assetData.timestamp,
          data_source: "LunarCrush v4 API"
        };
        
      } catch (e: any) {
        const msg = String(e?.message ?? e);
        console.warn("API call failed, using fallback data:", msg);
        
        // Always use fallback data on any error
        return getFallbackData();
      }
    });

    return NextResponse.json(
      { data: comprehensiveData },
      {
        headers: {
          "Cache-Control": "public, max-age=10, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/sentiment/bonk/comprehensive error:", err);
    
    // Return fallback data on error
    return NextResponse.json(
      { 
        data: getFallbackData(),
        error: "API error, using fallback data",
        details: String(err?.message ?? "Unknown error")
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }
}
