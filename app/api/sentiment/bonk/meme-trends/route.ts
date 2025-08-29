import { NextResponse } from "next/server";
import { getMemeCoins } from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const key = `meme-trends:bonk`;

    const data = await cached(key, 300_000, async () => { // 5 minute cache
      // Fetch all meme coins data
      const raw = await getMemeCoins();
      
      // Extract BONK data from the meme coins list
      const allMemes = Array.isArray(raw) ? raw : (raw?.data || []);
      const bonkData = allMemes.find((coin: any) => 
        coin.symbol?.toLowerCase() === 'bonk' || 
        coin.name?.toLowerCase().includes('bonk')
      );

      if (!bonkData) {
        throw new Error("BONK data not found in meme coins list");
      }

      return bonkData;
    });

    return NextResponse.json(
      { 
        data,
        source: "meme-coins-list",
        timestamp: Date.now()
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/sentiment/bonk/meme-trends error:", err);
    const message = String(err?.message ?? "Meme trends failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
