"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell as PieCell,
} from "recharts"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  Info,
} from "lucide-react"

interface HoldersData {
  overview: {
    total_holders: number
    unique_wallets: number
    holder_percentage: number
    last_updated: string
  }
  breakdowns: {
    total_holders: number
    holders_over_10_usd: number
    holders_over_50_usd: number
    holders_over_100_usd: number
    holders_over_250_usd: number
    holders_over_500_usd: number
    holders_over_1000_usd: number
    holders_over_10000_usd: number
    holders_over_100k_usd: number
    holders_over_1m_usd: number
    categories: {
      shrimp: number
      crab: number
      fish: number
      dolphin: number
      whale: number
    }
    market_cap_per_holder?: {
      all_holders: number
      over_10: number
      over_100: number
      over_1000: number
      over_10000: number
      over_100k: number
      over_1m: number
    }
  }
  deltas: {
    "1hour": number
    "2hours": number
    "4hours": number
    "12hours": number
    "1day": number
    "3days": number
    "7days": number
    "14days": number
    "30days": number
  }
  stats: {
    hhi: number
    gini: number
    median_holder_position: number
    avg_time_held: number | null
    retention_rate: number | null
    distribution_score?: number
    top_holder_percentage?: number
    top10_percentage?: number
    top25_percentage?: number
    top50_percentage?: number
    top100_percentage?: number
    top250_percentage?: number
    top500_percentage?: number
    top1000_percentage?: number
  }
  pnlStats: {
    break_even_price: number | null
    realized_pnl_total: number
    unrealized_pnl_total: number
  }
  walletCategories: {
    diamond: number
    gold: number
    silver: number
    bronze: number
    wood: number
    new_holders: number
  }
  supplyBreakdown: {
    diamond: number
    gold: number
    silver: number
    bronze: number
    wood: number
  }
  topHolders: {
    holder_count: number
    total: number
    holders: Array<{
      address: string
      spl_token_account: string
      amount: number
      rank: number
    }>
  }
  cexHoldings: Array<{
    exchange: string
    amount: string
    usd_value: string
    wallets: number
  }>
}

