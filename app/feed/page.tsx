"use client"

import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { useState, useEffect } from "react"
import { Heart, MessageCircle, Repeat2, ExternalLink, TrendingUp, TrendingDown, Minus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UnifiedLoading } from "@/components/loading"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface SocialPost {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
    isInfluencer?: boolean
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
  priority?: "influencer" | "general"
}

export default function FeedPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const postsPerPage = 10

  useEffect(() => {
    fetchSocialFeed()
  }, [currentPage, filter]) // Refetch when page or filter changes

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (currentPage === 1) { // Only auto-refresh first page
        fetchSocialFeed()
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [currentPage])

  const fetchSocialFeed = async () => {
    try {
      setLoading(true)
      const sentimentParam = filter === "all" ? "" : `&sentiment=${filter}`
      const response = await fetch(`/api/social-feed?page=${currentPage}&perPage=${postsPerPage}${sentimentParam}`)
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts || [])
        setTotalPosts(data.total || 0)
        setTotalPages(data.totalPages || 0)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("Failed to fetch social feed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: "all" | "positive" | "negative" | "neutral") => {
    setFilter(newFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
        <div className="group/header flex items-center justify-between mb-8 transition-all duration-500 hover:scale-[1.01] transform-gpu">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
              Live Crypto Social Feed
            </h1>
            <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
              Real-time social media activity from BONK and Solana ecosystems
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500 transition-all duration-500 group-hover/header:text-orange-400">
              {totalPosts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
              total posts
            </div>
            <div className="text-xs text-gray-500 mt-1">
              BONK + Solana feeds
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-600 mt-1">
                Last updated: {lastUpdated}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Sentiment Filters */}
          <div className="flex space-x-2">
            <span className="text-sm text-gray-400 self-center">Sentiment:</span>
            {[
              { key: "all", label: "All Posts" },
              { key: "positive", label: "Positive" },
              { key: "negative", label: "Negative" },
              { key: "neutral", label: "Neutral" },
            ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              onClick={() => handleFilterChange(filterOption.key as any)}
              className={`group/filter transition-all duration-500 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transform-gpu ${
                filter === filterOption.key
                  ? "bg-orange-500 text-black hover:bg-orange-600"
                  : "border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-500"
              }`}
            >
              {filterOption.label}
            </Button>
          ))}
          </div>
          
          {/* Info Badge */}
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
              TOP INFLUENCER
            </Badge>
            <span className="text-xs text-gray-500">= Posts from top 10 BONK influencers</span>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="group/loading text-center py-12 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <div className="text-gray-400 transition-all duration-500 group-hover/loading:text-gray-300">
                Loading BONK social feed...
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="group/empty text-center py-12 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <div className="text-gray-400 transition-all duration-500 group-hover/empty:text-gray-300">
                No posts found
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="group/post bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar || "/placeholder.svg"}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full transition-all duration-500 group-hover/post:scale-110 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.3)]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white transition-all duration-500 group-hover/post:text-orange-400">
                          {post.author.name}
                        </h3>
                        <span className="text-gray-400 transition-all duration-500 group-hover/post:text-gray-300">
                          @{post.author.username}
                        </span>
                        {post.author.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" title="Verified Account" />
                        )}
                        {post.author.isInfluencer && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold border-0">
                            TOP INFLUENCER
                          </Badge>
                        )}
                        <Badge className={`${getSentimentColor(post.sentiment)} border text-xs transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]`}>
                          <div className="flex items-center space-x-1">
                            <div className="transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2">
                              {getSentimentIcon(post.sentiment)}
                            </div>
                            <span>{post.sentiment}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 transition-all duration-500 group-hover/post:text-gray-400">
                        {post.timestamp}
                      </div>
                    </div>
                  </div>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link text-gray-400 hover:text-orange-500 transition-all duration-500 hover:scale-110 hover:rotate-2"
                  >
                    <ExternalLink className="w-5 h-5 transition-all duration-500 group-hover/link:scale-110 group-hover/link:rotate-2" />
                  </a>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-200 leading-relaxed transition-all duration-500 group-hover/post:text-gray-100">
                    {post.content}
                  </p>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <Heart className="w-4 h-4 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      <span>{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <Repeat2 className="w-4 h-4 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      <span>{post.engagement.retweets}</span>
                    </div>
                    <div className="flex items-center space-x-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <MessageCircle className="w-4 h-4 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      <span>{post.engagement.comments}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="transition-all duration-500 group-hover/post:text-gray-300">
                      Followers: {post.engagement.followers.toLocaleString()}
                    </span>
                    <span className="transition-all duration-500 group-hover/post:text-gray-300">
                      Interactions: {post.engagement.interactions}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Info */}
        {!loading && posts.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-400">
            Showing {posts.length} of {totalPosts.toLocaleString()} posts (Page {currentPage} of {totalPages})
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={`group/prev transition-all duration-500 ${
                      currentPage === 1 
                        ? "pointer-events-none opacity-50" 
                        : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                    }`}
                  />
                </PaginationItem>
                
                {/* Show limited page numbers around current page */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 7;
                  
                  if (totalPages <= maxVisiblePages) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    const end = Math.min(totalPages, start + maxVisiblePages - 1);
                    
                    if (start > 1) {
                      pages.push(1);
                      if (start > 2) pages.push('...');
                    }
                    
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    
                    if (end < totalPages) {
                      if (end < totalPages - 1) pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-400">...</span>
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => handlePageChange(page as number)}
                          className="group/page cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={`group/next transition-all duration-500 ${
                      currentPage === totalPages 
                        ? "pointer-events-none opacity-50" 
                        : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  )
}
