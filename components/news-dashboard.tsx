"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BONKNewsFeed } from "@/components/bonk-news-feed"
import { Newspaper, TrendingUp, Clock, Search, Filter, MessageSquare, BarChart3 } from "lucide-react"

export function NewsDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newsStats, setNewsStats] = useState({
    totalArticles: 0,
    todayArticles: 0,
    positiveNews: 0,
    trendingTopics: 0,
  })

  // Mock news statistics
  useEffect(() => {
    setNewsStats({
      totalArticles: 247,
      todayArticles: 12,
      positiveNews: 8,
      trendingTopics: 15,
    })
  }, [])

  const categories = [
    { id: "all", label: "All News", count: 247 },
    { id: "price", label: "Price Updates", count: 89 },
    { id: "ecosystem", label: "Ecosystem", count: 67 },
    { id: "partnerships", label: "Partnerships", count: 34 },
    { id: "development", label: "Development", count: 28 },
    { id: "community", label: "Community", count: 29 },
  ]

  const trendingTopics = [
    { topic: "BONK ATH", mentions: 1247, sentiment: "positive" },
    { topic: "Solana Integration", mentions: 892, sentiment: "positive" },
    { topic: "DeFi Expansion", mentions: 634, sentiment: "neutral" },
    { topic: "Community Growth", mentions: 567, sentiment: "positive" },
    { topic: "Market Analysis", mentions: 423, sentiment: "neutral" },
  ]

  return (
    <div className="space-y-8">
      {/* News Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Articles</p>
                <p className="text-2xl font-bold text-white">{newsStats.totalArticles}</p>
                <p className="text-green-400 text-xs">+12 this week</p>
              </div>
              <Newspaper className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Articles</p>
                <p className="text-2xl font-bold text-white">{newsStats.todayArticles}</p>
                <p className="text-blue-400 text-xs">Last updated: Just now</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Positive News</p>
                <p className="text-2xl font-bold text-white">{newsStats.positiveNews}</p>
                <p className="text-green-400 text-xs">67% positive sentiment</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Trending Topics</p>
                <p className="text-2xl font-bold text-white">{newsStats.trendingTopics}</p>
                <p className="text-orange-400 text-xs">5 new topics</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Filter className="h-5 w-5 text-orange-500" />
            <span>News Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-400"
                }
              >
                {category.label}
                <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span>Trending Topics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.map((topic, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/30 transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.1)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{topic.topic}</h4>
                  <Badge
                    variant="outline"
                    className={
                      topic.sentiment === "positive"
                        ? "border-green-500 text-green-400"
                        : topic.sentiment === "negative"
                          ? "border-red-500 text-red-400"
                          : "border-gray-500 text-gray-400"
                    }
                  >
                    {topic.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span>{topic.mentions.toLocaleString()} mentions</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main News Feed */}
      <BONKNewsFeed />
    </div>
  )
}
