"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Activity,
  Globe,
  Twitter,
  MessageCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface TokenDetail {
  id: string
  name: string
  symbol: string
  rank: number
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  change7d: number
  change30d: number
  allTimeHigh: number
  allTimeLow: number
  holders?: number
  verified: boolean
  description: string
  website?: string
  twitter?: string
  discord?: string
  totalSupply: number
  circulatingSupply: number
  maxSupply?: number
}

export default function TokenDetailPage() {
  const params = useParams()
  const tokenId = params.id as string
  const [tokenData, setTokenData] = useState<TokenDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true)
      try {
        // This would be replaced with actual CoinGecko API call
        // const response = await fetch(`/api/coingecko/token/${tokenId}`)

        // Mock data for demonstration
        const mockTokenData: TokenDetail = {
          id: tokenId,
          name: tokenId === "bonk" ? "Bonk" : tokenId === "useless-3" ? "Useless" : "Token Name",
          symbol: tokenId === "bonk" ? "BONK" : tokenId === "useless-3" ? "USELESS" : "TOKEN",
          rank: tokenId === "bonk" ? 78 : 156,
          price: tokenId === "bonk" ? 0.00002204 : tokenId === "useless-3" ? 0.000045 : 0.001234,
          marketCap: tokenId === "bonk" ? 1706257459 : 45678901,
          volume24h: tokenId === "bonk" ? 171331847 : 2345678,
          change24h: tokenId === "bonk" ? -3.82 : 12.45,
          change7d: tokenId === "bonk" ? 12.4 : -8.23,
          change30d: tokenId === "bonk" ? 45.67 : 23.45,
          allTimeHigh: tokenId === "bonk" ? 0.00005825 : 0.000123,
          allTimeLow: tokenId === "bonk" ? 0.00000078 : 0.000001,
          holders: tokenId === "bonk" ? 974800 : 45678,
          verified: true,
          description:
            tokenId === "bonk"
              ? "Bonk is a Solana-based meme coin that has become one of the most popular tokens in the Solana ecosystem."
              : "A community-driven token in the LetsBonk ecosystem.",
          website: "https://bonkcoin.com",
          twitter: "https://twitter.com/bonk_inu",
          discord: "https://discord.gg/bonk",
          totalSupply: 87995351634222.84,
          circulatingSupply: 77419592329436.58,
          maxSupply: 87995351634222.84,
        }

        setTimeout(() => {
          setTokenData(mockTokenData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching token data:", error)
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [tokenId])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatSupply = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-32 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Token not found</h1>
          <Link href="/letsbonk">
            <Button className="bg-orange-500 hover:bg-orange-600 text-black">Back to LetsBonk Ecosystem</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/letsbonk">
          <Button variant="ghost" className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LetsBonk Ecosystem
          </Button>
        </Link>

        {/* Token Header */}
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
            {tokenData.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-bold">{tokenData.name}</h1>
              <span className="text-2xl text-gray-400">{tokenData.symbol}</span>
              {tokenData.verified && <Badge className="bg-green-500/20 text-green-400">Verified</Badge>}
              <span className="text-gray-400">#{tokenData.rank}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              {tokenData.website && (
                <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-400">
                  <Globe className="h-4 w-4 mr-1" />
                  Website
                </Button>
              )}
              {tokenData.twitter && (
                <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-400">
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </Button>
              )}
              {tokenData.discord && (
                <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-400">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Discord
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Price and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Current Price</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(tokenData.price)}</div>
              <p
                className={`text-xs flex items-center ${tokenData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {tokenData.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(tokenData.change24h).toFixed(2)}% (24h)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Market Cap</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(tokenData.marketCap)}</div>
              <p className="text-xs text-gray-400">Rank #{tokenData.rank}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">24h Volume</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(tokenData.volume24h)}</div>
              <p className="text-xs text-gray-400">Trading volume</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Holders</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{tokenData.holders?.toLocaleString() || "N/A"}</div>
              <p className="text-xs text-gray-400">Token holders</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Price Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">7d Change</span>
                <span className={`font-medium ${tokenData.change7d >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {tokenData.change7d >= 0 ? "+" : ""}
                  {tokenData.change7d.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">30d Change</span>
                <span className={`font-medium ${tokenData.change30d >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {tokenData.change30d >= 0 ? "+" : ""}
                  {tokenData.change30d.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">All-Time High</span>
                <span className="text-white font-medium">{formatNumber(tokenData.allTimeHigh)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">All-Time Low</span>
                <span className="text-white font-medium">{formatNumber(tokenData.allTimeLow)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Supply Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="text-white font-medium">{formatSupply(tokenData.circulatingSupply)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Supply</span>
                <span className="text-white font-medium">{formatSupply(tokenData.totalSupply)}</span>
              </div>
              {tokenData.maxSupply && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Supply</span>
                  <span className="text-white font-medium">{formatSupply(tokenData.maxSupply)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Supply Ratio</span>
                <span className="text-white font-medium">
                  {((tokenData.circulatingSupply / tokenData.totalSupply) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">About {tokenData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{tokenData.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
