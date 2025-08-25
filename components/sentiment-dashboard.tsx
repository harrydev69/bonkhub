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
}

// Insights payload from /api/sentiment/bonk/snapshot
type Insights = {
  keywords?: { word: string; count: number }[]
  sentiment?: { pos: number; neg: number; neu: number }
  totalPosts?: number
}

export default function SentimentDashboard({
  refreshMs = 60_000,
  points = 48,
}: {
  refreshMs?: number
  points?: number
}) {
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
    refetchInterval: refreshMs,
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
    refetchInterval: refreshMs,
  })

  const {
    data: influencers,
    isLoading: influencersLoading,
    error: influencersError,
  } = useQuery<Influencer[]>({
    queryKey: ["sentimentInfluencers"],
    queryFn: async () => {
      const res = await fetch("/api/influencers/bonk?limit=12")
      if (!res.ok) throw new Error("Failed to fetch influencers")
      const data = await res.json()
      return data.influencers
    },
    refetchInterval: refreshMs,
  })

  const loading = insightsLoading || timeseriesLoading || influencersLoading
  const error = insightsError || timeseriesError || influencersError

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

  const overallLabel =
    overallFromInsights?.label ?? labelFromSentiment(lastTS?.average_sentiment ?? lastTS?.sentiment ?? 0)
  const overallScore = overallFromInsights?.score ?? normalizeScore(lastTS?.average_sentiment ?? lastTS?.sentiment ?? 0)

  // social metrics (with fallbacks)
  const socialVolume = lastTS?.social_volume ?? lastTS?.social_volume_24h ?? 0

  const engagementScore = lastTS?.social_score ?? 0
  const viralScore = lastTS?.galaxy_score ?? 0

  // influencers
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
          return { name, followers, impact, sentiment, avatar: i.creator_avatar }
        })
        .sort((a, b) => (b.impact || 0) - (a.impact || 0))
        .slice(0, 8),
    [influencers],
  )

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
            <Card key={i} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sentiment Analysis</h1>
        <p className="text-gray-400">Real-time sentiment tracking across social media platforms</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700 hover:border-[#ff6b35] transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Overall Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#ff6b35]" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getSentimentBadge(overallLabel)} className="bg-[#ff6b35] text-black">
                {overallLabel}
              </Badge>
            </div>
            <Progress value={overallScore} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">{overallScore}% positive</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:border-[#ff6b35] transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Social Volume</CardTitle>
            <MessageCircle className="h-4 w-4 text-[#ff6b35]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Number(socialVolume).toLocaleString()}</div>
            <p className="text-xs text-gray-400">Mentions (24h)</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:border-[#ff6b35] transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Engagement Score</CardTitle>
            <Heart className="h-4 w-4 text-[#ff6b35]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Number(engagementScore).toLocaleString()}</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">Higher = stronger community reaction</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:border-[#ff6b35] transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Viral Score</CardTitle>
            <Zap className="h-4 w-4 text-[#ff6b35]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Number(viralScore).toLocaleString()}</div>
            <p className="text-xs text-gray-400">Galaxy Score™</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">
            Overview
          </TabsTrigger>
          <TabsTrigger value="keywords" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">
            Keywords
          </TabsTrigger>
          <TabsTrigger value="influencers" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">
            Influencers
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfluencerList limit={25} />
            <SocialFeed />
          </div>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Trending Keywords</CardTitle>
              <CardDescription className="text-gray-400">
                Most mentioned keywords and their sentiment impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordRows.map((keyword) => (
                  <div
                    key={keyword.word}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-[#ff6b35] font-mono">#{keyword.word}</div>
                      <div className="text-gray-400 text-sm">{keyword.count.toLocaleString()} mentions</div>
                    </div>
                    <Badge
                      variant={
                        keyword.sentiment === "positive"
                          ? "default"
                          : keyword.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                      className={keyword.sentiment === "positive" ? "bg-[#ff6b35] text-black" : ""}
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
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Key Influencers</CardTitle>
              <CardDescription className="text-gray-400">Influential voices and their sentiment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {influencerRows.map((influencer) => (
                  <div
                    key={influencer.name}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#ff6b35] rounded-full flex items-center justify-center overflow-hidden">
                        {influencer.avatar ? (
                          <img src={influencer.avatar} alt={influencer.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-5 w-5 text-black" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{influencer.name}</div>
                        <div className="text-gray-400 text-sm">
                          {Number(influencer.followers || 0).toLocaleString()} followers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={getSentimentBadge(influencer.sentiment)}
                        className={influencer.sentiment === "bullish" ? "bg-[#ff6b35] text-black" : ""}
                      >
                        {influencer.sentiment}
                      </Badge>
                      <div className="text-gray-400 text-sm mt-1">Impact: {influencer.impact.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {!influencerRows.length && (
                  <div className="text-gray-400 text-center py-8">No influencer data yet.</div>
                )}
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
        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
          Failed to update some data: {error.message}
        </div>
      )}
    </div>
  )
}

// (Optional) also export a named version if other files import it that way
export { SentimentDashboard }
