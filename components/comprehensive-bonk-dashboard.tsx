"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { InteractivePriceChart } from "./interactive-price-chart"
import { BONKNewsFeed } from "./bonk-news-feed"
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle, ChevronDown, Copy, ExternalLink } from "lucide-react"

// Types for our API responses
type OverviewData = {
  price: number
  changePct: {
    h1: number
    h24: number
    d7: number
    d30: number
    y1: number
  }
  marketCap: number
  fdv: number | null
  volume24h: number
  rank: number | null
  sparkline7d: number[]
  high24h: number
  low24h: number
  ath: {
    price: number
    date: string
    changePct: number
  }
  atl: {
    price: number
    date: string
    changePct: number
  }
  lastUpdated: string
}

export function ComprehensiveBONKDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/bonk/overview")

        if (response.ok) {
          const overviewData = await response.json()
          setOverview(overviewData)
        } else {
          throw new Error(`Failed to fetch overview: ${response.status}`)
        }
      } catch (err) {
        setError("Failed to fetch BONK data")
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!overview) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <span className="text-gray-400">No BONK data available</span>
        </CardContent>
      </Card>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }).format(price)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatPercentage = (pct: number) => {
    const isPositive = pct >= 0
    return (
      <span className={`flex items-center ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(pct).toFixed(2)}%
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* BONK Price Chart - Main Feature */}
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-white">BONK Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractivePriceChart />
          </CardContent>
        </Card>

        {/* Price Performance Timeline */}
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span>Price Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">1h</div>
                <div className="flex flex-col items-center space-y-1">
                  {overview.changePct.h1 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold text-lg ${overview.changePct.h1 >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(overview.changePct.h1).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">24h</div>
                <div className="flex flex-col items-center space-y-1">
                  {overview.changePct.h24 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold text-lg ${overview.changePct.h24 >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(overview.changePct.h24).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">7d</div>
                <div className="flex flex-col items-center space-y-1">
                  {overview.changePct.d7 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold text-lg ${overview.changePct.d7 >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(overview.changePct.d7).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">14d</div>
                <div className="flex flex-col items-center space-y-1">
                  {overview.changePct.d7 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold text-lg ${overview.changePct.d7 >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(overview.changePct.d7).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">30d</div>
                <div className="flex flex-col items-center space-y-1">
                  {overview.changePct.d30 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold text-lg ${overview.changePct.d30 >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(overview.changePct.d30).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">1y</div>
                <div className="flex flex-col items-center space-y-1">
                  {overview.changePct.y1 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold text-lg ${overview.changePct.y1 >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(overview.changePct.y1).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BONK News Feed - Recently Happened to Bonk */}
        <BONKNewsFeed />

        {/* About BONK - FAQ Style */}
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-white">About BONK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* FAQ Items with Dropdowns */}

            {/* What is Bonk? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-1")
                  const icon = document.getElementById("icon-1")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">What is Bonk?</span>
                <ChevronDown id="icon-1" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-1" className="hidden mt-3 text-gray-400">
                Bonk is the first Solana dog coin for the people, by the people with 50% of the total supply airdropped
                to the Solana community. The Bonk contributors were tired of toxic "Alameda" tokenomics and wanted to
                make a fun memecoin where everyone gets a fair shot.
              </div>
            </div>

            {/* Where can you buy Bonk? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-2")
                  const icon = document.getElementById("icon-2")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">Where can you buy Bonk?</span>
                <ChevronDown id="icon-2" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-2" className="hidden mt-3 text-gray-400">
                BONK tokens can be traded on centralized crypto exchanges. The most popular exchange to buy and trade
                Bonk is Binance, where the most active trading pair BONK/USDT has a trading volume of $20,692,508 in the
                last 24 hours. Other popular options include Gate, OKX, and Jupiter for decentralized trading.
              </div>
            </div>

            {/* What is the daily trading volume? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-3")
                  const icon = document.getElementById("icon-3")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">What is the daily trading volume?</span>
                <ChevronDown id="icon-3" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-3" className="hidden mt-3 text-gray-400">
                The trading volume of Bonk (BONK) is ${overview?.volume24h?.toLocaleString() || "169,061,565"} in the
                last 24 hours, representing significant market activity. Check out CoinGecko's list of highest volume
                cryptocurrencies for comparison.
              </div>
            </div>

            {/* What is the market cap? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-4")
                  const icon = document.getElementById("icon-4")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">What is the market cap?</span>
                <ChevronDown id="icon-4" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-4" className="hidden mt-3 text-gray-400">
                Market capitalization of Bonk (BONK) is ${overview?.marketCap?.toLocaleString() || "1,678,853,795"} and
                is ranked #{overview?.rank || "77"} on CoinGecko today. Market cap is measured by multiplying token
                price with the circulating supply of BONK tokens.
              </div>
            </div>

            {/* How does BONK work on Solana? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-5")
                  const icon = document.getElementById("icon-5")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">How does BONK work on Solana?</span>
                <ChevronDown id="icon-5" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-5" className="hidden mt-3 text-gray-400">
                BONK is built on the Solana blockchain, leveraging its fast transaction speeds and low fees. The token
                was designed to bring liquidity back to Solana-based decentralized exchanges (DEXs) and create a
                community-driven ecosystem where everyone gets a fair opportunity.
              </div>
            </div>

            {/* What makes BONK unique? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-6")
                  const icon = document.getElementById("icon-6")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">What makes BONK unique?</span>
                <ChevronDown id="icon-6" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-6" className="hidden mt-3 text-gray-400">
                Nearly half of the total supply (50 trillion coins) was distributed among Solana blockchain contributors
                and community members. BONK has over 350 Onchain integrations built by the community across many
                verticals, making it one of the most integrated memecoins in the Solana ecosystem.
              </div>
            </div>

            {/* Price Performance History */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-7")
                  const icon = document.getElementById("icon-7")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">What is BONK's price performance?</span>
                <ChevronDown id="icon-7" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-7" className="hidden mt-3 text-gray-400">
                Bonk (BONK) reached an all-time high of $0.00005825 and an all-time low of $0.078614. It's currently
                trading 62.79% below that peak and 25,062.20% above its lowest price. For 2023, it was the best
                performing crypto asset based on return percentages.
              </div>
            </div>

            {/* Ecosystem Integrations */}
            <div className="pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-colors"
                onClick={() => {
                  const content = document.getElementById("about-8")
                  const icon = document.getElementById("icon-8")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium">What are BONK's ecosystem integrations?</span>
                <ChevronDown id="icon-8" className="h-5 w-5 transition-transform" />
              </button>
              <div id="about-8" className="hidden mt-3 text-gray-400">
                BONK now has over 350 Onchain integrations built by the community across many verticals including
                gaming, DeFi protocols, NFT marketplaces, and social platforms. This extensive integration network makes
                it one of the most utility-focused meme tokens in the cryptocurrency space.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* BONK Price Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🐕</span>
                </div>
                <CardTitle className="text-white">BONK Price</CardTitle>
              </div>
              <span className="text-gray-400 text-sm">#78</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Price */}
            <div>
              <div className="text-2xl font-bold text-white">{formatPrice(overview?.price || 0.00002204)}</div>
              <div className="flex items-center space-x-1 mt-1">
                {(overview?.changePct.h24 || -3.82) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span className="text-red-400 text-sm font-medium">
                  {Math.abs(overview?.changePct.h24 || 3.82).toFixed(2)}% (24h)
                </span>
              </div>
            </div>

            {/* Price Range Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>${(overview?.low24h || 0.00002206).toFixed(8)}</span>
                <span>24h Range</span>
                <span>${(overview?.high24h || 0.00002318).toFixed(8)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>

            {/* Market Data */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white font-medium">${formatNumber(overview?.marketCap || 1706257459)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fully Diluted Valuation</span>
                <span className="text-white font-medium">${formatNumber(overview?.fdv || 1939337583)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24 Hour Trading Vol</span>
                <span className="text-white font-medium">${formatNumber(overview?.volume24h || 171331847)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="text-white font-medium">77,419,592,329,436.58</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply</span>
                <span className="text-white font-medium">87,995,351,634,222.84</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Supply</span>
                <span className="text-white font-medium">87,995,351,634,222.84</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-orange-500">Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Contract</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono">DezXA...pPB263</span>
                <Copy className="h-4 w-4 text-gray-400 hover:text-orange-400 cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Website</span>
              <a
                href="https://bonkcoin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>bonkcoin.com</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Explorers</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">Solscan</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Wallets</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">Phantom</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Community</span>
              <div className="flex space-x-2">
                <span className="bg-gray-800 px-2 py-1 rounded text-white text-xs">X Twitter</span>
                <span className="bg-gray-800 px-2 py-1 rounded text-white text-xs">Discord</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Search on</span>
              <a
                href="https://twitter.com/search?q=BONK"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Twitter
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">API ID</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono">bonk</span>
                <Copy className="h-4 w-4 text-gray-400 hover:text-orange-400 cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Chains</span>
              <div className="flex items-center space-x-2">
                <span className="text-white">Ethereum Ecosystem</span>
                <span className="text-gray-400 text-xs">6 more</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Categories</span>
              <div className="flex items-center space-x-2">
                <span className="text-white">Meme</span>
                <span className="text-gray-400 text-xs">7 more</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holders Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-orange-500">Holders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">Total Holders</div>
              <div className="text-4xl font-bold text-orange-500">974.8K</div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="text-gray-400 text-xs mb-1">4 Hours</div>
                <div className="text-red-400 font-bold text-lg">-138</div>
                <div className="text-red-400 text-xs">-0.01%</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="text-gray-400 text-xs mb-1">12 Hours</div>
                <div className="text-red-400 font-bold text-lg">-216</div>
                <div className="text-red-400 text-xs">-0.02%</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="text-gray-400 text-xs mb-1">1 Day</div>
                <div className="text-red-400 font-bold text-lg">-1394</div>
                <div className="text-red-400 text-xs">-0.14%</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="text-gray-400 text-xs mb-1">3 Days</div>
                <div className="text-red-400 font-bold text-lg">-1039</div>
                <div className="text-red-400 text-xs">-0.11%</div>
              </div>
            </div>

            <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
              <div className="text-gray-400 text-xs mb-1">7 Days</div>
              <div className="text-red-400 font-bold text-lg">-129</div>
              <div className="text-red-400 text-xs">-0.01%</div>
            </div>
          </CardContent>
        </Card>

        {/* BONK Historical Price Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-orange-500">BONK Historical Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">24h Range</span>
              <span className="text-white">$0.00002206 - $0.00002318</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">7d Range</span>
              <span className="text-white">$0.00002162 - $0.00002550</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">All-Time High</span>
                <div className="text-right">
                  <div className="text-white">$0.00005825</div>
                  <div className="text-red-400 text-xs">↘ 62.8%</div>
                </div>
              </div>
              <div className="text-gray-500 text-xs text-right">Nov 20, 2024 (9 months)</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">All-Time Low</span>
                <div className="text-right">
                  <div className="text-white">$0.00000078</div>
                  <div className="text-green-400 text-xs">↗ 25062.2%</div>
                </div>
              </div>
              <div className="text-gray-500 text-xs text-right">Dec 29, 2022 (over 2 years)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-gray-800" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 bg-gray-800" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-24 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full bg-gray-800" />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🐕</span>
                </div>
                <Skeleton className="h-6 w-24 bg-gray-800" />
              </div>
              <Skeleton className="h-4 w-12 bg-gray-800" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-8 w-48 bg-gray-800" />
              <div className="flex items-center space-x-1 mt-1">
                <Skeleton className="h-4 w-4 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <Skeleton className="h-2 w-full bg-gray-800" />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-4 w-48 bg-gray-800" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <Skeleton className="h-6 w-24 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-48 bg-gray-800" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Skeleton className="h-4 w-24 bg-gray-800" />
              <Skeleton className="h-8 w-48 bg-gray-800" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                </div>
              ))}
            </div>

            <div className="text-center">
              <Skeleton className="h-4 w-24 bg-gray-800" />
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-48 bg-gray-800" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
