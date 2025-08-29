import { NextResponse } from "next/server"
import { getCoinFeeds, getCoinInfluencers } from "@/lib/lunarcrush"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1", 10)
    const perPage = parseInt(url.searchParams.get("perPage") || "10", 10)
    const sentiment = url.searchParams.get("sentiment") // all, positive, negative, neutral

    console.log(`🔍 Fetching social feed - page: ${page}, perPage: ${perPage}, sentiment: ${sentiment || 'all'}`)

    // Get feeds from BONK, Solana, and top BONK influencers for comprehensive coverage
    const [bonkFeeds, solanaFeeds, bonkInfluencers] = await Promise.all([
      getCoinFeeds("BONK", 300),
      getCoinFeeds("SOL", 300),
      getCoinInfluencers("BONK", 10) // Get top 10 BONK influencers
    ])

    // Get posts from top influencers (enhanced matching)
    const influencerNames = new Set(bonkInfluencers.map((inf: any) => inf.creator_name?.toLowerCase()));
    const influencerPosts = bonkFeeds.filter((post: any) => {
      const postCreatorName = post.creator_name?.toLowerCase() || '';
      return influencerNames.has(postCreatorName);
    });

    console.log(`🌟 Found ${influencerPosts.length} posts from top influencers: ${Array.from(influencerNames).slice(0, 5).join(', ')}...`);

    // Combine all posts: influencer posts get priority, then general feeds
    const prioritizedPosts = [
      ...influencerPosts, // Influencer posts first (higher quality)
      ...bonkFeeds.filter((post: any) => !influencerPosts.some(ip => ip.id === post.id)), // Non-influencer BONK posts
      ...solanaFeeds // Solana ecosystem posts
    ];

    // Remove duplicates and sort by creation time (newest first)
    const seenIds = new Set();
    const allPosts = prioritizedPosts
      .filter((post: any) => {
        if (seenIds.has(post.id)) return false;
        seenIds.add(post.id);
        return true;
      })
      .sort((a, b) => (b.post_created || 0) - (a.post_created || 0))

    console.log(`📝 Total posts: BONK(${bonkFeeds.length}) + SOL(${solanaFeeds.length}) + Influencers(${influencerPosts.length}) = ${allPosts.length} unique posts`)

    // Transform to match frontend interface
    const transformedPosts = allPosts.map((post: any) => {
      // Check if this post is from a top influencer
      const isFromInfluencer = influencerPosts.some(ip => ip.id === post.id);
      const isHighFollower = post.creator_followers > 10000;

      // Enhanced interaction breakdown - use real data when available
      const totalInteractions = post.interactions_total || post.interactions_24h || 0;
      
      // For influencers: use more sophisticated breakdown, for others: basic estimation
      let likes, retweets, comments;
      
      if (isFromInfluencer && totalInteractions > 0) {
        // Influencers typically get higher engagement ratios
        likes = Math.floor(totalInteractions * 0.6);      // 60% likes
        retweets = Math.floor(totalInteractions * 0.25);  // 25% retweets  
        comments = Math.floor(totalInteractions * 0.15);  // 15% comments
      } else if (totalInteractions > 0) {
        // General posts: standard breakdown
        likes = Math.floor(totalInteractions * 0.5);      // 50% likes
        retweets = Math.floor(totalInteractions * 0.3);   // 30% retweets
        comments = Math.floor(totalInteractions * 0.2);   // 20% comments
      } else {
        // No interaction data available
        likes = 0;
        retweets = 0;
        comments = 0;
      }

      // Determine sentiment with better thresholds
      let sentiment = "neutral";
      const sentimentScore = post.post_sentiment || 0;
      if (sentimentScore > 2.5) sentiment = "positive";      // LunarCrush uses 1-5 scale
      else if (sentimentScore < 2.0) sentiment = "negative";

      return {
        id: post.id,
    author: {
          name: post.creator_display_name || post.creator_name || "Creator",
          username: post.creator_name || "unknown", 
          avatar: post.creator_avatar || "",
          verified: isHighFollower,
          isInfluencer: isFromInfluencer
        },
        content: post.post_title || post.post_text || "",
        timestamp: new Date(post.post_created * 1000).toLocaleString(),
        platform: post.post_type || "social",
        sentiment: sentiment as "positive" | "negative" | "neutral",
    engagement: {
          likes,
          retweets,
          comments,
          followers: post.creator_followers || 0,
          interactions: totalInteractions
        },
        url: post.post_link || "",
        priority: isFromInfluencer ? "influencer" : "general"
      }
    })

    // Apply sentiment filter if specified
    const filteredPosts = sentiment && sentiment !== "all" 
      ? transformedPosts.filter(post => post.sentiment === sentiment)
      : transformedPosts

    // Apply pagination
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

    console.log(`✅ Returning ${paginatedPosts.length} posts for page ${page} (${startIndex}-${endIndex})`)

    return NextResponse.json({
      success: true,
      posts: paginatedPosts,
      total: filteredPosts.length,
      page,
      perPage,
      totalPages: Math.ceil(filteredPosts.length / perPage),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Social feed API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch social feed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
