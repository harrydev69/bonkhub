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
  Brain,
  Hash,
  User,
  Rss,
  BarChart3,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  Target,
  Globe,
  Twitter,
  Youtube,
  MessageSquare,
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

interface AIInsight {
  summary: string
  timestamp: string
  sentiment: "bullish" | "bearish" | "neutral"
  keyPoints: string[]
  marketContext: string
}

interface RelatedTopic {
  name: string
  symbol: string
  relevance: number
  sentiment: "positive" | "negative" | "neutral"
  change24h: number
}

interface Creator {
  id: string
  name: string
  username: string
  platform: "twitter" | "youtube" | "reddit" | "tiktok"
  followers: number
  engagement: number
  posts: number
  verified: boolean
  avatar: string
  lastPost: string
  sentiment: "positive" | "negative" | "neutral"
}

interface SocialPost {
  id: string
  content: string
  author: string
  platform: "twitter" | "reddit" | "youtube" | "tiktok"
  timestamp: string
  engagement: {
    likes: number
    shares: number
    comments: number
  }
  sentiment: "positive" | "negative" | "neutral"
  trending: boolean
  url: string
}

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  url: string
  timestamp: string
  sentiment: "positive" | "negative" | "neutral"
  relevance: number
  image?: string
}

interface TokenStats {
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  circulatingSupply: number
  totalSupply: number
  ath: number
  athChangePercentage: number
  atl: number
  atlChangePercentage: number
  rank: number
}

