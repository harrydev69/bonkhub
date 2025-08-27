"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  ExternalLink,
  TrendingUp,
  Clock,
  Users,
  Star,
  Filter,
  Flame,
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface MetaSearchDashboardProps {
  initialQuery?: string
}

type Category = "news" | "analysis" | "social" | "defi" | "nft"
type Sentiment = "positive" | "negative" | "neutral"

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  source: string
  timestamp: string
  relevance: number
  category: Category
  sentiment: Sentiment
  engagement: number
  trending?: boolean
  verified?: boolean
  author?: {
    name: string
    verified: boolean
  }
}

const latestBonkContent: SearchResult[] = [
  {
    id: "news-1",
    title: "BONK Reaches New All-Time High of $0.000055 as Solana Ecosystem Thrives",
    description:
      "BONK token surges 340% in the past month, driven by increased adoption, new partnerships, and growing utility within the Solana ecosystem. Daily trading volume exceeds $2.1B.",
    url: "https://coindesk.com/bonk-ath-solana-ecosystem-2024",
    source: "CoinDesk",
    timestamp: "2 hours ago",
    relevance: 98,
    category: "news",
    sentiment: "positive",
    engagement: 15420,
    trending: true,
    verified: true,
    author: { name: "Sarah Chen", verified: true },
  },
  {
    id: "news-2",
    title: "Solana Mobile Announces Exclusive BONK Integration for Saga Phone Users",
    description:
      "Solana Mobile reveals comprehensive BONK integration including native wallet support, exclusive airdrops, and mobile-first DeFi features for Saga phone owners.",
    url: "https://solanamobile.com/bonk-saga-integration-2024",
    source: "Solana Mobile",
    timestamp: "4 hours ago",
    relevance: 95,
    category: "news",
    sentiment: "positive",
    engagement: 12890,
    trending: true,
    verified: true,
    author: { name: "Solana Labs", verified: true },
  },
  {
    id: "news-3",
    title: "BONK Community Celebrates Historic 1.5 Million Holder Milestone",
    description:
      "The BONK ecosystem reaches unprecedented growth with 1.5 million unique holders, making it the most distributed memecoin on Solana and demonstrating strong community adoption.",
    url: "https://theblock.co/bonk-1-5-million-holders-milestone",
    source: "The Block",
    timestamp: "8 hours ago",
    relevance: 92,
    category: "news",
    sentiment: "positive",
    engagement: 18750,
    trending: true,
    verified: true,
    author: { name: "BONK Official", verified: true },
  },
  {
    id: "news-4",
    title: "Major CEX Listings: Coinbase and Kraken Add BONK Trading Pairs",
    description:
      "Two major centralized exchanges announce BONK listing with multiple trading pairs including BONK/USD, BONK/BTC, and BONK/ETH, increasing accessibility for retail investors.",
    url: "https://decrypt.co/coinbase-kraken-bonk-listings",
    source: "Decrypt",
    timestamp: "12 hours ago",
    relevance: 89,
    category: "news",
    sentiment: "positive",
    engagement: 14230,
    verified: true,
    author: { name: "Exchange News", verified: true },
  },
  {
    id: "analysis-1",
    title: "Deep Dive: BONK's Role in Solana's Memecoin Renaissance and Market Dynamics",
    description:
      "Comprehensive analysis of BONK's impact on Solana ecosystem growth, examining tokenomics, community governance, and its position as the flagship Solana memecoin driving retail adoption.",
    url: "https://messari.io/bonk-solana-memecoin-analysis-2024",
    source: "Messari",
    timestamp: "6 hours ago",
    relevance: 96,
    category: "analysis",
    sentiment: "positive",
    engagement: 8930,
    verified: true,
    author: { name: "Messari Research", verified: true },
  },
  {
    id: "analysis-2",
    title: "Technical Analysis: BONK Shows Strong Support at $0.000045 with Bullish Indicators",
    description:
      "Chart analysis reveals BONK maintaining strong support levels with RSI at 65, MACD showing bullish crossover, and volume profile suggesting continued upward momentum through Q1 2024.",
    url: "https://tradingview.com/bonk-technical-analysis-jan-2024",
    source: "TradingView",
    timestamp: "10 hours ago",
    relevance: 87,
    category: "analysis",
    sentiment: "positive",
    engagement: 6750,
    verified: true,
    author: { name: "CryptoAnalyst Pro", verified: true },
  },
  {
    id: "social-1",
    title: "🚀 BONK Army Trends Worldwide as Community Celebrates ATH Achievement",
    description:
      "The BONK community takes over social media with #BONKtoTheMoon trending globally. Over 50,000 tweets in 24 hours celebrating the new all-time high and ecosystem growth.",
    url: "https://twitter.com/bonk_inu/status/bonk-ath-celebration",
    source: "Twitter",
    timestamp: "3 hours ago",
    relevance: 94,
    category: "social",
    sentiment: "positive",
    engagement: 25670,
    trending: true,
    verified: true,
    author: { name: "BONK Official", verified: true },
  },
  {
    id: "social-2",
    title: "Elon Musk Tweets About BONK: 'Solana's Good Boy Deserves Recognition'",
    description:
      "Tesla CEO Elon Musk acknowledges BONK in a tweet, calling it 'Solana's good boy' and praising the community-driven approach. Tweet receives 2.3M views in first hour.",
    url: "https://twitter.com/elonmusk/status/bonk-good-boy-tweet",
    source: "Twitter",
    timestamp: "5 hours ago",
    relevance: 99,
    category: "social",
    sentiment: "positive",
    engagement: 89420,
    trending: true,
    verified: true,
    author: { name: "Elon Musk", verified: true },
  },
  {
    id: "defi-1",
    title: "Jupiter DEX Integrates BONK as Primary Trading Pair with Zero Fees",
    description:
      "Jupiter, Solana's leading DEX aggregator, announces BONK integration as a primary trading pair with zero fees for BONK holders, improving liquidity and reducing trading costs.",
    url: "https://jup.ag/bonk-integration-zero-fees",
    source: "Jupiter",
    timestamp: "4 hours ago",
    relevance: 93,
    category: "defi",
    sentiment: "positive",
    engagement: 11230,
    verified: true,
    author: { name: "Jupiter Team", verified: true },
  },
  {
    id: "nft-1",
    title: "Official BONK NFT Collection 'Bonk Buddies' Launches on Magic Eden",
    description:
      "The highly anticipated Bonk Buddies NFT collection launches with 10,000 unique pieces, offering holders exclusive BONK staking rewards, governance rights, and ecosystem access.",
    url: "https://magiceden.io/bonk-buddies-official-collection",
    source: "Magic Eden",
    timestamp: "5 hours ago",
    relevance: 91,
    category: "nft",
    sentiment: "positive",
    engagement: 13450,
    trending: true,
    verified: true,
    author: { name: "BONK NFT Team", verified: true },
  },
]

