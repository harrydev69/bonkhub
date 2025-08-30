import { getTopicNews } from "@/lib/lunarcrush";

/**
 * GET /api/news/[tokenId]
 *
 * Returns news data from LunarCrush for the specified token.
 */
export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const data = await getTopicNews(params.tokenId);
    return Response.json({ data });
  } catch (error: any) {
    const message = String(error?.message || "Failed to fetch news");
    return Response.json({ error: message }, { status: 500 });
  }
}