// Mock data for demonstration
const mockData = {
  aiInsight: {
    summary: "BONK is experiencing significant momentum with increased institutional interest and growing community engagement. The token has shown strong social dominance in the Solana ecosystem, with positive sentiment across major social platforms. Recent developments include new partnership announcements and increased DeFi integration.",
    timestamp: "2 hours ago",
    sentiment: "bullish" as const,
    keyPoints: [
      "Institutional interest growing",
      "Strong social dominance in Solana ecosystem",
      "New partnerships announced",
      "Increased DeFi integration",
      "Positive community sentiment"
    ],
    marketContext: "BONK's social volume increased 45% in the last 24 hours, with mentions across Twitter, Reddit, and Discord reaching new highs. The token's social dominance in the memecoin category has grown to 12.5%."
  },
  relatedTopics: [
    { name: "Solana", symbol: "SOL", relevance: 95, sentiment: "positive", change24h: 8.5 },
    { name: "Jupiter", symbol: "JUP", relevance: 87, sentiment: "positive", change24h: 12.3 },
    { name: "Raydium", symbol: "RAY", relevance: 82, sentiment: "positive", change24h: 6.7 },
    { name: "Orca", symbol: "ORCA", relevance: 78, sentiment: "neutral", change24h: -2.1 },
    { name: "Serum", symbol: "SRM", relevance: 75, sentiment: "positive", change24h: 4.2 }
  ],
  creators: [
    {
      id: "1",
      name: "BONK Official",
      username: "@bonk_inu",
      platform: "twitter",
      followers: 1250000,
      engagement: 98,
      posts: 45,
      verified: true,
      avatar: "https://via.placeholder.com/40",
      lastPost: "2 hours ago",
      sentiment: "positive"
    },
    {
      id: "2",
      name: "Solana Labs",
      username: "@solanalabs",
      platform: "twitter",
      followers: 890000,
      engagement: 95,
      posts: 23,
      verified: true,
      avatar: "https://via.placeholder.com/40",
      lastPost: "4 hours ago",
      sentiment: "positive"
    },
    {
      id: "3",
      name: "Crypto Analyst Pro",
      username: "@cryptoanalyst",
      platform: "youtube",
      followers: 450000,
      engagement: 92,
      posts: 12,
      verified: true,
      avatar: "https://via.placeholder.com/40",
      lastPost: "6 hours ago",
      sentiment: "positive"
    },
    {
      id: "4",
      name: "DeFi Researcher",
      username: "@defiresearcher",
      platform: "reddit",
      followers: 125000,
      engagement: 88,
      posts: 18,
      verified: false,
      avatar: "https://via.placeholder.com/40",
      lastPost: "8 hours ago",
      sentiment: "neutral"
    }
  ],
  socialPosts: [
    {
      id: "1",
      content: "🚀 BONK just hit another milestone! The community is absolutely amazing. This is just the beginning of what's possible on Solana! #BONK #Solana #ToTheMoon",
      author: "BONK Official",
      platform: "twitter",
      timestamp: "1 hour ago",
      engagement: { likes: 15420, shares: 8920, comments: 3240 },
      sentiment: "positive",
      trending: true,
      url: "https://twitter.com/bonk_inu/status/123456789"
    },
    {
      id: "2",
      content: "Just analyzed BONK's recent price action and social metrics. The correlation between social volume and price movement is incredibly strong. This token has serious potential! 📊",
      author: "Crypto Analyst Pro",
      platform: "youtube",
      timestamp: "3 hours ago",
      engagement: { likes: 8930, shares: 4560, comments: 1230 },
      sentiment: "positive",
      trending: true,
      url: "https://youtube.com/watch?v=123456789"
    },
    {
      id: "3",
      content: "BONK holders, what's your take on the recent developments? The ecosystem is growing so fast, it's hard to keep up! 🚀",
      author: "DeFi Researcher",
      platform: "reddit",
      timestamp: "5 hours ago",
      engagement: { likes: 6750, shares: 2340, comments: 890 },
      sentiment: "positive",
      trending: false,
      url: "https://reddit.com/r/bonk/123456789"
    }
  ],
  news: [
    {
      id: "1",
      title: "BONK Reaches New All-Time High as Solana Ecosystem Thrives",
      summary: "BONK token surges 340% in the past month, driven by increased adoption, new partnerships, and growing utility within the Solana ecosystem.",
      source: "CoinDesk",
      url: "https://coindesk.com/bonk-ath-solana-ecosystem-2024",
      timestamp: "2 hours ago",
      sentiment: "positive",
      relevance: 98,
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: "2",
      title: "Major CEX Listings: Coinbase and Kraken Add BONK Trading Pairs",
      summary: "Two major centralized exchanges announce BONK listing with multiple trading pairs including BONK/USD, BONK/BTC, and BONK/ETH.",
      source: "Decrypt",
      url: "https://decrypt.co/coinbase-kraken-bonk-listings",
      timestamp: "6 hours ago",
      sentiment: "positive",
      relevance: 95,
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: "3",
      title: "BONK Community Celebrates Historic 1.5 Million Holder Milestone",
      summary: "The BONK ecosystem reaches unprecedented growth with 1.5 million unique holders, making it the most distributed memecoin on Solana.",
      source: "The Block",
      url: "https://theblock.co/bonk-1-5-million-holders-milestone",
      timestamp: "12 hours ago",
      sentiment: "positive",
      relevance: 92,
      image: "https://via.placeholder.com/300x200"
    }
  ],
  tokenStats: {
    price: 0.00003435,
    change24h: 15.7,
    marketCap: 2340000000,
    volume24h: 45600000,
    circulatingSupply: 68000000000000,
    totalSupply: 100000000000000,
    ath: 0.000055,
    athChangePercentage: -37.5,
    atl: 0.00000001,
    atlChangePercentage: 343400,
    rank: 33
  }
}

