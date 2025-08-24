import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, Clock, Users, Activity, Zap, Globe } from "lucide-react"

export function EcosystemDashboard() {
  const ecosystemData = [
    {
      title: "BONK Ecosystem Overview - 500+ Projects",
      channel: "Ecosystem Tracker",
      views: "3.2M",
      duration: "22:45",
      thumbnail: "/bonk-ecosystem-overview-projects.png",
      trend: "up",
      change: "+45.2%",
      category: "Overview",
    },
    {
      title: "Top BONK DeFi Protocols Performance",
      channel: "DeFi Analytics",
      views: "1.8M",
      duration: "18:33",
      thumbnail: "/bonk-defi-protocols-performance.png",
      trend: "up",
      change: "+28.7%",
      category: "DeFi",
    },
    {
      title: "BONK NFT Collections Market Analysis",
      channel: "NFT Ecosystem",
      views: "1.1M",
      duration: "15:22",
      thumbnail: "/bonk-nft-collections-analysis.png",
      trend: "up",
      change: "+15.3%",
      category: "NFTs",
    },
    {
      title: "Ecosystem Token Distribution Deep Dive",
      channel: "Token Analytics",
      views: "892K",
      duration: "25:18",
      thumbnail: "/bonk-token-distribution-analysis.png",
      trend: "up",
      change: "+12.8%",
      category: "Tokenomics",
    },
    {
      title: "BONK Gaming Ecosystem Growth Report",
      channel: "Gaming Analytics",
      views: "756K",
      duration: "19:47",
      thumbnail: "/bonk-gaming-ecosystem-growth.png",
      trend: "up",
      change: "+38.9%",
      category: "Gaming",
    },
    {
      title: "Developer Activity & GitHub Commits",
      channel: "Dev Metrics",
      views: "634K",
      duration: "14:55",
      thumbnail: "/bonk-developer-activity-github.png",
      trend: "up",
      change: "+22.1%",
      category: "Development",
    },
    {
      title: "Partnership Network Analysis",
      channel: "Partnership Tracker",
      views: "543K",
      duration: "17:29",
      thumbnail: "/bonk-partnership-network-analysis.png",
      trend: "up",
      change: "+19.4%",
      category: "Partnerships",
    },
    {
      title: "Community Growth & Engagement Metrics",
      channel: "Community Analytics",
      views: "721K",
      duration: "21:12",
      thumbnail: "/bonk-community-growth-metrics.png",
      trend: "up",
      change: "+31.6%",
      category: "Community",
    },
  ]

  const ecosystemStats = [
    { label: "Total Projects", value: "500+", icon: Globe, trend: "+12%" },
    { label: "Active Developers", value: "1,200", icon: Users, trend: "+8%" },
    { label: "Daily Transactions", value: "2.5M", icon: Activity, trend: "+25%" },
    { label: "Ecosystem TVL", value: "$45M", icon: Zap, trend: "+18%" },
  ]

  return (
    <div className="space-y-6">
      {/* Ecosystem Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {ecosystemStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-gray-900 border-gray-800 p-4 hover:border-[#ff6b35]/50 hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-[#ff6b35]" />
            </div>
          </Card>
        ))}
      </div>

      {/* Ecosystem Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ecosystemData.map((item, index) => (
          <Card
            key={index}
            className="bg-gray-900 border-gray-800 overflow-hidden transition-all duration-300 cursor-pointer group hover:border-[#ff6b35]/50 hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] hover:scale-[1.02] hover:bg-gray-800"
          >
            <div className="relative">
              <img
                src={item.thumbnail || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(item.title)}`}
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
              <div className="absolute top-2 right-2">
                <Badge className="text-xs bg-[#ff6b35] text-white">{item.category}</Badge>
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
    </div>
  )
}
