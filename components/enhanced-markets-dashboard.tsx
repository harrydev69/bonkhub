"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, AlertCircle, BarChart3, Target, Shield, SortAsc, SortDesc, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export type EnhancedMarketsData = {
  venues: Array<{
    rank: number
    exchange: string
    pair: string
    price: number
    spread: number
    depth2Percent: {
      positive: number
      negative: number
    }
    volume24h: number
    volumePercentage: number
    lastUpdated: string
    trustScore: string
    marketType: "spot" | "perpetual" | "futures"
    exchangeType: "cex" | "dex"
    tradeUrl: string
    priceChange24h: number
    priceChangePercentage24h: number
    high24h: number
    low24h: number
    bidAsk: {
      bid: number
      ask: number
      bidSize: number
      askSize: number
    }
  }>
  summary: {
    totalVenues: number
    totalVolume: number
    averageSpread: number
    averageTrustScore: string
    marketTypeDistribution: {
      spot: number
      perpetual: number
      futures: number
    }
    exchangeTypeDistribution: {
      cex: number
      dex: number
    }
    topExchanges: Array<{
      name: string
      volume: number
      venueCount: number
      averageTrustScore: string
    }>
  }
  filters: {
    marketTypes: string[]
    exchangeTypes: string[]
    trustScores: string[]
    exchanges: string[]
  }
  metadata: {
    lastUpdated: string
    totalPairs: number
    stalePairs: number
    anomalyPairs: number
    dataQuality: {
      highTrust: number
      mediumTrust: number
      lowTrust: number
    }
  }
}

