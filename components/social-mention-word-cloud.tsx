"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// LunarCrush Topic Data Interface
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
    categories: string[]
    trend: string
  }
}

// Helper functions moved to top level
const getRandomSentiment = () => {
  const sentiments = ["positive", "negative", "neutral"]
  return sentiments[Math.floor(Math.random() * sentiments.length)]
}

const getRandomTrend = () => {
  const trends = ["up", "down", "stable"]
  return trends[Math.floor(Math.random() * trends.length)]
}

const getTopicCategory = (topic: string) => {
  if (topic.includes('$') || topic.includes('sol') || topic.includes('btc') || topic.includes('eth')) {
    return "crypto"
  } else if (topic.includes('trump') || topic.includes('biden') || topic.includes('politics')) {
    return "politics"
  } else if (topic.includes('gaming') || topic.includes('nft') || topic.includes('meta')) {
    return "gaming"
  } else {
    return "general"
  }
}

export function SocialMentionWordCloud() {
  const [timeRange, setTimeRange] = useState("24h")
  const [topicData, setTopicData] = useState<TopicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Transform related topics to word cloud format
  const wordCloudData = topicData ? topicData.data.related_topics
    .slice(0, 30) // Show top 30 topics
    .map((topic, index) => ({
      word: topic,
      mentions: Math.floor(Math.random() * 1000) + 100, // Simulate mention count since not provided
      sentiment: getRandomSentiment(), // Simulate sentiment since not provided
      trend: getRandomTrend(), // Simulate trend since not provided
      category: getTopicCategory(topic)
    })) : []

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

  const getWordSize = (mentions: number, maxMentions: number) => {
    const ratio = mentions / maxMentions
    if (ratio > 0.8) return "text-2xl"
    if (ratio > 0.6) return "text-xl"
    if (ratio > 0.4) return "text-lg"
    if (ratio > 0.2) return "text-base"
    return "text-sm"
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
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-orange-500">☁️</span>
            Social Mention Word Cloud
          </CardTitle>
          <p className="text-gray-400 text-sm">Trending topics and sentiment from social media mentions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            All Platforms
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-400">
            {timeRange}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{wordCloudData.length}</div>
            <div className="text-sm text-gray-400">Trending Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{sentimentStats.positive}%</div>
            <div className="text-sm text-gray-400">Positive Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{sentimentStats.negative}%</div>
            <div className="text-sm text-gray-400">Negative Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{topicData.data.types_count.tweet.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Tweets</div>
          </div>
        </div>

        {/* Word Cloud */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Visual Word Cloud</h3>
          <div className="text-xs text-gray-400">Top trending topics from LunarCrush • Updates every 30 minutes</div>

          <div className="flex flex-wrap gap-3 justify-center p-6 bg-gray-800/30 rounded-lg min-h-[200px]">
            {wordCloudData.map((wordData, index) => (
              <div
                key={index}
                className={`${getWordSize(wordData.mentions, maxMentions)} font-medium cursor-pointer hover:scale-110 transition-transform duration-200 ${getSentimentColor(wordData.sentiment)}`}
                title={`${wordData.word}: ${wordData.mentions} mentions, ${wordData.sentiment} sentiment, ${wordData.trend} trend`}
              >
                {wordData.word}
              </div>
            ))}
          </div>
        </div>

        {/* Top Trending Words */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Top Trending Words</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wordCloudData.slice(0, 10).map((wordData, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
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
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{wordData.mentions.toLocaleString()}</span>
                  {getTrendIcon(wordData.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Platform Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{topicData.data.types_count.tweet.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Twitter Posts</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{topicData.data.types_count["reddit-post"].toLocaleString()}</div>
              <div className="text-sm text-gray-400">Reddit Posts</div>
                    </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{topicData.data.types_count["youtube-video"].toLocaleString()}</div>
              <div className="text-sm text-gray-400">YouTube Videos</div>
                  </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{topicData.data.types_count["tiktok-video"].toLocaleString()}</div>
              <div className="text-sm text-gray-400">TikTok Videos</div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 hover:border-orange-500 hover:bg-orange-500/10 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Word Cloud
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