function comparableTime(ts: string): number {
  const now = Date.now()
  const rel = ts.trim().toLowerCase()
  const hMatch = rel.match(/^(\d+)\s*(hours?|h)\s*ago?$/)
  const dMatch = rel.match(/^(\d+)\s*(days?|d)\s*ago?$/)

  if (hMatch) return now - Number(hMatch[1]) * 60 * 60 * 1000
  if (dMatch) return now - Number(dMatch[1]) * 24 * 60 * 60 * 1000

  const parsed = Date.parse(ts)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatTimestampShort(ts: string): string {
  const rel = ts.toLowerCase()
  const map: Record<string, string> = {
    "2 hours ago": "2h",
    "3 hours ago": "3h",
    "4 hours ago": "4h",
    "5 hours ago": "5h",
    "6 hours ago": "6h",
    "8 hours ago": "8h",
    "10 hours ago": "10h",
    "12 hours ago": "12h",
    "1 day ago": "1d",
  }
  return map[rel] || ts
}

function humanEngagement(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function categoryDot(category: Category) {
  switch (category) {
    case "news":
      return "bg-blue-500"
    case "analysis":
      return "bg-purple-500"
    case "social":
      return "bg-green-500"
    case "defi":
      return "bg-orange-500"
    case "nft":
      return "bg-pink-500"
    default:
      return "bg-gray-500"
  }
}

function sentimentBadgeVariant(sentiment: Sentiment) {
  switch (sentiment) {
    case "positive":
      return "default"
    case "negative":
      return "destructive"
    case "neutral":
    default:
      return "secondary"
  }
}

export function MetaSearchDashboard({ initialQuery = "" }: MetaSearchDashboardProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState<"all" | Category>("all")
  const [searchResults, setSearchResults] = useState<SearchResult[]>(latestBonkContent)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"relevance" | "timestamp" | "engagement">("relevance")

  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery)
      void handleSearch(initialQuery)
    }
  }, [initialQuery])

  const filteredResults = useMemo(() => {
    return activeFilter === "all" ? searchResults : searchResults.filter((r) => r.category === activeFilter)
  }, [activeFilter, searchResults])

  const sortedResults = useMemo(() => {
    const arr = [...filteredResults]
    switch (sortBy) {
      case "timestamp":
        arr.sort((a, b) => comparableTime(b.timestamp) - comparableTime(a.timestamp))
        break
      case "engagement":
        arr.sort((a, b) => b.engagement - a.engagement)
        break
      case "relevance":
      default:
        arr.sort((a, b) => b.relevance - a.relevance)
    }
    return arr
  }, [filteredResults, sortBy])

  async function handleSearch(query?: string) {
    const q = (query ?? searchQuery).trim()
    if (!q) {
      setSearchResults(latestBonkContent)
      return
    }

    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 800))

      const filtered = latestBonkContent.filter((r) => {
        const t = q.toLowerCase()
        return (
          r.title.toLowerCase().includes(t) ||
          r.description.toLowerCase().includes(t) ||
          r.source.toLowerCase().includes(t) ||
          r.category.toLowerCase().includes(t)
        )
      })
      setSearchResults(filtered)

      toast({
        title: "Search Complete",
        description: `Found ${filtered.length} results for "${q}"`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: "Search Failed",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleSearch()
  }

  const totalEngagement = useMemo(() => sortedResults.reduce((s, r) => s + r.engagement, 0), [sortedResults])
  const avgRelevance = useMemo(
    () =>
      sortedResults.length ? Math.round(sortedResults.reduce((s, r) => s + r.relevance, 0) / sortedResults.length) : 0,
    [sortedResults],
  )
  const positivePct = useMemo(
    () =>
      sortedResults.length
        ? Math.round((sortedResults.filter((r) => r.sentiment === "positive").length / sortedResults.length) * 100)
        : 0,
    [sortedResults],
  )

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <h1 className="text-4xl font-bold text-white transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
          Meta Search
        </h1>
        <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
          Search across multiple platforms for BONK and Solana ecosystem content
        </p>
      </div>

      {/* Search bar + sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <form onSubmit={handleFormSubmit} className="relative flex-1 max-w-2xl group/search">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110" />
          <Input
            type="text"
            placeholder="Search for BONK news, articles, discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
          />
          <Button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 h-7 text-sm font-medium hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-300 transform-gpu z-10 rounded-md"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 transition-all duration-500 hover:text-gray-300">Sort by:</span>
          <div className="flex gap-1">
            {[
              { value: "relevance", label: "Relevance" },
              { value: "timestamp", label: "Latest" },
              { value: "engagement", label: "Popular" },
            ].map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                onClick={() => setSortBy(opt.value as typeof sortBy)}
                className={`${
                  sortBy === opt.value
                    ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
                }`}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="group/kpi bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 transition-all duration-500 group-hover/kpi:text-gray-300">
              <Search className="h-4 w-4 transition-all duration-500 group-hover/kpi:scale-110 group-hover/kpi:rotate-2 group-hover/kpi:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              Total Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/kpi:text-orange-400">
              {sortedResults.length.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/kpi:text-gray-400">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="group/kpi bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 transition-all duration-500 group-hover/kpi:text-gray-300">
              <Star className="h-4 w-4 transition-all duration-500 group-hover/kpi:scale-110 group-hover/kpi:rotate-2 group-hover/kpi:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              Avg Relevance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/kpi:text-orange-400">
              {avgRelevance}%
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/kpi:text-gray-400">
              Content quality
            </p>
          </CardContent>
        </Card>

        <Card className="group/kpi bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 transition-all duration-500 group-hover/kpi:text-gray-300">
              <Users className="h-4 w-4 transition-all duration-500 group-hover/kpi:scale-110 group-hover/kpi:rotate-2 group-hover/kpi:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              Total Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/kpi:text-orange-400">
              {humanEngagement(totalEngagement)}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/kpi:text-gray-400">
              Likes, shares, comments
            </p>
          </CardContent>
        </Card>

        <Card className="group/kpi bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 transition-all duration-500 group-hover/kpi:text-gray-300">
              <TrendingUp className="h-4 w-4 transition-all duration-500 group-hover/kpi:scale-110 group-hover/kpi:rotate-2 group-hover/kpi:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              Positive Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 transition-all duration-500 group-hover/kpi:text-green-400">
              {positivePct}%
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/kpi:text-gray-400">
              Of all results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="group/tabs bg-gray-900 border-gray-800 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
            <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
              All Results
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
              News
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
              Social
            </TabsTrigger>
            <TabsTrigger value="defi" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
              DeFi
            </TabsTrigger>
            <TabsTrigger value="nft" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
              NFT
            </TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm" 
            className="group/filter bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
          >
            <Filter className="h-4 w-4 mr-2 transition-all duration-500 group-hover/filter:scale-110 group-hover/filter:rotate-2" />
            Filters
          </Button>
        </div>

        <TabsContent value={activeFilter} className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="group/loading bg-gray-900 border-gray-800 animate-pulse hover:bg-gray-850 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-2 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedResults.length === 0 ? (
            <Card className="group/empty bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4 transition-all duration-500 group-hover/empty:text-orange-400 group-hover/empty:scale-110" />
                <h3 className="text-lg font-semibold text-white mb-2 transition-all duration-500 group-hover/empty:text-orange-400">
                  No results
                </h3>
                <p className="text-gray-400 mb-4 transition-all duration-500 group-hover/empty:text-gray-300">
                  Try different keywords or clear your filters.
                </p>
                <Button
                  onClick={() => {
                    setActiveFilter("all")
                    setSearchQuery("")
                    setSearchResults(latestBonkContent)
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                >
                  Reset Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedResults.map((r) => (
                <Card
                  key={r.id}
                  className="group/result bg-gray-900 border-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${categoryDot(r.category)} transition-all duration-500 group-hover/result:scale-150`} />
                          <h3 className="text-lg font-semibold text-white hover:text-orange-400 transition-all duration-500 group-hover/result:text-orange-400 cursor-pointer">
                            {r.title}
                          </h3>
                          {r.trending && (
                            <Badge variant="secondary" className="group/trending bg-red-500/20 text-red-400 border-red-500/30 transition-all duration-500 group-hover/trending:scale-105 group-hover/trending:shadow-[0_0_4px_rgba(239,68,68,0.3)]">
                              <Flame className="h-3 w-3 mr-1 transition-all duration-500 group-hover/trending:scale-110 group-hover/trending:rotate-2" />
                              Trending
                            </Badge>
                          )}
                          {r.verified && (
                            <Badge variant="secondary" className="group/verified bg-blue-500/20 text-blue-400 border-blue-500/30 transition-all duration-500 group-hover/verified:scale-105 group-hover/verified:shadow-[0_0_4px_rgba(59,130,246,0.3)]">
                              <CheckCircle className="h-3 w-3 mr-1 transition-all duration-500 group-hover/verified:scale-110 group-hover/verified:rotate-2" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="font-medium text-gray-300 transition-all duration-500 group-hover/result:text-orange-400">
                            {r.source}
                          </span>
                          {r.author && (
                            <>
                              <span>•</span>
                              <span className="text-gray-400 transition-all duration-500 group-hover/result:text-gray-300">
                                {r.author.name}
                                {r.author.verified && (
                                  <CheckCircle className="h-3 w-3 inline ml-1 text-blue-400 transition-all duration-500 group-hover/result:scale-110 group-hover/result:rotate-2" />
                                )}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1 transition-all duration-500 group-hover/result:text-gray-300">
                            <Clock className="h-3 w-3 transition-all duration-500 group-hover/result:scale-110 group-hover/result:rotate-2" />
                            {formatTimestampShort(r.timestamp)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 transition-all duration-500 group-hover/result:text-gray-300">
                            <Star className="h-3 w-3 transition-all duration-500 group-hover/result:scale-110 group-hover/result:rotate-2" />
                            {r.relevance}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="group/category bg-gray-800 border-gray-700 text-gray-300 capitalize transition-all duration-500 group-hover/category:scale-105 group-hover/category:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                            {r.category}
                          </Badge>
                          <Badge variant={sentimentBadgeVariant(r.sentiment)} className="group/sentiment capitalize transition-all duration-500 group-hover/sentiment:scale-105 group-hover/sentiment:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                            {r.sentiment}
                          </Badge>
                        </div>

                        <p className="text-gray-300 leading-relaxed transition-all duration-500 group-hover/result:text-gray-200">
                          {r.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1 transition-all duration-500 group-hover/result:text-gray-300">
                              <Heart className="h-4 w-4 transition-all duration-500 group-hover/result:scale-110 group-hover/result:rotate-2" />
                              {humanEngagement(Math.floor(r.engagement * 0.6))}
                            </span>
                            <span className="flex items-center gap-1 transition-all duration-500 group-hover/result:text-gray-300">
                              <Share2 className="h-4 w-4 transition-all duration-500 group-hover/result:scale-110 group-hover/result:rotate-2" />
                              {humanEngagement(Math.floor(r.engagement * 0.2))}
                            </span>
                            <span className="flex items-center gap-1 transition-all duration-500 group-hover/result:text-gray-300">
                              <MessageCircle className="h-4 w-4 transition-all duration-500 group-hover/result:scale-110 group-hover/result:rotate-2" />
                              {humanEngagement(Math.floor(r.engagement * 0.2))}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="group/view bg-gray-800 border-gray-700 text-gray-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                            onClick={() => window.open(r.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2 transition-all duration-500 group-hover/view:scale-110 group-hover/view:rotate-2" />
                            View Source
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {sortedResults.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="group/load bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
          >
            Load More Results
          </Button>
        </div>
      )}
    </div>
  )
}
