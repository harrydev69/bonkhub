"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UnifiedLoading } from "@/components/loading"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Search,
  ExternalLink,
  Star,
  Activity,
  RefreshCw,
  AlertCircle,
  ChevronUp,
} from "lucide-react"

interface Token {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  atl: number
  atl_change_percentage: number
  last_updated: string
  description?: string
  links?: any
  categories?: string[]
  community_data?: any
  developer_data?: any
  sparkline_in_7d?: {
    price: number[]
  }
}

interface CategoryData {
  id: string
  name: string
  market_cap: number
  market_cap_change_24h: number
  volume_24h: number
  content: string
  top_3_coins: any[]
  market_cap_change_percentage_24h: number
  updated_at: string
}

interface EcosystemData {
  category: CategoryData
  tokens: Token[]
  summary: {
    totalTokens: number
    totalMarketCap: number
    totalVolume: number
    averageChange24h: number
    lastUpdated: string
  }
  metadata: {
    dataSource: string
    updateFrequency: string
    categoryId: string
    totalTokensFound: number
  }
}

export function LetsBonkEcosystem() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ecosystemData, setEcosystemData] = useState<EcosystemData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"market_cap" | "total_volume" | "price_change_percentage_1h_in_currency" | "price_change_percentage_24h" | "price_change_percentage_7d_in_currency">("market_cap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/coingecko/letsbonk-ecosystem')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('LetsBonk API Response:', data) // Debug log
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setEcosystemData(data)
        // setTokens(data.tokens || []) // This line was removed as per the new_code, as tokens are not directly managed here.
      } catch (err) {
        console.error('Error fetching LetsBonk data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Auto-refresh every 5 minutes (300000ms)
    const interval = setInterval(fetchData, 300000)
    
    return () => clearInterval(interval)
  }, [])

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    if (!ecosystemData?.tokens) return []
    
    let filtered = ecosystemData.tokens.filter(token =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Sort tokens
    filtered.sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case "market_cap":
          aValue = a.market_cap || 0
          bValue = b.market_cap || 0
          break
        case "total_volume":
          aValue = a.total_volume || 0
          bValue = b.total_volume || 0
          break
        case "price_change_percentage_1h_in_currency":
          aValue = a.price_change_percentage_1h_in_currency || 0
          bValue = b.price_change_percentage_1h_in_currency || 0
          break
        case "price_change_percentage_24h":
          aValue = a.price_change_percentage_24h || 0
          bValue = b.price_change_percentage_24h || 0
          break
        case "price_change_percentage_7d_in_currency":
          aValue = a.price_change_percentage_7d_in_currency || 0
          bValue = b.price_change_percentage_7d_in_currency || 0
          break
        default:
          aValue = a.market_cap || 0
          bValue = b.market_cap || 0
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })
    
    return filtered
  }, [ecosystemData?.tokens, searchTerm, sortBy, sortOrder])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(8)}`
    if (price < 1) return `$${price.toFixed(6)}`
    if (price < 100) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '-'
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleTokenClick = (tokenId: string) => {
    router.push(`/token/${tokenId}`)
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="h-6 w-6" />
            <span className="font-medium text-lg">Error loading data:</span>
          </div>
          <p className="text-red-300 mt-3 text-base">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && !ecosystemData && (
        <div className="mb-8">
          <UnifiedLoading 
            title="Loading Ecosystem"
            description="Fetching LetsBonk ecosystem data..."
            icon="activity"
            variant="chart"
            size="md"
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-6 group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <h1 className="text-5xl font-bold text-white transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
          {ecosystemData?.category?.name || "LetsBonk Ecosystem Overview"}
        </h1>
        <p className="text-gray-400 text-xl transition-all duration-500 group-hover/header:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Comprehensive analysis of the LetsBonk.fun ecosystem tokens with real-time market data and performance metrics
        </p>
      </div>

      {/* Ecosystem Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Total Market Cap
            </CardTitle>
            <DollarSign className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-white transition-all duration-500 group-hover/stats:text-orange-400">
              {ecosystemData ? formatNumber(ecosystemData.summary.totalMarketCap) : "Loading..."}
            </div>
            <div className={`text-sm flex items-center transition-all duration-500 group-hover/stats:scale-105 ${
              ecosystemData?.category?.market_cap_change_percentage_24h && ecosystemData.category.market_cap_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
            }`}>
              {ecosystemData?.category?.market_cap_change_percentage_24h !== undefined ? (
                <>
                  {ecosystemData.category.market_cap_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-medium">
                    {formatPercentage(ecosystemData.category.market_cap_change_percentage_24h)} from yesterday
                  </span>
                </>
              ) : (
                <span className="text-gray-400">Market Cap Trend</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              24h Volume
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-white transition-all duration-500 group-hover/stats:text-orange-400">
              {ecosystemData ? formatNumber(ecosystemData.summary.totalVolume) : "Loading..."}
            </div>
            <div className="text-sm text-green-500 flex items-center transition-all duration-500 group-hover/stats:scale-105">
              <Activity className="h-4 w-4 mr-2" />
              <span className="font-medium">Volume Trend</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Total Tokens
            </CardTitle>
            <Users className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-white transition-all duration-500 group-hover/stats:text-orange-400">
              {ecosystemData?.summary.totalTokens || "Loading..."}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Active tokens in ecosystem
            </div>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Avg 24h Change
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`text-3xl font-bold transition-all duration-500 group-hover/stats:scale-105 ${
              ecosystemData?.summary?.averageChange24h && ecosystemData.summary.averageChange24h >= 0 ? "text-green-500" : "text-red-500"
            }`}>
              {ecosystemData?.summary?.averageChange24h !== undefined ? formatPercentage(ecosystemData.summary.averageChange24h) : "Loading..."}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Ecosystem performance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tokens Table */}
      <Card className="group/table bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <CardTitle className="text-2xl text-white flex items-center transition-all duration-500 group-hover/table:text-orange-400">
              <Star className="h-6 w-6 text-orange-500 mr-3 transition-all duration-500 group-hover/table:scale-110 group-hover/table:rotate-2 group-hover/table:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              {ecosystemData?.category?.name || "LetsBonk.fun Ecosystem Tokens"}
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Search within the card header */}
              <div className="relative group/search">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110" />
                <Input
                  placeholder="Search tokens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-800 border-gray-600 text-white focus:border-orange-500 focus:shadow-[0_0_15px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500 w-72 text-base"
                />
              </div>
              
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                size="default"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu px-4 py-3"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }, (_, loadingIndex) => (
                <div
                  key={loadingIndex}
                  className="group/loading animate-pulse flex items-center space-x-8 p-5 bg-gray-800 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-full transition-all duration-500 group-hover/loading:scale-110 group-hover/loading:shadow-[0_0_8px_rgba(255,107,53,0.3)]" />
                  <div className="flex-1 space-y-2 min-w-48">
                    <div className="h-5 bg-gray-700 rounded w-32 transition-all duration-500 group-hover/loading:bg-gray-600" />
                    <div className="h-4 bg-gray-700 rounded w-20 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                  <div className="space-y-2 w-28">
                    <div className="h-5 bg-gray-700 rounded w-24 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                  <div className="space-y-2 w-20">
                    <div className="h-5 bg-gray-700 rounded w-16 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                  <div className="space-y-2 w-20">
                    <div className="h-5 bg-gray-700 rounded w-16 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                  <div className="space-y-2 w-20">
                    <div className="h-5 bg-gray-700 rounded w-16 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                  <div className="space-y-2 w-32">
                    <div className="h-5 bg-gray-700 rounded w-24 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                  <div className="space-y-2 w-32">
                    <div className="h-5 bg-gray-700 rounded w-24 transition-all duration-500 group-hover/loading:bg-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="flex items-center space-x-8 p-4 bg-gray-800 rounded-lg mb-4 text-sm font-medium text-gray-400 border-b border-gray-700">
                <div className="flex-1 min-w-48">Coin</div>
                <div className="text-center w-28">Price</div>
                <div 
                  className="text-center w-20 cursor-pointer hover:text-orange-400 transition-all duration-300 flex items-center justify-center space-x-2 group/header"
                  onClick={() => {
                    if (sortBy === "price_change_percentage_1h_in_currency") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("price_change_percentage_1h_in_currency")
                      setSortOrder("desc")
                    }
                  }}
                >
                  <span>1h</span>
                  {sortBy === "price_change_percentage_1h_in_currency" && (
                    <ChevronUp className={`h-4 w-4 transition-all duration-300 ${
                      sortOrder === "asc" ? "text-orange-400" : "text-gray-500"
                    }`} />
                  )}
                </div>
                <div 
                  className="text-center w-20 cursor-pointer hover:text-orange-400 transition-all duration-300 flex items-center justify-center space-x-2 group/header"
                  onClick={() => {
                    if (sortBy === "price_change_percentage_24h") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("price_change_percentage_24h")
                      setSortOrder("desc")
                    }
                  }}
                >
                  <span>24h</span>
                  {sortBy === "price_change_percentage_24h" && (
                    <ChevronUp className={`h-4 w-4 transition-all duration-300 ${
                      sortOrder === "asc" ? "text-orange-400" : "text-gray-500"
                    }`} />
                  )}
                </div>
                <div 
                  className="text-center w-20 cursor-pointer hover:text-orange-400 transition-all duration-300 flex items-center justify-center space-x-2 group/header"
                  onClick={() => {
                    if (sortBy === "price_change_percentage_7d_in_currency") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("price_change_percentage_7d_in_currency")
                      setSortOrder("desc")
                    }
                  }}
                >
                  <span>7d</span>
                  {sortBy === "price_change_percentage_7d_in_currency" && (
                    <ChevronUp className={`h-4 w-4 transition-all duration-300 ${
                      sortOrder === "asc" ? "text-orange-400" : "text-gray-500"
                    }`} />
                  )}
                </div>
                <div 
                  className="text-right w-32 cursor-pointer hover:text-orange-400 transition-all duration-300 flex items-center justify-end space-x-2 group/header"
                  onClick={() => {
                    if (sortBy === "total_volume") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("total_volume")
                      setSortOrder("desc")
                    }
                  }}
                >
                  <span>24h Volume</span>
                  {sortBy === "total_volume" && (
                    <ChevronUp className={`h-4 w-4 transition-all duration-300 ${
                      sortOrder === "asc" ? "text-orange-400" : "text-gray-500"
                    }`} />
                  )}
                </div>
                <div 
                  className="text-right w-32 cursor-pointer hover:text-orange-400 transition-all duration-300 flex items-center justify-end space-x-2 group/header"
                  onClick={() => {
                    if (sortBy === "market_cap") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortBy("market_cap")
                      setSortOrder("desc")
                    }
                  }}
                >
                  <span>Market Cap</span>
                  {sortBy === "market_cap" && (
                    <ChevronUp className={`h-4 w-4 transition-all duration-300 ${
                      sortOrder === "asc" ? "text-orange-400" : "text-gray-500"
                    }`} />
                  )}
                </div>
              </div>
              
              {/* Table Rows */}
              <div className="space-y-4">
                {filteredTokens.map((token, index) => (
                  <div
                    key={token.id}
                    onClick={() => handleTokenClick(token.id)}
                    className="group/token flex items-center space-x-8 p-5 bg-gray-800 rounded-lg hover:bg-gray-750 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer border border-transparent hover:border-orange-500/30"
                  >
                    {/* Coin Column */}
                    <div className="flex items-center space-x-4 min-w-0 flex-1 min-w-48">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden transition-all duration-500 group-hover/token:scale-110 group-hover/token:shadow-[0_0_8px_rgba(255,107,53,0.3)]">
                          <img
                            src={token.image}
                            alt={token.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder-logo.svg"
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300 font-medium border-2 border-gray-800 transition-all duration-500 group-hover/token:bg-orange-500 group-hover/token:text-black group-hover/token:scale-110">
                          {token.market_cap_rank || index + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white group-hover/token:text-orange-400 transition-all duration-500 truncate text-base">
                          {token.name}
                        </div>
                        <div className="text-sm text-gray-400 group-hover/token:text-orange-300 transition-all duration-500 uppercase tracking-wide mt-1">
                          {token.symbol}
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Column */}
                    <div className="text-center w-28">
                      <div className="font-medium text-white group-hover/token:text-orange-400 transition-all duration-500 text-base">
                        ${token.current_price.toFixed(4)}
                      </div>
                    </div>
                    
                    {/* 1h Change Column */}
                    <div className="text-center w-20">
                      {token.price_change_percentage_1h_in_currency !== null && token.price_change_percentage_1h_in_currency !== undefined ? (
                        <div className={`font-medium transition-all duration-500 group-hover/token:scale-110 text-base ${
                          token.price_change_percentage_1h_in_currency >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {token.price_change_percentage_1h_in_currency >= 0 ? "▲" : "▼"} {formatPercentage(token.price_change_percentage_1h_in_currency)}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-base">-</span>
                      )}
                    </div>
                    
                    {/* 24h Change Column */}
                    <div className="text-center w-20">
                      <div className={`font-medium transition-all duration-500 group-hover/token:scale-110 text-base ${
                        token.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {token.price_change_percentage_24h >= 0 ? "▲" : "▼"} {formatPercentage(token.price_change_percentage_24h)}
                      </div>
                    </div>
                    
                    {/* 7d Change Column */}
                    <div className="text-center w-20">
                      {token.price_change_percentage_7d_in_currency !== null && token.price_change_percentage_7d_in_currency !== undefined ? (
                        <div className={`font-medium transition-all duration-500 group-hover/token:scale-110 text-base ${
                          token.price_change_percentage_7d_in_currency >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {token.price_change_percentage_7d_in_currency >= 0 ? "▲" : "▼"} {formatPercentage(token.price_change_percentage_7d_in_currency)}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-base">-</span>
                      )}
                    </div>
                    
                    {/* 24h Volume Column */}
                    <div className="text-right w-32">
                      <div className="font-medium text-white group-hover/token:text-orange-400 transition-all duration-500 text-base">
                        ${(token.total_volume / 1e6).toFixed(2)}M
                      </div>
                    </div>
                    
                    {/* Market Cap Column */}
                    <div className="text-right w-32">
                      <div className="font-medium text-white group-hover/token:text-orange-400 transition-all duration-500 text-base">
                        ${(token.market_cap / 1e6).toFixed(2)}M
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Source Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Updates every 5 minutes</p>
      </div>
    </div>
  )
}
