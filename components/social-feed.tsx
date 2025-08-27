"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ExternalLink, MessageCircle, ThumbsUp, Repeat2 } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export type Post = {
  id: string
  post_type: string
  post_title: string
  post_link: string
  post_image: string | null
  post_created: number
  post_sentiment: number
  creator_id: string
  creator_name: string
  creator_display_name: string
  creator_followers: number
  creator_avatar: string
  interactions_24h: number
  interactions_total: number
}

function sentimentBadge(v?: number) {
  if (typeof v !== "number") return <Badge variant="secondary">neutral</Badge>
  if (v > 0.1) return <Badge>positive</Badge>
  if (v < -0.1) return <Badge variant="destructive">negative</Badge>
  return <Badge variant="secondary">neutral</Badge>
}

function humanTime(ts?: number | string) {
  if (!ts) return ""
  let ms: number
  if (typeof ts === "number") ms = ts < 1e12 ? ts * 1000 : ts
  else {
    const n = Number(ts)
    ms = !Number.isNaN(n) ? (n < 1e12 ? n * 1000 : n) : Date.parse(ts)
  }
  const d = new Date(ms)
  return isNaN(d.getTime()) ? "" : d.toLocaleString()
}

export function SocialFeed({
  limit = 30,
}: {
  limit?: number
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 7

  // Fetch influencers data to filter posts - refresh every 1 hour
  const { data: influencersData } = useQuery({
    queryKey: ["influencers", "bonk", 200], // Use same key as InfluencerList
    queryFn: async () => {
      const res = await fetch(`/api/influencers/bonk?limit=200`, {
        cache: "force-cache",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`influencers ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      return json.influencers || []
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  })

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ["feeds", "bonk", limit],
    queryFn: async () => {
      const res = await fetch(`/api/feeds/bonk?limit=${limit}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`feeds ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      
      let posts: Post[] = []
      if (json.feeds && Array.isArray(json.feeds)) {
        posts = json.feeds
      } else if (json.data && Array.isArray(json.data)) {
        posts = json.data
      }
      
      return posts
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
  })

  // Get influencer names for filtering
  const influencerNames = useMemo(() => {
    if (!influencersData || !Array.isArray(influencersData)) return new Set()
    return new Set(influencersData.map((inf: any) => inf.creator_name?.toLowerCase()))
  }, [influencersData])

  // Filter posts to only include those from influencers
  const posts = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return []
    return rawData.filter((post: Post) => 
      post.creator_name && influencerNames.has(post.creator_name.toLowerCase())
    )
  }, [rawData, influencerNames])
  
  const totalPages = Math.ceil(posts.length / postsPerPage)
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Live BONK Social Feed</CardTitle></CardHeader>
        <CardContent><div className="h-24 animate-pulse rounded-md bg-muted" /></CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live BONK Social Feed</CardTitle>
          <Badge variant="destructive">error</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">Feed unavailable: {String(error)}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group/social-feed bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white transition-all duration-500 group-hover/social-feed:text-orange-400">
          Live BONK Social Feed
        </CardTitle>
        <Badge variant="outline" className="transition-all duration-500 group-hover/social-feed:scale-105 group-hover/social-feed:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
          {posts.length} posts
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPosts.map((p) => {
          const name = p.creator_display_name || p.creator_name || "Creator"
          const handle = p.creator_name ? `@${p.creator_name}` : ""
          const platform = p.post_type || "Social"
          const likeCount = 0
          const rtCount = 0
          const replyCount = 0
          const text = p.post_title || ""
          const id = String(p.id)

          return (
            <div key={id} className="group/post p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 transition-all duration-500 group-hover/post:scale-110 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                  <AvatarImage src={p.creator_avatar || ""} />
                  <AvatarFallback className="bg-orange-600 text-white transition-all duration-500 group-hover/post:bg-orange-500">
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white transition-all duration-500 group-hover/post:text-orange-400">
                        {name}
                      </span>
                      {handle && (
                        <span className="text-sm text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                          {handle}
                        </span>
                      )}
                      <Badge variant="secondary" className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                        {platform}
                      </Badge>
                      <div className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                        {sentimentBadge(p.post_sentiment)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                      {humanTime(p.post_created)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-300 transition-all duration-500 group-hover/post:text-gray-200">
                    {text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <ThumbsUp className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      {likeCount}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <Repeat2 className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      {rtCount}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <MessageCircle className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      {replyCount}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      Followers: {p.creator_followers}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      Interactions: {p.interactions_24h}
                    </span>
                    {p.post_link && (
                      <a href={p.post_link} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" className="group/open h-7 px-2 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                          <ExternalLink className="h-3 w-3 mr-1 transition-all duration-500 group-hover/open:scale-110 group-hover/open:rotate-2" /> 
                          Open
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {!posts.length && (
          <div className="group/empty text-sm text-muted-foreground hover:text-gray-300 transition-all duration-500">
            No recent posts found.
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
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
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                      className="group/page cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
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
      </CardContent>
    </Card>
  )
}
