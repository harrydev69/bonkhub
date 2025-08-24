"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Search,
  ExternalLink,
  Star,
  Activity,
} from "lucide-react"

interface Token {
  id: string
  name: string
  symbol: string
  rank: number
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  change7d: number
  holders?: number
  verified: boolean
}

export function LetsBonkEcosystem() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "marketCap" | "volume" | "change24h">("rank")
  const router = useRouter()

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true)
      try {
        // This would be replaced with actual CoinGecko API call
        // const response = await fetch('/api/coingecko/letsbonk-ecosystem')

        // Mock data representing actual LetsBonk ecosystem tokens
        const letsBonkTokens: Token[] = [
          {
            id: "bonk",
            name: "Bonk",
            symbol: "BONK",
            rank: 1,
            price: 0.00002204,
            marketCap: 1706257459,
            volume24h: 171331847,
            change24h: -3.82,
            change7d: 12.4,
            holders: 974800,
            verified: true,
          },
          {
            id: "book-of-meme",
            name: "Book of Meme",
            symbol: "BOME",
            rank: 2,
            price: 0.008234,
            marketCap: 567234891,
            volume24h: 45672341,
            change24h: 15.67,
            change7d: -8.23,
            holders: 234567,
            verified: true,
          },
          {
            id: "dogwifhat",
            name: "dogwifhat",
            symbol: "WIF",
            rank: 3,
            price: 1.89,
            marketCap: 1890234567,
            volume24h: 89234567,
            change24h: 7.45,
            change7d: 23.12,
            holders: 156789,
            verified: true,
          },
          {
            id: "popcat",
            name: "Popcat",
            symbol: "POPCAT",
            rank: 4,
            price: 0.7834,
            marketCap: 783456789,
            volume24h: 34567890,
            change24h: -2.34,
            change7d: 18.67,
            holders: 98765,
            verified: true,
          },
          {
            id: "cat-in-a-dogs-world",
            name: "Cat in a dogs world",
            symbol: "MEW",
            rank: 5,
            price: 0.004567,
            marketCap: 456789012,
            volume24h: 23456789,
            change24h: 12.89,
            change7d: -5.67,
            holders: 87654,
            verified: true,
          },
          // Generate additional tokens to reach 47 total
          ...Array.from({ length: 42 }, (_, index) => ({
            id: `letsbonk-token-${index + 6}`,
            name: `LetsBonk Token ${index + 6}`,
            symbol: `LB${index + 6}`,
            rank: index + 6,
            price: Math.random() * 10,
            marketCap: Math.random() * 100000000,
            volume24h: Math.random() * 5000000,
            change24h: (Math.random() - 0.5) * 30,
            change7d: (Math.random() - 0.5) * 50,
            holders: Math.floor(Math.random() * 50000),
            verified: Math.random() > 0.4,
          })),
        ]

        setTimeout(() => {
          setTokens(letsBonkTokens)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching LetsBonk ecosystem data:", error)
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  const filteredTokens = tokens
    .filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "marketCap":
          return b.marketCap - a.marketCap
        case "volume":
          return b.volume24h - a.volume24h
        case "change24h":
          return b.change24h - a.change24h
        default:
          return a.rank - b.rank
      }
    })

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const handleTokenClick = (tokenId: string) => {
    router.push(`/token/${tokenId}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">LetsBonk Ecosystem Overview</h1>
        <p className="text-gray-400 text-lg">
          Comprehensive analysis of the LetsBonk.fun ecosystem tokens powered by CoinGecko data
        </p>
      </div>

      {/* Ecosystem Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Market Cap</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(1847392847)}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.7% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(84729384)}</div>
            <p className="text-xs text-green-500 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              High activity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Tokens</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">47</div>
            <p className="text-xs text-gray-400">Active tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg 24h Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+8.7%</div>
            <p className="text-xs text-gray-400">Ecosystem performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-orange-500 focus:shadow-[0_0_10px_rgba(255,107,53,0.3)]"
          />
        </div>
        <div className="flex gap-2">
          {(["rank", "marketCap", "volume", "change24h"] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(sort)}
              className={
                sortBy === sort
                  ? "bg-orange-500 hover:bg-orange-600 text-black"
                  : "border-gray-700 text-gray-300 hover:text-orange-500 hover:border-orange-500"
              }
            >
              {sort === "rank"
                ? "Rank"
                : sort === "marketCap"
                  ? "Market Cap"
                  : sort === "volume"
                    ? "Volume"
                    : "24h Change"}
            </Button>
          ))}
        </div>
      </div>

      {/* Tokens Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center">
            <Star className="h-5 w-5 text-orange-500 mr-2" />
            LetsBonk.fun Ecosystem Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }, (_, loadingIndex) => (
                <div
                  key={loadingIndex}
                  className="animate-pulse flex items-center space-x-4 p-4 bg-gray-800 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="w-20 h-4 bg-gray-700 rounded"></div>
                  <div className="w-16 h-4 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  onClick={() => handleTokenClick(token.id)}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-400 font-mono text-sm w-8">#{token.rank}</div>
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium hover:text-orange-500 transition-colors">
                          {token.name}
                        </span>
                        <span className="text-gray-400 text-sm">{token.symbol}</span>
                        {token.verified && <Badge className="bg-green-500/20 text-green-400 text-xs">Verified</Badge>}
                      </div>
                      {token.holders && (
                        <div className="text-xs text-gray-500">{token.holders.toLocaleString()} holders</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <div className="text-white font-medium">{formatNumber(token.price)}</div>
                      <div
                        className={`text-sm flex items-center ${
                          token.change24h >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {token.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(token.change24h).toFixed(2)}%
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white text-sm">{formatNumber(token.marketCap)}</div>
                      <div className="text-gray-400 text-xs">Market Cap</div>
                    </div>

                    <div className="text-right">
                      <div className="text-white text-sm">{formatNumber(token.volume24h)}</div>
                      <div className="text-gray-400 text-xs">Volume</div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://www.coingecko.com/en/coins/${token.id}`, "_blank")
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
