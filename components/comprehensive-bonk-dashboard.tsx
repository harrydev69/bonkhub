"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { BONKNewsFeed } from "./bonk-news-feed"
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle, ChevronDown, Copy, ExternalLink } from "lucide-react"
import { useBonkPerformance } from '@/hooks/useBonkPerformance'
import { useBonkTickers } from '@/hooks/useBonkTickers'
import { useBonkHolders } from '@/hooks/useBonkHolders'

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
  const perf = useBonkPerformance('usd')
  const { data: tickersData, loading: tickersLoading } = useBonkTickers(1, 'volume_desc')
  const { data: holdersData, loading: holdersLoading } = useBonkHolders()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching BONK data from /api/bonk/overview...')
        
        const response = await fetch("/api/bonk/overview", {
          cache: 'no-store', // Force fresh data
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          const overviewData = await response.json()
          console.log('✅ BONK data received:', overviewData)
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

  const formatExactValue = (num: number) => {
    return `$${num.toLocaleString()}`
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


        {/* Price Performance Timeline */}
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-[#ff6b35]/30 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2 transition-all duration-500 group-hover:text-orange-400">
              <TrendingUp className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 transform-gpu" />
              <span className="transition-all duration-500 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">Price Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-6">
              {[
                { label: '1h', value: perf?.changes['1h'] },
                { label: '24h', value: perf?.changes['24h'] },
                { label: '7d', value: perf?.changes['7d'] },
                { label: '14d', value: perf?.changes['14d'] },
                { label: '30d', value: perf?.changes['30d'] },
                { label: '1y', value: perf?.changes['1y'] }
              ].map(({ label, value }) => (
                <div key={label} className="text-center transition-all duration-500 hover:scale-105 transform-gpu group/item">
                  <div className="text-gray-400 text-sm mb-2 transition-all duration-500 group-hover/item:text-gray-300">{label}</div>
                  <div className="flex flex-col items-center space-y-1">
                    {value != null ? (
                      <>
                        {value >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`font-bold text-lg ${value >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {Math.abs(value).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BONK News Feed - Recently Happened to Bonk */}
        <BONKNewsFeed />

        {/* About BONK - FAQ Style */}
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-[#ff6b35]/30 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-white transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">About BONK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* FAQ Items with Dropdowns */}

            {/* What is Bonk? */}
            <div className="border-b border-gray-800 pb-4">
              <button
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-1")
                  const icon = document.getElementById("icon-1")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">What is Bonk?</span>
                <ChevronDown id="icon-1" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-2")
                  const icon = document.getElementById("icon-2")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">Where can you buy Bonk?</span>
                <ChevronDown id="icon-2" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-3")
                  const icon = document.getElementById("icon-3")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">What is the daily trading volume?</span>
                <ChevronDown id="icon-3" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-4")
                  const icon = document.getElementById("icon-4")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">What is the market cap?</span>
                <ChevronDown id="icon-4" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-5")
                  const icon = document.getElementById("icon-5")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">How does BONK work on Solana?</span>
                <ChevronDown id="icon-5" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-6")
                  const icon = document.getElementById("icon-6")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">What makes BONK unique?</span>
                <ChevronDown id="icon-6" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-7")
                  const icon = document.getElementById("icon-7")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">What is BONK's price performance?</span>
                <ChevronDown id="icon-7" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
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
                className="flex items-center justify-between w-full text-left text-white hover:text-orange-400 transition-all duration-500 hover:scale-[1.02] transform-gpu group/faq"
                onClick={() => {
                  const content = document.getElementById("about-8")
                  const icon = document.getElementById("icon-8")
                  if (content && icon) {
                    content.classList.toggle("hidden")
                    icon.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)"
                  }
                }}
              >
                <span className="font-medium transition-all duration-500 group-hover/faq:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">What are BONK's ecosystem integrations?</span>
                <ChevronDown id="icon-8" className="h-5 w-5 transition-all duration-500 group-hover/faq:scale-110 transform-gpu" />
              </button>
              <div id="about-8" className="hidden mt-3 text-gray-400">
                BONK now has over 350 Onchain integrations built by the community across many verticals including
                gaming, DeFi protocols, NFT marketplaces, and social platforms. This extensive integration network makes
                it one of the most utility-focused meme tokens in the cryptocurrency space.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Where to Trade BONK Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-orange-500 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">Where to Trade BONK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Top Exchanges */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="text-gray-400 font-medium">Exchange</div>
                <div className="text-gray-400 font-medium">Pair</div>
                <div className="text-gray-400 font-medium">24h Volume</div>
                <div className="text-gray-400 font-medium">Trust Score</div>
              </div>
              
              {/* Exchange Rows */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tickersLoading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3 p-2 bg-gray-800/30 rounded animate-pulse">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-4 w-16 bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-700 rounded"></div>
                      <div className="flex space-x-1">
                        {[...Array(10)].map((_, j) => (
                          <div key={j} className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : tickersData?.tickers?.slice(0, 5).map((ticker, i) => (
                  <a
                    key={i}
                    href={ticker.trade_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-4 gap-3 p-2 bg-gray-800/30 rounded hover:bg-gray-800/50 hover:scale-[1.02] hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer group/exchange"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        ticker.market.name.toLowerCase().includes('binance') ? 'bg-green-500' :
                        ticker.market.name.toLowerCase().includes('coinbase') ? 'bg-blue-500' :
                        ticker.market.name.toLowerCase().includes('okx') ? 'bg-purple-500' :
                        ticker.market.name.toLowerCase().includes('gate') ? 'bg-orange-500' :
                        ticker.market.name.toLowerCase().includes('htx') ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-white font-medium transition-all duration-500 group-hover/exchange:text-orange-400 group-hover/exchange:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">{ticker.market.name}</span>
                    </div>
                    <span className="text-blue-400">{ticker.base}/{ticker.target}</span>
                    <span className="text-white">${(ticker.converted_volume.usd / 1000000).toFixed(1)}M</span>
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, j) => (
                        <div key={j} className={`w-2 h-2 rounded-full ${
                          ticker.trust_score === 'green' && j < 10 ? 'bg-green-500' :
                          ticker.trust_score === 'yellow' && j < 7 ? 'bg-yellow-500' :
                          ticker.trust_score === 'red' && j < 4 ? 'bg-red-500' :
                          'bg-gray-600'
                        }`}></div>
                      ))}
                    </div>
                  </a>
                ))}
                
              </div>
              
                                {/* View All Button */}
                  <div className="text-center pt-2">
                    <a
                      href="/trading-pairs"
                      className="inline-block text-orange-400 hover:text-orange-300 text-sm font-medium transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)] transform-gpu"
                    >
                      View All Trading Pairs →
                    </a>
                  </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* BONK Price Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                <Image 
                  src="https://assets.coingecko.com/coins/images/28600/small/bonk.jpg"
                  alt="BONK"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="text-white transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">BONK Price</CardTitle>
            </div>
              <span className="text-gray-400 text-sm">#78</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Price */}
            <div className="group/price">
              <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/price:text-orange-400 group-hover/price:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">{formatPrice(overview?.price || 0.00002204)}</div>
              <div className="flex items-center space-x-1 mt-1">
                {(overview?.changePct.h24 || -3.82) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400 transition-all duration-500 group-hover/price:scale-110 group-hover/price:drop-shadow-[0_0_3px_rgba(34,197,94,0.6)]" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400 transition-all duration-500 group-hover/price:scale-110 group-hover/price:drop-shadow-[0_0_3px_rgba(239,68,68,0.6)]" />
                )}
                <span className="text-red-400 text-sm font-medium transition-all duration-500 group-hover/price:scale-105 group-hover/price:drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]">
                  {Math.abs(overview?.changePct.h24 || 3.82).toFixed(2)}% (24h)
                </span>
              </div>
            </div>

            {/* Price Range Bar */}
            <div className="space-y-2 group/range">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="transition-all duration-500 group-hover/range:text-gray-300">${(overview?.low24h || 0.00002206).toFixed(8)}</span>
                <span className="transition-all duration-500 group-hover/range:text-orange-400 group-hover/range:drop-shadow-[0_0_2px_rgba(255,107,53,0.5)]">24h Range</span>
                <span className="transition-all duration-500 group-hover/range:text-gray-300">${(overview?.high24h || 0.00002318).toFixed(8)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 transition-all duration-500 group-hover/range:bg-gray-600">
                <div
                  className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500 group-hover/range:shadow-[0_0_8px_rgba(255,107,53,0.4)]"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>

            {/* Market Data */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between group/market">
                <span className="text-gray-400 transition-all duration-500 group-hover/market:text-gray-300">Market Cap</span>
                <span className="text-white font-medium transition-all duration-500 group-hover/market:text-orange-400 group-hover/market:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">{formatExactValue(overview?.marketCap || 1706257459)}</span>
              </div>
              <div className="flex justify-between group/fdv">
                <span className="text-gray-400 transition-all duration-500 group-hover/fdv:text-gray-300">Fully Diluted Valuation</span>
                <span className="text-white font-medium transition-all duration-500 group-hover/fdv:text-orange-400 group-hover/fdv:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">{formatExactValue(overview?.fdv || 1939337583)}</span>
              </div>
              <div className="flex justify-between group/volume">
                <span className="text-gray-400 transition-all duration-500 group-hover/volume:text-gray-300">24 Hour Trading Vol</span>
                <span className="text-white font-medium transition-all duration-500 group-hover/volume:text-orange-400 group-hover/volume:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">${formatNumber(overview?.volume24h || 171331847)}</span>
              </div>
              <div className="flex justify-between group/circulating">
                <span className="text-gray-400 transition-all duration-500 group-hover/circulating:text-gray-300">Circulating Supply</span>
                <span className="text-white font-medium transition-all duration-500 group-hover/circulating:text-orange-400 group-hover/circulating:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">77,419,592,329,436.58</span>
              </div>
              <div className="flex justify-between group/total">
                <span className="text-gray-400 transition-all duration-500 group-hover/total:text-gray-300">Total Supply</span>
                <span className="text-white font-medium transition-all duration-500 group-hover/total:text-orange-400 group-hover/total:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">87,995,351,634,222.84</span>
              </div>
              <div className="flex justify-between group/max">
                <span className="text-gray-400 transition-all duration-500 group-hover/max:text-gray-300">Max Supply</span>
                <span className="text-white font-medium transition-all duration-500 group-hover/max:text-orange-400 group-hover/max:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">87,995,351,634,222.84</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-orange-500 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center group/contract">
              <span className="text-gray-400 transition-all duration-500 group-hover/contract:text-gray-300">Contract</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono transition-all duration-500 group-hover/contract:text-orange-400 group-hover/contract:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]" title="DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263">
                  DezXA...pPB263
                </span>
                <Copy 
                  className="h-4 w-4 text-gray-400 hover:text-orange-400 hover:scale-110 transition-all duration-500 cursor-pointer" 
                  onClick={() => navigator.clipboard.writeText('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')}
                />
              </div>
            </div>
            <div className="flex justify-between items-center group/website">
              <span className="text-gray-400 transition-all duration-500 group-hover/website:text-gray-300">Website</span>
              <a
                href="https://bonkcoin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-all duration-500 group-hover/website:scale-105"
              >
                <span className="transition-all duration-500 group-hover/website:drop-shadow-[0_0_2px_rgba(59,130,246,0.5)]">bonkcoin.com</span>
                <ExternalLink className="h-3 w-3 transition-all duration-500 group-hover/website:scale-110 group-hover/website:rotate-2" />
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Explorers</span>
              <a
                href="https://solscan.io/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Solscan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Wallets</span>
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Phantom</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between items-center group/community">
              <span className="text-gray-400 transition-all duration-500 group-hover/community:text-gray-300">Community</span>
              <div className="flex space-x-2">
                <a
                  href="https://twitter.com/bonk_inu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 px-2 py-1 rounded text-white text-xs hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-500 transform-gpu"
                >
                  X Twitter
                </a>
                <a
                  href="https://discord.gg/bonk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 px-2 py-1 rounded text-white text-xs hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(88,101,242,0.4)] transition-all duration-500 transform-gpu"
                >
                  Discord
                </a>
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
                <Copy 
                  className="h-4 w-4 text-gray-400 hover:text-orange-400 cursor-pointer" 
                  onClick={() => navigator.clipboard.writeText('bonk')}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Chains</span>
              <span className="text-white">Solana</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Categories</span>
              <span className="text-white">Meme</span>
            </div>
          </CardContent>
        </Card>



        {/* Holders Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-orange-500 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">Holders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {holdersLoading ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Total Holders</div>
                  <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Loading...</div>
                      <div className="h-6 bg-gray-700 rounded animate-pulse mb-1"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Loading...</div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Total Holders</div>
                  <div className="text-4xl font-bold text-orange-500">
                    {holdersData?.breakdowns?.total_holders ? 
                      (holdersData.breakdowns.total_holders / 1000).toFixed(1) + 'K' : 
                      '974.8K'
                    }
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                    <div className="text-gray-400 text-xs mb-1">4 Hours</div>
                    <div className={`font-bold text-lg ${
                      (holdersData?.deltas?.['4hours'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['4hours'] ? 
                        (holdersData.deltas['4hours'] >= 0 ? '+' : '') + holdersData.deltas['4hours'] : 
                        '-138'
                      }
                    </div>
                    <div className={`text-xs ${
                      (holdersData?.deltas?.['4hours'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['4hours'] ? 
                        (holdersData.deltas['4hours'] >= 0 ? '+' : '') + 
                        ((holdersData.deltas['4hours'] / (holdersData.breakdowns?.total_holders || 1)) * 100).toFixed(2) + '%' : 
                        '-0.01%'
                      }
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                    <div className="text-gray-400 text-xs mb-1">12 Hours</div>
                    <div className={`font-bold text-lg ${
                      (holdersData?.deltas?.['12hours'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['12hours'] ? 
                        (holdersData.deltas['12hours'] >= 0 ? '+' : '') + holdersData.deltas['12hours'] : 
                        '-216'
                      }
                    </div>
                    <div className={`text-xs ${
                      (holdersData?.deltas?.['12hours'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['12hours'] ? 
                        (holdersData.deltas['12hours'] >= 0 ? '+' : '') + 
                        ((holdersData.deltas['12hours'] / (holdersData.breakdowns?.total_holders || 1)) * 100).toFixed(2) + '%' : 
                        '-0.02%'
                      }
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                    <div className="text-gray-400 text-xs mb-1">1 Day</div>
                    <div className={`font-bold text-lg ${
                      (holdersData?.deltas['1day'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['1day'] ? 
                        (holdersData.deltas['1day'] >= 0 ? '+' : '') + holdersData.deltas['1day'] : 
                        '-1394'
                      }
                    </div>
                    <div className={`text-xs ${
                      (holdersData?.deltas['1day'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['1day'] ? 
                        (holdersData.deltas['1day'] >= 0 ? '+' : '') + 
                        ((holdersData.deltas['1day'] / (holdersData.breakdowns?.total_holders || 1)) * 100).toFixed(2) + '%' : 
                        '-0.14%'
                      }
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                    <div className="text-gray-400 text-xs mb-1">3 Days</div>
                    <div className={`font-bold text-lg ${
                      (holdersData?.deltas['3days'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['3days'] ? 
                        (holdersData.deltas['3days'] >= 0 ? '+' : '') + holdersData.deltas['3days'] : 
                        '-1039'
                      }
                    </div>
                    <div className={`text-xs ${
                      (holdersData?.deltas['3days'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holdersData?.deltas?.['3days'] ? 
                        (holdersData.deltas['3days'] >= 0 ? '+' : '') + 
                        ((holdersData.deltas['3days'] / (holdersData.breakdowns?.total_holders || 1)) * 100).toFixed(2) + '%' : 
                        '-0.11%'
                      }
                    </div>
                  </div>
                </div>

                <div className="text-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div className="text-gray-400 text-xs mb-1">7 Days</div>
                  <div className={`font-bold text-lg ${
                    (holdersData?.deltas['7days'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holdersData?.deltas?.['7days'] ? 
                      (holdersData.deltas['7days'] >= 0 ? '+' : '') + holdersData.deltas['7days'] : 
                      '-129'
                    }
                  </div>
                  <div className={`text-xs ${
                    (holdersData?.deltas['7days'] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holdersData?.deltas?.['7days'] ? 
                      (holdersData.deltas['7days'] >= 0 ? '+' : '') + 
                      ((holdersData.deltas['7days'] / (holdersData.breakdowns?.total_holders || 1)) * 100).toFixed(2) + '%' : 
                      '-0.01%'
                    }
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* BONK Historical Price Card */}
        <Card className="bg-gray-900 border-orange-500/20 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-orange-500 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">BONK Historical Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between group/item">
              <span className="text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">24h Range</span>
              <span className="text-white transition-all duration-500 group-hover/item:text-orange-400 group-hover/item:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">$0.0000218 - $0.00002326</span>
            </div>
            <div className="flex justify-between group/item">
              <span className="text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">7d Range</span>
              <span className="text-white transition-all duration-500 group-hover/item:text-orange-400 group-hover/item:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">$0.00002081 - $0.0000238</span>
            </div>
            <div className="space-y-1 group/ath">
              <div className="flex justify-between">
                <span className="text-gray-400 transition-all duration-500 group-hover/ath:text-gray-300">All-Time High</span>
                <div className="text-right">
                  <div className="text-white transition-all duration-500 group-hover/ath:text-orange-400 group-hover/ath:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">$0.00005825</div>
                  <div className="text-red-400 text-xs transition-all duration-500 group-hover/ath:scale-105 group-hover/ath:drop-shadow-[0_0_2px_rgba(239,68,68,0.6)]">↘ 62.5%</div>
                </div>
              </div>
              <div className="text-gray-500 text-xs text-right transition-all duration-500 group-hover/ath:text-gray-400">Nov 20, 2024 (9 months)</div>
            </div>
            <div className="space-y-1 group/atl">
              <div className="flex justify-between">
                <span className="text-gray-400 transition-all duration-500 group-hover/atl:text-gray-300">All-Time Low</span>
                <div className="text-right">
                  <div className="text-white transition-all duration-500 group-hover/atl:text-orange-400 group-hover/atl:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">$0.00000008614</div>
                  <div className="text-green-400 text-xs transition-all duration-500 group-hover/atl:scale-105 group-hover/atl:drop-shadow-[0_0_2px_rgba(34,197,94,0.6)]">↗ 25276.6%</div>
                </div>
              </div>
              <div className="text-gray-500 text-xs text-right transition-all duration-500 group-hover/atl:text-gray-400">Dec 29, 2022 (over 2 years)</div>
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
