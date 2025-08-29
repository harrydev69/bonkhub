"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Heart, MessageCircle, Users, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EngagementTrendChart, type ChartData } from "./engagement-trend-chart"
import { SocialFeed } from "./social-feed"
import InfluencerList from "./influencer-list"

/* -------------------------------
 Types
-------------------------------- */
type PlatformRow = {
  name: string
  sentiment: "bullish" | "bearish" | "neutral"
  score: number // 0..100
  mentions: number
  change?: string
}

type KeywordRow = {
  word: string
  count: number
  sentiment: "positive" | "negative" | "neutral"
}

type InfluencerRow = {
  name: string // "@handle" preferred
  followers: number
  sentiment: "bullish" | "bearish" | "neutral"
  impact: number // 0..100-ish
  avatar?: string
  url?: string // URL to creator's profile or social media
  creator_id?: string // For navigation
  handle?: string // For navigation
  username?: string // For navigation
}

type TimeseriesPoint = {
  average_sentiment?: number
  sentiment?: number
  social_volume?: number
  social_volume_24h?: number
  social_volume_48h?: number
  social_score?: number
  galaxy_score?: number
  ts?: string | number
}

type FeedItem = {
  platform?: string
  text?: string
  title?: string
  sentiment?: number // -1..1 or 0..100
}

type Influencer = {
  creator_id?: string
  creator_name?: string
  creator_avatar?: string
  creator_followers?: number
  creator_rank?: number
  interactions_24h?: number
  handle?: string
  username?: string
  name?: string
  display_name?: string
  followers?: number
  followers_count?: number
  engagement?: number
  engagement_score?: number
  score?: number
  sentiment?: number
  url?: string // URL to creator's profile
  platform?: string // Social media platform (twitter, youtube, etc.)
}

// Insights payload from /api/sentiment/bonk/snapshot
type Insights = {
  keywords?: { word: string; count: number }[]
  sentiment?: { pos: number; neg: number; neu: number }
  totalPosts?: number
}

// Comprehensive sentiment data from new endpoint
type ComprehensiveSentimentData = {
  overall_sentiment: {
    label: string
    percentage: number
    score: number
  }
  social_volume: {
    mentions_24h: number
    trend: string
  }
  engagement_score: {
    value: number
    max: number
    description: string
  }
  viral_score: {
    value: number
    max: number
    description: string
  }
  galaxy_score: {
    value: number
    max: number
    description: string
  }
  additional_metrics: {
    correlation_rank: number
    alt_rank: number
    social_impact: number
  }
  timestamp: number
  data_source: string
}

