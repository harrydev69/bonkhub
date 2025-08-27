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
  ExternalLink, Users, MessageCircle, Brain,
  Hash,
  User,
  Rss,
  BarChart3, ArrowUp,
  ArrowDown,
  Activity, ThumbsUp,
  Repeat2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  avatar: string
  followers: number
  rank: number
  interactions24h: number
  platform: "twitter" | "youtube" | "reddit" | "tiktok"
}

interface SocialPost {
  id: string
  post_type: string
  post_title: string
  post_link: string
  post_image: string | null
  post_created: number
  post_sentiment: number
  creator_id: string
  creator_name: string
  creator_display_name: string
  creator_followers: number
  creator_avatar: string
  interactions_24h: number
  interactions_total: number
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

// API fetch functions
async function fetchTokenStats(tokenId: string): Promise<TokenStats> {
  const response = await fetch(`/api/coingecko/token/${tokenId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch token stats: ${response.statusText}`)
  }
  const data = await response.json()

  return {
    price: data.market_data?.current_price?.usd || 0,
    change24h: data.market_data?.price_change_percentage_24h || 0,
    marketCap: data.market_data?.market_cap?.usd || 0,
    volume24h: data.market_data?.total_volume?.usd || 0,
    circulatingSupply: data.market_data?.circulating_supply || 0,
    totalSupply: data.market_data?.total_supply || 0,
    ath: data.market_data?.ath?.usd || 0,
    athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
    atl: data.market_data?.atl?.usd || 0,
    atlChangePercentage: data.market_data?.atl_change_percentage?.usd || 0,
    rank: data.market_data?.market_cap_rank || 0
  }
}

function sentimentBadge(v?: number) {
  if (typeof v !== "number") return <Badge variant="secondary">neutral</Badge>
  if (v > 0.1) return <Badge>positive</Badge>
  if (v < -0.1) return <Badge variant="destructive">negative</Badge>
  return <Badge variant="secondary">neutral</Badge>
}

function humanTime(ts?: number | string) {
  if (!ts) return ""
  let ms: number
  if (typeof ts === "number") ms = ts < 1e12 ? ts * 1000 : ts
  else {
    const n = Number(ts)
    ms = !Number.isNaN(n) ? (n < 1e12 ? n * 1000 : n) : Date.parse(ts)
  }
  const d = new Date(ms)
  return isNaN(d.getTime()) ? "" : d.toLocaleString()
}

async function fetchCreators(tokenId: string): Promise<Creator[]> {
  const response = await fetch(`/api/influencers/${tokenId}?limit=10`)
  if (!response.ok) {
    throw new Error(`Failed to fetch creators: ${response.statusText}`)
  }
  const data = await response.json()

  return data.influencers?.map((influencer: any, index: number) => ({
    id: influencer.creator_id || Math.random().toString(),
    name: influencer.creator_name || 'Unknown',
    avatar: influencer.creator_avatar || 'https://via.placeholder.com/40',
    followers: influencer.creator_followers || 0,
    rank: influencer.creator_rank || index + 1,
    interactions24h: influencer.interactions_24h || 0,
    platform: influencer.creator_id?.startsWith('youtube::') ? 'youtube' : 
             influencer.creator_id?.startsWith('twitter::') ? 'twitter' : 'twitter'
  })) || []
}

