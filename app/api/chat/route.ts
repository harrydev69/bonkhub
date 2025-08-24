import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, stream, context } = await request.json()

    // Mock AI response for now - you can integrate with your preferred AI service
    const mockResponse = {
      choices: [
        {
          message: {
            content: `I'm analyzing the BONK ecosystem data. Based on the current context:
          
• Price: ${context?.price || "$0.000000"}
• 24h Change: ${context?.change24h || "+0.00%"}
• Volume: ${context?.volume24h || "$0"}
• Sentiment: ${context?.sentiment || "neutral"}

How can I help you with BONK analytics today? I can provide insights on price movements, market sentiment, trading patterns, and ecosystem developments.`,
          },
        },
      ],
    }

    if (stream) {
      // Return streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const content = mockResponse.choices[0].message.content
          const words = content.split(" ")

          let index = 0
          const interval = setInterval(() => {
            if (index < words.length) {
              const chunk = {
                choices: [
                  {
                    delta: {
                      content: words[index] + " ",
                    },
                  },
                ],
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
              index++
            } else {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              controller.close()
              clearInterval(interval)
            }
          }, 50)
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
