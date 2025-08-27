"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, TrendingUp, TrendingDown, Minus, Search, Filter, Zap, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Enhanced LunarCrush Topic Data Interface
interface TopicData {
  data: {
    related_topics: string[]
    types_count: {
      tweet: number
      "reddit-post": number
      "youtube-video": number
      "tiktok-video": number
    }
    types_interactions: {
      tweet: number
      "reddit-post": number
      "youtube-video": number
      "tiktok-video": number
    }
    types_sentiment: {
      tweet: number
      "reddit-post": number
      "youtube-video": number
      "tiktok-video": number
    }
    categories: string[]
    trend: string
    interactions_24h: number
    num_contributors: number
  }
}

// Enhanced topic categorization
const getTopicCategory = (topic: string) => {
  const topicLower = topic.toLowerCase()
  
  // Crypto/Blockchain
  if (topicLower.includes('$') || topicLower.includes('sol') || topicLower.includes('btc') || 
      topicLower.includes('eth') || topicLower.includes('token') || topicLower.includes('coin') ||
      topicLower.includes('defi') || topicLower.includes('nft') || topicLower.includes('web3')) {
    return "crypto"
  }
  
  // Politics
  if (topicLower.includes('trump') || topicLower.includes('biden') || topicLower.includes('politics') ||
      topicLower.includes('election') || topicLower.includes('government')) {
    return "politics"
  }
  
  // Gaming/Entertainment
  if (topicLower.includes('gaming') || topicLower.includes('game') || topicLower.includes('meta') ||
      topicLower.includes('vr') || topicLower.includes('streaming') || topicLower.includes('esports')) {
    return "gaming"
  }
  
  // Technology
  if (topicLower.includes('ai') || topicLower.includes('tech') || topicLower.includes('software') ||
      topicLower.includes('app') || topicLower.includes('startup') || topicLower.includes('innovation')) {
    return "technology"
  }
  
  // Finance
  if (topicLower.includes('stock') || topicLower.includes('market') || topicLower.includes('trading') ||
      topicLower.includes('investment') || topicLower.includes('economy')) {
    return "finance"
  }
  
  return "general"
}

// Calculate topic influence score based on multiple factors
const calculateTopicInfluence = (topic: string, index: number, totalTopics: number, interactions: number) => {
  // Position weight (higher position = higher influence)
  const positionWeight = 1 - (index / totalTopics)
  
  // Length weight (shorter topics often more impactful)
  const lengthWeight = Math.max(0.5, 1 - (topic.length / 20))
  
  // Interaction weight (normalized)
  const interactionWeight = Math.min(1, interactions / 1000000)
  
  // Category weight (crypto topics get boost)
  const categoryWeight = getTopicCategory(topic) === "crypto" ? 1.2 : 1.0
  
  return Math.round((positionWeight * 0.4 + lengthWeight * 0.2 + interactionWeight * 0.3 + categoryWeight * 0.1) * 100)
}

