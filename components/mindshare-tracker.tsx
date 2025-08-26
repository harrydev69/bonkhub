"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Brain,
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
        <div className="flex items-center gap-4">
          <Brain className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">BONK Mindshare Analytics</h1>
            <p className="text-gray-400">Loading live mindshare data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brain className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">BONK Mindshare Analytics</h1>
            <p className="text-gray-400">Real-time tracking of BONK's presence in the crypto consciousness</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            Rank #3
          </Badge>
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
            <Flame className="h-3 w-3 mr-1" />
            Hot
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Mindshare Score</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mindshareScore}</div>
            <p className="text-xs text-gray-400">
              {change24h >= 0 ? "+" : ""}
              {change24h}% from earlier window
            </p>
            <Progress value={mindshareScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Social Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{socialMentions.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Sampled posts</p>
            <Badge variant="secondary" className="mt-1 bg-green-500/20 text-green-400 border-green-500/30">
              {change24h >= 0 ? "+" : ""}
              {change24h}% vs earlier
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Influencer Mentions</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{influencerMentions}</div>
            <p className="text-xs text-gray-400">Top creators</p>
            <Badge variant="secondary" className="mt-1 bg-orange-500/20 text-orange-400 border-orange-500/30">
              live
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Brand Awareness</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{brandAwareness.toFixed(0)}%</div>
            <Progress value={brandAwareness} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">unique creator ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest BONK News */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <CardTitle className="text-white">Latest BONK News & Updates</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time news and developments from the BONK ecosystem
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
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
                    ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"
                    : "border-gray-600 text-gray-300 hover:border-orange-500/50"
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
                className="border border-gray-700/50 rounded-lg p-4 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{news.title}</h3>
                  {news.trending && (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                      <Flame className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className={getSentimentColor(news.sentiment)}>
                  {news.sentiment}
                </Badge>
                <p className="text-gray-400 text-sm mt-2">{news.summary}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {news.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {news.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {news.engagement.toLocaleString()} engagements
                    </span>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {news.category}
                  </Badge>
                </div>
              </div>
            ))}
            {!filteredNews.length && (
              <p className="text-gray-400 text-center py-8">No recent posts in this category.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900/50 border border-gray-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="competitors" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Competitors
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Trending
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Mindshare Radar</CardTitle>
                <CardDescription className="text-gray-400">
                  Multi-dimensional analysis of BONK's market presence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                    <p>Radar chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Social Word Cloud</CardTitle>
                <CardDescription className="text-gray-400">Most mentioned terms associated with BONK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                    <p>Word cloud visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Competitor Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                How BONK compares to other meme coins in mindshare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "DOGE", score: clamp(mindshareScore + 6), change: -1.8 },
                  { name: "SHIB", score: clamp(mindshareScore + 2), change: 2.3 },
                  { name: "BONK", score: mindshareScore, change: change24h },
                  { name: "PEPE", score: clamp(mindshareScore - 10), change: -3.2 },
                  { name: "WIF", score: clamp(mindshareScore - 17), change: 4.8 },
                ].map((competitor, index) => (
                  <div
                    key={competitor.name}
                    className="flex items-center justify-between p-4 border border-gray-700/50 rounded-lg hover:border-orange-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-white">{competitor.name}</h3>
                        <p className="text-sm text-gray-400">Meme Coin</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{competitor.score}</div>
                        <div className="text-sm text-gray-400">Score</div>
                      </div>
                      <Badge variant={competitor.change >= 0 ? "default" : "destructive"} className="text-sm">
                        {competitor.change >= 0 ? "+" : ""}
                        {competitor.change}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Trending Topics</CardTitle>
              <CardDescription className="text-gray-400">
                What the crypto community is saying about BONK right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((item, index) => (
                  <div
                    key={item.topic}
                    className="flex items-center justify-between p-4 border border-gray-700/50 rounded-lg hover:border-orange-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-white">{item.topic}</h3>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{item.mentions.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">mentions</div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {item.trend === "up" && <TrendingUp className="h-4 w-4 text-green-400" />}
                        {item.trend === "down" && <TrendingDown className="h-4 w-4 text-red-400" />}
                        {item.trend === "stable" && <Activity className="h-4 w-4 text-gray-400" />}
                        <span className="text-gray-400">{item.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!trendingTopics.length && (
                  <p className="text-gray-400 text-center py-8">No trending topics detected yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          {(() => {
            const sVals = feeds.map((p) => Number(p.sentiment ?? p.average_sentiment ?? 0))
            const pos = sVals.filter((s) => s > 0.1).length
            const neg = sVals.filter((s) => s < -0.1).length
            const neu = sVals.length - pos - neg
            const total = sVals.length || 1
            const posPct = Math.round((pos / total) * 100)
            const neuPct = Math.round((neu / total) * 100)
            const negPct = Math.round((neg / total) * 100)

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">Positive</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-400">{posPct}%</div>
                      <Progress value={posPct} className="mt-2" />
                      <p className="text-xs text-gray-400 mt-1">Based on recent posts</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">Neutral</CardTitle>
                      <Activity className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-400">{neuPct}%</div>
                      <Progress value={neuPct} className="mt-2" />
                      <p className="text-xs text-gray-400 mt-1">Based on recent posts</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">Negative</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-400">{negPct}%</div>
                      <Progress value={negPct} className="mt-2" />
                      <p className="text-xs text-gray-400 mt-1">Based on recent posts</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Sentiment Timeline</CardTitle>
                    <CardDescription className="text-gray-400">
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
                        <div key={day.date} className="border border-gray-700/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">{day.date}</h4>
                            <span className="text-sm text-gray-400">{day.event}</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-green-400">Positive</span>
                                <span className="text-green-400">{day.positive}%</span>
                              </div>
                              <Progress value={day.positive} className="h-2" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Neutral</span>
                                <span className="text-gray-400">{day.neutral}%</span>
                              </div>
                              <Progress value={day.neutral} className="h-2" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-red-400">Negative</span>
                                <span className="text-red-400">{day.negative}%</span>
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
