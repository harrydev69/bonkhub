"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Heart, MessageCircle, Users, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EngagementTrendChart, type ChartData } from "./engagement-trend-chart"

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
}

type TimeseriesPoint = {
  average_sentiment?: number
  sentiment?: number
  social_volume?: number
  social_volume_24h?: number
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
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [error, setError] = useState<string | null>(null)

  // jitter + visibility-aware refresh
  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const jitter = 350 + Math.floor(Math.random() * 450)

  useEffect(() => {
    const ac = new AbortController()

    const load = async (signal?: AbortSignal) => {
      try {
        setError(null)
        const [snapRes, tsRes, inflRes] = await Promise.all([
          fetch("/api/sentiment/bonk/snapshot", { cache: "no-store", signal }),
          fetch(`/api/sentiment/bonk/timeseries?interval=hour&points=${points}`, { cache: "no-store", signal }),
          fetch("/api/influencers/bonk?limit=12", { cache: "no-store", signal }),
        ])

        // Try to parse JSON even if one failed (best-effort UI)
        const [snapJson, tsJson, inflJson] = await Promise.all([
          snapRes.json().catch(() => ({})),
          tsRes.json().catch(() => ({})),
          inflRes.json().catch(() => ({})),
        ])

        console.log("API responses:", { snapJson, tsJson, inflJson })

        setInsights(
          (snapJson?.insights ?? {
            keywords: [],
            sentiment: { pos: 0, neg: 0, neu: 0 },
            totalPosts: 0,
          }) as Insights,
        )
        setTimeseries(Array.isArray(tsJson?.timeseries) ? tsJson.timeseries : [])
        setInfluencers(Array.isArray(inflJson?.influencers) ? inflJson.influencers : [])
      } catch (e: any) {
        setError(String(e?.message ?? e))
        setInsights({ keywords: [], sentiment: { pos: 0, neg: 0, neu: 0 }, totalPosts: 0 })
        setTimeseries([])
        setInfluencers([])
      } finally {
        setLoading(false)
      }
    }

    const kickOff = () => {
      window.setTimeout(() => load(ac.signal), jitter)
      const tick = async () => {
        if (document.visibilityState === "visible") await load()
        timerRef.current = window.setTimeout(tick, refreshMs) as unknown as number
      }
      timerRef.current = window.setTimeout(tick, refreshMs) as unknown as number
    }

    if (!startedRef.current) {
      startedRef.current = true
      kickOff()
    }

    const onVis = () => {
      if (document.visibilityState === "visible") {
        void load()
      }
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      ac.abort()
      if (timerRef.current) window.clearTimeout(timerRef.current)
      document.removeEventListener("visibilitychange", onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs, points, jitter])

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
      influencers
        .map((i, idx) => {
          const handle = (i.handle || i.username || i.name || "").toString()
          const name = handle.startsWith("@") ? handle : handle ? `@${handle}` : i.display_name || `Influencer_${idx}`
          const followers = Number(i.followers ?? i.followers_count ?? 0)
          const impact = Number(i.engagement ?? i.engagement_score ?? i.score ?? 0)
          const sNum = typeof i.sentiment === "number" ? i.sentiment : 0
          const sentiment = labelFromSentiment(sNum)
          return { name, followers, impact, sentiment }
        })
        .sort((a, b) => (b.impact || 0) - (a.impact || 0))
        .slice(0, 8),
    [influencers],
  )

  // Mock keywords data
  const keywordRows: KeywordRow[] = [
    { word: "bonk", count: 1250, sentiment: "positive" },
    { word: "moon", count: 890, sentiment: "positive" },
    { word: "hodl", count: 670, sentiment: "neutral" },
    { word: "dip", count: 450, sentiment: "negative" },
    { word: "pump", count: 380, sentiment: "positive" },
    { word: "solana", count: 320, sentiment: "neutral" },
    { word: "meme", count: 280, sentiment: "positive" },
    { word: "diamond", count: 210, sentiment: "positive" },
  ]

  // Mock chart data
  const chartData: ChartData[] = [
    { hour: "12 AM", engagement: 1200, sentiment: 0.65 },
    { hour: "1 AM", engagement: 980, sentiment: 0.58 },
    { hour: "2 AM", engagement: 750, sentiment: 0.62 },
    { hour: "3 AM", engagement: 650, sentiment: 0.55 },
    { hour: "4 AM", engagement: 580, sentiment: 0.48 },
    { hour: "5 AM", engagement: 720, sentiment: 0.52 },
    { hour: "6 AM", engagement: 890, sentiment: 0.68 },
    { hour: "7 AM", engagement: 1100, sentiment: 0.72 },
    { hour: "8 AM", engagement: 1350, sentiment: 0.78 },
    { hour: "9 AM", engagement: 1580, sentiment: 0.82 },
    { hour: "10 AM", engagement: 1720, sentiment: 0.85 },
    { hour: "11 AM", engagement: 1650, sentiment: 0.79 },
  ]

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
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400">Bullish</span>
                    <span className="text-white">{insights?.sentiment?.pos || 0}</span>
                  </div>
                  <Progress
                    value={((insights?.sentiment?.pos || 0) / (insights?.totalPosts || 1)) * 100}
                    className="bg-gray-800"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-red-400">Bearish</span>
                    <span className="text-white">{insights?.sentiment?.neg || 0}</span>
                  </div>
                  <Progress
                    value={((insights?.sentiment?.neg || 0) / (insights?.totalPosts || 1)) * 100}
                    className="bg-gray-800"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Neutral</span>
                    <span className="text-white">{insights?.sentiment?.neu || 0}</span>
                  </div>
                  <Progress
                    value={((insights?.sentiment?.neu || 0) / (insights?.totalPosts || 1)) * 100}
                    className="bg-gray-800"
                  />
                </div>
              </CardContent>
            </Card>
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
                      <div className="w-10 h-10 bg-[#ff6b35] rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-black" />
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
                      <div className="text-gray-400 text-sm mt-1">Impact: {Math.round(influencer.impact)}%</div>
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
          Failed to update some data: {error}
        </div>
      )}
    </div>
  )
}

// (Optional) also export a named version if other files import it that way
export { SentimentDashboard }
