"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { fetchTokenData, type TokenData, formatPrice, formatMarketCap, formatVolume } from "@/lib/api"

export function TokenCards() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTokenData = async () => {
      try {
        setLoading(true)
        const data = await fetchTokenData()
        setTokens(data)
        setError(null)
      } catch (err) {
        setError("Failed to load token data")
        console.error("Error loading tokens:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTokenData()

    const interval = setInterval(loadTokenData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {tokens.map((token) => (
        <Card key={token.symbol} className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{token.symbol[0]}</span>
                </div>
                <span className="font-semibold">{token.symbol}</span>
              </div>
              <Badge
                variant={token.change24h > 0 ? "default" : "destructive"}
                className={token.change24h > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"}
              >
                {token.change24h > 0 ? "+" : ""}
                {token.change24h.toFixed(1)}%
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">{formatPrice(token.price)}</div>
              <div className="text-sm text-muted-foreground">Market Cap: {formatMarketCap(token.marketCap)}</div>
              <div className="text-sm text-muted-foreground">24h Volume: {formatVolume(token.volume24h)}</div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  token.sentiment === "Bullish"
                    ? "border-green-500 text-green-500"
                    : token.sentiment === "Bearish"
                      ? "border-red-500 text-red-500"
                      : "border-yellow-500 text-yellow-500"
                }`}
              >
                {token.sentiment}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
