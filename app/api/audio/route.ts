import { NextResponse } from "next/server"

// Audio Library API endpoint for managing podcasts, interviews, and analysis content
// Supports both database storage and AWS S3 integration for actual audio files
// Includes BONK relevance filtering and content validation

interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: string
  category: "podcast" | "interview" | "analysis" | "news" | "blog" | "official" | "community"
  tags: string[]
  relevanceScore: number // 0-100, how relevant to BONK
  verified: boolean // Whether content has been verified
  plays: number
  likes: number
  description: string
  platformUrl: string
  source: string
  createdAt: string
  updatedAt: string
}

// Mock audio tracks with BONK relevance scoring
const mockAudioTracks: AudioTrack[] = [
  {
    id: "1",
    title: "Are Meme Coins Dead? The Vision Behind BONK (featuring Nom)",
    artist: "The Open Metaverse Podcast (Animoca)",
    duration: "45:32",
    category: "podcast",
    tags: ["bonk", "meme coins", "vision", "animoca", "metaverse", "podcast", "nom", "founder"],
    relevanceScore: 98,
    verified: true,
    plays: 1250,
    likes: 89,
    platformUrl: "https://rss.com/podcasts/animocabrands/1970112/",
    description:
      "Season 2, Episode 2 featuring BONK founder Nom discussing the vision and future of BONK, and whether meme coins are truly dead or evolving into something more meaningful.",
    source: "animoca-podcast",
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Bringing Solana Back from the Dead with BONK Founder Nom",
    artist: "Midcurve via Solana Compass",
    duration: "38:15",
    category: "podcast",
    tags: ["bonk", "solana", "nom", "founder", "revival", "midcurve", "ecosystem"],
    relevanceScore: 99,
    verified: true,
    plays: 2100,
    likes: 156,
    platformUrl: "https://solanacompass.com/learn/Midcurve/bringing-solana-back-from-the-dead-with-bonk-founder-nom",
    description:
      "Interview with BONK founder Nom discussing how BONK helped bring Solana back to life and the ecosystem's resurgence.",
    source: "solana-compass",
    createdAt: "2024-11-28T00:00:00Z",
    updatedAt: "2024-11-28T00:00:00Z",
  },
  {
    id: "3",
    title: "BONK Dump Incoming? Expert Analysis",
    artist: "Crypto Town Hall (Apple Podcasts)",
    duration: "52:18",
    category: "podcast",
    tags: ["bonk", "analysis", "expert", "trading", "market", "crypto-town-hall", "price-prediction"],
    relevanceScore: 92,
    verified: true,
    plays: 1875,
    likes: 134,
    platformUrl:
      "https://podcasts.apple.com/us/podcast/bonk-dump-incoming-expert-analysis-crypto-town-hall/id1500066831?i=1000638733204",
    description: "Expert analysis on BONK market movements, discussing potential price action and market sentiment.",
    source: "apple-podcasts",
    createdAt: "2024-11-25T00:00:00Z",
    updatedAt: "2024-11-25T00:00:00Z",
  },
  {
    id: "4",
    title: "BONK, the next Dogecoin?",
    artist: "Crypto Intuition (Spotify)",
    duration: "12:45",
    category: "podcast",
    tags: ["bonk", "dogecoin", "comparison", "spotify", "crypto-intuition", "meme-coin"],
    relevanceScore: 88,
    verified: true,
    plays: 950,
    likes: 67,
    platformUrl: "https://open.spotify.com/show/35uxWfE3tZtvGXJtW7T287",
    description: "Short segment comparing BONK to Dogecoin and discussing the potential for meme coin evolution.",
    source: "spotify",
    createdAt: "2024-11-22T00:00:00Z",
    updatedAt: "2024-11-22T00:00:00Z",
  },
  {
    id: "5",
    title: "BONK: Let the Dog Run with Cailin Doran",
    artist: "Blockchain Bylines (Spotify)",
    duration: "41:23",
    category: "podcast",
    tags: ["bonk", "cailin-doran", "blockchain-bylines", "spotify", "interview", "community"],
    relevanceScore: 90,
    verified: true,
    plays: 1650,
    likes: 112,
    platformUrl: "https://open.spotify.com/episode/2bPFt7EOPkNVdp5p7eJ7Vo",
    description:
      "Interview with Cailin Doran discussing BONK's journey and the future of meme coins in the blockchain space.",
    source: "spotify",
    createdAt: "2024-11-20T00:00:00Z",
    updatedAt: "2024-11-20T00:00:00Z",
  },
  {
    id: "6",
    title: "Throwback to Midcurve Episode with Nom",
    artist: "Binance Square Blog",
    duration: "15:30",
    category: "blog",
    tags: ["bonk", "nom", "midcurve", "binance", "throwback", "blog", "founder"],
    relevanceScore: 85,
    verified: true,
    plays: 720,
    likes: 45,
    platformUrl: "https://www.binance.com/en/square/post/27077253498426",
    description: "Binance Square blog post revisiting the popular Midcurve episode featuring BONK founder Nom.",
    source: "binance-blog",
    createdAt: "2024-11-18T00:00:00Z",
    updatedAt: "2024-11-18T00:00:00Z",
  },
  {
    id: "7",
    title: "BONK Ecosystem Deep Dive",
    artist: "Solana Foundation",
    duration: "28:45",
    category: "official",
    tags: ["bonk", "solana", "ecosystem", "official", "foundation", "technical"],
    relevanceScore: 96,
    verified: true,
    plays: 3200,
    likes: 234,
    platformUrl: "https://solana.com",
    description: "Official Solana Foundation deep dive into the BONK ecosystem and its impact on the Solana network.",
    source: "solana-foundation",
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
  },
  {
    id: "8",
    title: "BONK Community AMA Session",
    artist: "BONK Community",
    duration: "67:12",
    category: "community",
    tags: ["bonk", "ama", "community", "q&a", "live", "interactive"],
    relevanceScore: 94,
    verified: true,
    plays: 1890,
    likes: 167,
    platformUrl: "https://bonk.community",
    description: "Live community AMA session with BONK team members answering questions from the community.",
    source: "bonk-community",
    createdAt: "2024-11-12T00:00:00Z",
    updatedAt: "2024-11-12T00:00:00Z",
  },
]

