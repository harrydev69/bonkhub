import { NextResponse } from "next/server";
import { getTopicData } from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const key = `topic-keywords:bonk`;

    const data = await cached(key, 300_000, async () => { // 5 minute cache
      // Fetch BONK topic data which includes trending keywords
      const topicData = await getTopicData("bonk");
      
      // Extract keywords/topics from the response
      // The topic endpoint usually returns trending keywords, hashtags, and related terms
      return topicData;
    });

    return NextResponse.json(
      { 
        data,
        source: "topic-bonk-v1",
        timestamp: Date.now()
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/sentiment/bonk/topic-keywords error:", err);
    const message = String(err?.message ?? "Topic keywords failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
