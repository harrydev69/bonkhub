"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Flame, Users, MessageCircle, Share2 } from "lucide-react"

// Types
type Sentiment = "bullish" | "bearish" | "neutral"
type Trend = "up" | "down" | "stable"

interface Narrative {
  id: string
  title: string
  description: string
  sentiment: Sentiment
  strength: number // 0..100
  mentions: number
  engagement: number // average engagement per mention (rounded)
  trend: Trend
  tags: string[]
  sources: string[]
  timeframe: string
}

type FeedItem = {
  text?: string
  title?: string
  tags?: string[] | string
  platform?: string
  likes?: number
  like_count?: number
  shares?: number
  retweet_count?: number
  quote_count?: number
  comments?: number
  reply_count?: number
  sentiment?: number
  average_sentiment?: number
  timestamp?: number | string
  time?: number | string
  created_at?: number | string
  created?: number | string
}

// Helper functions
function classifySentiment(n: number): Sentiment {
  if (n > 0.1) return "bullish"
  if (n < -0.1) return "bearish"
  return "neutral"
}

function parseTimestamp(post: Partial<FeedItem>): number {
  const raw = post?.timestamp ?? post?.time ?? post?.created_at ?? post?.created ?? null
  if (raw == null) return Date.now()
  if (typeof raw === "number") return raw < 1e12 ? raw * 1000 : raw
  const n = Number(raw)
  if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n
  const d = Date.parse(String(raw))
  return Number.isNaN(d) ? Date.now() : d
}

function timeframeFromTimestamps(timestamps: number[]) {
  if (!timestamps.length) return "recent"
  const last = Math.max(...timestamps)
  const diffH = Math.max(0, Math.floor((Date.now() - last) / 3_600_000))
  return diffH < 24 ? `${diffH}h` : `${Math.floor(diffH / 24)}d`
}

function getSentimentBadge(s: Sentiment) {
  switch (s) {
    case "bullish":
      return "default"
    case "bearish":
      return "destructive"
    case "neutral":
      return "secondary"
    default:
      return "outline"
  }
}

function getTrendIcon(t: Trend): JSX.Element {
  switch (t) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />
    case "stable":
      return <Flame className="h-4 w-4 text-yellow-500" />
    default:
      return <></> // Added default return to fix undeclared JSX variable error
  }
}