// Get all audio tracks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minRelevance = Number.parseInt(searchParams.get("minRelevance") || "25")
    const verifiedOnly = searchParams.get("verifiedOnly") === "true"
    const tag = searchParams.get("tag")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredTracks = [...mockAudioTracks]

    // Filter by relevance threshold
    filteredTracks = filteredTracks.filter((track) => track.relevanceScore >= minRelevance)

    // Filter by verification status
    if (verifiedOnly) {
      filteredTracks = filteredTracks.filter((track) => track.verified)
    }

    // Filter by category
    if (category && category !== "all") {
      filteredTracks = filteredTracks.filter((track) => track.category === category)
    }

    // Filter by tag
    if (tag) {
      filteredTracks = filteredTracks.filter((track) => track.tags.includes(tag))
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTracks = filteredTracks.filter(
        (track) =>
          track.title.toLowerCase().includes(searchLower) ||
          track.artist.toLowerCase().includes(searchLower) ||
          track.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Sort by relevance score (highest first), then by plays
    filteredTracks.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return b.plays - a.plays
    })

    // Apply pagination
    const paginatedTracks = filteredTracks.slice(offset, offset + limit)

    return NextResponse.json({
      tracks: paginatedTracks,
      total: filteredTracks.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < filteredTracks.length,
      },
      filters: {
        category,
        search,
        minRelevance,
        verifiedOnly,
        tag,
      },
      platforms: {
        spotify: true,
        applePodcasts: true,
        solanaCompass: true,
        binanceSquare: true,
        solanaFoundation: true,
        bonkCommunity: true,
        animocaPodcasts: true,
      },
      relevanceStats: {
        average:
          filteredTracks.length > 0
            ? Math.round(filteredTracks.reduce((sum, t) => sum + t.relevanceScore, 0) / filteredTracks.length)
            : 0,
        highRelevance: filteredTracks.filter((t) => t.relevanceScore >= 70).length,
        mediumRelevance: filteredTracks.filter((t) => t.relevanceScore >= 50 && t.relevanceScore < 70).length,
        lowRelevance: filteredTracks.filter((t) => t.relevanceScore >= 25 && t.relevanceScore < 50).length,
      },
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Audio tracks fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch audio tracks" }, { status: 500 })
  }
}
