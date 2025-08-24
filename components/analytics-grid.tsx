"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function AnalyticsGrid() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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
    {
      title: "BONK Ecosystem Token Performance Review",
      channel: "Ecosystem Tracker",
      views: "789K",
      duration: "16:28",
      thumbnail: "/bonk-ecosystem-overview-projects.png",
      trend: "up",
      change: "+22.1%",
    },
    {
      title: "Smart Contract Security Analysis Report",
      channel: "Security Labs",
      views: "445K",
      duration: "19:41",
      thumbnail: "/placeholder.svg",
      trend: "up",
      change: "+8.9%",
    },
    {
      title: "Community Growth Metrics & Engagement",
      channel: "Community Analytics",
      views: "923K",
      duration: "13:15",
      thumbnail: "/bonk-community-growth-metrics.png",
      trend: "up",
      change: "+31.6%",
    },
    {
      title: "Gaming Integration Impact on BONK",
      channel: "Gaming Insights",
      views: "678K",
      duration: "21:33",
      thumbnail: "/bonk-gaming-ecosystem-growth.png",
      trend: "up",
      change: "+19.4%",
    },
    {
      title: "Developer Activity & GitHub Metrics",
      channel: "Dev Analytics",
      views: "356K",
      duration: "17:52",
      thumbnail: "/bonk-developer-activity-github.png",
      trend: "down",
      change: "-3.7%",
    },
    {
      title: "Partnership Network & Collaboration Analysis",
      channel: "Partnership Tracker",
      views: "512K",
      duration: "22:18",
      thumbnail: "/bonk-partnership-network-analysis.png",
      trend: "up",
      change: "+15.8%",
    },
    {
      title: "AI Integration & BONK Bot Performance",
      channel: "AI Analytics",
      views: "834K",
      duration: "10:27",
      thumbnail: "/bonk-ai-robot-assistant.png",
      trend: "up",
      change: "+28.3%",
    },
    {
      title: "BONK Staking & Yield Farming Strategies",
      channel: "Yield Optimizer",
      views: "621K",
      duration: "23:45",
      thumbnail: "/placeholder.svg",
      trend: "up",
      change: "+16.9%",
    },
    {
      title: "Live: BONK Price Action & Market Analysis",
      channel: "Live Trading Pro",
      views: "1.8M",
      duration: "LIVE",
      thumbnail: "/placeholder.svg",
      trend: "up",
      change: "+42.1%",
    },
    {
      title: "Live: Whale Movement & Large Transaction Alert",
      channel: "Whale Tracker Live",
      views: "2.3M",
      duration: "LIVE",
      thumbnail: "/placeholder.svg",
      trend: "up",
      change: "+38.7%",
    },
    {
      title: "Live: BONK Community Q&A & Strategy Session",
      channel: "Community Hub",
      views: "956K",
      duration: "LIVE",
      thumbnail: "/placeholder.svg",
      trend: "up",
      change: "+25.4%",
    },
    {
      title: "Live: Technical Analysis & Chart Patterns",
      channel: "Chart Master",
      views: "1.4M",
      duration: "LIVE",
      thumbnail: "/placeholder.svg",
      trend: "up",
      change: "+31.2%",
    },
  ]

  // Calculate pagination
  const totalPages = Math.ceil(analyticsData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = analyticsData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first 5 pages for now (since we only have 1 page of content)
      for (let i = 1; i <= maxVisiblePages; i++) {
        pages.push(i)
      }
    }

    return pages.map((page) => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        disabled={page === 1 ? false : true} // Only page 1 is active for now
        className={`px-3 py-2 mx-1 rounded-md text-sm font-medium transition-all duration-200 ${
          page === currentPage
            ? "bg-[#ff6b35] text-black shadow-[0_0_10px_rgba(255,107,53,0.5)]"
            : page === 1
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white cursor-pointer"
            : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
        }`}
      >
        {page}
      </button>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentItems.map((item, index) => (
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

      {/* Pagination Component */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center">
          {renderPaginationNumbers()}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