export function MetaSearchDashboard({ initialQuery = "" }: MetaSearchDashboardProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery)
      void handleSearch(initialQuery)
    }
  }, [initialQuery])

  async function handleSearch(query?: string) {
    const q = (query ?? searchQuery).trim()
    if (!q) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      // Simulate API call delay
      await new Promise((r) => setTimeout(r, 1000))
      
      toast({
        title: "Search Complete",
        description: `Found comprehensive data for "${q}"`,
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

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
    return String(num)
  }

  const formatPrice = (price: number) => {
    if (price < 0.0001) return `$${price.toFixed(8)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-20 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center group/icon transition-all duration-500 hover:scale-110">
        <Search className="w-12 h-12 text-gray-400 group-hover/icon:text-orange-400 transition-all duration-500" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-white">Search for a Token to Get Started</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover comprehensive social intelligence, market data, and community insights for any cryptocurrency. 
          Search by token name, symbol, or contract address.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          AI-Powered Insights
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          Social Sentiment
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          Real-time Data
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
          <p className="text-gray-400 text-sm">Get AI-generated summaries of current developments, sentiment analysis, and market context.</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Social Intelligence</h3>
          <p className="text-gray-400 text-sm">Track top creators, trending conversations, and community engagement across all platforms.</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Market Data</h3>
          <p className="text-gray-400 text-sm">Access real-time prices, market cap, volume, and comprehensive token statistics.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <h1 className="text-4xl font-bold text-white transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
          Meta Search
        </h1>
        <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
          Search across multiple platforms for comprehensive crypto intelligence
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <form onSubmit={handleFormSubmit} className="relative w-full max-w-2xl group/search">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110" />
          <Input
            type="text"
            placeholder="Search for tokens, topics, or trends..."
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
      </div>

      {/* Show empty state if no search has been performed */}
      {!hasSearched && !loading && <EmptyState />}

      {/* Show loading state */}
      {loading && (
        <div className="text-center py-20 space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
            <Search className="w-12 h-12 text-orange-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Searching...</h2>
            <p className="text-gray-400 text-lg">Gathering comprehensive data from multiple sources...</p>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Show results only after search */}
      {hasSearched && !loading && (
        <>
          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="group/tabs bg-gray-900 border-gray-800 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
                <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
                  Social
                </TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
                  News
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* AI Insights */}
              <Card className="group/ai bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/ai:text-orange-400">
                    <Brain className="h-6 w-6 text-orange-400 transition-all duration-500 group-hover/ai:scale-110 group-hover/ai:rotate-2" />
                    AI Insights
                    <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {mockData.aiInsight.timestamp}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      mockData.aiInsight.sentiment === "bullish" ? "bg-green-500" : 
                      mockData.aiInsight.sentiment === "bearish" ? "bg-red-500" : "bg-gray-500"
                    }`} />
                    <div className="flex-1">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {mockData.aiInsight.summary}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mockData.aiInsight.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                            {point}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-gray-800 rounded-lg border-l-4 border-orange-500">
                        <p className="text-sm text-gray-300">
                          <strong>Market Context:</strong> {mockData.aiInsight.marketContext}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Topics */}
              <Card className="group/topics bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/topics:text-orange-400">
                    <Hash className="h-6 w-6 text-blue-400 transition-all duration-500 group-hover/topics:scale-110 group-hover/topics:rotate-2" />
                    Related Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockData.relatedTopics.map((topic, index) => (
                      <div key={index} className="group/topic p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white group-hover/topic:text-orange-400 transition-colors duration-300">
                            {topic.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {topic.symbol}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Relevance: {topic.relevance}%</span>
                          <span className={`flex items-center gap-1 ${
                            topic.change24h >= 0 ? "text-green-400" : "text-red-400"
                          }`}>
                            {topic.change24h >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(topic.change24h)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Creators */}
              <Card className="group/creators bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/creators:text-orange-400">
                    <User className="h-6 w-6 text-purple-400 transition-all duration-500 group-hover/creators:scale-110 group-hover/creators:rotate-2" />
                    Top Creators & Influencers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.creators.map((creator, index) => (
                      <div key={creator.id} className="group/creator flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                        <div className="relative">
                          <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full" />
                          {creator.verified && (
                            <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-400 bg-gray-800 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white group-hover/creator:text-orange-400 transition-colors duration-300">
                              {creator.name}
                            </h4>
                            <span className="text-gray-400 text-sm">@{creator.username}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {creator.platform}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{formatNumber(creator.followers)} followers</span>
                            <span>Engagement: {creator.engagement}%</span>
                            <span>{creator.posts} posts</span>
                            <span className="text-gray-500">{creator.lastPost}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-400">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Token Stats */}
              <Card className="group/stats bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/stats:text-orange-400">
                    <BarChart3 className="h-6 w-6 text-green-400 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2" />
                    Full Token Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">Current Price</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatPrice(mockData.tokenStats.price)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        mockData.tokenStats.change24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {mockData.tokenStats.change24h >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        {Math.abs(mockData.tokenStats.change24h)}%
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">Market Cap</div>
                      <div className="text-2xl font-bold text-white">
                        ${(mockData.tokenStats.marketCap / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">24h Volume</div>
                      <div className="text-2xl font-bold text-white">
                        ${(mockData.tokenStats.volume24h / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">Rank</div>
                      <div className="text-2xl font-bold text-white">
                        #{mockData.tokenStats.rank}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6">
              <Card className="group/social bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/social:text-orange-400">
                    <MessageSquare className="h-6 w-6 text-blue-400 transition-all duration-500 group-hover/social:scale-110 group-hover/social:rotate-2" />
                    Top Social Posts & Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.socialPosts.map((post) => (
                      <div key={post.id} className="group/post p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              post.platform === "twitter" ? "bg-blue-500" :
                              post.platform === "youtube" ? "bg-red-500" :
                              post.platform === "reddit" ? "bg-orange-500" : "bg-pink-500"
                            }`}>
                              {post.platform === "twitter" ? <Twitter className="w-5 h-5 text-white" /> :
                               post.platform === "youtube" ? <Youtube className="w-5 h-5 text-white" /> :
                               post.platform === "reddit" ? <MessageSquare className="w-5 h-5 text-white" /> :
                               <MessageSquare className="w-5 h-5 text-white" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-white group-hover/post:text-orange-400 transition-colors duration-300">
                                {post.author}
                              </span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {post.platform}
                              </Badge>
                              {post.trending && (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                                  <Flame className="h-3 w-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              <span className="text-gray-400 text-sm ml-auto">{post.timestamp}</span>
                            </div>
                            <p className="text-gray-300 mb-3 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {formatNumber(post.engagement.likes)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-4 w-4" />
                                {formatNumber(post.engagement.shares)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {formatNumber(post.engagement.comments)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              <Card className="group/news bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/news:text-orange-400">
                    <Rss className="h-6 w-6 text-green-400 transition-all duration-500 group-hover/news:scale-110 group-hover/news:rotate-2" />
                    Latest News & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockData.news.map((article) => (
                      <div key={article.id} className="group/article bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                        <img src={article.image} alt={article.title} className="w-full h-40 object-cover group-hover/article:scale-105 transition-transform duration-300" />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {article.source}
                            </Badge>
                            <span className="text-gray-400 text-sm">{article.timestamp}</span>
                          </div>
                          <h3 className="font-semibold text-white mb-2 group-hover/article:text-orange-400 transition-colors duration-300 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Relevance: {article.relevance}%</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-300"
                              onClick={() => window.open(article.url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="group/analytics bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/analytics:text-orange-400">
                    <Activity className="h-6 w-6 text-purple-400 transition-all duration-500 group-hover/analytics:scale-110 group-hover/analytics:rotate-2" />
                    Advanced Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Social Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">Social Score</span>
                          <span className="text-white font-semibold">87/100</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">Community Score</span>
                          <span className="text-white font-semibold">92/100</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">Developer Score</span>
                          <span className="text-white font-semibold">78/100</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Market Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">ATH</span>
                          <span className="text-white font-semibold">{formatPrice(mockData.tokenStats.ath)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">ATL</span>
                          <span className="text-white font-semibold">{formatPrice(mockData.tokenStats.atl)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">Circulating Supply</span>
                          <span className="text-white font-semibold">{formatNumber(mockData.tokenStats.circulatingSupply)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
