"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react"

export function SocialMentionWordCloud() {
  const [timeRange, setTimeRange] = useState("24h")

  const wordCloudData = [
    { word: "dump", mentions: 936, sentiment: "negative", trend: "down" },
    { word: "nft", mentions: 936, sentiment: "neutral", trend: "down" },
    { word: "dip", mentions: 932, sentiment: "negative", trend: "stable" },
    { word: "moon", mentions: 911, sentiment: "positive", trend: "down" },
    { word: "pump", mentions: 882, sentiment: "positive", trend: "up" },
    { word: "strong", mentions: 854, sentiment: "positive", trend: "stable" },
    { word: "token", mentions: 835, sentiment: "neutral", trend: "up" },
    { word: "growth", mentions: 824, sentiment: "positive", trend: "up" },
    { word: "blockchain", mentions: 822, sentiment: "neutral", trend: "stable" },
    { word: "meme", mentions: 787, sentiment: "neutral", trend: "up" },
    { word: "bearish", mentions: 756, sentiment: "negative", trend: "down" },
    { word: "hodl", mentions: 743, sentiment: "neutral", trend: "stable" },
    { word: "bullish", mentions: 721, sentiment: "positive", trend: "up" },
    { word: "fear", mentions: 698, sentiment: "negative", trend: "up" },
    { word: "volatile", mentions: 687, sentiment: "neutral", trend: "up" },
    { word: "market", mentions: 654, sentiment: "neutral", trend: "stable" },
    { word: "community", mentions: 632, sentiment: "positive", trend: "stable" },
    { word: "ecosystem", mentions: 621, sentiment: "positive", trend: "up" },
    { word: "investment", mentions: 598, sentiment: "neutral", trend: "down" },
    { word: "solana", mentions: 587, sentiment: "positive", trend: "up" },
    { word: "crash", mentions: 543, sentiment: "negative", trend: "stable" },
    { word: "crypto", mentions: 521, sentiment: "neutral", trend: "stable" },
    { word: "potential", mentions: 498, sentiment: "positive", trend: "up" },
    { word: "diamond", mentions: 476, sentiment: "positive", trend: "down" },
    { word: "hands", mentions: 465, sentiment: "positive", trend: "up" },
    { word: "buy", mentions: 432, sentiment: "positive", trend: "down" },
    { word: "coin", mentions: 421, sentiment: "neutral", trend: "up" },
    { word: "price", mentions: 398, sentiment: "neutral", trend: "up" },
    { word: "gaming", mentions: 376, sentiment: "positive", trend: "stable" },
    { word: "chart", mentions: 354, sentiment: "neutral", trend: "up" },
  ]

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

  const maxMentions = Math.max(...wordCloudData.map((w) => w.mentions))
  const sentimentStats = {
    positive: Math.round((wordCloudData.filter((w) => w.sentiment === "positive").length / wordCloudData.length) * 100),
    negative: Math.round((wordCloudData.filter((w) => w.sentiment === "negative").length / wordCloudData.length) * 100),
    neutral: Math.round((wordCloudData.filter((w) => w.sentiment === "neutral").length / wordCloudData.length) * 100),
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
            <div className="text-2xl font-bold text-orange-500">30</div>
            <div className="text-sm text-gray-400">Trending Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">14</div>
            <div className="text-sm text-gray-400">Positive Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">6</div>
            <div className="text-sm text-gray-400">Negative Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">20,762</div>
            <div className="text-sm text-gray-400">Total Mentions</div>
          </div>
        </div>

        {/* Visual Word Cloud */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Visual Word Cloud</h3>
          <div className="bg-gray-800/30 rounded-lg p-6 min-h-[200px] flex flex-wrap items-center justify-center gap-3">
            {wordCloudData.slice(0, 20).map((item) => (
              <div
                key={item.word}
                className={`${getWordSize(item.mentions, maxMentions)} ${getSentimentColor(item.sentiment)} font-semibold hover:scale-110 transition-transform cursor-pointer flex items-center gap-1`}
                title={`${item.word}: ${item.mentions} mentions - ${item.sentiment}`}
              >
                <span>{item.word}</span>
                {getTrendIcon(item.trend)}
              </div>
            ))}
          </div>
        </div>

        {/* Top Trending Words Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Top Trending Words</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-orange-500 hover:bg-orange-500/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Word Cloud
            </Button>
          </div>

          <div className="grid gap-2">
            {wordCloudData.slice(0, 10).map((item, index) => (
              <div
                key={item.word}
                className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-orange-500 font-bold text-sm">#{index + 1}</div>
                  <div className="font-semibold text-white">{item.word}</div>
                  {getTrendIcon(item.trend)}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">{item.mentions.toLocaleString()} mentions</span>
                  <Badge
                    variant="outline"
                    className={`${
                      item.sentiment === "positive"
                        ? "border-green-500 text-green-400"
                        : item.sentiment === "negative"
                          ? "border-red-500 text-red-400"
                          : "border-gray-500 text-gray-400"
                    }`}
                  >
                    {item.sentiment}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Sentiment Insights */}
        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Social Sentiment Insights</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-orange-500 mb-3">Dominant Themes</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>🎮 Gaming partnerships driving positive sentiment</li>
                <li>🚀 "Moon" and "pump" indicate bullish expectations</li>
                <li>💎 "Diamond hands" shows strong community conviction</li>
                <li>🏗️ Solana ecosystem integration praised</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-orange-500 mb-3">Sentiment Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Positive</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${sentimentStats.positive}%` }} />
                    </div>
                    <span className="text-sm text-white">{sentimentStats.positive}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Negative</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div className="h-2 bg-red-500 rounded-full" style={{ width: `${sentimentStats.negative}%` }} />
                    </div>
                    <span className="text-sm text-white">{sentimentStats.negative}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Neutral</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div className="h-2 bg-gray-500 rounded-full" style={{ width: `${sentimentStats.neutral}%` }} />
                    </div>
                    <span className="text-sm text-white">{sentimentStats.neutral}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
