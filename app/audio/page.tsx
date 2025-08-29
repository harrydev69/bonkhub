"use client"

import { useState, useEffect } from "react"
import { PornhubNavigation } from "../../components/pornhub-navigation"
import { PornhubHeader } from "../../components/pornhub-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UnifiedLoading } from "@/components/loading"
import {
  Play,
  Heart,
  Search,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Headphones,
  Clock,
  Coins,
} from "lucide-react"

interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: string
  category: "podcast" | "interview" | "analysis" | "news" | "blog" | "official" | "community"
  tags: string[]
  relevanceScore: number
  verified: boolean
  plays: number
  likes: number
  description: string
  platformUrl: string
  source: string
  createdAt: string
  updatedAt: string
}

// Platform-specific component with BONK theming
function PlatformPlayer({ track }: { track: AudioTrack }) {
  const getPlatformInfo = (source: string) => {
    switch (source) {
      case "spotify":
        return {
          name: "Spotify",
          color: "from-green-500 to-green-600",
          icon: "",
          description: "Listen on Spotify",
          accent: "bg-green-500",
        }
      case "apple-podcasts":
        return {
          name: "Apple Podcasts",
          color: "from-purple-500 to-purple-600",
          icon: "🎧",
          description: "Listen on Apple Podcasts",
          accent: "bg-purple-500",
        }
      case "solana-compass":
        return {
          name: "Solana Compass",
          color: "from-blue-500 to-blue-600",
          icon: "🔍",
          description: "Read on Solana Compass",
          accent: "bg-blue-500",
        }
      case "binance-blog":
        return {
          name: "Binance Square",
          color: "from-yellow-500 to-yellow-600",
          icon: "",
          description: "Read on Binance Square",
          accent: "bg-yellow-500",
        }
      case "solana-foundation":
        return {
          name: "Solana Foundation",
          color: "from-indigo-500 to-indigo-600",
          icon: "🏛️",
          description: "Official Solana Content",
          accent: "bg-indigo-500",
        }
      case "bonk-community":
        return {
          name: "BONK Community",
          color: "from-orange-500 to-orange-600",
          icon: "",
          description: "BONK Community Content",
          accent: "bg-orange-500",
        }
      case "animoca-podcast":
        return {
          name: "Animoca Podcasts",
          color: "from-teal-500 to-teal-600",
          icon: "🎙️",
          description: "Listen on Animoca Podcasts",
          accent: "bg-teal-500",
        }
      default:
        return {
          name: "External Platform",
          color: "from-gray-500 to-gray-600",
          icon: "🔗",
          description: "Visit Platform",
          accent: "bg-gray-500",
        }
    }
  }

  const platform = getPlatformInfo(track.source)

  return (
    <div className="relative group">
      {/* Enhanced Platform Thumbnail with BONK theme */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">{platform.icon}</div>

        {/* BONK-themed overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Platform badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`${platform.accent} text-white border-0`}>{platform.name}</Badge>
        </div>

        {/* Duration badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">{track.duration}</div>

        {/* BONK sparkle effect */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="w-5 h-5 text-[#ff6b35]" />
        </div>
      </div>

      {/* Enhanced Platform Info */}
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-400">{platform.description}</p>
        <Button
          onClick={() => window.open(track.platformUrl, "_blank")}
          className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.4)]"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Listen Now
        </Button>
      </div>

      {/* Enhanced Source Info with BONK theme */}
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        {track.verified && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ff6b35] rounded-full" />
            <span className="text-[#ff6b35]">✓ Verified</span>
          </div>
        )}
        <div>BONK Verified Content</div>
        <div>Source: {track.source.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</div>
        <div>Platform: {platform.name}</div>
      </div>
    </div>
  )
}

