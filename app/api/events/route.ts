import { NextResponse } from "next/server"

interface Event {
  id: string
  title: string
  date: string
  time: string
  type:
    | "conference"
    | "webinar"
    | "launch"
    | "update"
    | "community"
    | "exchange"
    | "burning"
    | "meetup"
    | "ama"
    | "contest"
    | "announcement"
    | "nft"
    | "governance"
    | "partnership"
    | "workshop"
    | "presentation"
    | "competition"
    | "tournament"
    | "tutorial"
    | "analysis"
    | "panel"
    | "community-call"
    | "awards"
  location?: string
  description: string
  relevanceScore: number
  tags: string[]
  verified: boolean
  source: "coindar" | "google" | "database" | "admin" | "coincarp" | "coinmarketcal" | "luma" | "community"
  externalId?: string
  attendees?: number
  link?: string
  isRecurring?: boolean
  recurrenceRule?: string
  createdAt: string
  updatedAt: string
}

const BONK_KEYWORDS = {
  primary: [
    "bonk",
    "bonkai",
    "bonkfun",
    "letsbonk",
    "bonk ecosystem",
    "solana",
    "sol",
    "spl",
    "defi",
    "meme coin",
    "dog coin",
  ],
  secondary: [
    "nft",
    "gaming",
    "metaverse",
    "dao",
    "governance",
    "staking",
    "yield farming",
    "liquidity",
    "amm",
    "dex",
    "cex",
    "trading",
  ],
  events: [
    "breakpoint",
    "solana breakpoint",
    "solana conference",
    "defi summit",
    "crypto conference",
    "blockchain event",
  ],
  projects: [
    "raydium",
    "orca",
    "serum",
    "phantom",
    "solflare",
    "magic eden",
    "tensor",
    "helius",
    "quicknode",
    "alchemy",
  ],
}

function calculateBONKRelevance(title: string, description: string, tags: string[] = []): number {
  const text = `${title} ${description} ${tags.join(" ")}`.toLowerCase()
  let score = 0

  for (const keyword of BONK_KEYWORDS.primary) {
    if (text.includes(keyword)) {
      score += 25
    }
  }

  for (const keyword of BONK_KEYWORDS.secondary) {
    if (text.includes(keyword)) {
      score += 10
    }
  }

  for (const keyword of BONK_KEYWORDS.events) {
    if (text.includes(keyword)) {
      score += 15
    }
  }

  for (const keyword of BONK_KEYWORDS.projects) {
    if (text.includes(keyword)) {
      score += 8
    }
  }

  const totalMatches =
    BONK_KEYWORDS.primary.filter((k) => text.includes(k)).length +
    BONK_KEYWORDS.secondary.filter((k) => text.includes(k)).length
  if (totalMatches > 3) score += 10

  return Math.min(100, score)
}

