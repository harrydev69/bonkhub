import { NextRequest, NextResponse } from "next/server";
import { getCreatorPosts, getCoinFeeds } from "@/lib/lunarcrush";

export async function GET(
  request: NextRequest,
  { params }: { params: { network: string; creatorId: string } }
) {
  try {
    const { network, creatorId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage") || "3", 10);
    const limit = parseInt(url.searchParams.get("limit") || "200", 10);
    const start = url.searchParams.get("start") ? parseInt(url.searchParams.get("start")!, 10) : undefined;

    console.log(`🔍 Fetching creator posts for ${network}/${creatorId} with start: ${start || 'default (30 days ago)'}`);

    // Get creator posts using the simple, direct approach
    const creatorPosts = await getCreatorPosts(network, creatorId, 200, start);
    
    console.log(`📝 Creator posts received: ${Array.isArray(creatorPosts) ? creatorPosts.length : 0}`);

    if (Array.isArray(creatorPosts) && creatorPosts.length > 0) {
      // Sort by creation time (newest first)
      const sortedPosts = creatorPosts.sort((a, b) => (b.post_created || 0) - (a.post_created || 0));
      
      // Remove duplicates by ID
      const uniquePosts = [];
      const seenIds = new Set();
      
      for (const post of sortedPosts) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          uniquePosts.push(post);
        }
      }
      
      console.log(`📝 Unique posts after deduplication: ${uniquePosts.length}`);

      // Get feeds data for interaction enhancement
      const feedsData = await getCoinFeeds("BONK", 500);
      
      // Enhance posts with interaction data
      const enhancedPosts = uniquePosts.map((post: any) => {
        const matchingFeed = feedsData.find((feed: any) => 
          feed.post_link === post.post_link || feed.id === post.id
        );

        if (matchingFeed) {
          const totalInteractions = matchingFeed.interactions_total || 0;
          const estimatedRetweets = Math.floor(totalInteractions * 0.3);
          const estimatedReplies = Math.floor(totalInteractions * 0.2);
          const estimatedLikes = totalInteractions - estimatedRetweets - estimatedReplies;

          return {
            ...post,
            likes: estimatedLikes,
            retweets: estimatedRetweets,
            replies: estimatedReplies,
            interactions_total: matchingFeed.interactions_total || 0,
            interactions_24h: matchingFeed.interactions_24h || 0,
          };
        }

        return {
          ...post,
          likes: 0,
          retweets: 0,
          replies: 0,
          interactions_total: 0,
          interactions_24h: 0,
        };
      });

      // Apply pagination
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedPosts = enhancedPosts.slice(startIndex, endIndex);

      console.log(`✅ Returning page ${page}: ${paginatedPosts.length} posts from ${enhancedPosts.length} total`);

      return NextResponse.json({
        data: paginatedPosts,
        total: enhancedPosts.length,
        page,
        perPage,
        totalPages: Math.ceil(enhancedPosts.length / perPage)
      });
    }



    // Final fallback
    console.log(`❌ No data found for creator ${creatorId}`);
    return NextResponse.json({
      data: [],
      total: 0,
      page,
      perPage,
      totalPages: 0
    });
  } catch (error) {
    console.error(`❌ Error fetching creator posts for ${params.network}/${params.creatorId}:`, error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch creator posts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