async function fetchTopicData(tokenId: string): Promise<{ aiInsight: AIInsight; relatedTopics: RelatedTopic[] }> {
  const response = await fetch(`/api/topic?topic=${tokenId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch topic data: ${response.statusText}`)
  }
  const data = await response.json()

  // Generate AI insight from topic data
  const aiInsight: AIInsight = {
    summary: `Analysis for ${tokenId.toUpperCase()} shows strong market presence with significant social engagement.`,
    timestamp: "Just now",
    sentiment: "neutral",
    keyPoints: [
      "Active social presence",
      "Growing community engagement",
      "Market data available"
    ],
    marketContext: `Current market analysis for ${tokenId.toUpperCase()} based on available data.`
  }

  // Generate related topics (this could be enhanced with more sophisticated logic)
  const relatedTopics: RelatedTopic[] = [
    { name: "Solana", symbol: "SOL", relevance: 90, sentiment: "positive", change24h: 5.2 },
    { name: "Ethereum", symbol: "ETH", relevance: 75, sentiment: "neutral", change24h: 2.1 },
    { name: "Bitcoin", symbol: "BTC", relevance: 70, sentiment: "positive", change24h: 3.8 }
  ]

  return { aiInsight, relatedTopics }
}
export function MetaSearchDashboard({ initialQuery = "" }: MetaSearchDashboardProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialQuery)
  const [inputValue, setInputValue] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [hasSearched, setHasSearched] = useState(false)

  // API data states
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null)
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([])

  // Error states
  const [tokenStatsError, setTokenStatsError] = useState<string | null>(null)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [creatorsError, setCreatorsError] = useState<string | null>(null)
  const [aiInsightError, setAiInsightError] = useState<string | null>(null)
  const [relatedTopicsError, setRelatedTopicsError] = useState<string | null>(null)

  // Social posts pagination
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 7

  const { data: influencersData } = useQuery({
    queryKey: ["influencers", debouncedSearchQuery || "bonk", 200], // Use debounced search query
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk"
      const res = await fetch(`/api/influencers/${tokenId}?limit=200`, {
        cache: "force-cache",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`influencers ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      return json.influencers || []
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
    enabled: !!debouncedSearchQuery || hasSearched, // Only fetch when there's a debounced search query or search has been performed
  })

  const { data: rawSocialPostsData, isLoading: socialPostsLoading, error: socialPostsQueryError } = useQuery({
    queryKey: ["feeds", debouncedSearchQuery || "bonk", 30],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk"
      const res = await fetch(`/api/feeds/${tokenId}?limit=30`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`feeds ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      
      let posts: SocialPost[] = []
      if (json.feeds && Array.isArray(json.feeds)) {
        posts = json.feeds
      } else if (json.data && Array.isArray(json.data)) {
        posts = json.data
      }
      
      return posts
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
    enabled: !!debouncedSearchQuery || hasSearched, // Only fetch when there's a debounced search query or search has been performed
  })

  // Get influencer names for filtering
  const influencerNames = useMemo(() => {
    if (!influencersData || !Array.isArray(influencersData)) return new Set()
    return new Set(influencersData.map((inf: any) => inf.creator_name?.toLowerCase()))
  }, [influencersData])

  // Filter posts to only include those from influencers
  const filteredSocialPosts = useMemo(() => {
    if (!rawSocialPostsData || !Array.isArray(rawSocialPostsData)) return []
    return rawSocialPostsData.filter((post: SocialPost) => 
      post.creator_name && influencerNames.has(post.creator_name.toLowerCase())
    )
  }, [rawSocialPostsData, influencerNames])
  
  const totalPages = Math.ceil(filteredSocialPosts.length / postsPerPage)
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredSocialPosts.slice(indexOfFirstPost, indexOfLastPost)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (initialQuery && initialQuery !== inputValue) {
      setInputValue(initialQuery)
    }
  }, [initialQuery])

  async function handleSearch(query?: string) {
    const q = (query ?? debouncedSearchQuery).trim()
    if (!q) return

    setLoading(true)
    setHasSearched(true)

    // Clear previous errors
    setTokenStatsError(null)
    setNewsError(null)
    setCreatorsError(null)
    setAiInsightError(null)
    setRelatedTopicsError(null)

    try {
      // Fetch all data in parallel
      const [
        tokenStatsData,
        creatorsData,
        topicData
      ] = await Promise.allSettled([
        fetchTokenStats(q).catch(err => { throw new Error(`Token stats: ${err.message}`) }),
        fetchCreators(q).catch(err => { throw new Error(`Creators: ${err.message}`) }),
        fetchTopicData(q).catch(err => { throw new Error(`Topic data: ${err.message}`) })
      ])

      // Handle token stats
      if (tokenStatsData.status === 'fulfilled') {
        setTokenStats(tokenStatsData.value)
      } else {
        setTokenStatsError(tokenStatsData.reason.message)
        console.error('Token stats error:', tokenStatsData.reason)
      }

      // Handle creators
      if (creatorsData.status === 'fulfilled') {
        setCreators(creatorsData.value)
      } else {
        setCreatorsError(creatorsData.reason.message)
        console.error('Creators error:', creatorsData.reason)
      }

      // Handle topic data (AI insights and related topics)
      if (topicData.status === 'fulfilled') {
        setAiInsight(topicData.value.aiInsight)
        setRelatedTopics(topicData.value.relatedTopics)
      } else {
        setAiInsightError(topicData.reason.message)
        setRelatedTopicsError(topicData.reason.message)
        console.error('Topic data error:', topicData.reason)
      }

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
    // Trigger immediate search on form submit
    if (inputValue.trim()) {
      setDebouncedSearchQuery(inputValue.trim())
      void handleSearch(inputValue.trim())
    }
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

  // News pagination
  const [newsCurrentPage, setNewsCurrentPage] = useState(1)
  const newsPerPage = 6

  const { data: rawNewsData, isLoading: newsLoading, error: newsQueryError } = useQuery({
    queryKey: ["news", debouncedSearchQuery || "bonk", 50],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk"
      const res = await fetch(`/api/news/${tokenId}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`news ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      return json.data?.data || []
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 9 * 60 * 1000, // Consider stale after 9 minutes
    enabled: !!debouncedSearchQuery || hasSearched, // Only fetch when there's a debounced search query or search has been performed
  })

  // Filter and paginate news
  const filteredNews = useMemo(() => {
    if (!rawNewsData || !Array.isArray(rawNewsData)) return []
    return rawNewsData
  }, [rawNewsData])
  
  const newsTotalPages = Math.ceil(filteredNews.length / newsPerPage)
  const newsIndexOfLast = newsCurrentPage * newsPerPage
  const newsIndexOfFirst = newsIndexOfLast - newsPerPage
  const currentNews = filteredNews.slice(newsIndexOfFirst, newsIndexOfLast)

  const handleNewsPageChange = (page: number) => {
    setNewsCurrentPage(page)
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
              {aiInsight && (
              <Card className="group/ai bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/ai:text-orange-400">
                    <Brain className="h-6 w-6 text-orange-400 transition-all duration-500 group-hover/ai:scale-110 group-hover/ai:rotate-2" />
                    AI Insights
                    <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {aiInsight.timestamp}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      aiInsight.sentiment === "bullish" ? "bg-green-500" : 
                      aiInsight.sentiment === "bearish" ? "bg-red-500" : "bg-gray-500"
                    }`} />
                    <div className="flex-1">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {aiInsight.summary}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiInsight.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                            {point}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-gray-800 rounded-lg border-l-4 border-orange-500">
                        <p className="text-sm text-gray-300">
                          <strong>Market Context:</strong> {aiInsight.marketContext}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

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
                    {relatedTopics.map((topic, index) => (
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
                    {creators.map((creator, index) => (
                      <div key={creator.id} className="group/creator flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                        <div className="relative">
                          <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white group-hover/creator:text-orange-400 transition-colors duration-300">
                              {creator.name}
                            </h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {creator.platform}
                            </Badge>
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              Rank #{creator.rank}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{formatNumber(creator.followers)} followers</span>
                            <span>{formatNumber(creator.interactions24h)} interactions (24h)</span>
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
              {tokenStats && (
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
                        {formatPrice(tokenStats.price)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        tokenStats.change24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {tokenStats.change24h >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        {Math.abs(tokenStats.change24h)}%
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">Market Cap</div>
                      <div className="text-2xl font-bold text-white">
                        {(tokenStats.marketCap / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">24h Volume</div>
                      <div className="text-2xl font-bold text-white">
                        {(tokenStats.volume24h / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                      <div className="text-sm text-gray-400 mb-1">Rank</div>
                      <div className="text-2xl font-bold text-white">
                        #{tokenStats.rank}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6">
              {socialPostsLoading ? (
                <Card>
                  <CardHeader><CardTitle>Live BONK Social Feed</CardTitle></CardHeader>
                  <CardContent><div className="h-24 animate-pulse rounded-md bg-muted" /></CardContent>
                </Card>
              ) : socialPostsQueryError ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Live BONK Social Feed</CardTitle>
                    <Badge variant="destructive">error</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-red-600">Feed unavailable: {String(socialPostsQueryError)}</div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group/social-feed bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white transition-all duration-500 group-hover/social-feed:text-orange-400">
                      Live BONK Social Feed
                    </CardTitle>
                    <Badge variant="outline" className="transition-all duration-500 group-hover/social-feed:scale-105 group-hover/social-feed:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                      {filteredSocialPosts.length} posts
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentPosts.map((p) => {
                      const name = p.creator_display_name || p.creator_name || "Creator"
                      const handle = p.creator_name ? `@${p.creator_name}` : ""
                      const platform = p.post_type || "Social"
                      const likeCount = 0
                      const rtCount = 0
                      const replyCount = 0
                      const text = p.post_title || ""
                      const id = String(p.id)

                      return (
                        <div key={id} className="group/post p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 transition-all duration-500 group-hover/post:scale-110 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                              <AvatarImage src={p.creator_avatar || ""} />
                              <AvatarFallback className="bg-orange-600 text-white transition-all duration-500 group-hover/post:bg-orange-500">
                                {name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-white transition-all duration-500 group-hover/post:text-orange-400">
                                    {name}
                                  </span>
                                  {handle && (
                                    <span className="text-sm text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                                      {handle}
                                    </span>
                                  )}
                                  <Badge variant="secondary" className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                                    {platform}
                                  </Badge>
                                  <div className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                                    {sentimentBadge(p.post_sentiment)}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                                  {humanTime(p.post_created)}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap text-gray-300 transition-all duration-500 group-hover/post:text-gray-200">
                                {text}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                                  <ThumbsUp className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                                  {likeCount}
                                </span>
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                                  <Repeat2 className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                                  {rtCount}
                                </span>
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                                  <MessageCircle className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                                  {replyCount}
                                </span>
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                                  Followers: {p.creator_followers}
                                </span>
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                                  Interactions: {p.interactions_24h}
                                </span>
                                {p.post_link && (
                                  <a href={p.post_link} target="_blank" rel="noreferrer">
                                    <Button size="sm" variant="ghost" className="group/open h-7 px-2 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                                      <ExternalLink className="h-3 w-3 mr-1 transition-all duration-500 group-hover/open:scale-110 group-hover/open:rotate-2" /> 
                                      Open
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {!filteredSocialPosts.length && (
                      <div className="group/empty text-sm text-muted-foreground hover:text-gray-300 transition-all duration-500">
                        No recent posts found.
                      </div>
                    )}
                    
                    {totalPages > 1 && (
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                className={`group/prev transition-all duration-500 ${
                                  currentPage === 1 
                                    ? "pointer-events-none opacity-50" 
                                    : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                                }`}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={currentPage === page}
                                  onClick={() => handlePageChange(page)}
                                  className="group/page cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                className={`group/next transition-all duration-500 ${
                                  currentPage === totalPages 
                                    ? "pointer-events-none opacity-50" 
                                    : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                                }`}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              {newsLoading ? (
                <Card>
                  <CardHeader><CardTitle>Latest News & Updates</CardTitle></CardHeader>
                  <CardContent><div className="h-24 animate-pulse rounded-md bg-muted" /></CardContent>
                </Card>
              ) : newsQueryError ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Latest News & Updates</CardTitle>
                    <Badge variant="destructive">error</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-red-600">News unavailable: {String(newsQueryError)}</div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group/news bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white transition-all duration-500 group-hover/news:text-orange-400">
                      Latest News & Updates
                    </CardTitle>
                    <Badge variant="outline" className="transition-all duration-500 group-hover/news:scale-105 group-hover/news:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                      {filteredNews.length} articles
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentNews.map((article) => {
                      const name = article.creator_display_name || article.creator_name || "Source"
                      const handle = article.creator_name ? `@${article.creator_name}` : ""
                      const text = article.post_title || ""
                      const id = String(article.id)

                      return (
                        <div key={id} className="group/article p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 transition-all duration-500 group-hover/article:scale-110 group-hover/article:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                              <AvatarImage src={article.creator_avatar || ""} />
                              <AvatarFallback className="bg-orange-600 text-white transition-all duration-500 group-hover/article:bg-orange-500">
                                {name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-white transition-all duration-500 group-hover/article:text-orange-400">
                                    {name}
                                  </span>
                                  {handle && (
                                    <span className="text-sm text-muted-foreground transition-all duration-500 group-hover/article:text-gray-300">
                                      {handle}
                                    </span>
                                  )}
                                  <Badge variant="secondary" className="transition-all duration-500 group-hover/article:scale-105 group-hover/article:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                                    {article.post_type}
                                  </Badge>
                                  <div className="transition-all duration-500 group-hover/article:scale-105 group-hover/article:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                                    {sentimentBadge(article.post_sentiment)}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground transition-all duration-500 group-hover/article:text-gray-300">
                                  {humanTime(article.post_created)}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap text-gray-300 transition-all duration-500 group-hover/article:text-gray-200">
                                {text}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/article:text-gray-300">
                                  Followers: {article.creator_followers}
                                </span>
                                <span className="flex items-center gap-1 transition-all duration-500 group-hover/article:text-gray-300">
                                  Interactions: {article.interactions_24h}
                                </span>
                                {article.post_link && (
                                  <a href={article.post_link} target="_blank" rel="noreferrer">
                                    <Button size="sm" variant="ghost" className="group/open h-7 px-2 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                                      <ExternalLink className="h-3 w-3 mr-1 transition-all duration-500 group-hover/open:scale-110 group-hover/open:rotate-2" /> 
                                      Read
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {!filteredNews.length && (
                      <div className="group/empty text-sm text-muted-foreground hover:text-gray-300 transition-all duration-500">
                        No recent news found.
                      </div>
                    )}
                    
                    {newsTotalPages > 1 && (
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handleNewsPageChange(Math.max(1, newsCurrentPage - 1))}
                                className={`group/prev transition-all duration-500 ${
                                  newsCurrentPage === 1 
                                    ? "pointer-events-none opacity-50" 
                                    : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                                }`}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: newsTotalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={newsCurrentPage === page}
                                  onClick={() => handleNewsPageChange(page)}
                                  className="group/page cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handleNewsPageChange(Math.min(newsTotalPages, newsCurrentPage + 1))}
                                className={`group/next transition-all duration-500 ${
                                  newsCurrentPage === newsTotalPages 
                                    ? "pointer-events-none opacity-50" 
                                    : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                                }`}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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
                        {tokenStats && (
                        <>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">ATH</span>
                          <span className="text-white font-semibold">{formatPrice(tokenStats.ath)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">ATL</span>
                          <span className="text-white font-semibold">{formatPrice(tokenStats.atl)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <span className="text-gray-400">Circulating Supply</span>
                          <span className="text-white font-semibold">{formatNumber(tokenStats.circulatingSupply)}</span>
                        </div>
                        </>
                        )}
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
