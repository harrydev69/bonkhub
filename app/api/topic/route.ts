import { getTopicData } from "@/lib/lunarcrush";

/**
 * GET /api/topic
 *
 * Returns topic data from LunarCrush for the specified topic. The topic
 * must be provided as a query parameter.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic");

    if (!topic) {
      return Response.json({ error: "Topic parameter is required" }, { status: 400 });
    }

    const data = await getTopicData(topic);
    return Response.json({ data });
  } catch (error: any) {
    const message = String(error?.message || "Failed to fetch topic data");
    return Response.json({ error: message }, { status: 500 });
  }
}