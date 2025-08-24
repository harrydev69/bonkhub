import { NextResponse } from "next/server"

// Mock social feed data based on the user's image
const mockPosts = [
  {
    id: "1",
    author: {
      name: "Brihanna",
      username: "BrihannaDegen",
      avatar: "/crypto-trader-avatar.png",
      verified: true,
    },
    content:
      "$labubu $bonk $uranus $troll $ray $aura $ani $giza $bulla $verse $zora $wifout $clippy $urmom $lizard $tokabu $ava $smiski $bitty $sus $light $orange $yzy $boss $dark $mm $stay $cudis $bas $xny $rion $macho $titanium $robotheism $balajis $usduc $juan $bome $ltm $buttplug",
    timestamp: "8/24/2025, 1:11:22 PM",
    platform: "twitter",
    sentiment: "positive" as const,
    engagement: {
      likes: 0,
      retweets: 0,
      comments: 0,
      followers: 115,
      interactions: 238,
    },
    url: "https://twitter.com/BrihannaDegen/status/123",
  },
  {
    id: "2",
    author: {
      name: "Alberto Alarido",
      username: "ALBERTO_ALARIDO",
      avatar: "/crypto-analyst-avatar.png",
      verified: false,
    },
    content:
      "$ENA/USDT\n\n$ABRR $SOL $SEI $INJ $BONK $AVAX $FET $ETC $ASTR $ETE $PENGU $ENA $CKB $HYPER $SYRUP $BTC $ETH $ltc $XRP $Coins $HYPE $SPX $AVAX $HUMA $SWARMS $VINE $POPCAT $ELF $PAXG $GT $COMP $WOO $USDP $ZIL $FET $GMT $SC $DASH $ILV $USTC",
    timestamp: "8/24/2025, 1:06:54 PM",
    platform: "twitter",
    sentiment: "positive" as const,
    engagement: {
      likes: 0,
      retweets: 0,
      comments: 0,
      followers: 850,
      interactions: 161,
    },
    url: "https://twitter.com/ALBERTO_ALARIDO/status/124",
  },
  {
    id: "3",
    author: {
      name: "CryptoWhale",
      username: "CryptoWhale_",
      avatar: "/whale-crypto-trader.png",
      verified: true,
    },
    content:
      "BONK is showing strong momentum today! 🚀 The community is growing and the ecosystem is expanding. This could be the start of something big. #BONK #Solana #DeFi",
    timestamp: "8/24/2025, 12:45:30 PM",
    platform: "twitter",
    sentiment: "positive" as const,
    engagement: {
      likes: 156,
      retweets: 89,
      comments: 23,
      followers: 45200,
      interactions: 892,
    },
    url: "https://twitter.com/CryptoWhale_/status/125",
  },
  {
    id: "4",
    author: {
      name: "DeFi Degen",
      username: "DefiDegen2024",
      avatar: "/defi-trader-avatar.png",
      verified: false,
    },
    content:
      "Market looking rough today. BONK down 15% but still holding strong support levels. Might be a good entry point for those who missed the initial pump. DYOR as always.",
    timestamp: "8/24/2025, 11:30:15 PM",
    platform: "twitter",
    sentiment: "negative" as const,
    engagement: {
      likes: 67,
      retweets: 34,
      comments: 12,
      followers: 8900,
      interactions: 445,
    },
    url: "https://twitter.com/DefiDegen2024/status/126",
  },
  {
    id: "5",
    author: {
      name: "Solana News",
      username: "SolanaNews",
      avatar: "/solana-news-logo.png",
      verified: true,
    },
    content:
      "BREAKING: Major DEX announces BONK integration coming next week. This could significantly increase trading volume and liquidity for the meme coin. Stay tuned for more updates.",
    timestamp: "8/24/2025, 10:15:45 AM",
    platform: "twitter",
    sentiment: "positive" as const,
    engagement: {
      likes: 234,
      retweets: 178,
      comments: 56,
      followers: 125000,
      interactions: 1567,
    },
    url: "https://twitter.com/SolanaNews/status/127",
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      posts: mockPosts,
      total: mockPosts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Social feed API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch social feed" }, { status: 500 })
  }
}
