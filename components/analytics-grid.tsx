import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, Clock } from "lucide-react"

export function AnalyticsGrid() {
  const analyticsData = [
    {
      title: "BONK Price Analysis - Bull Run Incoming?",
      channel: "Crypto Analytics Pro",
      views: "2.1M",
      duration: "15:42",
      thumbnail: "/bonk-price-chart-green-candles.png",
      trend: "up",
      change: "+24.5%",
    },
    {
      title: "Top 10 Meme Coins Market Cap Comparison",
      channel: "DeFi Insights",
      views: "890K",
      duration: "12:18",
      thumbnail: "/cryptocurrency-market-cap-comparison-chart.png",
      trend: "up",
      change: "+12.3%",
    },
    {
      title: "Whale Activity Alert - Large BONK Transfers",
      channel: "Whale Watcher",
      views: "1.5M",
      duration: "08:33",
      thumbnail: "/whale-cryptocurrency-transfer-blockchain-analysis.png",
      trend: "down",
      change: "-5.2%",
    },
    {
      title: "Sentiment Analysis: Social Media BONK Buzz",
      channel: "Social Crypto",
      views: "654K",
      duration: "20:15",
      thumbnail: "/social-media-sentiment-dashboard.png",
      trend: "up",
      change: "+18.7%",
    },
    {
      title: "DeFi Liquidity Pool Performance Deep Dive",
      channel: "Liquidity Labs",
      views: "432K",
      duration: "25:09",
      thumbnail: "/defi-liquidity-pool-analytics-dashboard.png",
      trend: "up",
      change: "+7.8%",
    },
    {
      title: "Trading Volume Spike - What's Driving It?",
      channel: "Volume Tracker",
      views: "1.2M",
      duration: "11:47",
      thumbnail: "/trading-volume-spike-cryptocurrency-chart.png",
      trend: "up",
      change: "+45.2%",
    },
    {
      title: "Cross-Chain Bridge Activity Analysis",
      channel: "Bridge Monitor",
      views: "298K",
      duration: "18:22",
      thumbnail: "/blockchain-bridge-activity-network-analysis.png",
      trend: "down",
      change: "-2.1%",
    },
    {
      title: "NFT Collection Floor Price Trends",
      channel: "NFT Analytics",
      views: "567K",
      duration: "14:55",
      thumbnail: "/nft-floor-price-trends-analytics-dashboard.png",
      trend: "up",
      change: "+33.4%",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {analyticsData.map((item, index) => (
        <Card
          key={index}
          className="bg-gray-900 border-gray-800 overflow-hidden transition-all duration-300 cursor-pointer group hover:border-[#ff6b35]/50 hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] hover:scale-[1.02] hover:bg-gray-800"
        >
          <div className="relative">
            <img
              src={item.thumbnail || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-48 object-cover transition-all duration-300 group-hover:brightness-110"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded transition-all duration-300 group-hover:bg-[#ff6b35]/80">
              {item.duration}
            </div>
            <div className="absolute top-2 left-2">
              <Badge
                variant={item.trend === "up" ? "default" : "destructive"}
                className="text-xs transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(255,107,53,0.4)]"
              >
                {item.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {item.change}
              </Badge>
            </div>
          </div>

          <div className="p-3">
            <h3 className="text-white text-sm font-medium line-clamp-2 mb-2 transition-all duration-300 group-hover:text-[#ff6b35] group-hover:drop-shadow-[0_0_5px_rgba(255,107,53,0.7)]">
              {item.title}
            </h3>

            <div className="flex items-center text-gray-400 text-xs mb-1">
              <span className="transition-all duration-200 hover:text-[#ff6b35] hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)] cursor-pointer">
                {item.channel}
              </span>
              <span className="mx-1">•</span>
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {item.views}
              </span>
            </div>

            <div className="flex items-center text-gray-500 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              <span>2 hours ago</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
