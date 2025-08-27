import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const runtime = 'edge'

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
})

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema),
  stream: z.boolean().optional(),
  context: z.object({
    price: z.string(),
    change24h: z.string(),
    volume24h: z.string(),
    sentiment: z.string(),
  }).optional(),
})


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = chatRequestSchema.parse(body)
    const { messages, stream = false, context } = validated

    // Fetch BONK ecosystem data from internal APIs
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      : 'http://localhost:3000'

    const [chartRes, marketsRes, overviewRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/bonk/chart?tf=24h`),
      fetch(`${baseUrl}/api/bonk/markets/enhanced`),
      fetch(`${baseUrl}/api/bonk/overview`)
    ])

    // Parse responses safely
    let chartData = null
    let marketsData = null
    let overviewData = null

    if (chartRes.status === 'fulfilled' && chartRes.value.ok) {
      chartData = await chartRes.value.json()
    }

    if (marketsRes.status === 'fulfilled' && marketsRes.value.ok) {
      marketsData = await marketsRes.value.json()
    }

    if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
      overviewData = await overviewRes.value.json()
    }

    // Build comprehensive ecosystem context
    const ecosystemContext = {
      price: overviewData?.price || chartData?.currentPrice || context?.price || 'N/A',
      change24h: overviewData?.change24h || context?.change24h || 'N/A',
      volume24h: overviewData?.volume24h || chartData?.currentVolume || context?.volume24h || 'N/A',
      marketCap: overviewData?.marketCap || chartData?.currentMarketCap || 'N/A',
      rank: overviewData?.rank || 'N/A',
      // Additional chart data
      chartChangePercent: chartData?.summary?.changePercent || 'N/A',
      highestPrice: chartData?.summary?.highestPrice || 'N/A',
      lowestPrice: chartData?.summary?.lowestPrice || 'N/A',
      totalChartVolume: chartData?.summary?.totalVolume || 'N/A',
      // Markets data
      totalVenues: marketsData?.summary?.totalVenues || 'N/A',
      totalMarketsVolume: marketsData?.summary?.totalVolume || 'N/A',
      averageSpread: marketsData?.summary?.averageSpread || 'N/A',
      uniqueExchanges: marketsData?.summary?.uniqueExchanges || 'N/A',
      averagePrice: marketsData?.summary?.averagePrice || 'N/A',
      // Overview additional data
      circulatingSupply: overviewData?.circulatingSupply || 'N/A',
      totalSupply: overviewData?.totalSupply || 'N/A',
      maxSupply: overviewData?.maxSupply || 'N/A',
      ath: overviewData?.ath || {},
      atl: overviewData?.atl || {},
      // Performance data
      performance: overviewData?.changePct || {},
      sentiment: context?.sentiment || 'N/A'
    }

    // Add context as system message
    const enhancedMessages = [...messages]
    const systemMessage = {
      role: "system" as const,
      content: `You are BONK AI Assistant. Here is the current BONK ecosystem data:

**Price & Market Data:**
- Current Price: $${ecosystemContext.price}
- 24h Change: ${ecosystemContext.change24h}%
- 24h Volume: $${ecosystemContext.volume24h?.toLocaleString()}
- Market Cap: $${ecosystemContext.marketCap?.toLocaleString()}
- Market Cap Rank: ${ecosystemContext.rank}

**Chart Analytics (24h):**
- Price Change %: ${ecosystemContext.chartChangePercent}%
- Highest Price: $${ecosystemContext.highestPrice}
- Lowest Price: $${ecosystemContext.lowestPrice}
- Total Volume: $${ecosystemContext.totalChartVolume?.toLocaleString()}

**Markets Overview:**
- Total Trading Venues: ${ecosystemContext.totalVenues}
- Total Markets Volume: $${ecosystemContext.totalMarketsVolume?.toLocaleString()}
- Average Spread: ${ecosystemContext.averageSpread}%
- Unique Exchanges: ${ecosystemContext.uniqueExchanges}
- Average Price Across Markets: $${ecosystemContext.averagePrice}

**Supply Information:**
- Circulating Supply: ${ecosystemContext.circulatingSupply?.toLocaleString()}
- Total Supply: ${ecosystemContext.totalSupply?.toLocaleString()}
- Max Supply: ${ecosystemContext.maxSupply?.toLocaleString()}

**Historical Data:**
- All-Time High: $${ecosystemContext.ath?.price} (${ecosystemContext.ath?.changePct}% from ATH)
- All-Time Low: $${ecosystemContext.atl?.price} (${ecosystemContext.atl?.changePct}% from ATL)

**Performance Changes:**
- 1h: ${ecosystemContext.performance?.h1}%
- 7d: ${ecosystemContext.performance?.d7}%
- 30d: ${ecosystemContext.performance?.d30}%
- 1y: ${ecosystemContext.performance?.y1}%

**Sentiment:** ${ecosystemContext.sentiment}

Provide insights about BONK prices, sentiment, trading volume, market data, and ecosystem developments. Be helpful and accurate. Use the provided data to give context-aware responses.
Keep your response under 300 words and focus on actionable insights.
Do not regurgitate the context data; synthesize it into a coherent summary, focusing on the key takeaways and actionable insights.

Format your summary into sections of:
1. Headline: A concise summary of the current market performance and key metrics.
2. Signals: A summary of recent price movements and trends.
3. Sentiment: A summary of social sentiment and community engagement.
4. Actionable Insights: Key takeaways and recommendations based on the analysis.

at all cost avoid writing out mathematical expressions like Aonhourlydipsunder, suggestsaggressiverotationratherthancapitulation

speak normally like a human expert in economics and finance would, especially in cryptocurrency, maintain a wam academic tone but also be engaging and easy to read for a broad audience.

Avoid just giving out raw data; instead, interpret and analyze the information to provide valuable insights for traders and investors.
`,
    }
    enhancedMessages.unshift(systemMessage)

    const jatevoPayload = {
      model: "moonshotai/kimi-k2-instruct",
      messages: enhancedMessages,
      stream: true,
      stop: [],
      top_p: 1,
      max_tokens: 1000,
      temperature: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
    }

    const apiKey = process.env.JATEVO_API_KEY
    if (!apiKey) {
      throw new Error("JATEVO_API_KEY environment variable is not set")
    }

    const jatevoResponse = await fetch("https://inference.jatevo.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(jatevoPayload),
    })

    if (!jatevoResponse.ok) {
      const errorText = await jatevoResponse.text()
      throw new Error(`Jatevo API error: ${jatevoResponse.status} ${errorText}`)
    }

    if (stream) {
      const readableStream = new ReadableStream({
        async start(controller) {
          if (jatevoResponse.body) {
            const reader = jatevoResponse.body.getReader()
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) {
                  break
                }
                controller.enqueue(value)
              }
            } catch (error) {
              console.error("Error while reading stream:", error)
              controller.error(error)
            } finally {
              controller.close()
            }
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      })
    }

    return NextResponse.json(await jatevoResponse.json())
  } catch (error) {
    console.error("Chat API error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request format", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
