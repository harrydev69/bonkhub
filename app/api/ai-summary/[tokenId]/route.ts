import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;

  if (!tokenId) {
    return NextResponse.json(
      { error: "Token ID is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.JATEVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch comprehensive context data in parallel
    const [
      tokenStatsResponse,
      influencersResponse,
      feedsResponse,
      newsResponse,
      priceChartResponse
    ] = await Promise.allSettled([
      fetch(`${request.nextUrl.origin}/api/coingecko/token/${tokenId}`),
      fetch(`${request.nextUrl.origin}/api/influencers/${tokenId}?limit=10`),
      fetch(`${request.nextUrl.origin}/api/feeds/${tokenId}?limit=20`),
      fetch(`${request.nextUrl.origin}/api/news/${tokenId}`),
      fetch(`${request.nextUrl.origin}/api/coingecko/token/${tokenId}?days=7`)
    ]);

    // Extract successful responses
    let tokenStats = null;
    let influencers = [];
    let socialPosts = [];
    let newsArticles = [];
    let priceChart = [];

    if (tokenStatsResponse.status === "fulfilled" && tokenStatsResponse.value.ok) {
      tokenStats = await tokenStatsResponse.value.json().catch(() => null);
    }

    if (influencersResponse.status === "fulfilled" && influencersResponse.value.ok) {
      const influencersData = await influencersResponse.value.json().catch(() => ({}));
      influencers = influencersData.influencers || [];
    }

    if (feedsResponse.status === "fulfilled" && feedsResponse.value.ok) {
      const feedsData = await feedsResponse.value.json().catch(() => ({}));
      socialPosts = feedsData.feeds || feedsData.data || [];
    }

    if (newsResponse.status === "fulfilled" && newsResponse.value.ok) {
      const newsData = await newsResponse.value.json().catch(() => ({}));
      newsArticles = newsData.data?.data || [];
    }

    if (priceChartResponse.status === "fulfilled" && priceChartResponse.value.ok) {
      const chartData = await priceChartResponse.value.json().catch(() => ({}));
      priceChart = chartData.chartData?.prices || [];
    }

    // Build comprehensive context
    const context = {
      tokenId: tokenId.toUpperCase(),
      tokenStats: tokenStats ? {
        price: tokenStats.market_data?.current_price?.usd,
        marketCap: tokenStats.market_data?.market_cap?.usd,
        volume24h: tokenStats.market_data?.total_volume?.usd,
        change24h: tokenStats.market_data?.price_change_percentage_24h,
        change7d: tokenStats.market_data?.price_change_percentage_7d_in_currency,
        rank: tokenStats.market_data?.market_cap_rank,
        circulatingSupply: tokenStats.market_data?.circulating_supply,
        totalSupply: tokenStats.market_data?.total_supply,
        ath: tokenStats.market_data?.ath?.usd,
        atl: tokenStats.market_data?.atl?.usd
      } : null,
      topInfluencers: influencers.slice(0, 5).map((inf: any) => ({
        name: inf.creator_name,
        followers: inf.creator_followers,
        interactions24h: inf.interactions_24h,
        platform: inf.creator_id?.startsWith("youtube::") ? "YouTube" :
                 inf.creator_id?.startsWith("twitter::") ? "Twitter" : "Other"
      })),
      recentSocialPosts: socialPosts.slice(0, 10).map((post: any) => ({
        title: post.post_title,
        sentiment: post.post_sentiment,
        created: post.post_created,
        creator: post.creator_name,
        interactions: post.interactions_24h
      })),
      recentNews: newsArticles.slice(0, 5).map((article: any) => ({
        title: article.title || article.post_title,
        source: article.source,
        sentiment: article.sentiment,
        timestamp: article.timestamp || article.post_created
      })),
      priceHistory: priceChart.slice(-7).map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price: price
      }))
    };

    // Create enhanced prompt with comprehensive context
    const prompt = `You are a cryptocurrency analyst providing a comprehensive summary for ${context.tokenId}.

CONTEXT DATA:
${context.tokenStats ? `
MARKET DATA:
- Current Price: $${context.tokenStats.price?.toFixed(6) || 'N/A'}
- 24h Change: ${context.tokenStats.change24h?.toFixed(2) || 'N/A'}%
- 7d Change: ${context.tokenStats.change7d?.toFixed(2) || 'N/A'}%
- Market Cap: $${(context.tokenStats.marketCap / 1e9)?.toFixed(2) || 'N/A'}B
- 24h Volume: $${(context.tokenStats.volume24h / 1e9)?.toFixed(2) || 'N/A'}B
- Rank: #${context.tokenStats.rank || 'N/A'}
- Circulating Supply: ${context.tokenStats.circulatingSupply?.toLocaleString() || 'N/A'}
- ATH: $${context.tokenStats.ath?.toFixed(6) || 'N/A'}
- ATL: $${context.tokenStats.atl?.toFixed(6) || 'N/A'}
` : 'Market data not available.'}

${context.topInfluencers.length > 0 ? `
TOP INFLUENCERS:
${context.topInfluencers.map((inf: any) => `- ${inf.name} (${inf.followers?.toLocaleString() || 0} followers, ${inf.interactions24h || 0} interactions/24h on ${inf.platform})`).join('\n')}
` : 'Influencer data not available.'}

${context.recentSocialPosts.length > 0 ? `
RECENT SOCIAL SENTIMENT:
${context.recentSocialPosts.map((post: any) => `- "${post.title}" (sentiment: ${post.sentiment || 'neutral'}, ${post.interactions || 0} interactions)`).join('\n')}
` : 'Social data not available.'}

${context.recentNews.length > 0 ? `
RECENT NEWS:
${context.recentNews.map((news: any) => `- ${news.title} (${news.source || 'Unknown'}, sentiment: ${news.sentiment || 'neutral'})`).join('\n')}
` : 'News data not available.'}

${context.priceHistory.length > 0 ? `
PRICE HISTORY (Last 7 Days):
${context.priceHistory.map((day: any) => `${day.date}: $${day.price?.toFixed(6) || 'N/A'}`).join('\n')}
` : 'Price history not available.'}

Based on all this data, provide a comprehensive analysis including:
1. Current market performance and key metrics
2. Recent price movements and trends
3. Social sentiment and community engagement
4. Influencer activity and reach
5. News impact and market context
6. Overall outlook and key takeaways

Keep your response under 300 words and focus on actionable insights.
Do not regurgitate the context data; synthesize it into a coherent summary, focusing on the key takeaways and actionable insights.

Format your summary into sections of:
1. Headline: A concise summary of the current market performance and key metrics.
2. Signals: A summary of recent price movements and trends.
3. Sentiment: A summary of social sentiment and community engagement.
4. Actionable Insights: Key takeaways and recommendations based on the analysis.

Avoid just giving out raw data; instead, interpret and analyze the information to provide valuable insights for traders and investors.
`;

    const response = await fetch("https://inference.jatevo.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-instruct",
        messages: [
          { role: "user", content: prompt }
        ],
        stop: [],
        stream: true,
        top_p: 1,
        max_tokens: 600,
        temperature: 0.7,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jatevo API error: ${response.status} - ${errorText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body reader available");
    }

    const decoder = new TextDecoder();
    let accumulatedContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              accumulatedContent += parsed.choices[0].delta.content;
            }
          } catch (e) {
            // Ignore parse errors for now
          }
        }
      }
    }

    if (!accumulatedContent) {
      throw new Error("No content received from streaming response");
    }

    return NextResponse.json({
      summary: accumulatedContent,
      tokenId,
      generatedAt: new Date().toISOString(),
      contextUsed: {
        hasTokenStats: !!context.tokenStats,
        influencerCount: context.topInfluencers.length,
        socialPostCount: context.recentSocialPosts.length,
        newsCount: context.recentNews.length,
        pricePoints: context.priceHistory.length
      }
    });
  }
  catch (error) {
    console.error("Error fetching AI summary:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
