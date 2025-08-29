"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { TrendingUp, Users, MessageCircle, Activity, BarChart3, LineChart as LineChartIcon, PieChart, Coins, Zap, Target, TrendingDown, Award, Rocket, Flame, Star, TrendingUpIcon, Table, Lightbulb, Info } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, AreaChart, Area, BarChart, Bar } from "recharts"
import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"


// Types for the LunarCrush data (based on actual API response)
type LunarCrushDataPoint = {
  time: number
  open?: number
  high?: number
  low?: number
  close?: number
  volume_24h?: number
  sentiment?: number
  interactions?: number
  contributors_active?: number
  posts_active?: number
  contributors_created?: number
  posts_created?: number
  spam?: number
  galaxy_score?: number
  alt_rank?: number
  market_cap?: number
  market_dominance?: number
  social_dominance?: number
  circulating_supply?: number
  [key: string]: any
}

type LunarCrushResponse = {
  config?: {
    id: string
    name: string
    symbol: string
    generated: number
  }
  data: LunarCrushDataPoint[]
}

export default function PerformancePage() {
  const [coinsData, setCoinsData] = useState<LunarCrushResponse | null>(null)
  const [topicData, setTopicData] = useState<LunarCrushResponse | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("24h")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMetrics, setSelectedMetrics] = useState({
    price: true,
    volume: false,
    sentiment: true,
    interactions: true,
    contributors: false,
    posts: false,
    galaxyScore: false,
    socialDominance: false,
    altRank: false
  })
  const [chartType, setChartType] = useState<"stacked-area" | "line-chart">("stacked-area")

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  const fetchAllData = async () => {
    try {
      // Fetch both data sources for comprehensive BONK analysis
      const [coinsResponse, topicResponse] = await Promise.all([
        fetch(`/api/test/lunarcrush-coins-v2?timeRange=${timeRange}&coinId=bonk`),
        fetch(`/api/test/lunarcrush-timeseries-v2?timeRange=${timeRange}&coinId=bonk`)
      ])
      
      if (coinsResponse.ok && topicResponse.ok) {
        const coinsResult = await coinsResponse.json()
        const topicResult = await topicResponse.json()
        
        setCoinsData(coinsResult.data)
        setTopicData(topicResult.results.hour)
      } else {
        throw new Error('Failed to fetch BONK data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch BONK performance data")
    }
  }

  const formatTime = (timestamp: number | undefined | null) => {
    if (timestamp === undefined || timestamp === null || isNaN(timestamp)) return 'N/A'
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return '$0.00000000'
    return `$${price.toFixed(8)}`
  }

  const getChartData = (data: LunarCrushDataPoint[] | undefined) => {
    if (!data) return []
    
    return data.map((point, index) => {
      const date = new Date(point.time * 1000)
      
      let timeLabel: string
      if (timeRange === "1h" || timeRange === "24h") {
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
      
      return {
        time: timeLabel,
        price: point.close || 0,
        volume: point.volume_24h || 0,
        sentiment: point.sentiment || 0,
        interactions: point.interactions || 0,
        posts: point.posts_active || 0,
        contributors: point.contributors_active || 0,
        galaxyScore: point.galaxy_score || 0,
        altRank: point.alt_rank || 0,
        marketCap: point.market_cap || 0,
        index
      }
    })
  }

  const getTopicChartData = (data: LunarCrushDataPoint[] | undefined) => {
    if (!data) return []
    
    return data.map((point, index) => {
      const date = new Date(point.time * 1000)
      
      let timeLabel: string
      if (timeRange === "1h" || timeRange === "24h") {
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
      
      return {
        time: timeLabel,
        // Social metrics from topic endpoint (using actual available fields)
        socialVolume: point.volume_24h || 0,
        socialScore: point.sentiment || 0,
        socialContributors: point.contributors_active || 0,
        socialEngagement: point.interactions || 0,
        // Market metrics if available
        price: point.close || 0,
        volume: point.volume_24h || 0,
        index
      }
    })
  }

  const getPerformanceChange = (data: LunarCrushDataPoint[] | undefined) => {
    if (!data || data.length < 2) return { priceChange: 0, volumeChange: 0, sentimentChange: 0, interactionsChange: 0 }
    
    const latest = data[data.length - 1]
    const previous = data[data.length - 2]
    
    const priceChange = latest.close && previous.close ? ((latest.close - previous.close) / previous.close) * 100 : 0
    const volumeChange = latest.volume_24h && previous.volume_24h ? ((latest.volume_24h - previous.volume_24h) / previous.volume_24h) * 100 : 0
    const sentimentChange = latest.sentiment && previous.sentiment ? latest.sentiment - previous.sentiment : 0
    const interactionsChange = latest.interactions && previous.interactions ? ((latest.interactions - previous.interactions) / previous.interactions) * 100 : 0
    
    return { priceChange, volumeChange, sentimentChange, interactionsChange }
  }

  const calculateCorrelation = (data: LunarCrushDataPoint[] | undefined) => {
    if (!data || data.length < 2) return []
    
    const metrics = [
      { key: 'price', label: 'Price', data: data.map(d => d.close || 0) },
      { key: 'volume', label: 'Volume', data: data.map(d => d.volume_24h || 0) },
      { key: 'sentiment', label: 'Sentiment', data: data.map(d => d.sentiment || 0) },
      { key: 'interactions', label: 'Interactions', data: data.map(d => d.interactions || 0) },
      { key: 'galaxyScore', label: 'Galaxy Score', data: data.map(d => d.galaxy_score || 0) }
    ]
    
    const correlations = []
    
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i; j < metrics.length; j++) {
        const metric1 = metrics[i]
        const metric2 = metrics[j]
        
        if (i === j) {
          correlations.push({
            metric1: metric1.label,
            metric2: metric2.label,
            correlation: 1.0,
            strength: 'Perfect'
          })
        } else {
          const correlation = pearsonCorrelation(metric1.data, metric2.data)
          correlations.push({
            metric1: metric1.label,
            metric2: metric2.label,
            correlation: correlation,
            strength: getCorrelationStrength(correlation)
          })
        }
      }
    }
    
    return correlations
  }

  const pearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length
    if (n !== y.length) return 0
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0)
    const sumX2 = x.reduce((a, b) => a + b * b, 0)
    const sumY2 = y.reduce((a, b) => a + b * b, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  const getCorrelationStrength = (correlation: number): string => {
    const abs = Math.abs(correlation)
    if (abs >= 0.8) return 'Very Strong'
    if (abs >= 0.6) return 'Strong'
    if (abs >= 0.4) return 'Moderate'
    if (abs >= 0.2) return 'Weak'
    return 'Very Weak'
  }

  const calculateMetricCorrelation = (metric1: string, metric2: string, coinsData: any, topicData: any): number => {
    if (!coinsData || !topicData) return 0
    
    // Extract data for both metrics
    let data1: number[] = []
    let data2: number[] = []
    
    // Map metric keys to data sources
    const metricMap: { [key: string]: { data: any[], field: string } } = {
      price: { data: coinsData, field: 'close' },
      volume: { data: coinsData, field: 'volume_24h' },
      sentiment: { data: topicData, field: 'sentiment' },
      interactions: { data: topicData, field: 'interactions' },
      contributors: { data: topicData, field: 'contributors_active' },
      posts: { data: topicData, field: 'posts_active' },
      galaxyScore: { data: topicData, field: 'galaxy_score' },
      socialDominance: { data: topicData, field: 'social_dominance' },
      altRank: { data: coinsData, field: 'alt_rank' }
    }
    
    const source1 = metricMap[metric1]
    const source2 = metricMap[metric2]
    
    if (!source1 || !source2) return 0
    
    // Extract data arrays
    data1 = source1.data.map((d: any) => d[source1.field] || 0)
    data2 = source2.data.map((d: any) => d[source2.field] || 0)
    
    // Ensure both arrays have the same length
    const minLength = Math.min(data1.length, data2.length)
    data1 = data1.slice(0, minLength)
    data2 = data2.slice(0, minLength)
    
    return pearsonCorrelation(data1, data2)
  }

  const getNormalizedData = (data: LunarCrushDataPoint[] | undefined) => {
    if (!data || data.length === 0) return []
    
    return data.map((point, index) => {
      const date = new Date(point.time * 1000)
      
      let timeLabel: string
      if (timeRange === "1h" || timeRange === "24h") {
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
      
      // Normalize all metrics to 0-100 scale
      const maxPrice = Math.max(...data.map(d => d.close || 0))
      const maxVolume = Math.max(...data.map(d => d.volume_24h || 0))
      const maxSentiment = Math.max(...data.map(d => d.sentiment || 0))
      const maxInteractions = Math.max(...data.map(d => d.interactions || 0))
      const maxContributors = Math.max(...data.map(d => d.contributors_active || 0))
      const maxPosts = Math.max(...data.map(d => d.posts_active || 0))
      const maxGalaxyScore = Math.max(...data.map(d => d.galaxy_score || 0))
      const maxSocialDominance = Math.max(...data.map(d => d.social_dominance || 0))
      const maxAltRank = Math.max(...data.map(d => d.alt_rank || 0))
      
      return {
        time: timeLabel,
        price: maxPrice > 0 ? ((point.close || 0) / maxPrice) * 100 : 0,
        volume: maxVolume > 0 ? ((point.volume_24h || 0) / maxVolume) * 100 : 0,
        sentiment: maxSentiment > 0 ? ((point.sentiment || 0) / maxSentiment) * 100 : 0,
        interactions: maxInteractions > 0 ? ((point.interactions || 0) / maxInteractions) * 100 : 0,
        contributors: maxContributors > 0 ? ((point.contributors_active || 0) / maxContributors) * 100 : 0,
        posts: maxPosts > 0 ? ((point.posts_active || 0) / maxPosts) * 100 : 0,
        galaxyScore: maxGalaxyScore > 0 ? ((point.galaxy_score || 0) / maxGalaxyScore) * 100 : 0,
        socialDominance: maxSocialDominance > 0 ? ((point.social_dominance || 0) / maxSocialDominance) * 100 : 0,
        altRank: maxAltRank > 0 ? ((point.alt_rank || 0) / maxAltRank) * 100 : 0,
        index
      }
    })
  }





  const coinsChartData = getChartData(coinsData?.data)
  const topicChartData = getTopicChartData(topicData?.data)
  const performanceChange = getPerformanceChange(coinsData?.data)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Main heading */}
          <div className="mb-8">
            <div className="flex items-center gap-4 group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
              <TrendingUp className="h-8 w-8 text-[#ff6b35] transition-all duration-500 group-hover/header:scale-110 group-hover/header:rotate-2 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]" />
              <div>
                <h1 className="text-3xl font-bold text-white transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
                  BONK Performance Analytics Internationally 🔥
                </h1>
                <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
                  Real-time performance analysis of the most memeable dog coin on Solana
                </p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex justify-center mt-8">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Performance Metrics - 8 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Current Price */}
            <Card className="group/price bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/price:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/price:scale-110 group-hover/price:rotate-2 group-hover/price:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Current Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/price:text-[#ff6b35]">
                  {formatPrice(coinsData?.data?.[coinsData.data.length - 1]?.close)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${performanceChange.priceChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'} transition-all duration-500 group-hover/price:scale-105`}>
                    {performanceChange.priceChange >= 0 ? '+' : ''}{performanceChange.priceChange.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 transition-all duration-500 group-hover/price:text-gray-400">vs previous</span>
                </div>
              </CardContent>
            </Card>

            {/* 2. 24H Volume */}
            <Card className="group/volume bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/volume:text-gray-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/volume:scale-110 group-hover/volume:rotate-2 group-hover/volume:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  24H Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/volume:text-[#ff6b35]">
                  {formatNumber(coinsData?.data?.[coinsData.data.length - 1]?.volume_24h)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${performanceChange.volumeChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'} transition-all duration-500 group-hover/volume:scale-105`}>
                    {performanceChange.volumeChange >= 0 ? '+' : ''}{performanceChange.volumeChange.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 transition-all duration-500 group-hover/volume:text-gray-400">vs previous</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Market Cap */}
            <Card className="group/marketcap bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/marketcap:text-gray-300 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/marketcap:scale-110 group-hover/marketcap:rotate-2 group-hover/marketcap:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/marketcap:text-[#ff6b35]">
                  {formatNumber(coinsData?.data?.[coinsData.data.length - 1]?.market_cap)}
                </div>
              </CardContent>
            </Card>

            {/* 4. Alt Rank */}
            <Card className="group/altrank bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/altrank:text-gray-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/altrank:scale-110 group-hover/altrank:rotate-2 group-hover/altrank:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Alt Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/altrank:text-[#ff6b35]">
                  #{coinsData?.data?.[coinsData.data.length - 1]?.alt_rank || 0}
                </div>
                <p className="text-xs text-gray-500 mt-2 transition-all duration-500 group-hover/altrank:text-gray-400">Among all altcoins</p>
              </CardContent>
            </Card>

            {/* 5. Social Dominance */}
            <Card className="group/social bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/social:text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/social:scale-110 group-hover/social:rotate-2 group-hover/social:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Social Dominance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/social:text-[#ff6b35]">
                  {(coinsData?.data?.[coinsData.data.length - 1]?.social_dominance || 0).toFixed(2)}%
                </div>
              </CardContent>
            </Card>

            {/* 6. Social Sentiment */}
            <Card className="group/sentiment bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/sentiment:text-gray-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/sentiment:scale-110 group-hover/sentiment:rotate-2 group-hover/sentiment:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Social Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/sentiment:text-[#ff6b35]">
                  {coinsData?.data?.[coinsData.data.length - 1]?.sentiment || 0}/100
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${performanceChange.sentimentChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'} transition-all duration-500 group-hover/sentiment:scale-105`}>
                    {performanceChange.sentimentChange >= 0 ? '+' : ''}{performanceChange.sentimentChange.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 transition-all duration-500 group-hover/sentiment:text-gray-400">vs previous</span>
                </div>
              </CardContent>
            </Card>

            {/* 7. Interactions */}
            <Card className="group/interactions bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/interactions:text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/interactions:scale-110 group-hover/interactions:rotate-2 group-hover/interactions:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/interactions:text-[#ff6b35]">
                  {formatNumber(coinsData?.data?.[coinsData.data.length - 1]?.interactions || 0)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${performanceChange.interactionsChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'} transition-all duration-500 group-hover/interactions:scale-105`}>
                    {performanceChange.interactionsChange >= 0 ? '+' : ''}{performanceChange.interactionsChange.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 transition-all duration-500 group-hover/interactions:text-gray-400">vs previous</span>
                </div>
              </CardContent>
            </Card>

            {/* 8. Galaxy Score */}
            <Card className="group/galaxy bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/galaxy:text-gray-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#ff6b35] transition-all duration-500 group-hover/galaxy:scale-110 group-hover/galaxy:rotate-2 group-hover/galaxy:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Galaxy Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/galaxy:text-[#ff6b35]">
                  {coinsData?.data?.[coinsData.data.length - 1]?.galaxy_score || 0}/100
                </div>
                <p className="text-xs text-gray-500 mt-2 transition-all duration-500 group-hover/galaxy:text-gray-400">LunarCrush rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Spacing between metric cards and Data Insights */}
          <div className="mb-8"></div>

          {/* Data Insights Panel */}
          <Card className="group/insights bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
           <CardHeader>
             <CardTitle className="text-white text-xl flex items-center gap-3 transition-all duration-500 group-hover/insights:text-[#ff6b35]">
               <Lightbulb className="w-6 h-6 text-[#ff6b35] transition-all duration-500 group-hover/insights:scale-110 group-hover/insights:rotate-2 group-hover/insights:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
               Data Insights & Analysis
             </CardTitle>
             <CardDescription className="text-gray-300 transition-all duration-500 group-hover/insights:text-gray-200">
               AI-powered insights explaining what the data means and its implications for BONK performance
             </CardDescription>
           </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Performance Insights */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#ff6b35]" />
                  Market Performance
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    <strong>Price Trend:</strong> {performanceChange.priceChange >= 0 ? 'BONK is showing positive momentum' : 'BONK is experiencing downward pressure'} 
                    with a {Math.abs(performanceChange.priceChange).toFixed(2)}% change.
                  </p>
                  <p>
                    <strong>Volume Analysis:</strong> {performanceChange.volumeChange >= 0 ? 'Trading activity is increasing' : 'Trading activity is decreasing'}, 
                    indicating {performanceChange.volumeChange >= 0 ? 'growing' : 'declining'} market interest.
                  </p>
                  <p>
                    <strong>Market Cap:</strong> Current market capitalization reflects the overall value perception 
                    of BONK in the cryptocurrency ecosystem.
                  </p>
                </div>
              </div>

              {/* Social Sentiment Insights */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#ff6b35]" />
                  Social Sentiment
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    <strong>Sentiment Score:</strong> {coinsData?.data?.[coinsData.data.length - 1]?.sentiment || 0}/100 indicates 
                    {(coinsData?.data?.[coinsData.data.length - 1]?.sentiment || 0) >= 70 ? ' very positive' : (coinsData?.data?.[coinsData.data.length - 1]?.sentiment || 0) >= 50 ? ' moderately positive' : ' negative'} community sentiment.
                  </p>
                  <p>
                    <strong>Social Dominance:</strong> {(coinsData?.data?.[coinsData.data.length - 1]?.social_dominance || 0).toFixed(2)}% 
                    of social media discussions about cryptocurrencies mention BONK.
                  </p>
                  <p>
                    <strong>Community Engagement:</strong> {formatNumber(coinsData?.data?.[coinsData.data.length - 1]?.interactions || 0)} interactions 
                    show {performanceChange.interactionsChange >= 0 ? 'increasing' : 'decreasing'} community activity.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h5 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#ff6b35]" />
                Key Takeaways
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <strong className="text-[#ff6b35]">Market Position:</strong> Alt Rank #{coinsData?.data?.[coinsData.data.length - 1]?.alt_rank || 0} 
                  places BONK among the top altcoins by market performance.
                </div>
                <div>
                  <strong className="text-[#ff6b35]">Galaxy Score:</strong> Score of {coinsData?.data?.[coinsData.data.length - 1]?.galaxy_score || 0} 
                  indicates {(coinsData?.data?.[coinsData.data.length - 1]?.galaxy_score || 0) >= 70 ? 'strong' : (coinsData?.data?.[coinsData.data.length - 1]?.galaxy_score || 0) >= 50 ? 'moderate' : 'weak'} 
                  overall market health and social engagement.
                </div>
                <div>
                  <strong className="text-[#ff6b35]">Trend Analysis:</strong> {timeRange} data shows {performanceChange.priceChange >= 0 ? 'positive' : 'negative'} 
                  momentum with {performanceChange.volumeChange >= 0 ? 'increasing' : 'decreasing'} trading volume.
                </div>
              </div>
            </div>
                     </CardContent>
         </Card>

         {/* Spacing between Data Insights and Main Dashboard Tabs */}
         <div className="mb-8"></div>

                                    {/* Main Dashboard Tabs */}
                     <Tabs defaultValue="metrics-comparison" className="space-y-6">
             <TabsList className="group/tabs bg-gray-800 border-gray-700 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500 p-2 flex justify-center">
               <TabsTrigger value="metrics-comparison" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-500 hover:scale-105 px-6 py-3 text-base font-medium">
                 Metrics Comparison
               </TabsTrigger>
               <TabsTrigger value="correlation-analysis" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-500 hover:scale-105 px-6 py-3 text-base font-medium">
                 Correlation Analysis
               </TabsTrigger>
               <TabsTrigger value="price-charts" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-500 hover:scale-105 px-6 py-3 text-base font-medium">
                 Price Charts
               </TabsTrigger>
               <TabsTrigger value="social-analytics" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-500 hover:scale-105 px-6 py-3 text-base font-medium">
                 Social Analytics
               </TabsTrigger>
               <TabsTrigger value="market-health" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-500 hover:scale-105 px-6 py-3 text-base font-medium">
                 Market Health
               </TabsTrigger>
             </TabsList>

                      {/* Metrics Comparison Tab */}
            <TabsContent value="metrics-comparison" className="space-y-6">
                             {/* Metrics Comparison */}
               <Card className="group/metrics bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                 <CardHeader>
                   <CardTitle className="text-white text-2xl flex items-center gap-3 transition-all duration-500 group-hover/metrics:text-[#ff6b35]">
                     <TrendingUp className="w-8 h-8 text-[#ff6b35] transition-all duration-500 group-hover/metrics:scale-110 group-hover/metrics:rotate-2 group-hover/metrics:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                     Metrics Comparison
                   </CardTitle>
                   <CardDescription className="text-gray-400 text-lg transition-all duration-500 group-hover/metrics:text-gray-200">
                     Compare different metrics over time with normalized stacked area charts
                   </CardDescription>
                 </CardHeader>
                              <CardContent>
                  <div className="space-y-8">
                                         {/* Chart Type Selector */}
                     <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                       <h4 className="text-lg font-semibold text-white mb-3 transition-all duration-500 hover:text-[#ff6b35]">Chart Type:</h4>
                                               <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${chartType === "stacked-area" ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"} hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu`}
                            onClick={() => setChartType("stacked-area")}
                          >
                            Stacked Area
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${chartType === "line-chart" ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"} hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu`}
                            onClick={() => setChartType("line-chart")}
                          >
                            Line Chart
                          </Button>
                        </div>
                     </div>

                                         {/* Metric Selection Buttons */}
                     <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                       <h4 className="text-lg font-semibold text-white mb-3 transition-all duration-500 hover:text-[#ff6b35]">Select Metrics to Compare:</h4>
                                               <p className="text-gray-400 text-sm mb-4">Click the buttons below to select which metrics you want to see in the chart. Selected metrics will be highlighted in green with a checkmark. Click again to deselect.</p>
                                               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.price ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, price: !prev.price }))}
                          >
                            {selectedMetrics.price && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Price
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.sentiment ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, sentiment: !prev.sentiment }))}
                          >
                            {selectedMetrics.sentiment && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Sentiment
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.volume ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, volume: !prev.volume }))}
                          >
                            {selectedMetrics.volume && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Volume
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.interactions ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, interactions: !prev.interactions }))}
                          >
                            {selectedMetrics.interactions && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Interactions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.contributors ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, contributors: !prev.contributors }))}
                          >
                            {selectedMetrics.contributors && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Active Contributors
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.posts ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, posts: !prev.posts }))}
                          >
                            {selectedMetrics.posts && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Active Posts
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.galaxyScore ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, galaxyScore: !prev.galaxyScore }))}
                          >
                            {selectedMetrics.galaxyScore && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Galaxy Score
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.socialDominance ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, socialDominance: !prev.socialDominance }))}
                          >
                            {selectedMetrics.socialDominance && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Social Dominance
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`${selectedMetrics.altRank ? "bg-green-700 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600"} transition-all duration-300 transform-gpu relative`}
                            onClick={() => setSelectedMetrics(prev => ({ ...prev, altRank: !prev.altRank }))}
                          >
                            {selectedMetrics.altRank && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-green-900 font-bold">✓</span>
                              </div>
                            )}
                            Alt Rank
                          </Button>
                        </div>
                     </div>

                    {/* Normalized Stacked Area Chart */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-[#ff6b35]" />
                        Normalized Metrics Comparison (0-100 Scale)
                      </h3>
                      <p className="text-gray-300 text-sm mb-6">
                        This chart shows all metrics normalized to a 0-100 scale for easy comparison.
                        All metrics are scaled relative to their maximum values in the selected time range.
                      </p>
                      
                      <div className="h-96 bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === "stacked-area" ? (
                            <AreaChart data={getNormalizedData(coinsData?.data)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                              <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} domain={[0, 100]} />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151', 
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }} 
                                labelStyle={{ color: '#F9FAFB' }}
                                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Normalized Value']}
                              />
                              <Legend />
                              {selectedMetrics.price && (
                                <Area 
                                  type="monotone" 
                                  dataKey="price" 
                                  stackId="1"
                                  stroke="#10B981" 
                                  fill="#10B981" 
                                  fillOpacity={0.8} 
                                  name="Price" 
                                />
                              )}
                              {selectedMetrics.volume && (
                                <Area 
                                  type="monotone" 
                                  dataKey="volume" 
                                  stackId="1"
                                  stroke="#F59E0B" 
                                  fill="#F59E0B" 
                                  fillOpacity={0.8} 
                                  name="Volume" 
                                />
                              )}
                              {selectedMetrics.sentiment && (
                                <Area 
                                  type="monotone" 
                                  dataKey="sentiment" 
                                  stackId="1"
                                  stroke="#3B82F6" 
                                  fill="#3B82F6" 
                                  fillOpacity={0.8} 
                                  name="Sentiment" 
                                />
                              )}
                              {selectedMetrics.interactions && (
                                <Area 
                                  type="monotone" 
                                  dataKey="interactions" 
                                  stackId="1"
                                  stroke="#EF4444" 
                                  fill="#EF4444" 
                                  fillOpacity={0.8} 
                                  name="Interactions" 
                                />
                              )}
                              {selectedMetrics.contributors && (
                                <Area 
                                  type="monotone" 
                                  dataKey="contributors" 
                                  stackId="1"
                                  stroke="#8B5CF6" 
                                  fill="#8B5CF6" 
                                  fillOpacity={0.8} 
                                  name="Active Contributors" 
                                />
                              )}
                              {selectedMetrics.posts && (
                                <Area 
                                  type="monotone" 
                                  dataKey="posts" 
                                  stackId="1"
                                  stroke="#EC4899" 
                                  fill="#EC4899" 
                                  fillOpacity={0.8} 
                                  name="Active Posts" 
                                />
                              )}
                              {selectedMetrics.galaxyScore && (
                                <Area 
                                  type="monotone" 
                                  dataKey="galaxyScore" 
                                  stackId="1"
                                  stroke="#06B6D4" 
                                  fill="#06B6D4" 
                                  fillOpacity={0.8} 
                                  name="Galaxy Score" 
                                />
                              )}
                              {selectedMetrics.socialDominance && (
                                <Area 
                                  type="monotone" 
                                  dataKey="socialDominance" 
                                  stackId="1"
                                  stroke="#84CC16" 
                                  fill="#84CC16" 
                                  fillOpacity={0.8} 
                                  name="Social Dominance" 
                                />
                              )}
                              {selectedMetrics.altRank && (
                                <Area 
                                  type="monotone" 
                                  dataKey="altRank" 
                                  stackId="1"
                                  stroke="#F97316" 
                                  fill="#F97316" 
                                  fillOpacity={0.8} 
                                  name="Alt Rank" 
                                />
                              )}
                            </AreaChart>
                          ) : (
                            <LineChart data={getNormalizedData(coinsData?.data)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                              <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} domain={[0, 100]} />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151', 
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }} 
                                labelStyle={{ color: '#F9FAFB' }}
                                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Normalized Value']}
                              />
                              <Legend />
                              {selectedMetrics.price && (
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke="#10B981" 
                                  strokeWidth={2}
                                  name="Price" 
                                />
                              )}
                              {selectedMetrics.volume && (
                                <Line 
                                  type="monotone" 
                                  dataKey="volume" 
                                  stroke="#F59E0B" 
                                  strokeWidth={2}
                                  name="Volume" 
                                />
                              )}
                              {selectedMetrics.sentiment && (
                                <Line 
                                  type="monotone" 
                                  dataKey="sentiment" 
                                  stroke="#3B82F6" 
                                  strokeWidth={2}
                                  name="Sentiment" 
                                />
                              )}
                              {selectedMetrics.interactions && (
                                <Line 
                                  type="monotone" 
                                  dataKey="interactions" 
                                  stroke="#EF4444" 
                                  strokeWidth={2}
                                  name="Interactions" 
                                />
                              )}
                              {selectedMetrics.contributors && (
                                <Line 
                                  type="monotone" 
                                  dataKey="contributors" 
                                  stroke="#8B5CF6" 
                                  strokeWidth={2}
                                  name="Active Contributors" 
                                />
                              )}
                              {selectedMetrics.posts && (
                                <Line 
                                  type="monotone" 
                                  dataKey="posts" 
                                  stroke="#EC4899" 
                                  strokeWidth={2}
                                  name="Active Posts" 
                                />
                              )}
                              {selectedMetrics.galaxyScore && (
                                <Line 
                                  type="monotone" 
                                  dataKey="galaxyScore" 
                                  stroke="#06B6D4" 
                                  strokeWidth={2}
                                  name="Galaxy Score" 
                                />
                              )}
                              {selectedMetrics.socialDominance && (
                                <Line 
                                  type="monotone" 
                                  dataKey="socialDominance" 
                                  stroke="#84CC16" 
                                  strokeWidth={2}
                                  name="Social Dominance" 
                                />
                              )}
                              {selectedMetrics.altRank && (
                                <Line 
                                  type="monotone" 
                                  dataKey="altRank" 
                                  stroke="#F97316" 
                                  strokeWidth={2}
                                  name="Alt Rank" 
                                />
                              )}
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                                         </div>
                   </div>

                   {/* Spacing between chart and Data Statistics */}
                   <div className="mb-8"></div>

                   {/* Data Statistics */}
                   <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl flex items-center gap-3 transition-all duration-500 group-hover/stats:text-[#ff6b35]">
                        <BarChart3 className="w-8 h-8 text-[#ff6b35] transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                        Data Statistics
                      </CardTitle>
                                         <CardDescription className="text-gray-400 transition-all duration-500 group-hover/stats:text-gray-200">
                     Comprehensive statistics from different metrics
                   </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Coins Data Statistics */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Coins Endpoint</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                              <span className="text-gray-300">Time Range</span>
                              <span className="text-white font-medium">
                                {coinsData?.data ? new Date(coinsData.data[0]?.time * 1000).toLocaleString() : 'N/A'} - {coinsData?.data ? new Date(coinsData.data[coinsData.data.length - 1]?.time * 1000).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                              <span className="text-gray-300">Price Range</span>
                              <span className="text-white font-medium">
                                {coinsData?.data ? formatPrice(Math.min(...coinsData.data.map(d => d.close || 0))) : '$0.00000000'} - {coinsData?.data ? formatPrice(Math.max(...coinsData.data.map(d => d.close || 0))) : '$0.00000000'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                              <span className="text-gray-300">Avg Volume</span>
                              <span className="text-white font-medium">
                                {formatNumber(coinsData?.data ? coinsData.data.reduce((sum, d) => sum + (d.volume_24h || 0), 0) / coinsData.data.length : 0)}
                              </span>
                            </div>
                                                         <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                               <span className="text-gray-300">Avg Sentiment</span>
                               <span className="text-white font-medium">
                                 {coinsData?.data ? (coinsData.data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / coinsData.data.length).toFixed(1) : '0.0'}
                               </span>
                             </div>
                          </div>
                        </div>

                        {/* Topic Data Statistics */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Topic Endpoint</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                              <span className="text-gray-300">Time Range</span>
                              <span className="text-white font-medium">
                                {topicData?.data ? new Date(topicData.data[0]?.time * 1000).toLocaleString() : 'N/A'} - {topicData?.data ? new Date(topicData.data[topicData.data.length - 1]?.time * 1000).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                              <span className="text-gray-300">Avg Sentiment</span>
                              <span className="text-white font-medium">
                                {topicData?.data ? (topicData.data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / topicData.data.length).toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                              <span className="text-gray-300">Total Interactions</span>
                              <span className="text-white font-medium">
                                {formatNumber(topicData?.data ? topicData.data.reduce((sum, d) => sum + (d.interactions || 0), 0) : 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                              <span className="text-gray-300">Avg Galaxy Score</span>
                              <span className="text-white font-medium">
                                {topicData?.data ? (topicData.data.reduce((sum, d) => sum + (d.galaxy_score || 0), 0) / topicData.data.length).toFixed(1) : '0.0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                                         </CardContent>
                   </Card>

                   {/* Spacing between Data Statistics and Unified Data Table */}
                   <div className="mb-8"></div>

                   {/* Unified Data Table */}
                   <Card className="group/table bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl flex items-center gap-3 transition-all duration-500 group-hover/table:text-[#ff6b35]">
                        <Table className="w-8 h-8 text-[#ff6b35] transition-all duration-500 group-hover/table:scale-110 group-hover/table:rotate-2 group-hover/table:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                        Unified Data Table
                      </CardTitle>
                                             <CardDescription className="text-gray-400 transition-all duration-500 group-hover/table:text-gray-200">
                         Key metrics showing price, volume, sentiment, social engagement and social dominance over time
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-600">
                          <thead>
                            <tr className="bg-gray-800">
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Time</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Price</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Volume</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Market Cap</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Sentiment</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Alt Rank</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Interactions</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Galaxy Score</th>
                              <th className="border border-gray-600 p-3 text-left text-white font-semibold">Social Dominance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coinsData?.data?.map((point, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                                <td className="border border-gray-600 p-2 text-gray-300">
                                  {new Date(point.time * 1000).toLocaleString()}
                                </td>
                                <td className="border border-gray-600 p-2 text-green-400">{formatPrice(point.close)}</td>
                                <td className="border border-gray-600 p-2 text-yellow-400">{formatNumber(point.volume_24h)}</td>
                                <td className="border border-gray-600 p-2 text-blue-400">{formatNumber(point.market_cap)}</td>
                                                                 <td className="border border-gray-600 p-2 text-purple-400">{point.sentiment?.toFixed(1) || 'N/A'}</td>
                                <td className="border border-gray-600 p-2 text-red-400">#{point.alt_rank || 'N/A'}</td>
                                <td className="border border-gray-600 p-2 text-cyan-400">{formatNumber(point.interactions || 0)}</td>
                                <td className="border border-gray-600 p-2 text-orange-400">{formatNumber(point.galaxy_score || 0)}</td>
                                <td className="border border-gray-600 p-2 text-indigo-400">{point.social_dominance ? `${point.social_dominance.toFixed(2)}%` : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                                                                                   </CardContent>
                    </Card>

                    {/* Spacing between Unified Data Table and Understanding Your Metrics */}
                    <div className="mb-8"></div>

                    {/* Understanding Your Metrics Section */}
                    <Card className="group/explanation bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                     <CardHeader>
                       <CardTitle className="text-white text-lg flex items-center gap-3 transition-all duration-500 group-hover/explanation:text-[#ff6b35]">
                         <Info className="w-5 h-5 text-[#ff6b35] transition-all duration-500 group-hover/explanation:scale-110 group-hover/explanation:rotate-2 group-hover/explanation:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                         Understanding Your Metrics
                       </CardTitle>
                       <CardDescription className="text-gray-300 transition-all duration-500 group-hover/explanation:text-gray-200">
                         Learn what each metric means and how to interpret the data for better decision making
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                           <h4 className="text-md font-semibold text-white">Market Metrics</h4>
                           <div className="space-y-2 text-sm text-gray-300">
                             <p><strong>Current Price:</strong> Real-time trading price of BONK token</p>
                             <p><strong>24H Volume:</strong> Total trading volume in the last 24 hours</p>
                             <p><strong>Market Cap:</strong> Total market value of all BONK tokens</p>
                             <p><strong>Alt Rank:</strong> BONK's ranking among all altcoins by market performance</p>
                           </div>
                         </div>
                         <div className="space-y-4">
                           <h4 className="text-md font-semibold text-white">Social & Sentiment Metrics</h4>
                           <div className="space-y-2 text-sm text-gray-300">
                             <p><strong>Social Dominance:</strong> Percentage of crypto discussions mentioning BONK</p>
                             <p><strong>Social Sentiment:</strong> Community sentiment score from 0-100</p>
                             <p><strong>Interactions:</strong> Total social media interactions and engagement</p>
                             <p><strong>Galaxy Score:</strong> Overall health score combining market and social metrics</p>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </CardContent>
               </Card>
           </TabsContent>

          {/* Price Charts Tab */}
          <TabsContent value="price-charts" className="space-y-6">
            <Card className="group/price-charts bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white text-2xl transition-all duration-500 group-hover/price-charts:text-orange-400">💰 BONK Price Analysis</CardTitle>
                <CardDescription className="text-gray-400 transition-all duration-500 group-hover/price-charts:text-gray-200">
                  Detailed price movement and volume analysis over {timeRange === "1h" ? "the last hour" : timeRange === "24h" ? "the last 24 hours" : timeRange === "7d" ? "the last week" : "the last month"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">

                  {/* Price Trend Chart */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-[#ff6b35]" />
                      Price Trend ({timeRange === "1h" ? "1h" : timeRange === "24h" ? "24h" : timeRange === "7d" ? "7d" : "30d"})
                    </h3>
                    <div className="h-80 bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coinsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                          <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => `$${value.toFixed(8)}`} />
                                                     <RechartsTooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151', 
                               borderRadius: '8px',
                               color: '#F9FAFB'
                             }} 
                             labelStyle={{ color: '#F9FAFB' }}
                             formatter={(value: any) => [`$${value.toFixed(8)}`, 'Price']}
                           />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} 
                            name="BONK Price" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Volume Analysis */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-[#ff6b35]" />
                      Trading Volume Analysis
                    </h3>
                    <div className="h-64 bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={coinsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                          <YAxis stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => formatNumber(value)} />
                                                     <RechartsTooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151', 
                               borderRadius: '8px',
                               color: '#F9FAFB'
                             }} 
                             labelStyle={{ color: '#F9FAFB' }}
                             formatter={(value: any) => [formatNumber(value), 'Volume']}
                           />
                          <Bar dataKey="volume" fill="#F59E0B" name="Trading Volume" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Analytics Tab */}
          <TabsContent value="social-analytics" className="space-y-6">
            <Card className="group/social-analytics bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white text-2xl transition-all duration-500 group-hover/social-analytics:text-orange-400">🐕 BONK Social Buzz</CardTitle>
                <CardDescription className="text-gray-400 transition-all duration-500 group-hover/social-analytics:text-gray-200">
                  Social sentiment, engagement, and community activity metrics from both market and social data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">

                  {/* Social Sentiment Trend */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-[#ff6b35]" />
                      Social Sentiment Trend (Market Data)
                    </h3>
                    <div className="h-80 bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={coinsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                          <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151', 
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                            labelStyle={{ color: '#F9FAFB' }}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="sentiment" 
                            stroke="#3B82F6" 
                            fill="#3B82F6" 
                            fillOpacity={0.3} 
                            name="Social Sentiment" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Social Activity from Market Data */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-[#ff6b35]" />
                      Social Activity Metrics (Market Data)
                    </h3>
                    <div className="h-64 bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coinsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                          <YAxis stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151', 
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                            labelStyle={{ color: '#F9FAFB' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="interactions" stroke="#EF4444" strokeWidth={2} name="Social Interactions" />
                          <Line type="monotone" dataKey="posts" stroke="#8B5CF6" strokeWidth={2} name="Active Posts" />
                          <Line type="monotone" dataKey="contributors" stroke="#10B981" strokeWidth={2} name="Active Contributors" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Topic-Specific Social Metrics */}
                  {topicData?.data && topicData.data.length > 0 && (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <Users className="w-6 h-6 text-[#ff6b35]" />
                          Community Engagement (Topic Data)
                        </h3>
                        <div className="h-64 bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={topicChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151', 
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }} 
                                labelStyle={{ color: '#F9FAFB' }}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="socialVolume" stroke="#F59E0B" strokeWidth={2} name="Social Volume" />
                              <Line type="monotone" dataKey="socialScore" stroke="#06B6D4" strokeWidth={2} name="Social Score" />
                              <Line type="monotone" dataKey="socialEngagement" stroke="#8B5CF6" strokeWidth={2} name="Social Engagement" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <BarChart3 className="w-6 h-6 text-[#ff6b35]" />
                          Social Metrics Comparison
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-4">Topic Data Summary</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Data Points:</span>
                                <span className="text-white font-medium">{topicData.data.length}</span>
                              </div>
                                                             <div className="flex justify-between">
                                 <span className="text-gray-400">Avg Sentiment:</span>
                                 <span className="text-white font-medium">
                                   {topicData.data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / topicData.data.length}
                                 </span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-400">Total Interactions:</span>
                                 <span className="text-white font-medium">
                                   {formatNumber(topicData.data.reduce((sum, d) => sum + (d.interactions || 0), 0))}
                                 </span>
                               </div>
                            </div>
                          </div>

                          <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-4">Data Source Info</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Market Data:</span>
                                <span className="text-white font-medium">{coinsData?.data?.length || 0} points</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Topic Data:</span>
                                <span className="text-white font-medium">{topicData.data.length} points</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Time Range:</span>
                                <span className="text-white font-medium">{timeRange}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Fallback if no topic data */}
                  {(!topicData?.data || topicData.data.length === 0) && (
                    <Card className="bg-yellow-900/20 border-yellow-600/50">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                          </div>
                          <h4 className="text-yellow-400 text-lg font-semibold mb-2">Topic Data Unavailable</h4>
                          <p className="text-yellow-300 text-sm">
                            Social topic data is not currently available for this time range. 
                            The charts above show market-based social metrics from the coins endpoint.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Health Tab */}
          <TabsContent value="market-health" className="space-y-6">
            <Card className="group/market-health bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white text-2xl transition-all duration-500 group-hover/market-health:text-orange-400">📊 BONK Market Health</CardTitle>
                <CardDescription className="text-gray-400 transition-all duration-500 group-hover/market-health:text-gray-200">
                  Market ranking, health indicators, and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">

                  {/* Market Health Overview */}
                  <div>
                                          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-[#ff6b35]" />
                        Market Health Indicators
                      </h3>
                    <div className="h-80 bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coinsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                          <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151', 
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                            labelStyle={{ color: '#F9FAFB' }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="galaxyScore" 
                            stroke="#06B6D4" 
                            strokeWidth={2} 
                            dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }} 
                            name="Galaxy Score" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="altRank" 
                            stroke="#F97316" 
                            strokeWidth={2} 
                            dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }} 
                            name="Alt Rank" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-4">Market Position</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Alt Rank:</span>
                          <span className="text-white font-medium">#{coinsData?.data?.[coinsData.data.length - 1]?.alt_rank || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Galaxy Score:</span>
                          <span className="text-white font-medium">{coinsData?.data?.[coinsData.data.length - 1]?.galaxy_score || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Market Cap:</span>
                          <span className="text-white font-medium">{formatNumber(coinsData?.data?.[coinsData.data.length - 1]?.market_cap)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price Change:</span>
                          <span className={`font-medium ${performanceChange.priceChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'}`}>
                            {performanceChange.priceChange >= 0 ? '+' : ''}{performanceChange.priceChange.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume Change:</span>
                          <span className={`font-medium ${performanceChange.volumeChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'}`}>
                            {performanceChange.volumeChange >= 0 ? '+' : ''}{performanceChange.volumeChange.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sentiment Change:</span>
                          <span className={`font-medium ${performanceChange.sentimentChange >= 0 ? 'text-[#ff6b35]' : 'text-red-400'}`}>
                            {performanceChange.sentimentChange >= 0 ? '+' : ''}{performanceChange.sentimentChange.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                     {/* Community Insights Tab */}
           <TabsContent value="community" className="space-y-6">
             <Card className="group/community bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
               <CardHeader>
                 <CardTitle className="text-white text-2xl transition-all duration-500 group-hover/community:text-orange-400">🏘️ BONK Community Insights</CardTitle>
                 <CardDescription className="text-gray-400 transition-all duration-500 group-hover/community:text-gray-200">
                   Dive deeper into community engagement, sentiment, and social metrics from the topic endpoint.
                 </CardDescription>
               </CardHeader>
              <CardContent>
                {topicData?.data && topicData.data.length > 0 ? (
                  <div className="space-y-8">
                                          {/* Metric Selection Controls */}
                                             <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                         <h4 className="text-lg font-semibold text-white mb-3 transition-all duration-500 hover:text-[#ff6b35]">Select Metrics to Display:</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                           <label className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={selectedMetrics.price}
                               onChange={(e) => setSelectedMetrics(prev => ({ ...prev, price: e.target.checked }))}
                               className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 hover:scale-110 transition-all duration-300"
                             />
                             <span className="text-sm text-gray-300 hover:text-gray-200 transition-all duration-300">Price</span>
                           </label>
                                                     <label className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={selectedMetrics.volume}
                               onChange={(e) => setSelectedMetrics(prev => ({ ...prev, volume: e.target.checked }))}
                               className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 hover:scale-110 transition-all duration-300"
                             />
                             <span className="text-sm text-gray-300 hover:text-gray-200 transition-all duration-300">Volume</span>
                           </label>
                           <label className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={selectedMetrics.sentiment}
                               onChange={(e) => setSelectedMetrics(prev => ({ ...prev, sentiment: e.target.checked }))}
                               className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 hover:scale-110 transition-all duration-300"
                             />
                             <span className="text-sm text-gray-300 hover:text-gray-200 transition-all duration-300">Sentiment</span>
                           </label>
                           <label className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={selectedMetrics.interactions}
                               onChange={(e) => setSelectedMetrics(prev => ({ ...prev, interactions: e.target.checked }))}
                               className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 hover:scale-110 transition-all duration-300"
                             />
                             <span className="text-sm text-gray-300 hover:text-gray-200 transition-all duration-300">Interactions</span>
                           </label>
                           <label className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={selectedMetrics.galaxyScore}
                               onChange={(e) => setSelectedMetrics(prev => ({ ...prev, galaxyScore: e.target.checked }))}
                               className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 hover:scale-110 transition-all duration-300"
                             />
                             <span className="text-sm text-gray-300 hover:text-gray-200 transition-all duration-300">Galaxy Score</span>
                           </label>
                           <label className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={selectedMetrics.altRank}
                               onChange={(e) => setSelectedMetrics(prev => ({ ...prev, altRank: e.target.checked }))}
                               className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 hover:scale-110 transition-all duration-300"
                             />
                             <span className="text-sm text-gray-300 hover:text-gray-200 transition-all duration-300">Alt Rank</span>
                           </label>
                        </div>
                      </div>

                    {/* Social Sentiment Trend (Topic Data) */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-[#ff6b35]" />
                        Social Sentiment Trend (Topic Data)
                      </h3>
                      <div className="h-80 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:border-orange-500/30 transition-all duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={topicChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151', 
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }} 
                              labelStyle={{ color: '#F9FAFB' }}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="socialScore" 
                              stroke="#3B82F6" 
                              fill="#3B82F6" 
                              fillOpacity={0.3} 
                              name="Social Score" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Social Activity Metrics (Topic Data) */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-[#ff6b35]" />
                        Social Activity Metrics (Topic Data)
                      </h3>
                      <div className="h-64 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:border-orange-500/30 transition-all duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={topicChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <YAxis stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151', 
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }} 
                              labelStyle={{ color: '#F9FAFB' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="socialVolume" stroke="#F59E0B" strokeWidth={2} name="Social Volume" />
                            <Line type="monotone" dataKey="socialScore" stroke="#06B6D4" strokeWidth={2} name="Social Score" />
                            <Line type="monotone" dataKey="socialEngagement" stroke="#8B5CF6" strokeWidth={2} name="Social Engagement" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Community Engagement Overview */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#ff6b35]" />
                        Community Engagement Overview
                      </h3>
                      <div className="h-64 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:border-orange-500/30 transition-all duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topicChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <YAxis stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151', 
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }} 
                              labelStyle={{ color: '#F9FAFB' }}
                            />
                            <Legend />
                            <Bar dataKey="socialVolume" fill="#F59E0B" name="Social Volume" />
                            <Bar dataKey="socialScore" fill="#06B6D4" name="Social Score" />
                            <Bar dataKey="socialEngagement" fill="#8B5CF6" name="Social Engagement" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Data Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:border-orange-500/30 transition-all duration-500">
                        <h4 className="text-lg font-semibold text-white mb-4 transition-all duration-500 hover:text-[#ff6b35]">Topic Data Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data Points:</span>
                            <span className="text-white font-medium">{topicData.data.length}</span>
                          </div>
                                                     <div className="flex justify-between">
                             <span className="text-gray-400">Avg Sentiment:</span>
                             <span className="text-white font-medium">
                               {(topicData.data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / topicData.data.length).toFixed(2)}
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">Total Interactions:</span>
                             <span className="text-white font-medium">
                               {formatNumber(topicData.data.reduce((sum, d) => sum + (d.interactions || 0), 0))}
                             </span>
                           </div>
                        </div>
                      </div>

                      <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:border-orange-500/30 transition-all duration-500">
                        <h4 className="text-lg font-semibold text-white mb-4 transition-all duration-500 hover:text-[#ff6b35]">Data Source Info</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Market Data:</span>
                            <span className="text-white font-medium">{coinsData?.data?.length || 0} points</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Topic Data:</span>
                            <span className="text-white font-medium">{topicData.data.length} points</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time Range:</span>
                            <span className="text-white font-medium">{timeRange}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-yellow-400 mb-3">No Topic Data Available</h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      Social topic data is not currently available for the selected time range ({timeRange}). 
                      This could be due to API limitations or data availability.
                    </p>
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm">Use the time range selector at the top of the page to change data periods.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Correlation Analysis Tab */}
          <TabsContent value="correlation-analysis" className="space-y-6">
            <Card className="group/correlation bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3 transition-all duration-500 group-hover/correlation:text-[#ff6b35]">
                  <BarChart3 className="w-8 h-8 text-[#ff6b35] transition-all duration-500 group-hover/correlation:scale-110 group-hover/correlation:rotate-2 group-hover/correlation:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                  Correlation Analysis
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg transition-all duration-500 group-hover/correlation:text-gray-200">
                  See how different metrics relate to each other over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-gray-300 text-sm">
                    Correlation values range from -1 (perfect negative) to +1 (perfect positive)
                  </p>

                  {/* Correlation Matrix */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-600">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="border border-gray-600 p-3 text-left text-white font-semibold"></th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Price</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Sentiment</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Interactions</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Contributors</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Posts</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Galaxy</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Volume</th>
                          <th className="border border-gray-600 p-3 text-center text-white font-semibold">Alt Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Price', key: 'price' },
                          { name: 'Sentiment', key: 'sentiment' },
                          { name: 'Interactions', key: 'interactions' },
                          { name: 'Active Contributors', key: 'contributors' },
                          { name: 'Active Posts', key: 'posts' },
                          { name: 'Galaxy Score', key: 'galaxyScore' },
                          { name: 'Social Dominance', key: 'socialDominance' },
                          { name: 'Alt Rank', key: 'altRank' }
                        ].map((metric, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                            <td className="border border-gray-600 p-3 text-left text-white font-semibold">{metric.name}</td>
                            {[
                              { key: 'price', label: 'Price' },
                              { key: 'sentiment', label: 'Sentiment' },
                              { key: 'interactions', label: 'Interactions' },
                              { key: 'contributors', label: 'Contributors' },
                              { key: 'posts', label: 'Posts' },
                              { key: 'galaxyScore', label: 'Galaxy' },
                              { key: 'socialDominance', label: 'Volume' },
                              { key: 'altRank', label: 'Alt Rank' }
                            ].map((colMetric, colIndex) => {
                              const correlation = rowIndex === colIndex ? 1.00 : 
                                calculateMetricCorrelation(metric.key, colMetric.key, coinsData?.data, topicData?.data)
                              const isPositive = correlation > 0
                              
                              return (
                                <td key={colIndex} className="border border-gray-600 p-3 text-center">
                                  <span className={`font-mono text-sm font-medium ${
                                    isPositive ? 'text-[#ff6b35]' : 'text-red-400'
                                  }`}>
                                    {correlation.toFixed(2)}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>




                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>


      </div>
    </AuthGuard>
  )
}