const mockEvents: Event[] = [
  {
    id: "bonk-lcx-listing",
    title: "Listing on LCX Exchange",
    date: "2024-07-30",
    time: "00:00",
    type: "exchange",
    description: "LCX Exchange will list Bonk (BONK) on July 30th.",
    relevanceScore: 100,
    verified: true,
    tags: ["bonk", "exchange", "listing", "lcx"],
    source: "coindar",
    externalId: "lcx-listing-001",
    attendees: 0,
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2024-07-01T00:00:00Z",
  },
  {
    id: "bonk-consensus-hk",
    title: "Consensus Hong Kong",
    date: "2025-02-19",
    time: "00:00",
    type: "conference",
    location: "Hong Kong, China",
    description:
      "Bonk will be participating in Consensus Hong Kong, which will occur from February 17 to 19 in Hong Kong.",
    relevanceScore: 95,
    verified: true,
    tags: ["bonk", "conference", "consensus", "hong kong"],
    source: "coindar",
    externalId: "consensus-hk-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-token-burn-feb",
    title: "Token Burn",
    date: "2025-02-06",
    time: "00:00",
    type: "burning",
    description: "Bonk will host token burn on February 6th.",
    relevanceScore: 100,
    verified: true,
    tags: ["bonk", "burn", "tokenomics"],
    source: "coindar",
    externalId: "token-burn-feb-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-gaming-platform",
    title: "BONK Gaming Platform Release",
    date: "2025-01-30",
    time: "00:00",
    type: "launch",
    description: "Release of BONK gaming platform featuring play-to-earn mechanics and NFT integration.",
    relevanceScore: 98,
    verified: true,
    tags: ["bonk", "gaming", "nft", "play-to-earn", "platform"],
    source: "coindar",
    externalId: "gaming-platform-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-defi-protocol",
    title: "BONK DeFi Protocol Launch",
    date: "2025-01-25",
    time: "00:00",
    type: "launch",
    description: "Launch of new BONK-powered DeFi protocol on Solana blockchain.",
    relevanceScore: 97,
    verified: true,
    tags: ["bonk", "defi", "protocol", "launch", "solana"],
    source: "coindar",
    externalId: "defi-protocol-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-network-upgrade",
    title: "BONK Network Upgrade",
    date: "2025-01-20",
    time: "00:00",
    type: "update",
    description: "Major network upgrade for BONK including performance improvements and new features.",
    relevanceScore: 92,
    verified: true,
    tags: ["bonk", "network", "upgrade", "performance", "solana"],
    source: "coindar",
    externalId: "network-upgrade-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-major-exchange",
    title: "BONK Listing on Major Exchange",
    date: "2025-01-15",
    time: "00:00",
    type: "exchange",
    description: "BONK token will be listed on a major centralized exchange, expanding trading accessibility.",
    relevanceScore: 96,
    verified: true,
    tags: ["bonk", "exchange", "listing", "cex"],
    source: "coindar",
    externalId: "major-exchange-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-arkham-listing",
    title: "Listing on Arkham",
    date: "2025-01-14",
    time: "00:00",
    type: "exchange",
    description: "Arkham will list Bonk (BONK) on January 14th.",
    relevanceScore: 94,
    verified: true,
    tags: ["bonk", "exchange", "listing", "arkham"],
    source: "coindar",
    externalId: "arkham-listing-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-ecosystem-update",
    title: "BONK Ecosystem Development Update",
    date: "2025-01-10",
    time: "00:00",
    type: "update",
    description: "Major development update for the BONK ecosystem including new features and partnerships.",
    relevanceScore: 90,
    verified: true,
    tags: ["bonk", "development", "ecosystem", "partnerships"],
    source: "coindar",
    externalId: "ecosystem-update-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-governance-vote",
    title: "BONK Community Governance Vote",
    date: "2025-01-05",
    time: "00:00",
    type: "community",
    description: "Community governance vote on important BONK ecosystem proposals and decisions.",
    relevanceScore: 88,
    verified: true,
    tags: ["bonk", "governance", "dao", "community", "voting"],
    source: "coindar",
    externalId: "governance-vote-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-token-burn-dec",
    title: "Token Burn - 203,750,000,000 BONK",
    date: "2024-12-25",
    time: "00:00",
    type: "burning",
    description: "Bonk plans to burn 203,750,000,000 BONK tokens on December 25.",
    relevanceScore: 100,
    verified: true,
    tags: ["bonk", "burn", "tokenomics", "deflationary"],
    source: "coindar",
    externalId: "token-burn-dec-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-ama-x",
    title: "AMA on X",
    date: "2024-12-20",
    time: "00:00",
    type: "ama",
    description: "Bonk will host an AMA on X on December 20th.",
    relevanceScore: 85,
    verified: true,
    tags: ["bonk", "ama", "community", "twitter"],
    source: "coindar",
    externalId: "ama-x-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-art-basel",
    title: "Art Basel in Miami",
    date: "2024-12-05",
    time: "00:00",
    type: "conference",
    location: "Miami, FL",
    description:
      "Bonk will participate in Art Basel in Miami on December 5th. The event be featuring various mediums of art such as digital works, sculptures, and canvas pieces.",
    relevanceScore: 87,
    verified: true,
    tags: ["bonk", "conference", "art", "miami", "nft"],
    source: "coindar",
    externalId: "art-basel-001",
    attendees: 0,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "bonk-hk-meetup",
    title: "Hong Kong Meetup",
    date: "2024-10-26",
    time: "00:00",
    type: "meetup",
    location: "Hong Kong",
    description:
      "Bonk has announced its upcoming presence at the Solana Hacker House event in Hong Kong, scheduled from October 24 to 26.",
    relevanceScore: 92,
    verified: true,
    tags: ["bonk", "meetup", "solana", "hacker house", "hong kong"],
    source: "luma",
    externalId: "hk-meetup-001",
    attendees: 0,
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "bonk-breakpoint-singapore",
    title: "Solana Breakpoint in Singapore",
    date: "2024-09-21",
    time: "00:00",
    type: "conference",
    location: "Singapore",
    description: "Bonk is set to participate in the Solana Breakpoint conference in Singapore on September 19th-21st.",
    relevanceScore: 95,
    verified: true,
    tags: ["bonk", "conference", "solana", "breakpoint", "singapore"],
    source: "coindar",
    externalId: "breakpoint-singapore-001",
    attendees: 0,
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: "2024-09-01T00:00:00Z",
  },
  {
    id: "bonk-london-meetup",
    title: "London Meetup",
    date: "2024-07-06",
    time: "00:00",
    type: "meetup",
    location: "London, UK",
    description: "Bonk is set to host the closing event of the London Solana Hacker House in London on July 6th.",
    relevanceScore: 90,
    verified: true,
    tags: ["bonk", "meetup", "solana", "hacker house", "london"],
    source: "luma",
    externalId: "london-meetup-001",
    attendees: 0,
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2024-07-01T00:00:00Z",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const verifiedOnly = searchParams.get("verifiedOnly") === "true"
    const type = searchParams.get("type")
    const tag = searchParams.get("tag")

    let allEvents = [...mockEvents]

    if (verifiedOnly) {
      allEvents = allEvents.filter((event) => event.verified)
    }

    if (type) {
      allEvents = allEvents.filter((event) => event.type === type)
    }

    if (tag) {
      allEvents = allEvents.filter((event) => event.tags.includes(tag))
    }

    allEvents.sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateComparison !== 0) return dateComparison
      return b.relevanceScore - a.relevanceScore
    })

    return NextResponse.json({
      events: allEvents,
      total: allEvents.length,
      filters: { verifiedOnly, type, tag },
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Events fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