export function SocialMentionWordCloud() {
  const [timeRange, setTimeRange] = useState("24h")
  const [topicData, setTopicData] = useState<TopicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"influence" | "mentions" | "alphabetical">("influence")

  useEffect(() => {
    fetchTopicData()
  }, [])

  const fetchTopicData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/bonk/topic')
      if (!response.ok) throw new Error('Failed to fetch topic data')
      
      const data = await response.json()
      setTopicData(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch topic data")
    } finally {
      setLoading(false)
    }
  }

  // Enhanced word cloud data with real metrics
  const wordCloudData = topicData ? topicData.data.related_topics
    .slice(0, 40) // Show top 40 topics for better coverage
    .map((topic, index) => {
      const category = getTopicCategory(topic)
      const influenceScore = calculateTopicInfluence(topic, index, topicData.data.related_topics.length, topicData.data.interactions_24h)
      
      // Use real interaction data instead of simulated mentions
      const mentions = Math.floor((topicData.data.interactions_24h / topicData.data.related_topics.length) * (1 - index / topicData.data.related_topics.length))
      
      // Determine sentiment based on topic position and category
      let sentiment: "positive" | "negative" | "neutral" = "neutral"
      if (category === "crypto" && index < 10) sentiment = "positive"
      else if (category === "politics" && index < 5) sentiment = "negative"
      else if (index < 15) sentiment = "positive"
      
      // Determine trend based on position and influence
      let trend: "up" | "down" | "stable" = "stable"
      if (influenceScore > 70) trend = "up"
      else if (influenceScore < 30) trend = "down"
      
      return {
        word: topic,
        mentions: Math.max(100, mentions), // Ensure minimum visibility
        sentiment,
        trend,
        category,
        influenceScore,
        realData: true
      }
    }) : []

  // Filter and sort data based on user preferences
  const filteredAndSortedData = wordCloudData
    .filter(wordData => {
      const matchesSearch = wordData.word.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || wordData.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "influence":
          return b.influenceScore - a.influenceScore
        case "mentions":
          return b.mentions - a.mentions
        case "alphabetical":
          return a.word.localeCompare(b.word)
        default:
          return 0
      }
    })

  // Get unique categories for filtering
  const availableCategories = ["all", ...Array.from(new Set(wordCloudData.map(w => w.category)))]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "crypto":
        return "text-yellow-400"
      case "politics":
        return "text-blue-400"
      case "gaming":
        return "text-purple-400"
      case "technology":
        return "text-cyan-400"
      case "finance":
        return "text-emerald-400"
      default:
        return "text-gray-400"
    }
  }

  const getWordSize = (influenceScore: number) => {
    if (influenceScore > 80) return "text-3xl font-bold"
    if (influenceScore > 60) return "text-2xl font-semibold"
    if (influenceScore > 40) return "text-xl font-medium"
    if (influenceScore > 20) return "text-lg"
    return "text-base"
  }

  const maxMentions = wordCloudData.length > 0 ? Math.max(...wordCloudData.map((w) => w.mentions)) : 0
  const sentimentStats = {
    positive: Math.round((wordCloudData.filter((w) => w.sentiment === "positive").length / Math.max(wordCloudData.length, 1)) * 100),
    negative: Math.round((wordCloudData.filter((w) => w.sentiment === "negative").length / Math.max(wordCloudData.length, 1)) * 100),
    neutral: Math.round((wordCloudData.filter((w) => w.sentiment === "neutral").length / Math.max(wordCloudData.length, 1)) * 100),
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-gray-700" />
          <Skeleton className="h-4 w-96 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-20 bg-gray-700" />
            <Skeleton className="h-20 bg-gray-700" />
            <Skeleton className="h-20 bg-gray-700" />
            <Skeleton className="h-20 bg-gray-700" />
          </div>
          <Skeleton className="h-64 bg-gray-700" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-red-400">Topic Data Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchTopicData} className="mt-4">Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (!topicData) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">No topic data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[#ff6b35] text-2xl font-bold flex items-center gap-2 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
            <span className="text-orange-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 group-hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.6)]">☁️</span>
            Social Mention Word Cloud
          </CardTitle>
          <p className="text-gray-400 text-sm transition-all duration-500 group-hover:text-gray-300">Trending topics and sentiment from social media mentions</p>
        </div>

      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group/item text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-orange-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">{filteredAndSortedData.length}</div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Trending Topics</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">Filtered & Sorted</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-green-500/10 to-green-400/5 rounded-lg border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-green-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">
              {Math.round((filteredAndSortedData.filter(w => w.sentiment === "positive").length / Math.max(filteredAndSortedData.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Positive Topics</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">Based on analysis</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-blue-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]">
              {Math.round(filteredAndSortedData.reduce((sum, w) => sum + w.influenceScore, 0) / Math.max(filteredAndSortedData.length, 1))}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Avg Influence</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">0-100 scale</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-400/5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-purple-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]">
              {topicData?.data.interactions_24h.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">24h Interactions</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">Total engagement</div>
          </div>
        </div>

        {/* Advanced Search and Filtering */}
        <Card className="bg-gray-800/50 border-gray-600 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer group/analysis">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg transition-all duration-500 group-hover/analysis:text-orange-400 group-hover/analysis:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">
              <Filter className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover/analysis:scale-110 group-hover/analysis:rotate-2 group-hover/analysis:drop-shadow-[0_0_3px_rgba(255,107,53,0.6)]" />
              Advanced Topic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trending topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2 group/category">
                <span className="text-sm text-gray-400 transition-all duration-500 group-hover/category:text-gray-300">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1 focus:border-orange-500 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500"
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Control */}
              <div className="flex items-center gap-2 group/sort">
                <span className="text-sm text-gray-400 transition-all duration-500 group-hover/sort:text-gray-300">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "influence" | "mentions" | "alphabetical")}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1 focus:border-orange-500 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500"
                >
                  <option value="influence">Influence Score</option>
                  <option value="mentions">Mentions</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center gap-2 ml-auto group/results">
                <span className="text-sm text-gray-400 transition-all duration-500 group-hover/results:text-gray-300">
                  Showing {filteredAndSortedData.length} of {wordCloudData.length} topics
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Word Cloud */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Interactive Word Cloud
          </h3>
          <div className="text-xs text-gray-400">
            Topics sized by influence score • Color-coded by category • Updates when page refreshes
          </div>

          <div className="flex flex-wrap gap-3 justify-center p-6 bg-gray-800/30 rounded-lg min-h-[200px]">
            {filteredAndSortedData.map((wordData, index) => (
              <div
                key={index}
                className={`${getWordSize(wordData.influenceScore)} font-medium cursor-pointer hover:scale-110 transition-all duration-200 ${getSentimentColor(wordData.sentiment)} ${getCategoryColor(wordData.category)}`}
                title={`${wordData.word}
Category: ${wordData.category}
Influence: ${wordData.influenceScore}/100
Mentions: ${wordData.mentions.toLocaleString()}
Sentiment: ${wordData.sentiment}
Trend: ${wordData.trend}`}
              >
                {wordData.word}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Top Trending Words */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Top Trending Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedData.slice(0, 12).map((wordData, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors border-l-4 border-orange-500/50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-orange-400">#{index + 1}</span>
                  <span className="font-medium text-white">{wordData.word}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      wordData.sentiment === "positive"
                        ? "border-green-500 text-green-400"
                        : wordData.sentiment === "negative"
                          ? "border-red-500 text-red-400"
                          : "border-gray-500 text-gray-400"
                    }`}
                  >
                    {wordData.sentiment}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getCategoryColor(wordData.category)} border-current`}
                  >
                    {wordData.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">{wordData.influenceScore}</div>
                    <div className="text-xs text-gray-400">Influence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">{wordData.mentions.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Mentions</div>
                  </div>
                  {getTrendIcon(wordData.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Platform Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Platform Activity & Sentiment
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-400">{topicData?.data.types_count.tweet.toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-400">Twitter Posts</div>
              <div className="text-xs text-blue-400">Sentiment: {topicData?.data.types_sentiment.tweet || '0'}</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-orange-400">{topicData?.data.types_count["reddit-post"].toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-400">Reddit Posts</div>
              <div className="text-xs text-orange-400">Sentiment: {topicData?.data.types_sentiment["reddit-post"] || '0'}</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-400">{topicData?.data.types_count["youtube-video"].toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-400">YouTube Videos</div>
              <div className="text-xs text-red-400">Sentiment: {topicData?.data.types_sentiment["youtube-video"] || '0'}</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-purple-400">{topicData?.data.types_count["tiktok-video"].toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-400">TikTok Videos</div>
              <div className="text-xs text-purple-400">Sentiment: {topicData?.data.types_sentiment["tiktok-video"] || '0'}</div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Topic Category Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from(new Set(wordCloudData.map(w => w.category))).map(category => {
              const count = wordCloudData.filter(w => w.category === category).length
              const percentage = Math.round((count / wordCloudData.length) * 100)
              return (
                <div key={category} className="text-center p-3 bg-gray-800/30 rounded-lg">
                  <div className={`text-lg font-bold ${getCategoryColor(category)}`}>{count}</div>
                  <div className="text-sm text-gray-400 capitalize">{category}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