// Build narratives from social feeds
function buildNarratives(feeds: FeedItem[]): Narrative[] {
  const groups: Record<
    string,
    { mentions: number; engagement: number; sentimentSum: number; sources: Set<string>; timestamps: number[] }
  > = {}

  for (const p of feeds) {
    const text: string = p.text || p.title || ""
    const explicitTags = Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === "string"
        ? p.tags.split(",").map((t) => t.trim())
        : []
    const inferredTags = text.match(/#\w+/g) ?? []
    const tags: string[] = Array.from(new Set([...explicitTags, ...inferredTags])).map((t) => String(t).toLowerCase())
    if (!tags.length) continue

    const likes = Number(p.likes ?? p.like_count ?? 0)
    const shares = Number(p.shares ?? p.retweet_count ?? p.quote_count ?? 0)
    const comments = Number(p.comments ?? p.reply_count ?? 0)
    const engage = Math.max(0, likes + shares + comments)

    const sentRaw = Number(p.sentiment ?? p.average_sentiment ?? 0)
    const sent = Number.isFinite(sentRaw) ? sentRaw : 0
    const ts = parseTimestamp(p)

    for (const raw of tags) {
      const tag = raw.startsWith("#") ? raw : `#${raw}`
      if (!groups[tag]) {
        groups[tag] = { mentions: 0, engagement: 0, sentimentSum: 0, sources: new Set(), timestamps: [] }
      }
      groups[tag].mentions += 1
      groups[tag].engagement += engage
      groups[tag].sentimentSum += sent
      if (p.platform) groups[tag].sources.add(String(p.platform))
      groups[tag].timestamps.push(ts)
    }
  }

  const perTagAvg = Object.fromEntries(
    Object.entries(groups).map(([tag, g]) => [tag, g.mentions ? g.engagement / g.mentions : 0]),
  )
  const maxAvg = Math.max(1, ...Object.values(perTagAvg))

  const list: Narrative[] = Object.entries(groups).map(([tag, g], i) => {
    const avgEngage = g.mentions ? g.engagement / g.mentions : 0
    const avgSent = g.mentions ? g.sentimentSum / g.mentions : 0
    const sentiment = classifySentiment(avgSent)
    const strength = Math.round((avgEngage / maxAvg) * 100)
    const trend: Trend = strength >= 60 ? "up" : strength <= 30 ? "down" : "stable"
    const tf = timeframeFromTimestamps(g.timestamps)

    return {
      id: String(i + 1),
      title: tag.replace(/^#/, "").replace(/[-_]/g, " ").toUpperCase(),
      description: `Conversation around ${tag.toUpperCase()} with ${g.mentions} mentions in the observed window.`,
      sentiment,
      strength,
      mentions: g.mentions,
      engagement: Math.round(avgEngage),
      trend,
      tags: [tag.replace(/^#/, "")],
      sources: Array.from(g.sources),
      timeframe: tf,
    }
  })

  return list.sort((a, b) => b.strength - a.strength).slice(0, 12)
}

export function NarrativeTracker() {
  const [feeds, setFeeds] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch("/api/feeds/bonk?limit=200", { cache: "no-store" })
        const json: unknown = await res.json().catch(() => ({}))
        if (!active) return
        const arr =
          (json as any)?.feeds && Array.isArray((json as any).feeds)
            ? ((json as any).feeds as FeedItem[])
            : (json as any)?.data && Array.isArray((json as any).data)
              ? ((json as any).data as FeedItem[])
              : []
        setFeeds(arr)
      } catch (e) {
        console.error("Narrative feeds error:", e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const narratives = useMemo(() => buildNarratives(feeds), [feeds])
  const topNarratives = useMemo(() => [...narratives].sort((a, b) => b.strength - a.strength).slice(0, 3), [narratives])
  const bullishNarratives = useMemo(() => narratives.filter((n) => n.sentiment === "bullish"), [narratives])
  const bearishNarratives = useMemo(() => narratives.filter((n) => n.sentiment === "bearish"), [narratives])

  const dominant = topNarratives[0]
  const totalMentions = narratives.reduce((sum, n) => sum + n.mentions, 0)
  const avgEngagement = narratives.length
    ? Math.round(narratives.reduce((sum, n) => sum + n.engagement, 0) / narratives.length)
    : 0
  const bullishPct = narratives.length ? Math.round((bullishNarratives.length / narratives.length) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Hot narrative data Internationally 🔥</h1>
          <p className="text-gray-400">Loading BONK ecosystem narratives...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-32 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Hot narrative data Internationally 🔥</h1>

        {/* Category tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {[
            "bonk narrative",
            "market sentiment",
            "social trends",
            "ecosystem buzz",
            "community vibes",
            "trading pairs",
            "defi metrics",
            "whale activity",
            "price alerts",
            "volume analysis",
            "sentiment data",
            "ecosystem tokens",
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Dominant Narrative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{dominant ? dominant.title : "—"}</div>
            <p className="text-xs text-gray-500">{dominant ? `${dominant.strength}% strength` : "awaiting data"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{totalMentions.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Observed window</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{avgEngagement}%</div>
            <p className="text-xs text-gray-500">Per-narrative average</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Bullish Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{bullishPct}%</div>
            <p className="text-xs text-gray-500">Of all narratives</p>
          </CardContent>
        </Card>
      </div>

      {/* Narrative Analysis */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-700">
          <TabsTrigger value="trending" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
            Trending
          </TabsTrigger>
          <TabsTrigger value="bullish" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
            Bullish
          </TabsTrigger>
          <TabsTrigger value="bearish" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
            Bearish
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
            All Narratives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Trending Narratives</CardTitle>
              <CardDescription className="text-gray-400">
                Most influential narratives driving current sentiment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topNarratives.map((narrative, index) => (
                <div key={narrative.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[#ff6b35] border-[#ff6b35]">
                        #{index + 1}
                      </Badge>
                      <h3 className="font-semibold text-white">{narrative.title}</h3>
                    </div>
                    <Badge variant={getSentimentBadge(narrative.sentiment)} className="capitalize">
                      {narrative.sentiment}
                    </Badge>
                  </div>

                  <p className="text-gray-400 text-sm mb-3">{narrative.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {narrative.mentions.toLocaleString()} mentions
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {narrative.engagement}% engagement
                    </span>
                    <span className="flex items-center gap-1">
                      {getTrendIcon(narrative.trend)}
                      {narrative.timeframe}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Narrative Strength</span>
                      <span className="text-white">{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2 bg-gray-700" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {narrative.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#ff6b35] hover:text-[#ff6b35] hover:bg-[#ff6b35]/10"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>

                  {index < topNarratives.length - 1 && <hr className="border-gray-700 mt-4" />}
                </div>
              ))}
              {!topNarratives.length && <p className="text-gray-500 text-center py-8">No trending narratives yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bullish" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bullishNarratives.map((narrative) => (
              <Card
                key={narrative.id}
                className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{narrative.title}</CardTitle>
                    <Badge variant={getSentimentBadge(narrative.sentiment)} className="capitalize">
                      {narrative.sentiment}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">{narrative.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {narrative.mentions.toLocaleString()} mentions
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {narrative.engagement}% engagement
                    </span>
                    <span className="flex items-center gap-1">
                      {getTrendIcon(narrative.trend)}
                      {narrative.timeframe}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {narrative.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Strength</span>
                      <span className="text-white">{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2 bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!bullishNarratives.length && (
              <p className="text-gray-500 text-center py-8 col-span-full">No bullish narratives yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bearish" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bearishNarratives.map((narrative) => (
              <Card
                key={narrative.id}
                className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{narrative.title}</CardTitle>
                    <Badge variant={getSentimentBadge(narrative.sentiment)} className="capitalize">
                      {narrative.sentiment}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">{narrative.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {narrative.mentions.toLocaleString()} mentions
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {narrative.engagement}% engagement
                    </span>
                    <span className="flex items-center gap-1">
                      {getTrendIcon(narrative.trend)}
                      {narrative.timeframe}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {narrative.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Strength</span>
                      <span className="text-white">{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2 bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!bearishNarratives.length && (
              <p className="text-gray-500 text-center py-8 col-span-full">No bearish narratives yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {narratives.map((narrative) => (
              <Card
                key={narrative.id}
                className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{narrative.title}</CardTitle>
                    <Badge variant={getSentimentBadge(narrative.sentiment)} className="capitalize">
                      {narrative.sentiment}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">{narrative.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {narrative.mentions.toLocaleString()} mentions
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {narrative.engagement}% engagement
                    </span>
                    <span className="flex items-center gap-1">
                      {getTrendIcon(narrative.trend)}
                      {narrative.timeframe}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {narrative.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Strength</span>
                      <span className="text-white">{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2 bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!narratives.length && <p className="text-gray-500 text-center py-8 col-span-full">No narratives found.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