export function EnhancedMarketsDashboard() {
  const [marketsData, setMarketsData] = useState<EnhancedMarketsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"volume" | "price" | "spread" | "exchange" | "trust">("volume")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterMarketType, setFilterMarketType] = useState<string>("all")
  const [filterExchangeType, setFilterExchangeType] = useState<string>("all")
  const [filterTrustScore, setFilterTrustScore] = useState<string>("all")
  const [filterExchange, setFilterExchange] = useState<string>("all")

  useEffect(() => {
    fetchMarketsData()
  }, [])

  const fetchMarketsData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bonk/markets/enhanced")

      if (!response.ok) {
        throw new Error(`Failed to fetch enhanced markets data: ${response.status}`)
      }

      const data = await response.json()
      setMarketsData(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to fetch enhanced markets data")
      console.error("Enhanced markets fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <EnhancedMarketsSkeleton />
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading enhanced markets data: {error}</span>
          </div>
          <Button onClick={fetchMarketsData} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!marketsData) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <span className="text-gray-400">No enhanced markets data available</span>
        </CardContent>
      </Card>
    )
  }

  const { venues, summary, filters, metadata } = marketsData

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`
    return num.toFixed(decimals)
  }

  const formatPercentage = (num: number) => `${num.toFixed(2)}%`
  const formatPrice = (price: number) => `$${price.toFixed(6)}`

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case "green":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "red":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getMarketTypeColor = (type: string) => {
    switch (type) {
      case "spot":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "perpetual":
        return "bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100"
      case "futures":
        return "bg-orange-300 text-orange-900 dark:bg-orange-700 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getExchangeTypeColor = (type: string) => {
    switch (type) {
      case "cex":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "dex":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatPairDisplay = (pair: string) => {
    if (pair.length > 20) {
      return `${pair.substring(0, 10)}...${pair.substring(pair.length - 10)}`
    }
    return pair
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  // Filter and sort venues
  const filteredVenues = venues
    .filter((venue) => {
      if (
        searchTerm &&
        !venue.exchange.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !venue.pair.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false
      if (filterMarketType !== "all" && venue.marketType !== filterMarketType) return false
      if (filterExchangeType !== "all" && venue.exchangeType !== filterExchangeType) return false
      if (filterTrustScore !== "all" && venue.trustScore !== filterTrustScore) return false
      if (filterExchange !== "all" && venue.exchange !== filterExchange) return false
      return true
    })
    .sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case "volume":
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "spread":
          aValue = a.spread
          bValue = b.spread
          break
        case "exchange":
          aValue = a.exchange.localeCompare(b.exchange)
          bValue = 0
          break
        case "trust":
          const trustOrder = { green: 3, yellow: 2, red: 1 }
          aValue = trustOrder[a.trustScore as keyof typeof trustOrder] || 2
          bValue = trustOrder[b.trustScore as keyof typeof trustOrder] || 2
          break
        default:
          aValue = a.volume24h
          bValue = b.volume24h
      }

      if (sortBy === "exchange") {
        return sortOrder === "asc" ? aValue : -aValue
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Enhanced Markets Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Comprehensive analysis of BONK trading venues with depth, spread, and trust metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Last updated: {new Date(metadata.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="venues" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Trading Venues
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Market Analysis
            </TabsTrigger>
            <TabsTrigger value="quality" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Data Quality
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Venues</CardTitle>
                  <Building2 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{summary.totalVenues}</div>
                  <p className="text-xs text-gray-400">{metadata.totalPairs} total pairs</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Volume</CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatNumber(summary.totalVolume)}</div>
                  <p className="text-xs text-gray-400">24h trading volume</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Avg Spread</CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatPercentage(summary.averageSpread)}</div>
                  <p className="text-xs text-gray-400">Bid-ask spread</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Trust Score</CardTitle>
                  <Shield className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{summary.averageTrustScore}</div>
                  <p className="text-xs text-gray-400">Average quality</p>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Market Type Distribution</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown by trading instrument type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Spot Trading</span>
                      <span className="text-white font-semibold">{summary.marketTypeDistribution.spot}</span>
                    </div>
                    <Progress
                      value={(summary.marketTypeDistribution.spot / summary.totalVenues) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Perpetuals</span>
                      <span className="text-white font-semibold">{summary.marketTypeDistribution.perpetual}</span>
                    </div>
                    <Progress
                      value={(summary.marketTypeDistribution.perpetual / summary.totalVenues) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Futures</span>
                      <span className="text-white font-semibold">{summary.marketTypeDistribution.futures}</span>
                    </div>
                    <Progress
                      value={(summary.marketTypeDistribution.futures / summary.totalVenues) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Exchange Type Distribution</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown by exchange type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Centralized (CEX)</span>
                      <span className="text-white font-semibold">{summary.exchangeTypeDistribution.cex}</span>
                    </div>
                    <Progress
                      value={(summary.exchangeTypeDistribution.cex / summary.totalVenues) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Decentralized (DEX)</span>
                      <span className="text-white font-semibold">{summary.exchangeTypeDistribution.dex}</span>
                    </div>
                    <Progress
                      value={(summary.exchangeTypeDistribution.dex / summary.totalVenues) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Exchanges */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Exchanges by Volume</CardTitle>
                <CardDescription className="text-gray-400">Leading trading venues for BONK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.topExchanges.map((exchange, index) => (
                    <div
                      key={exchange.name}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{exchange.name}</div>
                          <div className="text-sm text-gray-400">{exchange.venueCount} venues</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{formatNumber(exchange.volume)}</div>
                        <div className="text-sm text-gray-400">Trust: {exchange.averageTrustScore}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Venues Tab */}
          <TabsContent value="venues" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Filters & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Search</label>
                    <Input
                      placeholder="Search exchanges or pairs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Market Type</label>
                    <Select value={filterMarketType} onValueChange={setFilterMarketType}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Types</SelectItem>
                        {filters.marketTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Exchange Type</label>
                    <Select value={filterExchangeType} onValueChange={setFilterExchangeType}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All</SelectItem>
                        {filters.exchangeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Trust Score</label>
                    <Select value={filterTrustScore} onValueChange={setFilterTrustScore}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Scores</SelectItem>
                        {filters.trustScores.map((score) => (
                          <SelectItem key={score} value={score}>
                            {score}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="spread">Spread</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Order</label>
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venues Table */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Venues ({filteredVenues.length})</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed view of all BONK trading venues with metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Rank</TableHead>
                        <TableHead className="text-gray-300">Exchange</TableHead>
                        <TableHead className="text-gray-300">Pair</TableHead>
                        <TableHead className="text-gray-300">Price</TableHead>
                        <TableHead className="text-gray-300">Spread</TableHead>
                        <TableHead className="text-gray-300">24h Volume</TableHead>
                        <TableHead className="text-gray-300">Vol %</TableHead>
                        <TableHead className="text-gray-300">Trust</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Updated</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVenues.map((venue) => (
                        <TableRow key={`${venue.exchange}-${venue.pair}`} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-gray-300">#{venue.rank}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{venue.exchange}</span>
                              <Badge className={`text-xs w-fit ${getExchangeTypeColor(venue.exchangeType)}`}>
                                {venue.exchangeType.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-white">{formatPairDisplay(venue.pair)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{venue.pair}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-white">{formatPrice(venue.price)}</TableCell>
                          <TableCell className="text-white">{formatPercentage(venue.spread)}</TableCell>
                          <TableCell className="text-white">{formatNumber(venue.volume24h)}</TableCell>
                          <TableCell className="text-white">{formatPercentage(venue.volumePercentage)}</TableCell>
                          <TableCell>
                            <Badge className={getTrustScoreColor(venue.trustScore)}>{venue.trustScore}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getMarketTypeColor(venue.marketType)}>{venue.marketType}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{formatDate(venue.lastUpdated)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                              onClick={() => window.open(venue.tradeUrl, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-gray-400 text-center">
                  Showing {filteredVenues.length} venues • Scroll to see more • Hover over pairs to see full details
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Market Depth Analysis</CardTitle>
                  <CardDescription className="text-gray-400">
                    +2% and -2% depth analysis for liquidity assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredVenues.slice(0, 6).map((venue) => (
                      <div key={`${venue.exchange}-${venue.pair}`} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{venue.exchange}</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm text-gray-400">{formatPairDisplay(venue.pair)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{venue.pair}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">+2% Depth</div>
                            <div className="text-green-400 font-semibold">
                              {formatNumber(venue.depth2Percent.positive)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">-2% Depth</div>
                            <div className="text-red-400 font-semibold">
                              {formatNumber(venue.depth2Percent.negative)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Bid: {formatPrice(venue.bidAsk.bid)} | Ask: {formatPrice(venue.bidAsk.ask)} | Spread:{" "}
                          {formatPercentage(venue.spread)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Volume Distribution</CardTitle>
                  <CardDescription className="text-gray-400">Top venues by trading volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredVenues.slice(0, 5).map((venue) => (
                      <div
                        key={`${venue.exchange}-${venue.pair}`}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-white">{venue.exchange}</div>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm text-gray-400">({formatPairDisplay(venue.pair)})</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{venue.pair}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-orange-400 font-semibold">{formatPercentage(venue.volumePercentage)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">High Trust</CardTitle>
                  <Shield className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{metadata.dataQuality.highTrust}</div>
                  <p className="text-xs text-gray-400">Venues</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Medium Trust</CardTitle>
                  <Shield className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{metadata.dataQuality.mediumTrust}</div>
                  <p className="text-xs text-gray-400">Venues</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Low Trust</CardTitle>
                  <Shield className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{metadata.dataQuality.lowTrust}</div>
                  <p className="text-xs text-gray-400">Venues</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Data Quality Issues</CardTitle>
                <CardDescription className="text-gray-400">Summary of data quality and filtering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-white">{metadata.totalPairs}</div>
                    <div className="text-sm text-gray-400">Total Pairs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{metadata.stalePairs}</div>
                    <div className="text-sm text-gray-400">Stale Pairs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{metadata.anomalyPairs}</div>
                    <div className="text-sm text-gray-400">Anomaly Pairs</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Note: Stale and anomaly pairs are automatically filtered out to ensure data quality. Only active,
                  reliable trading venues are displayed in the main analysis.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function EnhancedMarketsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-gray-700" />
          <Skeleton className="h-4 w-96 bg-gray-700" />
        </div>
        <Skeleton className="h-6 w-32 bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-16 bg-gray-700" />
              <Skeleton className="h-3 w-20 bg-gray-700" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-gray-700" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-full bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
