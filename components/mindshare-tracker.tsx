"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  Target,
  Flame,
  ExternalLink,
  Calendar,
  Activity,
  TrendingDown,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"

type SentimentTag = "positive" | "neutral" | "negative"

interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  timestamp: string
  source: string
  trending: boolean
  engagement: number
  sentiment: SentimentTag
}

interface CompetitorRow {
  name: string
  score: number
  change: number
}

type Feed = Record<string, any>
type Influencer = Record<string, any>

const FEEDS_WS_URL = process.env.NEXT_PUBLIC_FEEDS_WS_URL
const INFLUENCERS_WS_URL = process.env.NEXT_PUBLIC_INFLUENCERS_WS_URL

// --- helpers ---
function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n))
}
function pct(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0
}
// robust timestamp → ms
function parseMs(ts?: string | number): number {
  if (ts === undefined || ts === null) return Date.now()
  if (typeof ts === "number") return ts < 1e12 ? ts * 1000 : ts
  const n = Number(ts)
  if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n
  const d = Date.parse(ts)
  return Number.isNaN(d) ? Date.now() : d
}

export function MindshareTracker({ refreshMs = 30_000 }: { refreshMs?: number } = {}) {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // refs to avoid stale closures inside timers/ws handlers
  const feedsRef = useRef<Feed[]>([])
  const inflRef = useRef<Influencer[]>([])
  useEffect(() => {
    feedsRef.current = feeds
  }, [feeds])
  useEffect(() => {
    inflRef.current = influencers
  }, [influencers])

  // ---------- Fetch helpers ----------
  const dedupeBy = <T extends Record<string, any>>(arr: T[], key: string) => {
    const seen = new Set<string>()
    const out: T[] = []
    for (const item of arr) {
      const id = String(item[key] ?? item.id ?? item.post_id ?? Math.random())
      if (!seen.has(id)) {
        seen.add(id)
        out.push(item)
      }
    }
    return out
  }

  const loadOnce = async (signal?: AbortSignal) => {
    const [feedRes, inflRes] = await Promise.allSettled([
      fetch("/api/feeds/bonk?limit=200", { cache: "no-store", signal }).then((r) => r.json()),
      fetch("/api/influencers/bonk?limit=50", { cache: "no-store", signal }).then((r) => r.json()),
    ])
    const nextFeeds: Feed[] =
      feedRes.status === "fulfilled" && Array.isArray(feedRes.value?.feeds) ? feedRes.value.feeds : []
    const nextInfl: Influencer[] =
      inflRes.status === "fulfilled" && Array.isArray(inflRes.value?.influencers) ? inflRes.value.influencers : []

    setFeeds(dedupeBy(nextFeeds, "id"))
    setInfluencers(dedupeBy(nextInfl, "id"))
  }

  // ---------- Initial load ----------
  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        await loadOnce(ctrl.signal)
      } catch (e) {
        console.error("Mindshare initial load error:", e)
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [])

  // ---------- Auto-refresh polling (visibility-aware) ----------
  useEffect(() => {
    let timer: number | undefined

    const tick = async () => {
      if (document.visibilityState === "visible") {
        try {
          await loadOnce()
        } catch (e) {
          console.warn("Mindshare refresh error:", e)
        }
      }
      // Use 5 minutes for feeds refresh (most dynamic data)
      timer = window.setTimeout(tick, 5 * 60 * 1000)
    }

    timer = window.setTimeout(tick, 5 * 60 * 1000)

    const onVis = () => {
      if (document.visibilityState === "visible") {
        loadOnce().catch((e) => console.warn("Mindshare visibility change error:", e))
      }
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      if (timer) window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  // ---------- Optional WebSocket live updates ----------
  useEffect(() => {
    const sockets: WebSocket[] = []

    const tryWS = (url?: string, onMsg?: (data: any) => void) => {
      if (!url) return
      try {
        const ws = new WebSocket(url)

        ws.onerror = (error) => {
          console.warn("WebSocket error:", error)
        }

        ws.onclose = (event) => {
          console.warn("WebSocket closed:", event.code, event.reason)
        }

        ws.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data)
            onMsg?.(payload)
          } catch (error) {
            console.warn("WebSocket message parse error:", error)
          }
        }

        sockets.push(ws)
      } catch (e) {
        console.warn("WS connect failed:", e)
      }
    }

    tryWS(FEEDS_WS_URL, (payload) => {
      const items: Feed[] = Array.isArray(payload?.items) ? payload.items : payload?.item ? [payload.item] : []
      if (!items.length) return
      setFeeds(dedupeBy([...items, ...feedsRef.current], "id").slice(0, 500))
    })

    tryWS(INFLUENCERS_WS_URL, (payload) => {
      const items: Influencer[] = Array.isArray(payload?.items) ? payload.items : payload?.item ? [payload.item] : []
      if (!items.length) return
      setInfluencers(dedupeBy([...items, ...inflRef.current], "id").slice(0, 500))
    })

    return () => sockets.forEach((ws) => ws.close())
  }, [])

  // ---------- Metrics ----------
  const socialMentions = feeds.length
  const influencerMentions = influencers.length

  const engagementAgg = useMemo(() => {
    let sum = 0
    for (const p of feeds) {
      const e =
        Number(p.engagement ?? p.engagement_score ?? 0) +
        Number(p.likes ?? 0) +
        Number(p.retweets ?? 0) +
        Number(p.shares ?? 0) +
        Number(p.comments ?? p.replies ?? 0)
      sum += Number.isFinite(e) ? e : 0
    }
    const perPost = socialMentions ? sum / socialMentions : 0
    const scaled = clamp(Math.log10(1 + perPost) * 40)
    return { sum, perPost, scaled }
  }, [feeds, socialMentions])

  const brandAwareness = useMemo(() => {
    const ids = new Set<string>()
    for (const p of feeds) {
      const id = (p.creator_id || p.author_id || p.username || p.handle || p.user_id || "").toString()
      if (id) ids.add(id.toLowerCase())
    }
    const uniqueRatio = socialMentions ? ids.size / socialMentions : 0
    return clamp(uniqueRatio * 100)
  }, [feeds, socialMentions])

  const mindshareScore = useMemo(() => {
    const mVol = clamp(Math.log10(1 + socialMentions) * 20)
    const mInf = clamp(Math.log10(1 + influencerMentions) * 28)
    const mEng = engagementAgg.scaled
    const mBrand = brandAwareness
    const score = 0.3 * mVol + 0.25 * mInf + 0.25 * mEng + 0.2 * mBrand
    return Number(score.toFixed(1))
  }, [socialMentions, influencerMentions, engagementAgg.scaled, brandAwareness])

  const change24h = useMemo(() => {
    if (feeds.length < 20) return 0
    const q = Math.floor(feeds.length / 4)
    const early = feeds.slice(0, q).length
    const late = feeds.slice(-q).length
    const c = pct(late - early, Math.max(early, 1))
    return Number(c.toFixed(1))
  }, [feeds])

  const latestNews: NewsItem[] = useMemo(() => {
    const mapSent = (s: number | undefined): SentimentTag =>
      s === undefined || isNaN(Number(s))
        ? "neutral"
        : Number(s) > 0.1
          ? "positive"
          : Number(s) < -0.1
            ? "negative"
            : "neutral"

    return feeds.slice(0, 12).map((p, i) => ({
      id: String(p.id ?? p.post_id ?? `p${i}`),
      title: String(p.title ?? p.text?.slice(0, 80) ?? "Social update"),
      summary: String(p.text ?? p.title ?? "").slice(0, 200),
      category: (p.platform ?? "Social").toString(),
      timestamp: new Date(parseMs(p.timestamp ?? p.created_at)).toLocaleString(),
      source: (p.platform ?? "Social").toString(),
      trending: i < 5,
      engagement:
        Number(p.engagement ?? p.engagement_score ?? 0) +
        Number(p.likes ?? 0) +
        Number(p.retweets ?? 0) +
        Number(p.shares ?? 0) +
        Number(p.comments ?? p.replies ?? 0),
      sentiment: mapSent(Number(p.sentiment ?? p.average_sentiment)),
    }))
  }, [feeds])

  const categories = useMemo(() => {
    const set = new Set<string>(["all"])
    latestNews.forEach((n) => set.add(n.category))
    return Array.from(set)
  }, [latestNews])

  const filteredNews =
    selectedCategory === "all" ? latestNews : latestNews.filter((n) => n.category === selectedCategory)

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-900/20 border-green-500/30"
      case "negative":
        return "text-red-400 bg-red-900/20 border-red-500/30"
      default:
        return "text-yellow-400 bg-yellow-900/20 border-yellow-500/30"
    }
  }

  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of feeds) {
      const text: string = p.text || p.title || ""
      const tags = text.match(/#\w+/g) ?? []
      for (const t of tags) counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) || 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, mentions], idx) => ({
        topic: topic.replace(/^#/, "").toUpperCase(),
        mentions,
        trend: (idx < 5 ? "up" : "stable") as "up" | "down" | "stable",
        category: "Social",
      }))
  }, [feeds])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">BONK Mindshare Analytics</h1>
          <p className="text-gray-400">Loading live mindshare data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white transition-all duration-500 group-hover:text-orange-400">
            BONK Mindshare Analytics
          </h1>
          <p className="text-gray-400 transition-all duration-500 group-hover:text-gray-300">
            Real-time tracking of BONK's presence in the crypto consciousness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:scale-105 hover:shadow-[0_0_4px_rgba(59,130,246,0.3)] transition-all duration-500 transform-gpu">
            Rank #3
          </Badge>
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30 hover:scale-105 hover:shadow-[0_0_4px_rgba(239,68,68,0.3)] transition-all duration-500 transform-gpu">
            <Flame className="h-3 w-3 mr-1 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2" />
            Hot
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Mindshare Score
            </CardTitle>
            <Target className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-orange-400">
              {mindshareScore}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              {change24h >= 0 ? "+" : ""}
              {change24h}% from earlier window
            </p>
            <Progress value={mindshareScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Social Mentions
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-green-400">
              {socialMentions.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              Sampled posts
            </p>
            <Badge variant="secondary" className="mt-1 bg-green-500/20 text-green-400 border-green-500/30 hover:scale-105 hover:shadow-[0_0_4px_rgba(34,197,94,0.3)] transition-all duration-500 transform-gpu">
              {change24h >= 0 ? "+" : ""}
              {change24h}% vs earlier
            </Badge>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Influencer Mentions
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-purple-400">
              {influencerMentions}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              Top creators
            </p>
            <Badge variant="secondary" className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:scale-105 hover:shadow-[0_0_4px_rgba(59,130,246,0.3)] transition-all duration-500 transform-gpu">
              live
            </Badge>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Brand Awareness
            </CardTitle>
            <Eye className="h-4 w-4 text-cyan-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-cyan-400">
              {brandAwareness.toFixed(0)}%
            </div>
            <Progress value={brandAwareness} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1 transition-all duration-500 group-hover/stats:text-gray-400">
              unique creator ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest BONK News */}
      <Card className="group/main bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#ff6b35] transition-all duration-500 group-hover/main:scale-110 group-hover/main:rotate-2 group-hover/main:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              <div>
                <CardTitle className="text-white transition-all duration-500 group-hover/main:text-orange-400">
                  Latest BONK News & Updates
                </CardTitle>
                <CardDescription className="text-gray-400 transition-all duration-500 group-hover/main:text-gray-300">
                  Real-time news and developments from the BONK ecosystem
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="group/button border-orange-300 focus:border-orange-500 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu"
            >
              <ExternalLink className="h-4 w-4 mr-2 transition-all duration-500 group-hover/button:scale-110 group-hover/button:rotate-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from(new Set(["all", ...categories])).map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-[#ff6b35] hover:bg-[#ff6b35]/80 border-[#ff6b35] text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                    : "border-orange-300 focus:border-orange-500 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu"
                }
              >
                {category === "all" ? "All News" : category}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredNews.map((news) => (
              <div
                key={news.id}
                className="group/news border border-gray-700 rounded-lg p-4 hover:bg-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white transition-all duration-500 group-hover/news:text-orange-400">
                    {news.title}
                  </h3>
                  {news.trending && (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30 hover:scale-105 hover:shadow-[0_0_4px_rgba(239,68,68,0.3)] transition-all duration-500 transform-gpu">
                      <Flame className="h-3 w-3 mr-1 transition-all duration-500 group-hover/news:scale-110 group-hover/news:rotate-2" />
                      Trending
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className={`${getSentimentColor(news.sentiment)} hover:scale-105 transition-all duration-500 transform-gpu`}>
                  {news.sentiment}
                </Badge>
                <p className="text-gray-400 text-sm mt-2 transition-all duration-500 group-hover/news:text-gray-300">
                  {news.summary}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/news:text-gray-400">
                      <Calendar className="h-3 w-3 transition-all duration-500 group-hover/news:scale-110 group-hover/news:rotate-2" />
                      {news.timestamp}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/news:text-gray-400">
                      <ExternalLink className="h-3 w-3 transition-all duration-500 group-hover/news:scale-110 group-hover/news:rotate-2" />
                      {news.source}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/news:text-gray-400">
                      <Activity className="h-3 w-3 transition-all duration-500 group-hover/news:scale-110 group-hover/news:rotate-2" />
                      {news.engagement.toLocaleString()} engagements
                    </span>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 hover:scale-105 transition-all duration-500 transform-gpu">
                    {news.category}
                  </Badge>
                </div>
              </div>
            ))}
            {!filteredNews.length && (
              <p className="text-gray-400 text-center py-8">
                No recent posts in this category.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="group/tabs grid w-full grid-cols-3 bg-gray-800 border-gray-700 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white transition-all duration-500 hover:scale-105">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white transition-all duration-500 hover:scale-105">
            Trends
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white transition-all duration-500 hover:scale-105">
            Sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="group/competitor bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white transition-all duration-500 group-hover/competitor:text-orange-400">
                  Competitor Analysis
                </CardTitle>
                <CardDescription className="text-gray-400 transition-all duration-500 group-hover/competitor:text-gray-300">
                  BONK vs other memecoins in mindshare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "BONK", score: mindshareScore, change: change24h },
                    { name: "DOGE", score: 85, change: -2 },
                    { name: "SHIB", score: 78, change: 1 },
                    { name: "PEPE", score: 72, change: -5 },
                    { name: "WIF", score: 68, change: 8 },
                  ].map((competitor) => (
                    <div
                      key={competitor.name}
                      className="group/item flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center text-black font-bold text-sm transition-all duration-500 group-hover/item:scale-110 group-hover/item:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                          {competitor.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-white font-medium transition-all duration-500 group-hover/item:text-orange-400">
                            {competitor.name}
                          </div>
                          <div className="text-gray-400 text-sm transition-all duration-500 group-hover/item:text-gray-300">
                            Score: {competitor.score}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={competitor.change >= 0 ? "default" : "destructive"}
                          className={
                            competitor.change >= 0 ? "bg-green-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(34,197,94,0.3)]" : "bg-red-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(239,68,68,0.3)]"
                          }
                        >
                          {competitor.change >= 0 ? "+" : ""}
                          {competitor.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="group/trending bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white transition-all duration-500 group-hover/trending:text-orange-400">
                  Trending Topics
                </CardTitle>
                <CardDescription className="text-gray-400 transition-all duration-500 group-hover/trending:text-gray-300">
                  Most discussed hashtags and topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={topic.topic}
                      className="group/item flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center text-black font-bold text-sm transition-all duration-500 group-hover/item:scale-110 group-hover/item:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium transition-all duration-500 group-hover/item:text-orange-400">
                            {topic.topic}
                          </div>
                          <div className="text-gray-400 text-sm transition-all duration-500 group-hover/item:text-gray-300">
                            {topic.mentions} mentions
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={topic.trend === "up" ? "default" : "secondary"}
                        className={
                          topic.trend === "up" ? "bg-green-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(34,197,94,0.3)]" : "bg-gray-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(107,114,128,0.3)]"
                        }
                      >
                        {topic.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 mr-1 transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2" />
                        ) : (
                          <Activity className="h-3 w-3 mr-1 transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2" />
                        )}
                        {topic.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="group/trends bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white transition-all duration-500 group-hover/trends:text-orange-400">
                Mindshare Trends
              </CardTitle>
              <CardDescription className="text-gray-400 transition-all duration-500 group-hover/trends:text-gray-300">
                How BONK's mindshare has evolved over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { period: "Last 24h", score: mindshareScore, change: change24h, trend: "up" },
                  { period: "Last 7d", score: 78, change: 12, trend: "up" },
                  { period: "Last 30d", score: 72, change: 25, trend: "up" },
                  { period: "Last 90d", score: 65, change: 40, trend: "up" },
                ].map((trend) => (
                  <div
                    key={trend.period}
                    className="group/item flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#ff6b35] rounded-full flex items-center justify-center text-black font-bold text-sm transition-all duration-500 group-hover/item:scale-110 group-hover/item:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                        {trend.score}
                      </div>
                      <div>
                        <div className="text-white font-medium transition-all duration-500 group-hover/item:text-orange-400">
                          {trend.period}
                        </div>
                        <div className="text-gray-400 text-sm transition-all duration-500 group-hover/item:text-gray-300">
                          Mindshare Score
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={trend.change >= 0 ? "default" : "destructive"}
                        className={
                          trend.change >= 0 ? "bg-green-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(34,197,94,0.3)]" : "bg-red-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(239,68,68,0.3)]"
                        }
                      >
                        {trend.change >= 0 ? "+" : ""}
                        {trend.change}%
                      </Badge>
                      {trend.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-400 transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2 group-hover/item:drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400 transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2 group-hover/item:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          {(() => {
            const totalPosts = feeds.length
            const positivePosts = feeds.filter((p) => (p.sentiment || 0) > 0.1).length
            const negativePosts = feeds.filter((p) => (p.sentiment || 0) < -0.1).length
            const neutralPosts = totalPosts - positivePosts - negativePosts

            const posPct = totalPosts > 0 ? Math.round((positivePosts / totalPosts) * 100) : 0
            const negPct = totalPosts > 0 ? Math.round((negativePosts / totalPosts) * 100) : 0
            const neuPct = totalPosts > 0 ? Math.round((neutralPosts / totalPosts) * 100) : 0

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="group/positive bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:border-green-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/positive:text-gray-300">
                        Positive
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-400 transition-all duration-500 group-hover/positive:scale-110 group-hover/positive:rotate-2 group-hover/positive:drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-400 transition-all duration-500 group-hover/positive:text-green-300">
                        {posPct}%
                      </div>
                      <Progress value={posPct} className="mt-2" />
                      <p className="text-xs text-gray-500 mt-1 transition-all duration-500 group-hover/positive:text-gray-400">
                        Based on recent posts
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="group/neutral bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/neutral:text-gray-300">
                        Neutral
                      </CardTitle>
                      <Activity className="h-4 w-4 text-gray-400 transition-all duration-500 group-hover/neutral:scale-110 group-hover/neutral:rotate-2 group-hover/neutral:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-400 transition-all duration-500 group-hover/neutral:text-orange-400">
                        {neuPct}%
                      </div>
                      <Progress value={neuPct} className="mt-2" />
                      <p className="text-xs text-gray-500 mt-1 transition-all duration-500 group-hover/neutral:text-gray-400">
                        Based on recent posts
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="group/negative bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:border-red-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/negative:text-gray-300">
                        Negative
                      </CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-400 transition-all duration-500 group-hover/negative:scale-110 group-hover/negative:rotate-2 group-hover/negative:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-400 transition-all duration-500 group-hover/negative:text-red-300">
                        {negPct}%
                      </div>
                      <Progress value={negPct} className="mt-2" />
                      <p className="text-xs text-gray-500 mt-1 transition-all duration-500 group-hover/negative:text-gray-400">
                        Based on recent posts
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="group/timeline bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white transition-all duration-500 group-hover/timeline:text-orange-400">
                      Sentiment Timeline
                    </CardTitle>
                    <CardDescription className="text-gray-400 transition-all duration-500 group-hover/timeline:text-gray-300">
                      How sentiment has evolved over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { date: "Today", positive: 72, neutral: 19, negative: 9, event: "ATH reached" },
                        {
                          date: "Yesterday",
                          positive: 68,
                          neutral: 22,
                          negative: 10,
                          event: "Mobile integration announced",
                        },
                        { date: "2 days ago", positive: 65, neutral: 25, negative: 10, event: "Community milestone" },
                        { date: "3 days ago", positive: 62, neutral: 28, negative: 10, event: "DeFi partnerships" },
                        { date: "4 days ago", positive: 58, neutral: 30, negative: 12, event: "Token burn event" },
                        { date: "5 days ago", positive: 55, neutral: 32, negative: 13, event: "NFT collection launch" },
                        { date: "6 days ago", positive: 52, neutral: 35, negative: 13, event: "Regular trading" },
                      ].map((day) => (
                        <div key={day.date} className="group/day border border-gray-700 rounded-lg p-4 hover:bg-gray-800 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white transition-all duration-500 group-hover/day:text-orange-400">
                              {day.date}
                            </h4>
                            <span className="text-sm text-gray-400 transition-all duration-500 group-hover/day:text-gray-300">
                              {day.event}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-green-400 transition-all duration-500 group-hover/day:text-green-300">
                                  Positive
                                </span>
                                <span className="text-green-400 transition-all duration-500 group-hover/day:text-green-300">
                                  {day.positive}%
                                </span>
                              </div>
                              <Progress value={day.positive} className="h-2" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400 transition-all duration-500 group-hover/day:text-gray-300">
                                  Neutral
                                </span>
                                <span className="text-gray-400 transition-all duration-500 group-hover/day:text-gray-300">
                                  {day.neutral}%
                                </span>
                              </div>
                              <Progress value={day.neutral} className="h-2" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-red-400 transition-all duration-500 group-hover/day:text-red-300">
                                  Negative
                                </span>
                                <span className="text-red-400 transition-all duration-500 group-hover/day:text-red-300">
                                  {day.negative}%
                                </span>
                              </div>
                              <Progress value={day.negative} className="h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          })()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

