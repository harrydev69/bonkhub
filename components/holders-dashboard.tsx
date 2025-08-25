"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
  Search,
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

// Individual Holder Stats interface
interface IndividualHolderStats {
  amount: number;
  holder_category: string;
  avg_time_held: number;
  holding_breakdown: {
    diamond: number;
    gold: number;
    silver: number;
    bronze: number;
    wood: number;
  };
  unrealized_pnl: number;
  realized_pnl: number;
}

export function HoldersDashboard() {
  const [holdersData, setHoldersData] = useState<HoldersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [searchResult, setSearchResult] = useState<IndividualHolderStats | null>(null)
  const [searching, setSearching] = useState(false)




  const fetchHoldersData = async () => {
    try {
      setLoading(true)
      setError(null)
  

      const response = await fetch("/api/bonk/holders")

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. ${errorData.remainingRequests} requests remaining. Reset in ${Math.ceil(errorData.timeUntilReset / 1000)}s`)
        }
        throw new Error(`Failed to fetch holders data: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()
              setHoldersData(data)
      
    } catch (error: any) {
      console.error("Error fetching holders data:", error)
      setError(error.message)
      

      // Fallback data structure (simplified)
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

  const handleSearch = async () => {
    if (!searchAddress.trim()) return
    
    setSearching(true)
    setSearchResult(null)
    
    try {
      const response = await fetch(`/api/bonk/holders/individual/${searchAddress.trim()}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Search API Response:', data)
        if (data.success && data.data) {
          console.log('📊 Individual Holder Stats Data:', data.data)
          setSearchResult(data.data)
        } else {
          setError(data.error || 'Failed to fetch holder stats')
        }
      } else {
        setError('Failed to fetch holder stats')
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Search failed')
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    fetchHoldersData()
  }, [])



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
        {Array.from({ length: 5 }, (_, loadingIndex) => (
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

  

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">BONK Holders Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive analysis of BONK token holders, distribution, and trends</p>
        </div>

      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Holders</p>
                <p className="text-2xl font-bold text-white">{formatNumber(holdersData.overview?.total_holders)}</p>
                <p className="text-orange-400 text-sm">{holdersData.overview?.holder_percentage || 0}% of supply</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
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

        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Whale Concentration</p>
                <p className="text-2xl font-bold text-white">
                  {holdersData.breakdowns?.holders_over_10000_usd
                    ? (
                        (holdersData.breakdowns.holders_over_10000_usd / (holdersData.overview?.total_holders || 1)) *
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
                <p className="text-gray-400 text-sm">Gini Coefficient</p>
                <p className="text-2xl font-bold text-white">{holdersData.stats?.gini?.toFixed(3) || "0.920"}</p>
                <p className="text-orange-400 text-sm">Inequality Measure</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Redesigned Holder Changes Chart - Horizontal Bar Chart */}
        <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/30 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg">Holder Changes by Time Period</div>
                <div className="text-sm text-gray-400 font-normal">Net holder movement over time</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {holderChangeData.filter(d => d.change > 0).reduce((sum, d) => sum + d.change, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Total Gained</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">
                    {Math.abs(holderChangeData.filter(d => d.change < 0).reduce((sum, d) => sum + d.change, 0)).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Total Lost</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    holderChangeData.reduce((sum, d) => sum + d.change, 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holderChangeData.reduce((sum, d) => sum + d.change, 0) > 0 ? '+' : ''}
                    {holderChangeData.reduce((sum, d) => sum + d.change, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Net Change</div>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-3">
                {holderChangeData.map((entry, index) => {
                  const change = entry.change;
                  const isPositive = change > 0;
                  const isNegative = change < 0;
                  const isNeutral = change === 0;
                  const maxChange = Math.max(...holderChangeData.map(d => Math.abs(d.change)));
                  const barWidth = isNeutral ? 0 : (Math.abs(change) / maxChange) * 100;
                  
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300 min-w-[80px]">
                          {entry.period}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${
                            isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {isPositive ? '+' : ''}{change.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {isPositive ? '📈' : isNegative ? '📉' : '➡️'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
                        {/* Background track */}
                        <div className="absolute inset-0 bg-gray-700 rounded-full"></div>
                        
                        {/* Progress bar */}
                        {!isNeutral && (
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              isPositive 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-r from-red-500 to-pink-600'
                            }`}
                            style={{ 
                              width: `${barWidth}%`,
                              transform: isNegative ? 'translateX(100%)' : 'translateX(0)',
                              transformOrigin: isNegative ? 'right' : 'left'
                            }}
                          />
                        )}
                        
                        {/* Center line for negative values */}
                        {isNegative && (
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 transform -translate-x-1/2"></div>
                        )}
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Period Legend */}
              <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400">Gained</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-400">Lost</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-400">No Change</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redesigned Holder Categories Chart - Stacked Bar Chart */}
        <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/30 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg">Holder Categories Distribution</div>
                <div className="text-sm text-gray-400 font-normal">Community wealth tiers</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Total Holders Display */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-800/30">
                <div className="text-3xl font-bold text-blue-400">
                  {formatNumber(pieChartData.reduce((sum, item) => sum + item.value, 0))}
                </div>
                <div className="text-gray-300">Total Holders</div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                {pieChartData.map((entry, index) => {
                  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = ((entry.value / total) * 100).toFixed(1);
                  const barWidth = (entry.value / total) * 100;
                  
                  // Color mapping for each category
                  const getCategoryColor = (name: string) => {
                    switch (name.toLowerCase()) {
                      case 'shrimp': return 'from-red-500 to-red-600';
                      case 'crab': return 'from-orange-500 to-orange-600';
                      case 'fish': return 'from-blue-500 to-blue-600';
                      case 'dolphin': return 'from-purple-500 to-purple-600';
                      case 'whale': return 'from-cyan-500 to-cyan-600';
                      default: return 'from-gray-500 to-gray-600';
                    }
                  };

                  const getCategoryIcon = (name: string) => {
                    switch (name.toLowerCase()) {
                      case 'shrimp': return '🦐';
                      case 'crab': return '🦀';
                      case 'fish': return '🐟';
                      case 'dolphin': return '🐬';
                      case 'whale': return '🐋';
                      default: return '👤';
                    }
                  };

                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(entry.name)}</span>
                          <div>
                            <div className="font-semibold text-white">{entry.name}</div>
                            <div className="text-sm text-gray-400">
                              {formatNumber(entry.value)} holders
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-400">{percentage}%</div>
                          <div className="text-xs text-gray-500">of total</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gray-700 rounded-full"></div>
                        <div
                          className={`h-full bg-gradient-to-r ${getCategoryColor(entry.name)} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${barWidth}%` }}
                        />
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-full"></div>
                      </div>
                      
                      {/* Value indicator on bar */}
                      <div className="text-xs text-gray-400 mt-1 text-center">
                        {formatNumber(entry.value)} holders
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wealth Distribution Insight */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-300 mb-2">💡 Distribution Insight</div>
                <div className="text-xs text-gray-400">
                  {(() => {
                    const shrimp = pieChartData.find(d => d.name.toLowerCase() === 'shrimp')?.value || 0;
                    const whale = pieChartData.find(d => d.name.toLowerCase() === 'whale')?.value || 0;
                    const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
                    const shrimpPct = ((shrimp / total) * 100).toFixed(1);
                    const whalePct = ((whale / total) * 100).toFixed(1);
                    
                    if (parseFloat(shrimpPct) > 70) {
                      return `This token has a very broad base with ${shrimpPct}% small holders, indicating strong community adoption.`;
                    } else if (parseFloat(whalePct) > 10) {
                      return `Concentrated ownership with ${whalePct}% held by whales, suggesting institutional interest.`;
                    } else {
                      return 'Balanced distribution across all holder categories, showing healthy token economics.';
                    }
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holder Breakdowns by Value */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            Holder Breakdowns by Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(holdersData.breakdowns?.holders_over_10_usd)}
              </div>
              <div className="text-gray-400 text-sm">Over $10</div>
              <div className="text-orange-400 text-xs">
                {(
                  (holdersData.breakdowns?.holders_over_10_usd || 0) / (holdersData.breakdowns?.total_holders || 1) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(holdersData.breakdowns?.holders_over_100_usd)}
              </div>
              <div className="text-gray-400 text-sm">Over $100</div>
              <div className="text-orange-400 text-xs">
                {(
                  (holdersData.breakdowns?.holders_over_100_usd || 0) / (holdersData.breakdowns?.total_holders || 1) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(holdersData.breakdowns?.holders_over_1000_usd)}
              </div>
              <div className="text-gray-400 text-sm">Over $1K</div>
              <div className="text-orange-400 text-xs">
                {(
                  (holdersData.breakdowns?.holders_over_1000_usd || 0) / (holdersData.breakdowns?.total_holders || 1) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(holdersData.breakdowns?.holders_over_10000_usd)}
              </div>
              <div className="text-gray-400 text-sm">Over $10K</div>
              <div className="text-orange-400 text-xs">
                {(
                  (holdersData.breakdowns?.holders_over_10000_usd || 0) / (holdersData.breakdowns?.total_holders || 1) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(holdersData.breakdowns?.holders_over_100k_usd)}
              </div>
              <div className="text-gray-400 text-sm">Over $100K</div>
              <div className="text-orange-400 text-xs">
                {(
                  (holdersData.breakdowns?.holders_over_100k_usd || 0) / (holdersData.breakdowns?.total_holders || 1) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(holdersData.breakdowns?.holders_over_1m_usd)}
              </div>
              <div className="text-gray-400 text-sm">Over $1M</div>
              <div className="text-orange-400 text-xs">
                {(
                  (holdersData.breakdowns?.holders_over_1m_usd || 0) / (holdersData.breakdowns?.total_holders || 1) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-white">
              {holdersData.stats?.median_holder_position || 0}
            </div>
            <div className="text-gray-400 text-sm">Median Position</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-white">
              {holdersData.stats?.retention_rate
                ? `${(holdersData.stats.retention_rate * 100).toFixed(1)}%`
                : "Available Soon"}
            </div>
            <div className="text-gray-400 text-sm">Retention Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-white">
              {holdersData.pnlStats?.unrealized_pnl_total
                ? holdersData.pnlStats.unrealized_pnl_total > 0
                  ? "Profitable"
                  : "Loss"
                : "Available Soon"}
            </div>
            <div className="text-gray-400 text-sm">PnL Status</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-white">
              {holdersData.walletCategories?.new_holders ? holdersData.walletCategories.new_holders : "Available Soon"}
            </div>
            <div className="text-gray-400 text-sm">New Holders</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced PnL & Wallet Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PnL Statistics */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Profit & Loss Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-green-400">
                    {holdersData.pnlStats?.realized_pnl_total
                      ? formatCurrency(holdersData.pnlStats.realized_pnl_total)
                      : "Available Soon"}
                  </div>
                  <div className="text-gray-400 text-sm">Realized PnL</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className={`text-lg font-bold ${
                    holdersData.pnlStats?.unrealized_pnl_total
                      ? holdersData.pnlStats.unrealized_pnl_total > 0
                        ? 'text-green-400'
                        : 'text-gray-400'
                      : 'text-gray-400'
                  }`}>
                    {holdersData.pnlStats?.unrealized_pnl_total
                      ? formatCurrency(holdersData.pnlStats.unrealized_pnl_total)
                      : "Available Soon"}
                  </div>
                  <div className="text-gray-400 text-sm">Unrealized PnL</div>
                </div>
              </div>
              
              {holdersData.pnlStats?.break_even_price && (
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">
                    ${holdersData.pnlStats.break_even_price.toFixed(6)}
                  </div>
                  <div className="text-gray-400 text-sm">Break-even Price</div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-center">
                PnL data denominated in USD
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Categories */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Holder Wealth Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(holdersData.walletCategories || {}).map(([category, count]) => {
                if (category === 'new_holders') return null; // Skip, already shown above
                
                const getCategoryColor = (cat: string) => {
                  switch (cat) {
                    case 'diamond': return 'text-red-400';
                    case 'gold': return 'text-yellow-400';
                    case 'silver': return 'text-gray-400';
                    case 'bronze': return 'text-orange-400';
                    case 'wood': return 'text-amber-600';
                    default: return 'text-blue-400';
                  }
                };

                const getCategoryIcon = (cat: string) => {
                  switch (cat) {
                    case 'diamond': return '💎';
                    case 'gold': return '🥇';
                    case 'silver': return '🥈';
                    case 'bronze': return '🥉';
                    case 'wood': return '🪵';
                    default: return '👤';
                  }
                };

                return (
                  <div key={category} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(category)}</span>
                      <span className="text-white capitalize">{category}</span>
                    </div>
                    <span className={`font-bold ${getCategoryColor(category)}`}>
                      {count && count > 0 ? formatNumber(count) : "Available Soon"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supply Breakdown Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Supply Distribution by Holder Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Supply Display */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-800/30">
              <div className="text-2xl font-bold text-blue-400">
                {formatTokenAmount(
                  Object.values(holdersData.supplyBreakdown || {}).reduce((sum, amount) => sum + (amount || 0), 0)
                )}
              </div>
              <div className="text-gray-300">Total Supply in Top 1000 Wallets</div>
            </div>

            {/* Supply Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(holdersData.supplyBreakdown || {}).map(([category, amount]) => {
                const totalSupply = Object.values(holdersData.supplyBreakdown || {}).reduce((sum, a) => sum + (a || 0), 0);
                const percentage = ((amount || 0) / totalSupply * 100).toFixed(1);
                
                const getCategoryColor = (cat: string) => {
                  switch (cat) {
                    case 'diamond': return 'from-red-500 to-red-600';
                    case 'gold': return 'from-yellow-500 to-yellow-600';
                    case 'silver': return 'from-gray-500 to-gray-600';
                    case 'bronze': return 'from-orange-500 to-orange-600';
                    case 'wood': return 'from-amber-600 to-amber-700';
                    default: return 'from-blue-500 to-blue-600';
                  }
                };

                const getCategoryIcon = (cat: string) => {
                  switch (cat) {
                    case 'diamond': return '💎';
                    case 'gold': return '🥇';
                    case 'silver': return '🥈';
                    case 'bronze': return '🥉';
                    case 'wood': return '🪵';
                    default: return '📊';
                  }
                };

                return (
                  <div key={category} className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
                    <div className="text-lg font-bold text-white capitalize mb-1">{category}</div>
                    <div className="text-blue-400 font-semibold mb-1">
                      {amount && amount > 0 ? formatTokenAmount(amount) : "Available Soon"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {amount && amount > 0 ? `${percentage}%` : "N/A"}
                    </div>
                    
                    {/* Progress bar */}
                    {amount && amount > 0 ? (
                      <div className="mt-3 relative h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getCategoryColor(category)} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    ) : (
                      <div className="mt-3 h-2 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">No data</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Supply Insight */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-300 mb-2">💡 Supply Distribution Insight</div>
              <div className="text-xs text-gray-400">
                {(() => {
                  const diamond = holdersData.supplyBreakdown?.diamond || 0;
                  const wood = holdersData.supplyBreakdown?.wood || 0;
                  const total = Object.values(holdersData.supplyBreakdown || {}).reduce((sum, amount) => sum + (amount || 0), 0);
                  const diamondPct = ((diamond / total) * 100).toFixed(1);
                  const woodPct = ((wood / total) * 100).toFixed(1);
                  
                  if (parseFloat(diamondPct) > 50) {
                    return `High concentration in diamond tier (${diamondPct}%), indicating significant whale accumulation.`;
                  } else if (parseFloat(woodPct) > 30) {
                    return `Broad distribution with ${woodPct}% in wood tier, showing healthy retail participation.`;
                  } else {
                    return 'Balanced supply distribution across all tiers, suggesting stable token economics.';
                  }
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Holder Search Section */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Individual Holder Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter BONK Wallet Address
              </label>
              <input
                type="text"
                placeholder="e.g., DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!searchAddress.trim() || searching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {/* Search Results */}
          {searchResult && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">
                    {searchResult.holder_category?.charAt(0).toUpperCase() + searchResult.holder_category?.slice(1) || 'N/A'}
                  </div>
                  <div className="text-gray-400 text-sm">Holder Category</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className={`text-lg font-bold ${
                    searchResult.unrealized_pnl !== null && searchResult.unrealized_pnl !== undefined
                      ? searchResult.unrealized_pnl > 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                      : 'text-gray-400'
                  }`}>
                    {searchResult.unrealized_pnl !== null && searchResult.unrealized_pnl !== undefined
                      ? `$${searchResult.unrealized_pnl.toFixed(2)}`
                      : 'Not Available'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Unrealized PnL</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-green-400">
                    {searchResult.realized_pnl !== null && searchResult.realized_pnl !== undefined
                      ? `$${searchResult.realized_pnl.toFixed(2)}`
                      : 'Not Available'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Realized PnL</div>
                </div>
              </div>
              
              {/* Holding Breakdown */}
              <div className="mt-4">
                <h4 className="text-white font-medium mb-3">Holding Breakdown</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(searchResult.holding_breakdown || {}).map(([tier, amount]) => (
                    <div key={tier} className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-sm font-bold text-white capitalize">{tier}</div>
                      <div className="text-xs text-gray-400">{formatTokenAmount(amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Data Availability Note */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-blue-400 text-xs">
                  ℹ️ Some PnL data may show "Not Available" if this information isn't currently available for the specific wallet address.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Holders Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Top Holders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-400">Rank</th>
                  <th className="text-left py-3 text-gray-400">Address</th>
                  <th className="text-left py-3 text-gray-400">Amount</th>
                  <th className="text-left py-3 text-gray-400">USD Value</th>
                  <th className="text-left py-3 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdersData.topHolders?.holders && holdersData.topHolders.holders.length > 0 ? (
                  holdersData.topHolders.holders.slice(0, 50).map((holder, holderIndex) => (
                    <tr key={holderIndex} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 text-white">#{holder.rank}</td>
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
                                          <td className="py-3 text-white">{formatTokenAmount(holder.amount)}</td>
                    <td className="py-3 text-green-400">${((holder.amount * 0.000021) / 1e5).toFixed(2)}</td>
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
                                      <td colSpan={5} className="py-8 text-center text-gray-400">
                    No holders data available
                  </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-400 text-center">
            Showing top 50 of {holdersData.topHolders?.holder_count?.toLocaleString() || "0"} holders
          </div>
        </CardContent>
      </Card>
      
              {/* Subtle Data Availability Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 px-3 py-2 rounded-lg">
            <span>ℹ️</span>
            <span>Some metrics show "Available Soon" - data will appear as coverage expands</span>
          </div>
        </div>
    </div>
  )
}
