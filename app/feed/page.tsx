"use client"

import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { useState, useEffect } from "react"
import { Heart, MessageCircle, Repeat2, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SocialPost {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  timestamp: string
  platform: string
  sentiment: "positive" | "negative" | "neutral"
  engagement: {
    likes: number
    retweets: number
    comments: number
    followers: number
    interactions: number
  }
  url: string
}

export default function FeedPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all")

  useEffect(() => {
    fetchSocialFeed()
    const interval = setInterval(fetchSocialFeed, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSocialFeed = async () => {
    try {
      const response = await fetch("/api/social-feed")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Failed to fetch social feed:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => (filter === "all" ? true : post.sentiment === filter))

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Live BONK Social Feed</h1>
            <p className="text-gray-400">Real-time social media activity from the BONK ecosystem</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500">{filteredPosts.length}</div>
            <div className="text-sm text-gray-400">posts</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          {[
            { key: "all", label: "All Posts" },
            { key: "positive", label: "Positive" },
            { key: "negative", label: "Negative" },
            { key: "neutral", label: "Neutral" },
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              onClick={() => setFilter(filterOption.key as any)}
              className={`${
                filter === filterOption.key
                  ? "bg-orange-500 text-black hover:bg-orange-600"
                  : "border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-500"
              } transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.3)]`}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading BONK social feed...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">No posts found</div>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all group"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar || "/placeholder.svg"}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{post.author.name}</h3>
                        <span className="text-gray-400">@{post.author.username}</span>
                        <Badge className={`${getSentimentColor(post.sentiment)} border text-xs`}>
                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(post.sentiment)}
                            <span>{post.sentiment}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">{post.timestamp}</div>
                    </div>
                  </div>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-200 leading-relaxed">{post.content}</p>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Repeat2 className="w-4 h-4" />
                      <span>{post.engagement.retweets}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.engagement.comments}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Followers: {post.engagement.followers.toLocaleString()}</span>
                    <span>Interactions: {post.engagement.interactions}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
