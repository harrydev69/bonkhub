"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area } from "recharts"
import { Download, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// LunarCrush Topic Data Interface
interface TopicData {
  data: {
    types_sentiment: {
      tweet: number
      "reddit-post": number
      "youtube-video": number
      "tiktok-video": number
    }
    types_sentiment_detail: {
      tweet: {
        positive: number
        neutral: number
        negative: number
      }
      "reddit-post": {
        positive: number
        neutral: number
        negative: number
      }
      "youtube-video": {
        positive: number
        neutral: number
        negative: number
      }
      "tiktok-video": {
        positive: number
        neutral: number
        negative: number
      }
    }
    interactions_24h: number
    num_contributors: number
    num_posts: number
    trend: string
  }
}

export function SentimentTrendAnalysis() {
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
      setError(err instanceof Error ? err.message : "Failed to fetch sentiment data")
    } finally {
      setLoading(false)
    }
  }

  // Transform LunarCrush data to component format
  const sentimentMetrics = topicData ? [
    {
      title: "Twitter Sentiment",
      value: topicData.data.types_sentiment.tweet,
      change: 0, // No change data available
      color: "text-blue-400",
      platform: "Twitter",
      interactions: topicData.data.types_sentiment_detail.tweet.positive + 
                   topicData.data.types_sentiment_detail.tweet.neutral + 
                   topicData.data.types_sentiment_detail.tweet.negative
    },
    {
      title: "Reddit Sentiment",
      value: topicData.data.types_sentiment["reddit-post"],
      change: 0,
      color: "text-orange-400",
      platform: "Reddit",
      interactions: topicData.data.types_sentiment_detail["reddit-post"].positive + 
                   topicData.data.types_sentiment_detail["reddit-post"].neutral + 
                   topicData.data.types_sentiment_detail["reddit-post"].negative
    },
    {
      title: "YouTube Sentiment",
      value: topicData.data.types_sentiment["youtube-video"],
      change: 0,
      color: "text-red-400",
      platform: "YouTube",
      interactions: topicData.data.types_sentiment_detail["youtube-video"].positive + 
                   topicData.data.types_sentiment_detail["youtube-video"].neutral + 
                   topicData.data.types_sentiment_detail["youtube-video"].negative
    },
    {
      title: "TikTok Sentiment",
      value: topicData.data.types_sentiment["tiktok-video"],
      change: 0,
      color: "text-purple-400",
      platform: "TikTok",
      interactions: topicData.data.types_sentiment_detail["tiktok-video"].positive + 
                   topicData.data.types_sentiment_detail["tiktok-video"].neutral + 
                   topicData.data.types_sentiment_detail["tiktok-video"].negative
    }
  ] : []

  // Generate chart data from sentiment scores
  const chartData = topicData ? [
    { platform: "Twitter", score: topicData.data.types_sentiment.tweet, color: "#60A5FA" },
    { platform: "Reddit", score: topicData.data.types_sentiment["reddit-post"], color: "#FB923C" },
    { platform: "YouTube", score: topicData.data.types_sentiment["youtube-video"], color: "#F87171" },
    { platform: "TikTok", score: topicData.data.types_sentiment["tiktok-video"], color: "#A78BFA" }
  ] : []

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-gray-700" />
          <Skeleton className="h-4 w-96 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-32 bg-gray-700" />
            <Skeleton className="h-32 bg-gray-700" />
            <Skeleton className="h-32 bg-gray-700" />
            <Skeleton className="h-32 bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-red-400">Sentiment Data Error</CardTitle>
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
          <p className="text-gray-400">No sentiment data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-orange-500">📈</span>
            Sentiment Trend Analysis
          </CardTitle>
          <p className="text-gray-400 text-sm">Real-time sentiment tracking across multiple platforms</p>
        </div>
      </CardHeader>
      
      {/* Unified Key Insights Section */}
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l-4 border-blue-500 rounded-xl p-6 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              <h4 className="text-lg font-bold text-white">
                🔑 KEY INSIGHT: What's Happening with BONK Right Now
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5">
              {/* Sentiment Overview - Highlighted */}
              <div className="space-y-3">
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">BONK shows </span>
                  <span className="text-2xl font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                    {topicData ? Math.round((topicData.data.types_sentiment_detail.tweet.positive / (topicData.data.types_sentiment_detail.tweet.positive + topicData.data.types_sentiment_detail.tweet.neutral + topicData.data.types_sentiment_detail.tweet.negative)) * 100) : 0}%
                  </span>
                  <span className="text-gray-400"> positive sentiment</span>
                </div>
                
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Engagement trend is </span>
                  <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                    topicData?.data.trend === "down" 
                      ? "text-red-400 bg-red-400/10" 
                      : topicData?.data.trend === "up" 
                      ? "text-green-400 bg-green-400/10" 
                      : "text-blue-400 bg-blue-400/10"
                  }`}>
                    "{topicData?.data.trend || 'stable'}"
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-600">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{topicData?.data.interactions_24h.toLocaleString() || '0'}</div>
                <div className="text-xs text-gray-400">Total Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{topicData?.data.num_contributors.toLocaleString() || '0'}</div>
                <div className="text-xs text-gray-400">Contributors</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{topicData?.data.num_posts.toLocaleString() || '0'}</div>
                <div className="text-xs text-gray-400">Total Posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="space-y-6">
        {/* Sentiment Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sentimentMetrics.map((metric) => (
            <div key={metric.title} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {metric.title === 'Twitter Sentiment' && (
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )}
                {metric.title === 'Reddit Sentiment' && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                )}
                {metric.title === 'YouTube Sentiment' && (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                )}
                {metric.title === 'TikTok Sentiment' && (
                  <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.7-1.35 3.83-.97 1.26-2.53 2.05-4.13 2.08-1.4.02-2.75-.34-3.9-1.03-2.21-1.33-3.52-4.25-2.85-6.97.42-1.68 1.66-3.11 3.2-3.86 1.38-.67 2.93-.88 4.46-.54-.02-1.46-.04-2.92-.04-4.38-.99-.32-2.01-.5-3.02-.69C15.78.02 17.15.01 18.525.02z"/>
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-300">{metric.title.replace(' Sentiment', '')}</span>
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</div>
              <div className="text-xs text-gray-500">
                {topicData ? (
                  `${metric.interactions.toLocaleString()} interactions`
                ) : (
                  `${metric.interactions.toLocaleString()} interactions`
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Platform Sentiment Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Platform Sentiment Comparison</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="sentimentArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 109, 41, 0.6)" />
                    <stop offset="100%" stopColor="rgba(255, 109, 41, 0.05)" />
                  </linearGradient>
                </defs>
                
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis 
                  dataKey="platform" 
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={12} 
                  domain={[0, 100]}
                  width={70}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value}%`, "Sentiment Score"]}
                  labelFormatter={(label) => `${label} Platform`}
                />
                
                {/* Main Line */}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ff6d29"
                  strokeWidth={3}
                  dot={{ fill: "#ff6d29", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: "#ff6d29", strokeWidth: 2 }}
                />
                
                {/* Area Fill */}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="transparent"
                  fill="url(#sentimentArea)"
                  fillOpacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Computation Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Sentiment Computation Analysis</h3>
          
          {/* Key Concepts Explanation */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-blue-400 mb-2">📚 Understanding the Data</h4>
            <div className="text-xs text-blue-200 space-y-2">
              <p><strong>Sentiment Breakdown:</strong> Shows how people feel when they post about BONK (positive/neutral/negative distribution)</p>
              <p><strong>Trend Indicator:</strong> Shows engagement activity level (up/down/stable) - how many people are talking about BONK</p>
              <p><strong>Key Insight:</strong> You can have positive sentiment but declining engagement, or vice versa!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Twitter Sentiment Breakdown */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                Twitter Sentiment Distribution
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Posts Analyzed:</span>
                  <span className="text-sm font-medium text-white">
                    {(topicData.data.types_sentiment_detail.tweet.positive + 
                      topicData.data.types_sentiment_detail.tweet.neutral + 
                      topicData.data.types_sentiment_detail.tweet.negative).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Positive Posts:</span>
                  <span className="text-sm font-medium text-green-400">
                    {topicData.data.types_sentiment_detail.tweet.positive.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Neutral Posts:</span>
                  <span className="text-sm font-medium text-gray-400">
                    {topicData.data.types_sentiment_detail.tweet.neutral.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Negative Posts:</span>
                  <span className="text-sm font-medium text-red-400">
                    {topicData.data.types_sentiment_detail.tweet.negative.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-400">AI Score:</span>
                    <span className="text-lg font-bold text-blue-400">
                      {topicData.data.types_sentiment.tweet}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Advanced AI algorithm score
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution Visualization */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                Daily Sentiment Distribution
              </h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {Math.round(
                      (topicData.data.types_sentiment_detail.tweet.positive / 
                       (topicData.data.types_sentiment_detail.tweet.positive + 
                        topicData.data.types_sentiment_detail.tweet.neutral + 
                        topicData.data.types_sentiment_detail.tweet.negative)) * 100
                    )}%
                  </div>
                  <div className="text-sm text-gray-400">Positive Posts</div>
                  <div className="text-xs text-green-400">
                    {topicData.data.types_sentiment_detail.tweet.positive.toLocaleString()} posts
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Positive</span>
                    <span className="text-green-400 font-medium">
                      {Math.round(
                        (topicData.data.types_sentiment_detail.tweet.positive / 
                         (topicData.data.types_sentiment_detail.tweet.positive + 
                          topicData.data.types_sentiment_detail.tweet.neutral + 
                          topicData.data.types_sentiment_detail.tweet.negative)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.round(
                          (topicData.data.types_sentiment_detail.tweet.positive / 
                           (topicData.data.types_sentiment_detail.tweet.positive + 
                            topicData.data.types_sentiment_detail.tweet.neutral + 
                            topicData.data.types_sentiment_detail.tweet.negative)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Neutral</span>
                    <span className="text-gray-400 font-medium">
                      {Math.round(
                        (topicData.data.types_sentiment_detail.tweet.neutral / 
                         (topicData.data.types_sentiment_detail.tweet.positive + 
                          topicData.data.types_sentiment_detail.tweet.neutral + 
                          topicData.data.types_sentiment_detail.tweet.negative)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.round(
                          (topicData.data.types_sentiment_detail.tweet.neutral / 
                           (topicData.data.types_sentiment_detail.tweet.positive + 
                            topicData.data.types_sentiment_detail.tweet.neutral + 
                            topicData.data.types_sentiment_detail.tweet.negative)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Negative</span>
                    <span className="text-red-400 font-medium">
                      {Math.round(
                        (topicData.data.types_sentiment_detail.tweet.negative / 
                         (topicData.data.types_sentiment_detail.tweet.positive + 
                          topicData.data.types_sentiment_detail.tweet.neutral + 
                          topicData.data.types_sentiment_detail.tweet.negative)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.round(
                          (topicData.data.types_sentiment_detail.tweet.negative / 
                           (topicData.data.types_sentiment_detail.tweet.positive + 
                            topicData.data.types_sentiment_detail.tweet.neutral + 
                            topicData.data.types_sentiment_detail.tweet.negative)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement vs Sentiment Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Engagement vs Sentiment Analysis</h3>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Sentiment Quality */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(
                    (topicData.data.types_sentiment_detail.tweet.positive / 
                     (topicData.data.types_sentiment_detail.tweet.positive + 
                      topicData.data.types_sentiment_detail.tweet.neutral + 
                      topicData.data.types_sentiment_detail.tweet.negative)) * 100
                  )}%
                </div>
                <div className="text-sm text-gray-400">Sentiment Quality</div>
                <div className="text-xs text-green-400">
                  Positive posts today
                </div>
              </div>
              
              {/* Engagement Level */}
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {topicData.data.trend === "up" ? "↗️" : topicData.data.trend === "down" ? "↘️" : "→"}
                </div>
                <div className="text-sm text-gray-400">Engagement Trend</div>
                <div className="text-xs text-orange-400">
                  {topicData.data.trend === "up" ? "More people talking" : topicData.data.trend === "down" ? "Fewer people talking" : "Stable activity"}
                </div>
              </div>
              
              {/* Activity Volume */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {topicData.data.interactions_24h.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">24h Activity</div>
                <div className="text-xs text-blue-400">
                  Total interactions
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">{topicData.data.interactions_24h.toLocaleString()}</div>
                <div className="text-sm text-gray-400">24h Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{topicData.data.num_contributors.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Contributors</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{topicData.data.num_posts.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Posts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Disclaimer */}
        <div className="bg-gray-800/30 rounded-lg p-4 border-l-4 border-orange-500/50">
          <div className="flex items-start gap-3">
            <div className="text-orange-400 text-lg">⚠️</div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-orange-400">Data Accuracy Disclaimer</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sentiment data provided is derived from advanced AI algorithms and third-party social media sources. 
                While we strive for accuracy, this information may include inaccuracies or errors. 
                <span className="text-orange-300 font-medium"> Use for informational purposes only.</span> 
                These metrics represent the most accurate analysis available based on real-time social media data processing and AI-powered sentiment analysis.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
