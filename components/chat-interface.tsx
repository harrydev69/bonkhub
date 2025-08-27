"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, TrendingUp, DollarSign, BarChart3, MessageSquare, Sparkles, Zap, Brain } from "lucide-react"

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
    if (seg === "<thinking>") {
      inThink = true
      continue
    }
    if (seg === "</thinking>") {
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
        "Hello! I'm your BONK ecosystem AI assistant. I can provide real-time insights on prices, sentiment, trading volume, and the LetsBonk.fun ecosystem. What would you like to know? 🚀",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const quickActions = [
    { 
      label: "BONK Price", 
      icon: DollarSign, 
      query: "What's the current BONK price and market analysis?",
      color: "from-green-600 to-green-500",
      description: "Get real-time price data"
    },
    { 
      label: "Market Sentiment", 
      icon: TrendingUp, 
      query: "What's the current market sentiment for BONK?",
      color: "from-blue-600 to-blue-500",
      description: "Analyze market mood"
    },
    { 
      label: "Trading Volume", 
      icon: BarChart3, 
      query: "Show me BONK's trading volume and activity",
      color: "from-purple-600 to-purple-500",
      description: "Volume insights"
    },
    { 
      label: "Ecosystem Info", 
      icon: MessageSquare, 
      query: "Tell me about the BONK ecosystem and LetsBonk.fun",
      color: "from-orange-600 to-orange-500",
      description: "Ecosystem overview"
    },
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700/50 shadow-[0_0_30px_rgba(255,107,53,0.1)] hover:shadow-[0_0_40px_rgba(255,107,53,0.15)] transition-all duration-500 overflow-hidden group">
        {/* Enhanced Header */}
        <CardHeader className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <Avatar className="relative h-14 w-14 bg-gradient-to-br from-[#ff6b35] to-orange-500 ring-4 ring-gray-800 group-hover:ring-[#ff6b35]/30 transition-all duration-300">
                  <AvatarImage src="/bonk-ai-robot-assistant.png" />
                  <AvatarFallback className="bg-gradient-to-br from-[#ff6b35] to-orange-500 text-white text-lg font-bold">
                    <Brain className="h-7 w-7" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse shadow-lg">
                  <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    BONK AI Assistant
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                    <Badge className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 border-0 shadow-lg">
                      Live Data
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-300 text-sm font-medium">Real-time BONK ecosystem insights powered by AI</p>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Enhanced Chat Messages */}
          <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-900 to-gray-800">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 animate-in slide-in-from-bottom-2 duration-300 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-[#ff6b35] to-orange-500 ring-2 ring-[#ff6b35]/30 group-hover:ring-[#ff6b35]/50 transition-all duration-300">
                    <AvatarImage src="/bonk-ai-robot.png" />
                    <AvatarFallback className="bg-gradient-to-br from-[#ff6b35] to-orange-500 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col max-w-2xl ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-5 py-4 rounded-2xl transition-all duration-300 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#ff6b35] to-orange-500 text-white shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_25px_rgba(255,107,53,0.4)]"
                        : "bg-gray-800/80 text-white border border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-750 backdrop-blur-sm shadow-lg"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <div className={`flex items-center space-x-2 mt-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full backdrop-blur-sm">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === "ai" && (
                      <Badge variant="outline" className="text-xs border-[#ff6b35]/30 text-[#ff6b35] bg-[#ff6b35]/10">
                        AI Response
                      </Badge>
                    )}
                  </div>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-gray-600 to-gray-500 ring-2 ring-gray-500/30">
                    <AvatarImage src="/diverse-user-avatars.png" />
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-500 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Enhanced Loading State */}
            {isLoading && (
              <div className="flex items-start space-x-4 animate-in slide-in-from-bottom-2 duration-300">
                <Avatar className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-[#ff6b35] to-orange-500 ring-2 ring-[#ff6b35]/30">
                  <AvatarImage src="/bonk-ai-robot.png" />
                  <AvatarFallback className="bg-gradient-to-br from-[#ff6b35] to-orange-500 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-800/80 border border-gray-600/50 rounded-2xl px-5 py-4 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center space-x-3">
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
                    <span className="text-gray-400 text-sm font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Quick Actions */}
          <div className="border-t border-gray-700/50 p-6 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm">
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold mb-2 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Quick Actions</span>
              </h3>
              <p className="text-gray-400 text-sm">Get instant insights about BONK</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.query)}
                  className="group h-auto p-4 bg-gray-900/80 border-gray-600/50 text-white hover:bg-gray-800 hover:border-[#ff6b35] hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] transition-all duration-300 flex flex-col items-center space-y-3 backdrop-blur-sm hover:scale-105 transform-gpu"
                >
                  <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {React.createElement(action.icon, { className: "h-5 w-5 text-white" })}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-700/50 p-6 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex space-x-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about BONK prices, sentiment, trading volume, or ecosystem developments..."
                className="flex-1 bg-gray-800/80 border-gray-600/50 text-white placeholder-gray-400 focus:border-[#ff6b35] focus:ring-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-all duration-300 backdrop-blur-sm rounded-xl px-4 py-3 text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-[#ff6b35] to-orange-500 hover:from-[#e55a2b] hover:to-orange-600 text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.4)] hover:scale-105 transition-all duration-300 transform-gpu px-6 py-3 rounded-xl shadow-lg"
              >
                <Send className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
