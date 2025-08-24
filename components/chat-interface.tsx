"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, TrendingUp, DollarSign, BarChart3, MessageSquare } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

type ChatMsg = { role: "system" | "user" | "assistant"; content: string }

function stripThink(s: string) {
  let out = ""
  let inThink = false
  for (const seg of s.split(/(<\/?think>)/g)) {
    if (seg === "<Thinking>") {
      inThink = true
      continue
    }
    if (seg === "</Thinking>") {
      inThink = false
      continue
    }
    if (!inThink) out += seg
  }
  return out
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your BONK ecosystem AI assistant. Ask about prices, sentiment, trading volume, or the LetsBonk.fun ecosystem.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const quickActions = [
    { label: "BONK Price", icon: DollarSign, query: "What's the current BONK price and market analysis?" },
    { label: "Market Sentiment", icon: TrendingUp, query: "What's the current market sentiment for BONK?" },
    { label: "Trading Volume", icon: BarChart3, query: "Show me BONK's trading volume and activity" },
    { label: "Ecosystem Info", icon: MessageSquare, query: "Tell me about the BONK ecosystem and LetsBonk.fun" },
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const toApiHistory = (): ChatMsg[] => {
    const offset = messages.length && messages[0].sender === "ai" ? 1 : 0
    return messages.slice(offset).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content,
    }))
  }

  const handleSendMessage = async () => {
    const text = inputValue.trim()
    if (!text) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const userMessage: Message = {
      id: `${Date.now()}`,
      content: text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    const assistantId = `${Date.now() + 1}`
    setMessages((prev) => [...prev, { id: assistantId, content: "", sender: "ai", timestamp: new Date() }])

    try {
      const history: ChatMsg[] = [...toApiHistory(), { role: "user", content: text }]

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream: true,
          messages: history,
          context: {
            price: "$0.000000",
            change24h: "+0.00%",
            volume24h: "$0",
            sentiment: "neutral",
          },
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`chat ${res.status}`)

      const ct = res.headers.get("content-type") || ""

      if (!res.body || !ct.includes("text/event-stream")) {
        const json = await res.json().catch(() => null as any)
        const full = json?.choices?.[0]?.message?.content ?? ""
        const clean = stripThink(full || "")
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: clean, timestamp: new Date() } : m)),
        )
        setIsLoading(false)
        return
      }

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ""
      let acc = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })

        let i
        while ((i = buf.indexOf("\n\n")) !== -1) {
          const frame = buf.slice(0, i).trim()
          buf = buf.slice(i + 2)

          if (!frame.startsWith("data:")) continue
          const payload = frame.slice(5).trim()
          if (payload === "[DONE]") {
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, timestamp: new Date() } : m)))
            setIsLoading(false)
            return
          }
          try {
            const json = JSON.parse(payload)
            const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? ""
            if (!delta) continue

            const clean = stripThink(delta)
            if (!clean) continue

            acc += clean
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)))
          } catch {
            // ignore keepalives / non-JSON
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") return
      console.error("Chat error:", err)
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 2}`,
          sender: "ai",
          content: "Hmm, I couldn't reach the AI right now. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (query: string) => {
    setInputValue(query)
    setTimeout(() => handleSendMessage(), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700 shadow-[0_0_20px_rgba(255,107,53,0.1)] hover:shadow-[0_0_30px_rgba(255,107,53,0.2)] transition-all duration-300">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/bonk-ai-robot-assistant.png" />
                <AvatarFallback className="bg-[#ff6b35] text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-white">BONK AI Assistant</CardTitle>
                <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-700">
                  Live Data
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Real-time BONK ecosystem insights and analysis</p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Chat Messages */}
          <div ref={scrollRef} className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/bonk-ai-robot.png" />
                    <AvatarFallback className="bg-[#ff6b35] text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-[#ff6b35] text-white"
                        : "bg-gray-800 text-white border border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</span>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/diverse-user-avatars.png" />
                    <AvatarFallback className="bg-gray-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="/bonk-ai-robot.png" />
                  <AvatarFallback className="bg-[#ff6b35] text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-700 p-4">
            <p className="text-sm text-gray-400 mb-3">Quick Actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.query)}
                  className="justify-start h-auto p-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-[#ff6b35] hover:shadow-[0_0_10px_rgba(255,107,53,0.3)] transition-all duration-300"
                >
                  {React.createElement(action.icon, { className: "h-4 w-4 mr-2 text-[#ff6b35]" })}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about BONK prices, sentiment, or ecosystem..."
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white shadow-[0_0_10px_rgba(255,107,53,0.3)] hover:shadow-[0_0_20px_rgba(255,107,53,0.5)] transition-all duration-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