export default function SentimentDashboard({
  refreshMs = 60_000,
  points = 48,
}: {
  refreshMs?: number
  points?: number
}) {
  // State for filtering and sorting
  const [impactFilter, setImpactFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"impact" | "followers" | "rank">("impact")

  // New comprehensive sentiment query - refresh every 30 minutes
  const {
    data: comprehensiveData,
    isLoading: comprehensiveLoading,
    error: comprehensiveError,
  } = useQuery<ComprehensiveSentimentData>({
    queryKey: ["comprehensiveSentiment"],
    queryFn: async () => {
      const res = await fetch("/api/sentiment/bonk/comprehensive")
      if (!res.ok) throw new Error("Failed to fetch comprehensive sentiment")
      const data = await res.json()
      return data.data
    },
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    staleTime: 25 * 60 * 1000, // Consider stale after 25 minutes
  })

  const {
    data: insights,
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery<Insights>({
    queryKey: ["sentimentSnapshot"],
    queryFn: async () => {
      const res = await fetch("/api/sentiment/bonk/snapshot")
      if (!res.ok) throw new Error("Failed to fetch snapshot")
      const data = await res.json()
      return data.insights
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  })

  const {
    data: timeseries,
    isLoading: timeseriesLoading,
    error: timeseriesError,
  } = useQuery<TimeseriesPoint[]>({
    queryKey: ["sentimentTimeseries", points],
    queryFn: async () => {
      const res = await fetch(`/api/sentiment/bonk/timeseries?interval=hour&points=${points}`)
      if (!res.ok) throw new Error("Failed to fetch timeseries")
      const data = await res.json()
      return data.timeseries
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  })

  const {
    data: influencers,
    isLoading: influencersLoading,
    error: influencersError,
  } = useQuery<Influencer[]>({
    queryKey: ["sentimentInfluencers"],
    queryFn: async () => {
      const res = await fetch("/api/influencers/bonk?limit=100")
      if (!res.ok) throw new Error("Failed to fetch influencers")
      const data = await res.json()
      return data.influencers
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  })

  const loading = comprehensiveLoading || insightsLoading || timeseriesLoading || influencersLoading
  const error = comprehensiveError || insightsError || timeseriesError || influencersError

  /* -------------------------------
   Helpers
  -------------------------------- */
  const normalizeScore = (v: number | undefined | null) => {
    if (v === undefined || v === null || Number.isNaN(v)) return 50
    const n = Number(v)
    // support -1..1 (map to 0..100) OR already 0..100
    if (Math.abs(n) <= 1.2) return Math.round(((n + 1) / 2) * 100)
    return Math.max(0, Math.min(100, Math.round(n)))
  }

  const labelFromSentiment = (v: number | undefined | null): "bullish" | "bearish" | "neutral" => {
    if (v === undefined || v === null || Number.isNaN(v)) return "neutral"
    const n = Number(v)
    if (Math.abs(n) <= 1.2) {
      if (n > 0.1) return "bullish"
      if (n < -0.1) return "bearish"
      return "neutral"
    }
    if (n >= 66) return "bullish"
    if (n <= 33) return "bearish"
    return "neutral"
  }

  const getSentimentBadge = (s: string) =>
    s === "bullish" ? "default" : s === "bearish" ? "destructive" : s === "neutral" ? "secondary" : "outline"

  const lastTS = useMemo(
    () => (Array.isArray(timeseries) && timeseries.length ? timeseries[timeseries.length - 1] : null),
    [timeseries],
  )

  // Compute overall label/score primarily from insights counts; fall back to timeseries
  const overallFromInsights = useMemo(() => {
    const s = insights?.sentiment
    if (!s) return null
    const total = (s.pos ?? 0) + (s.neg ?? 0) + (s.neu ?? 0)
    if (!total) return null
    const posPct = Math.round(((s.pos ?? 0) / total) * 100)
    const label: "bullish" | "bearish" | "neutral" = posPct >= 55 ? "bullish" : posPct <= 45 ? "bearish" : "neutral"
    return { label, score: posPct }
  }, [insights])

  // Use comprehensive data when available, fall back to legacy data
  const overallLabel = comprehensiveData?.overall_sentiment?.label || 
    (overallFromInsights?.label ?? 
    labelFromSentiment(lastTS?.average_sentiment ?? lastTS?.sentiment ?? 0))
  
  const overallScore = comprehensiveData?.overall_sentiment?.percentage || 
    (overallFromInsights?.score ?? 
    normalizeScore(lastTS?.average_sentiment ?? lastTS?.sentiment ?? 0))

  // Use comprehensive data for social metrics
  const socialVolume = comprehensiveData?.social_volume?.mentions_24h || 
    (lastTS?.social_volume ?? 
    lastTS?.social_volume_24h ?? 0)

  const engagementScore = comprehensiveData?.engagement_score?.value || 
    (lastTS?.social_score ?? 0)
  
  const viralScore = comprehensiveData?.viral_score?.value || 
    comprehensiveData?.galaxy_score?.value || 
    (lastTS?.galaxy_score ?? 0)

  // influencers for overview tab (limited to 25 for sidebar)
  const influencerRows: InfluencerRow[] = useMemo(
    () =>
      (influencers || [])
        .map((i, idx) => {
          const handle = (i.creator_name || i.handle || i.username || i.name || "").toString()
          const name = handle.startsWith("@") ? handle : handle ? `@${handle}` : i.display_name || `Influencer_${idx}`
          const followers = Number(i.creator_followers ?? i.followers ?? i.followers_count ?? 0)
          const impact = Number(i.interactions_24h ?? i.engagement ?? i.engagement_score ?? i.score ?? 0)
          const sNum = typeof i.sentiment === "number" ? i.sentiment : 0
          const sentiment = labelFromSentiment(sNum)
          
          // Construct URL for external link
          let url = i.url // Use direct URL if available
          if (!url && handle) {
            // Fallback: construct Twitter URL for most creators
            const cleanHandle = handle.replace('@', '')
            if (cleanHandle) {
              url = `https://twitter.com/${cleanHandle}`
            }
          }
          
          return { 
            name, 
            followers, 
            impact, 
            sentiment, 
            avatar: i.creator_avatar, 
            url,
            creator_id: i.creator_id,
            handle: i.handle,
            username: i.username
          }
        })
        .sort((a, b) => (b.impact || 0) - (a.impact || 0))
        .slice(0, 25), // Keep 25 for overview sidebar
    [influencers],
  )

  // influencers for dedicated influencers tab (show all)
  const allInfluencerRows: InfluencerRow[] = useMemo(
    () =>
      (influencers || [])
        .map((i, idx) => {
          const handle = (i.creator_name || i.handle || i.username || i.name || "").toString()
          const name = handle.startsWith("@") ? handle : handle ? `@${handle}` : i.display_name || `Influencer_${idx}`
          const followers = Number(i.creator_followers ?? i.followers ?? i.followers_count ?? 0)
          const impact = Number(i.interactions_24h ?? i.engagement ?? i.engagement_score ?? i.score ?? 0)
          const sNum = typeof i.sentiment === "number" ? i.sentiment : 0
          const sentiment = labelFromSentiment(sNum)
          
          // Construct URL for external link
          let url = i.url // Use direct URL if available
          if (!url && handle) {
            // Fallback: construct Twitter URL for most creators
            const cleanHandle = handle.replace('@', '')
            if (cleanHandle) {
              url = `https://twitter.com/${cleanHandle}`
            }
          }
          
          return { 
            name, 
            followers, 
            impact, 
            sentiment, 
            avatar: i.creator_avatar, 
            url,
            creator_id: i.creator_id,
            handle: i.handle,
            username: i.username
          }
        })
        .sort((a, b) => (b.impact || 0) - (a.impact || 0)), // No limit - show all
    [influencers],
  )

  // Filtered and sorted influencers for the Influencers Tab
  const filteredAndSortedInfluencers: InfluencerRow[] = useMemo(() => {
    let filtered = allInfluencerRows

    // Apply impact filter
    if (impactFilter !== "all") {
      const sorted = [...allInfluencerRows].sort((a, b) => (b.impact || 0) - (a.impact || 0))
      const total = sorted.length
      const third = Math.floor(total / 3)
      
      if (impactFilter === "high") {
        filtered = sorted.slice(0, third)
      } else if (impactFilter === "medium") {
        filtered = sorted.slice(third, third * 2)
      } else if (impactFilter === "low") {
        filtered = sorted.slice(third * 2)
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(influencer => 
        influencer.name.toLowerCase().includes(query) ||
        influencer.name.replace('@', '').toLowerCase().includes(query)
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "impact") {
        return (b.impact || 0) - (a.impact || 0)
      } else if (sortBy === "followers") {
        return (b.followers || 0) - (a.followers || 0)
      } else { // rank
        return 0 // Keep original order
      }
    })

    return sorted
  }, [allInfluencerRows, impactFilter, searchQuery, sortBy])

  const keywordRows: KeywordRow[] = useMemo(() => {
    const fromInsights = (insights?.keywords ?? [])
      .slice(0, 30)
      .map((k) => ({ word: k.word.replace(/^#/, ""), count: k.count, sentiment: "neutral" as const }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return fromInsights.length ? fromInsights : [{ word: "bonk", count: 0, sentiment: "neutral" }]
  }, [insights])

  const chartData: ChartData[] = useMemo(() => {
    if (!Array.isArray(timeseries)) return []

    return timeseries.map((point) => ({
      hour: new Date(point.ts || 0).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      engagement: Math.round(point.social_score || 0),
      sentiment: Math.round((point.average_sentiment || point.sentiment || 0) * 100) / 100,
    }))
  }, [timeseries])

  /* -------------------------------
   UI
  -------------------------------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sentiment Analysis</h1>
          <p className="text-gray-400">Loading real-time sentiment…</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="group/skeleton bg-gray-900 border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-gray-700 transition-all duration-500 group-hover/skeleton:scale-105 group-hover/skeleton:shadow-[0_0_2px_rgba(255,107,53,0.1)]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-gray-700 transition-all duration-500 group-hover/skeleton:scale-105 group-hover/skeleton:shadow-[0_0_2px_rgba(255,107,53,0.1)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <h1 className="text-3xl font-bold text-white mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
          Sentiment Analysis
        </h1>
        <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
          Real-time sentiment tracking across social media platforms
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group/sentiment bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 transition-all duration-500 group-hover/sentiment:text-gray-200">
              Overall Sentiment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/sentiment:scale-110 group-hover/sentiment:rotate-2 group-hover/sentiment:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getSentimentBadge(overallLabel)} className="bg-[#ff6b35] text-black transition-all duration-500 group-hover/sentiment:scale-105 group-hover/sentiment:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                {overallLabel}
              </Badge>
            </div>
            <Progress value={overallScore} className="mt-2 transition-all duration-500 group-hover/sentiment:shadow-[0_0_6px_rgba(255,107,53,0.25)]" />
            <p className="text-xs text-gray-400 mt-1 transition-all duration-500 group-hover/sentiment:text-gray-300">
              {overallScore}% positive
            </p>
          </CardContent>
        </Card>

        <Card className="group/social bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 transition-all duration-500 group-hover/social:text-gray-200">
              Social Volume
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/social:scale-110 group-hover/social:rotate-2 group-hover/social:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/social:text-orange-400">
              {Number(socialVolume).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 transition-all duration-500 group-hover/social:text-gray-300">
              Mentions (24h)
            </p>
          </CardContent>
        </Card>

        <Card className="group/engagement bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 transition-all duration-500 group-hover/engagement:text-gray-200">
              Engagement Score
            </CardTitle>
            <Heart className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/engagement:scale-110 group-hover/engagement:rotate-2 group-hover/engagement:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/engagement:text-orange-400">
              {Number(engagementScore).toLocaleString()}
            </div>
            <Progress value={engagementScore} className="mt-2 transition-all duration-500 group-hover/engagement:shadow-[0_0_6px_rgba(255,107,53,0.25)]" />
            <p className="text-xs text-gray-400 mt-1 transition-all duration-500 group-hover/engagement:text-gray-300">
              Higher = stronger community reaction
            </p>
          </CardContent>
        </Card>

        <Card className="group/viral bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 transition-all duration-500 group-hover/viral:text-gray-200">
              Viral Score
            </CardTitle>
            <Zap className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/viral:scale-110 group-hover/viral:rotate-2 group-hover/viral:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/viral:text-orange-400">
              {Number(viralScore).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 transition-all duration-500 group-hover/viral:text-gray-300">
              Galaxy Score™
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="group/tabs bg-gray-900 border-gray-700 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black transition-all duration-500 hover:scale-105">
            Overview
          </TabsTrigger>
          <TabsTrigger value="keywords" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black transition-all duration-500 hover:scale-105">
            Keywords
          </TabsTrigger>
          <TabsTrigger value="influencers" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black transition-all duration-500 hover:scale-105">
            Influencers
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black transition-all duration-500 hover:scale-105">
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="group/influencers bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-white transition-all duration-500 group-hover/influencers:text-orange-400">
                    Top Influencers
                  </CardTitle>
                  <CardDescription className="text-gray-400 transition-all duration-500 group-hover/influencers:text-gray-300">
                    Most impactful BONK voices (click to view detailed profiles)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {influencerRows.map((influencer, index) => (
                      <div
                        key={influencer.name}
                        className="group/influencer flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 hover:scale-[1.01] hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu cursor-pointer"
                        onClick={() => {
                          // Navigate to creator profile page
                          const creatorId = influencer.name.replace('@', '');
                          window.open(`/creator/${creatorId}`, '_blank');
                        }}
                        title={`Click to view ${influencer.name.replace('@', '')}'s detailed profile`}
                      >
                        <div className="flex items-center space-x-3">
                          {influencer.avatar ? (
                            <img 
                              src={influencer.avatar} 
                              alt={influencer.name}
                              className="w-8 h-8 rounded-full object-cover transition-all duration-500 group-hover/influencer:scale-110 group-hover/influencer:shadow-[0_0_4px_rgba(255,107,53,0.3)]"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 bg-[#ff6b35] rounded-full text-black font-bold text-sm transition-all duration-500 group-hover/influencer:scale-110 group-hover/influencer:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                              #{index + 1}
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium transition-all duration-500 group-hover/influencer:text-orange-400">
                              {influencer.name.replace('@', '')}
                            </div>
                            <div className="text-gray-400 text-sm transition-all duration-500 group-hover/influencer:text-gray-300">
                              {influencer.followers.toLocaleString()} followers
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {/* Sentiment */}
                          <div className="flex flex-col items-center">
                            <div className="text-gray-400 text-xs mb-1">Sentiment</div>
                            <Badge
                              variant={getSentimentBadge(influencer.sentiment)}
                              className={`${influencer.sentiment === "bullish" ? "bg-[#ff6b35] text-black" : ""} transition-all duration-500 group-hover/influencer:scale-105 group-hover/influencer:shadow-[0_0_4px_rgba(255,107,53,0.2)]`}
                            >
                              {influencer.sentiment}
                            </Badge>
                          </div>
                          
                          {/* Impact Score */}
                          <div className="text-center">
                            <div className="text-gray-400 text-xs mb-1">Impact Score</div>
                            <div className="text-[#ff6b35] font-semibold transition-all duration-500 group-hover/influencer:text-orange-400">
                              {influencer.impact.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <SocialFeed limit={1000} />
          </div>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <Card className="group/keywords bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white transition-all duration-500 group-hover/keywords:text-orange-400">
                Trending Keywords
              </CardTitle>
              <CardDescription className="text-gray-400 transition-all duration-500 group-hover/keywords:text-gray-300">
                Most mentioned keywords and their sentiment impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordRows.map((keyword) => (
                  <div
                    key={keyword.word}
                    className="group/keyword flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 hover:scale-[1.01] hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-[#ff6b35] font-mono transition-all duration-500 group-hover/keyword:text-orange-400 group-hover/keyword:scale-105">
                        #{keyword.word}
                      </div>
                      <div className="text-gray-400 text-sm transition-all duration-500 group-hover/keyword:text-gray-300">
                        {keyword.count.toLocaleString()} mentions
                      </div>
                    </div>
                    <Badge
                      variant={
                        keyword.sentiment === "positive"
                          ? "default"
                          : keyword.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                      className={`${keyword.sentiment === "positive" ? "bg-[#ff6b35] text-black" : ""} transition-all duration-500 group-hover/keyword:scale-105 group-hover/keyword:shadow-[0_0_4px_rgba(255,107,53,0.2)]`}
                    >
                      {keyword.sentiment}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Influencers */}
        <TabsContent value="influencers" className="space-y-4">
          <Card className="group/leaderboard bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white transition-all duration-500 group-hover/leaderboard:text-orange-400">
                Creator Leaderboard
              </CardTitle>
              <CardDescription className="text-gray-400 transition-all duration-500 group-hover/leaderboard:text-gray-300">
                Top BONK voices ranked by impact and reach ({allInfluencerRows.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Enhanced Creator Leaderboard with all 100 influencers */}
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search creators..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#ff6b35] focus:outline-none hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 transition-all duration-500 hover:text-gray-300">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#ff6b35] focus:outline-none hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                    >
                      <option value="impact">Impact</option>
                      <option value="followers">Followers</option>
                      <option value="rank">Rank</option>
                    </select>
                  </div>
                </div>

                                 {/* Influencer List */}
                 <div className="space-y-4 mt-6">
                   {filteredAndSortedInfluencers.map((influencer, index) => (
                     <div
                       key={influencer.creator_id || influencer.handle || index}
                       className="group/row flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 hover:scale-[1.002] hover:shadow-[0_0_4px_rgba(255,107,53,0.1)] transition-all duration-200 transform-gpu cursor-pointer"
                       onClick={() => {
                         // Try multiple ID fields to find a valid creator ID
                         const creatorId = influencer.creator_id || influencer.handle || influencer.username || influencer.name?.replace('@', '');
                         if (creatorId) {
                           window.open(`/creator/${creatorId}`, '_blank');
                         }
                       }}
                     >
                      {/* Avatar + Info */}
                      <div className="flex items-center space-x-4">
                                                 {/* Avatar */}
                         <div className="w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center text-black font-bold text-lg transition-all duration-200 group-hover/row:scale-102 group-hover/row:shadow-[0_0_2px_rgba(255,107,53,0.1)]">
                         {influencer.avatar ? (
                           <img src={influencer.avatar} alt={influencer.name} className="w-full h-full object-cover" />
                         ) : (
                             <Users className="h-6 w-6 text-black" />
                         )}
                       </div>
                        
                        {/* Info */}
                        <div className="space-y-1">
                          <div className="text-white font-medium text-lg transition-all duration-500 group-hover/row:text-orange-400">
                            {influencer.name.replace('@', '')}
                          </div>
                          <div className="text-gray-400 text-sm transition-all duration-500 group-hover/row:text-gray-300">
                            {influencer.name}
                          </div>
                        </div>
                      </div>
                      
                                              {/* Metrics */}
                        <div className="flex items-center space-x-4">
                          {/* Sentiment Badge */}
                          <div className="flex flex-col items-center">
                            <div className="text-gray-400 text-xs mb-1 transition-all duration-500 group-hover/row:text-gray-300">
                              Sentiment
                            </div>
                            <Badge
                              variant={getSentimentBadge(influencer.sentiment)}
                              className={`${influencer.sentiment === "bullish" ? "bg-[#ff6b35] text-black" : ""} transition-all duration-200 group-hover/row:scale-105 group-hover/row:shadow-[0_0_2px_rgba(255,107,53,0.1)]`}
                            >
                              {influencer.sentiment}
                            </Badge>
                          </div>
                          
                          {/* Impact Score */}
                          <div className="text-center">
                            <div className="text-gray-400 text-xs mb-1 transition-all duration-500 group-hover/row:text-gray-300">
                              Impact Score
                            </div>
                            <div className="text-[#ff6b35] font-bold text-lg transition-all duration-500 group-hover/row:text-orange-400">
                              {influencer.impact.toLocaleString()}
                            </div>
                          </div>
                          
                          {/* Followers Count */}
                          <div className="text-center">
                            <div className="text-gray-400 text-xs mb-1 transition-all duration-500 group-hover/row:text-gray-300">
                              Followers
                            </div>
                            <div className="text-white font-semibold transition-all duration-500 group-hover/row:text-gray-200">
                              {Number(influencer.followers || 0).toLocaleString()}
                            </div>
                          </div>
                        
                        {/* External Link */}
                        {influencer.url ? (
                          <a
                            href={influencer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link w-6 h-6 text-gray-400 hover:text-[#ff6b35] transition-all duration-300 cursor-pointer"
                            title={`Visit ${influencer.name.replace('@', '')}'s profile`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-full h-full transition-all duration-300 group-hover/link:scale-105 group-hover/link:rotate-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <div 
                            className="w-6 h-6 text-gray-500 cursor-not-allowed" 
                            title="No profile link available"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
                  
                  {filteredAndSortedInfluencers.length === 0 && (
                    <div className="text-gray-400 text-center py-8 transition-all duration-500 hover:text-gray-300">
                      {searchQuery ? `No creators found for "${searchQuery}"` : 'No influencer data yet.'}
                    </div>
                  )}
                  
                  {filteredAndSortedInfluencers.length > 0 && (
                    <div className="text-gray-400 text-center py-4 text-sm transition-all duration-500 hover:text-gray-300">
                      Showing {filteredAndSortedInfluencers.length} of {allInfluencerRows.length} creators
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <EngagementTrendChart data={chartData} />
        </TabsContent>
      </Tabs>

      {error && (
        <div className="group/error text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800 hover:shadow-[0_0_8px_rgba(239,68,68,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          Failed to update some data: {error.message}
        </div>
      )}
    </div>
  )
}

// (Optional) also export a named version if other files import it that way
export { SentimentDashboard }