export default function AudioPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    category: "",
    tag: "",
  })
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchTracks = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        verifiedOnly: filters.verifiedOnly.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.tag && { tag: filters.tag }),
      })

      const response = await fetch(`/api/audio?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio tracks: ${response.status}`)
      }

      const data = await response.json()
      setTracks(data.tracks || [])
      setLastUpdated(data.updatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audio tracks")
      console.error("Audio tracks fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks()

    // Refresh every 10 minutes
    const interval = setInterval(fetchTracks, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filters])

  const handleLike = async (trackId: string) => {
    try {
      const response = await fetch(`/api/audio/${trackId}/like`, {
        method: "POST",
      })
      if (response.ok) {
        // Update local state
        setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, likes: track.likes + 1 } : track)))
      }
    } catch (error) {
      console.error("Failed to like track:", error)
    }
  }

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const getCategoryColor = (category: AudioTrack["category"]) => {
    switch (category) {
      case "podcast":
        return "bg-blue-500"
      case "interview":
        return "bg-green-500"
      case "analysis":
        return "bg-purple-500"
      case "news":
        return "bg-orange-500"
      case "blog":
        return "bg-indigo-500"
      case "official":
        return "bg-red-500"
      case "community":
        return "bg-teal-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRelevanceBadge = (score: number) => {
    if (score >= 70) return "High"
    if (score >= 50) return "Medium"
    return "Low"
  }

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`
    return plays.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />
        <UnifiedLoading 
          title="Loading Audio Library"
          description="Gathering hot BONK ecosystem audio content..."
          variant="page"
          size="lg"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 transition-all duration-500 hover:scale-110 hover:rotate-2 hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
            <h2 className="text-2xl font-bold mb-2 transition-all duration-500 hover:text-red-400">Failed to load audio tracks</h2>
            <p className="text-gray-400 mb-6 transition-all duration-500 hover:text-gray-300">{error}</p>
            <Button onClick={fetchTracks} className="group/retry bg-[#ff6b35] hover:bg-[#ff6b35]/90 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
              <RefreshCw className="w-4 h-4 mr-2 transition-all duration-500 group-hover/retry:scale-110 group-hover/retry:rotate-2" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="group/header mb-8 transition-all duration-500 hover:scale-[1.01] transform-gpu">
                      <h1 className="text-4xl font-bold mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
            Hot Audio Content Internationally
          </h1>
          <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
            Discover BONK ecosystem podcasts, interviews, and analysis from trusted platforms. Let the dog run!
          </p>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            "bonk price",
            "market cap",
            "volume analysis",
            "sentiment data",
            "ecosystem tokens",
            "trading pairs",
            "liquidity pools",
            "defi metrics",
            "social trends",
            "whale activity",
            "price alerts",
          ].map((tag) => (
            <button
              key={tag}
              className="group/tag px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition-all duration-500 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 hover:text-orange-400 transform-gpu"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110" />
              <Input
                placeholder="Search BONK Content"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 focus:border-[#ff6b35] text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="group/select w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
            >
              <option value="">All Categories</option>
              <option value="podcast">Podcast</option>
              <option value="interview">Interview</option>
              <option value="analysis">Analysis</option>
              <option value="news">News</option>
              <option value="blog">Blog</option>
              <option value="official">Official</option>
              <option value="community">Community</option>
            </select>
          </div>

          <div>
            <select
              value={filters.verifiedOnly.toString()}
              onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.value === "true" }))}
              className="group/select w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
            >
              <option value="false">All Tracks</option>
              <option value="true">Verified Only</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="group/stats bg-gray-800 p-4 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-5 h-5 text-[#ff6b35] transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              <span className="text-sm text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">Total Tracks</span>
            </div>
            <div className="text-2xl font-bold transition-all duration-500 group-hover/stats:text-orange-400">{tracks.length}</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">Available tracks</div>
          </div>

          <div className="group/stats bg-gray-800 p-4 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#ff6b35] transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              <span className="text-sm text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">High Relevance</span>
            </div>
            <div className="text-2xl font-bold text-[#ff6b35] transition-all duration-500 group-hover/stats:text-orange-400">
              {tracks.filter((t) => t.relevanceScore >= 70).length}
            </div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">70%+ relevance</div>
          </div>

          <div className="group/stats bg-gray-800 p-4 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="w-5 h-5 text-[#ff6b35] transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              <span className="text-sm text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">Verified Tracks</span>
            </div>
            <div className="text-2xl font-bold transition-all duration-500 group-hover/stats:text-orange-400">{tracks.filter((t) => t.verified).length}</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">Quality assured</div>
          </div>

          <div className="group/stats bg-gray-800 p-4 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-[#ff6b35] transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              <span className="text-sm text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">Avg Relevance</span>
            </div>
            <div className="text-2xl font-bold text-[#ff6b35] transition-all duration-500 group-hover/stats:text-orange-400">
              {tracks.length > 0 ? Math.round(tracks.reduce((sum, t) => sum + t.relevanceScore, 0) / tracks.length) : 0}
              %
            </div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">Overall quality</div>
          </div>
        </div>

        {/* Audio Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="group/track bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
            >
              <PlatformPlayer track={track} />

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2 transition-all duration-500 group-hover/track:text-orange-400">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-400 transition-all duration-500 group-hover/track:text-gray-300">{track.artist}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge className={`${getCategoryColor(track.category)} text-white text-xs transition-all duration-500 group-hover/track:scale-105 group-hover/track:shadow-[0_0_4px_rgba(255,107,53,0.2)]`}>
                    {track.category}
                  </Badge>
                  {track.verified && (
                    <Badge className="bg-[#ff6b35] text-white text-xs transition-all duration-500 group-hover/track:scale-105 group-hover/track:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                      ✓ Verified
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3 line-clamp-2 transition-all duration-500 group-hover/track:text-gray-400">{track.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {track.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="group/tag text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded hover:bg-gray-700 hover:text-gray-200 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                  {track.tags.length > 3 && (
                    <span className="text-xs text-gray-500 transition-all duration-500 group-hover/track:text-gray-400">+{track.tags.length - 3} more</span>
                  )}
                </div>

                {/* Stats and Controls */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 transition-all duration-500 group-hover/track:text-gray-300">
                      <Clock className="w-3 h-3 transition-all duration-500 group-hover/track:scale-110 group-hover/track:rotate-2" />
                      {track.duration}
                    </div>
                    <div className="flex items-center gap-1 transition-all duration-500 group-hover/track:text-gray-300">
                      <Play className="w-3 h-3 transition-all duration-500 group-hover/track:scale-110 group-hover/track:rotate-2" />
                      {formatPlays(track.plays)}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLike(track.id)}
                    className="group/like flex items-center gap-1 text-gray-400 hover:text-[#ff6b35] hover:bg-gray-800 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
                  >
                    <Heart className="w-3 h-3 transition-all duration-500 group-hover/like:scale-110 group-hover/like:rotate-2" />
                    {track.likes}
                  </Button>
                </div>

                {/* Relevance Score */}
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Relevance:</span>
                    <Badge className="bg-[#ff6b35] text-white">
                      {getRelevanceBadge(track.relevanceScore)} ({track.relevanceScore}%)
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated Info */}
        {lastUpdated && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4" />
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              BONK ecosystem content is constantly updated with fresh insights and analysis
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