export function HoldersDashboard() {
  const [holdersData, setHoldersData] = useState<HoldersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddresses, setShowAddresses] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchHoldersData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/bonk/holders")

      if (!response.ok) {
        throw new Error(`Failed to fetch holders data: ${response.status}`)
      }

      const data = await response.json()
      setHoldersData(data)
      setLastRefresh(new Date())
    } catch (error: any) {
      console.error("Error fetching holders data:", error)
      setError(error.message)

      const fallbackData: HoldersData = {
        overview: {
          total_holders: 976099,
          unique_wallets: 976099,
          holder_percentage: 50.93,
          last_updated: new Date().toISOString(),
        },
        breakdowns: {
          total_holders: 976099,
          holders_over_10_usd: 485000,
          holders_over_50_usd: 245000,
          holders_over_100_usd: 156000,
          holders_over_250_usd: 89000,
          holders_over_500_usd: 52000,
          holders_over_1000_usd: 28000,
          holders_over_10000_usd: 5100,
          holders_over_100k_usd: 890,
          holders_over_1m_usd: 125,
          categories: {
            shrimp: 750000,
            crab: 180000,
            fish: 35000,
            dolphin: 8500,
            whale: 2599,
          },
          market_cap_per_holder: {
            all_holders: 1750,
            over_10: 3520,
            over_100: 10950,
            over_1000: 61250,
            over_10000: 335800,
            over_100k: 1920000,
            over_1m: 13680000,
          },
        },
        deltas: {
          "1hour": -12,
          "2hours": -28,
          "4hours": -138,
          "12hours": -216,
          "1day": -1394,
          "3days": -1039,
          "7days": -129,
          "14days": 2450,
          "30days": 8920,
        },
        stats: {
          hhi: 0.158,
          gini: 0.92,
          median_holder_position: 46,
          avg_time_held: null,
          retention_rate: null,
          distribution_score: 0.29,
          top_holder_percentage: 7.53,
          top10_percentage: 29.55,
          top25_percentage: 39.68,
          top50_percentage: 48.56,
          top100_percentage: 61.62,
          top250_percentage: 77.06,
          top500_percentage: 82.2,
          top1000_percentage: 84.45,
        },
        pnlStats: {
          break_even_price: null,
          realized_pnl_total: 0,
          unrealized_pnl_total: 0,
        },
        walletCategories: {
          diamond: 125,
          gold: 890,
          silver: 5100,
          bronze: 28000,
          wood: 52000,
          new_holders: 15000,
        },
        supplyBreakdown: {
          diamond: 15.5e12,
          gold: 12.8e12,
          silver: 18.2e12,
          bronze: 20.1e12,
          wood: 10.8e12,
        },
        topHolders: {
          holder_count: 976099,
          total: 976099,
          holders: [
            {
              address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
              spl_token_account: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
              amount: 5.85e15,
              rank: 1,
            },
            {
              address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
              spl_token_account: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
              amount: 3.2e15,
              rank: 2,
            },
            {
              address: "36c739D3eC6E685Fd3c8BEA4dcaBF192c5c2F4b2",
              spl_token_account: "36c739D3eC6E685Fd3c8BEA4dcaBF192c5c2F4b2",
              amount: 2.8e15,
              rank: 3,
            },
            {
              address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
              spl_token_account: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
              amount: 2.1e15,
              rank: 4,
            },
            {
              address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
              spl_token_account: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
              amount: 1.9e15,
              rank: 5,
            },
          ],
        },
        cexHoldings: [
          { exchange: "Binance", amount: "12.50M", usd_value: "$2.85M", wallets: 2 },
          { exchange: "Coinbase", amount: "8.75M", usd_value: "$1.99M", wallets: 2 },
          { exchange: "Kraken", amount: "6.20M", usd_value: "$1.41M", wallets: 1 },
          { exchange: "Bybit", amount: "4.80M", usd_value: "$1.09M", wallets: 2 },
          { exchange: "OKX", amount: "3.90M", usd_value: "$888.30K", wallets: 1 },
          { exchange: "Gate.io", amount: "2.85M", usd_value: "$649.35K", wallets: 1 },
          { exchange: "KuCoin", amount: "2.10M", usd_value: "$478.80K", wallets: 1 },
          { exchange: "Huobi", amount: "1.75M", usd_value: "$398.75K", wallets: 1 },
          { exchange: "Bitget", amount: "1.25M", usd_value: "$284.38K", wallets: 1 },
          { exchange: "MEXC", amount: "950.00K", usd_value: "$216.63K", wallets: 1 },
        ],
      }

      setHoldersData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  useEffect(() => {
    fetchHoldersData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
        {Array.from({ length: 4 }, (_, loadingIndex) => (
          <Card key={loadingIndex} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-800 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error loading holders data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchHoldersData} className="bg-orange-600 hover:bg-orange-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!holdersData) {
    return <div className="text-center text-gray-400">No holders data available</div>
  }

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return "$0"
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toLocaleString()}`
  }

  const formatTokenAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0"
    if (amount >= 1000000000000) return `${(amount / 1000000000000).toFixed(2)}T`
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(2)}B`
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`
    return amount.toLocaleString()
  }

  const holderChangeData = Object.entries(holdersData.deltas || {}).map(([period, change]) => ({
    period: period.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
    change: change || 0,
    color: (change || 0) > 0 ? "#ff6b35" : (change || 0) < 0 ? "#ef4444" : "#6b7280",
  }))

  const pieChartData = Object.entries(holdersData.breakdowns?.categories || {}).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count || 0,
    color:
      category === "shrimp"
        ? "#ef4444"
        : category === "crab"
          ? "#f97316"
          : category === "fish"
            ? "#3b82f6"
            : category === "dolphin"
              ? "#8b5cf6"
              : "#ff6b35",
  }))

  const walletCategoryData = Object.entries(holdersData.walletCategories || {}).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1).replace("_", " "),
    count: count || 0,
    color:
      category === "diamond"
        ? "#b91c1c"
        : category === "gold"
          ? "#f59e0b"
          : category === "silver"
            ? "#6b7280"
            : category === "bronze"
              ? "#d97706"
              : category === "wood"
                ? "#8b4513"
                : "#ff6b35",
  }))

  const supplyBreakdownData = Object.entries(holdersData.supplyBreakdown || {}).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: (amount || 0) / 1e12, // Convert to T
    color:
      category === "diamond"
        ? "#b91c1c"
        : category === "gold"
          ? "#f59e0b"
          : category === "silver"
            ? "#6b7280"
            : category === "bronze"
              ? "#d97706"
              : category === "wood"
                ? "#8b4513"
                : "#ff6b35",
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">BONK Holders Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive analysis of BONK token holders, distribution, and trends</p>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>Updated: {new Date(holdersData.overview.last_updated).toLocaleDateString()}</div>
          <div>Last Refresh: {lastRefresh.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Holders</p>
                <p className="text-2xl font-bold text-white">{formatNumber(holdersData.overview.total_holders)}</p>
                <p className="text-orange-400 text-sm">{holdersData.overview.holder_percentage}% of supply</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Wallets</p>
                <p className="text-2xl font-bold text-white">{formatNumber(1916374)}</p>
                <p className="text-orange-400 text-sm">Active addresses</p>
              </div>
              <Wallet className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Whale Concentration</p>
                <p className="text-2xl font-bold text-white">
                  {holdersData.breakdowns?.holders_over_10000_usd
                    ? (
                        (holdersData.breakdowns.holders_over_10000_usd / (holdersData.overview.total_holders || 1)) *
                        100
                      ).toFixed(2)
                    : "0.52"}
                  %
                </p>
                <p className="text-orange-400 text-sm">Holders {">$10K"}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Distribution Health</p>
                <p className="text-2xl font-bold text-white">
                  {holdersData.stats?.hhi
                    ? holdersData.stats.hhi < 0.25
                      ? "Healthy"
                      : holdersData.stats.hhi < 0.5
                        ? "Moderate"
                        : "Concentrated"
                    : "Healthy"}
                </p>
                <p className="text-orange-400 text-sm">HHI: {holdersData.stats?.hhi?.toFixed(3) || "0.158"}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-orange-600">
            Distribution
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-orange-600">
            Trends
          </TabsTrigger>
          <TabsTrigger value="top-holders" className="data-[state=active]:bg-orange-600">
            Top Holders
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holder Changes Chart */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Holder Changes by Time Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={holderChangeData}>
                      <XAxis dataKey="period" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                        labelStyle={{ color: "#f3f4f6" }}
                      />
                      {holderChangeData.map((entry, barIndex) => (
                        <Bar key={barIndex} dataKey="change" fill={entry.color} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  CEX Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {holdersData.cexHoldings.slice(0, 6).map((exchange, exchangeIndex) => (
                    <div
                      key={exchangeIndex}
                      className="flex justify-between items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {exchange.exchange.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{exchange.exchange}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{exchange.amount}</div>
                        <div className="text-gray-400 text-sm">{exchange.usd_value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-500" />
                Holder Breakdowns by Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(holdersData.breakdowns.holders_over_10_usd)}
                  </div>
                  <div className="text-gray-400 text-sm">Over $10</div>
                  <div className="text-orange-400 text-xs">
                    {(
                      (holdersData.breakdowns.holders_over_10_usd / holdersData.breakdowns.total_holders) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(holdersData.breakdowns.holders_over_100_usd)}
                  </div>
                  <div className="text-gray-400 text-sm">Over $100</div>
                  <div className="text-orange-400 text-xs">
                    {(
                      (holdersData.breakdowns.holders_over_100_usd / holdersData.breakdowns.total_holders) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(holdersData.breakdowns.holders_over_1000_usd)}
                  </div>
                  <div className="text-gray-400 text-sm">Over $1K</div>
                  <div className="text-orange-400 text-xs">
                    {(
                      (holdersData.breakdowns.holders_over_1000_usd / holdersData.breakdowns.total_holders) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(holdersData.breakdowns.holders_over_10000_usd)}
                  </div>
                  <div className="text-gray-400 text-sm">Over $10K</div>
                  <div className="text-orange-400 text-xs">
                    {(
                      (holdersData.breakdowns.holders_over_10000_usd / holdersData.breakdowns.total_holders) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(holdersData.breakdowns.holders_over_100k_usd)}
                  </div>
                  <div className="text-gray-400 text-sm">Over $100K</div>
                  <div className="text-orange-400 text-xs">
                    {(
                      (holdersData.breakdowns.holders_over_100k_usd / holdersData.breakdowns.total_holders) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holder Categories Pie Chart */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-500" />
                  Holder Categories Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, pieIndex) => (
                          <PieCell key={`cell-${pieIndex}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Wallet Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={walletCategoryData}>
                      <XAxis dataKey="category" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                        labelStyle={{ color: "#f3f4f6" }}
                      />
                      {walletCategoryData.map((entry, walletIndex) => (
                        <Bar key={walletIndex} dataKey="count" fill={entry.color} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white">
                  {holdersData.stats.distribution_score?.toFixed(2) || "N/A"}
                </div>
                <div className="text-gray-400 text-sm">Distribution Score</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white">{holdersData.stats.hhi.toFixed(3)}</div>
                <div className="text-gray-400 text-sm">HHI Index</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white">{holdersData.stats.gini.toFixed(3)}</div>
                <div className="text-gray-400 text-sm">Gini Coefficient</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white">#{holdersData.stats.median_holder_position}</div>
                <div className="text-gray-400 text-sm">Median Position</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Holder Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {holdersData.stats.top_holder_percentage?.toFixed(2)}%
                  </div>
                  <div className="text-gray-400 text-sm">Top Holder</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">{holdersData.stats.top10_percentage?.toFixed(2)}%</div>
                  <div className="text-gray-400 text-sm">Top 10</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">{holdersData.stats.top100_percentage?.toFixed(2)}%</div>
                  <div className="text-gray-400 text-sm">Top 100</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {holdersData.stats.top1000_percentage?.toFixed(2)}%
                  </div>
                  <div className="text-gray-400 text-sm">Top 1000</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Holder Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(holdersData.deltas || {}).map(([period, change]) => (
                  <div
                    key={period}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-300">
                      {period.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${(change || 0) > 0 ? "text-green-400" : (change || 0) < 0 ? "text-red-400" : "text-gray-400"}`}
                      >
                        {(change || 0) > 0 ? "+" : ""}
                        {change || 0}
                      </span>
                      {(change || 0) > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (change || 0) < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Token Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">{holdersData.stats.hhi.toFixed(3)}</div>
                  <div className="text-gray-400 text-sm">HHI</div>
                  <div className="text-orange-400 text-xs">Concentration</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">{holdersData.stats.gini.toFixed(3)}</div>
                  <div className="text-gray-400 text-sm">Gini</div>
                  <div className="text-orange-400 text-xs">Inequality</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {holdersData.stats.median_holder_position.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Median</div>
                  <div className="text-orange-400 text-xs">Position</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {holdersData.stats.retention_rate
                      ? `${(holdersData.stats.retention_rate * 100).toFixed(1)}%`
                      : "N/A"}
                  </div>
                  <div className="text-gray-400 text-sm">Retention</div>
                  <div className="text-orange-400 text-xs">Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Holders Tab */}
        <TabsContent value="top-holders" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Top Holders</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddresses(!showAddresses)}
                  className="border-gray-700 hover:border-orange-500"
                >
                  {showAddresses ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showAddresses ? "Hide" : "Show"} Addresses
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 text-gray-400">Rank</th>
                      {showAddresses && <th className="text-left py-3 text-gray-400">Address</th>}
                      <th className="text-left py-3 text-gray-400">Amount</th>
                      <th className="text-left py-3 text-gray-400">USD Value</th>
                      <th className="text-left py-3 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdersData.topHolders?.holders && holdersData.topHolders.holders.length > 0 ? (
                      holdersData.topHolders.holders.slice(0, 20).map((holder, holderIndex) => (
                        <tr key={holderIndex} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 text-white">#{holder.rank}</td>
                          {showAddresses && (
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 font-mono text-sm">
                                  {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(holder.address)}
                                  className="h-6 w-6 p-0 hover:bg-orange-500/20"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          )}
                          <td className="py-3 text-white">{formatTokenAmount(holder.amount)}</td>
                          <td className="py-3 text-green-400">${((holder.amount * 0.000021) / 1e9).toFixed(2)}</td>
                          <td className="py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://solscan.io/account/${holder.address}`, "_blank")}
                              className="h-6 w-6 p-0 hover:bg-orange-500/20"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={showAddresses ? 5 : 4} className="py-8 text-center text-gray-400">
                          No holders data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-400 text-center">
                Showing top 20 of {holdersData.topHolders?.holder_count?.toLocaleString() || "0"} holders
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
