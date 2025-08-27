import { getCoinFeeds } from "@/lib/lunarcrush";

/**
 * GET /api/feeds/[tokenId]
 *
 * Returns the most recent social posts for the specified token from LunarCrush. An optional
 * `limit` query parameter may be provided but is clamped to the range
 * 1‑200 to avoid excessive payloads. When no limit is specified the
 * default of 50 is used. Results are sliced client‑side because the
 * LunarCrush v4 feed endpoint does not reliably honour the limit on the
 * server.
 */
export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const url = new URL(req.url);
    const rawLimit = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.max(1, Math.min(200, isFinite(rawLimit) ? rawLimit : 50));

    const feeds = await getCoinFeeds(params.tokenId, limit);
    return Response.json({ feeds });
  } catch (error: any) {
    const message = String(error?.message || "Failed to fetch feeds");
    return Response.json({ error: message }, { status: 500 });
  }
}