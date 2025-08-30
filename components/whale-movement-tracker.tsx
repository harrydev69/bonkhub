"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Download, TrendingUp, AlertCircle } from "lucide-react"

interface WhaleTransaction {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
  to: string;
  type: 'buy' | 'sell' | 'transfer';
  usdValue: number;
  priceImpact: number;
  exchange?: string;
}

interface WhaleWallet {
  address: string;
  balance: number;
  balanceUSD: number;
  transactionCount: number;
  lastActivity: number;
  isActive: boolean;
  category: 'mega_whale' | 'whale' | 'large_holder';
}

interface WhaleData {
  whaleTransactions: WhaleTransaction[];
  whaleWallets: WhaleWallet[];
  marketData: {
    price: number;
    volume24h: number;
    marketCap: number;
    priceChange24h: number;
    rank: number | null;
  };
  analytics: {
    totalWhaleTransactions: number;
    totalWhaleVolume: number;
    averageWhaleTransaction: number;
    whaleNetFlow: number;
    accumulationPhase: boolean;
    whaleCount: number;
    activeWhales24h: number;
  };
  dexData: {
    totalPairs: number;
    totalLiquidity: number;
    whaleActivity: {
      totalVolume24h: number;
      largeTransactions: number;
      averageTransactionSize: number;
      topExchanges: Array<{
        name: string;
        volume: number;
        percentage: number;
      }>;
    };
  };
  metadata: {
    lastUpdated: string;
    dataSource: string;
    whaleThreshold: string;
  };
}

export function WhaleMovementTracker() {
  const [filter, setFilter] = useState("all")
  const [whaleData, setWhaleData] = useState<WhaleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch whale data from our new API
  const fetchWhaleData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/bonk/whales', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setWhaleData(result.data)
        setLastRefresh(new Date())
        console.log('🐋 Whale data updated:', result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch whale data')
      }
    } catch (err) {
      console.error('Error fetching whale data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch whale data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchWhaleData()
  }

  // Initial load and auto-refresh
  useEffect(() => {
    fetchWhaleData()
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchWhaleData, 120000)
    
    return () => clearInterval(interval)
  }, [])

  // Mock data fallback (keeping some of the original structure for fallback)
  const mockWhaleTransactions = [
    {
      type: "sell",
      impact: "high",
      wallet: "5cMy...pw00",
      exchange: "Orca",
      time: "8/24/2025, 5:56:18 PM",
      usdValue: "$1071K",
      bonkAmount: "48.5B BONK",
      priceImpact: "+3.28%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "3dFw...d5uf",
      exchange: "Binance",
      time: "8/24/2025, 12:56:18 PM",
      usdValue: "$979K",
      bonkAmount: "44.3B BONK",
      priceImpact: "-3.42%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "5cMy...ub5x",
      exchange: "OKX",
      time: "8/24/2025, 2:56:18 AM",
      usdValue: "$971K",
      bonkAmount: "44.0B BONK",
      priceImpact: "+0.24%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "4vBz...bpib",
      exchange: "Orca",
      time: "8/24/2025, 6:56:18 PM",
      usdValue: "$961K",
      bonkAmount: "43.5B BONK",
      priceImpact: "-4.39%",
    },
    {
      type: "transfer",
      impact: "high",
      wallet: "4vBz...g9ko",
      exchange: "Direct Transfer",
      time: "8/24/2025, 6:56:18 PM",
      usdValue: "$953K",
      bonkAmount: "43.1B BONK",
      priceImpact: "+4.06%",
    },
    {
      type: "sell",
      impact: "high",
      wallet: "3dFw...iz6d",
      exchange: "Orca",
      time: "8/23/2025, 10:56:18 PM",
      usdValue: "$929K",
      bonkAmount: "42.0B BONK",
      priceImpact: "-1.06%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "3dFw...boqt",
      exchange: "Binance",
      time: "8/24/2025, 4:56:18 PM",
      usdValue: "$894K",
      bonkAmount: "40.5B BONK",
      priceImpact: "+0.98%",
    },
    {
      type: "sell",
      impact: "high",
      wallet: "8kLp...yzj4",
      exchange: "Jupiter",
      time: "8/24/2025, 6:56:18 AM",
      usdValue: "$661K",
      bonkAmount: "29.9B BONK",
      priceImpact: "-1.57%",
    },
    {
      type: "transfer",
      impact: "high",
      wallet: "5cMy...ket7",
      exchange: "Direct Transfer",
      time: "8/24/2025, 11:56:18 AM",
      usdValue: "$565K",
      bonkAmount: "25.6B BONK",
      priceImpact: "-3.12%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "5cMy...vdsb",
      exchange: "OKX",
      time: "8/24/2025, 4:56:18 PM",
      usdValue: "$492K",
      bonkAmount: "22.3B BONK",
      priceImpact: "-1.74%",
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case "sell":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return "border-green-500 text-green-400"
      case "sell":
        return "border-red-500 text-red-400"
      case "transfer":
        return "border-blue-500 text-blue-400"
      default:
        return "border-gray-500 text-gray-400"
    }
  }

  // Helper functions for real data
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000
    const diff = now - timestamp
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  // Use real data or fallback to mock data
  const displayTransactions = whaleData?.whaleTransactions || mockWhaleTransactions.slice(0, 10)
  const analytics = whaleData?.analytics
  const marketData = whaleData?.marketData
  const dexData = whaleData?.dexData

  // Loading state
  if (loading) {
    return (
      <Card className="group bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#ff6b35] text-2xl font-bold flex items-center gap-2">
              <span className="text-orange-500">🐋</span>
              Whale Movement Tracker
            </CardTitle>
            <p className="text-gray-400 text-sm">Loading real-time whale data from Solana blockchain...</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-4 bg-gray-800/50 rounded-lg">
                <Skeleton className="h-8 w-16 mx-auto mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-20 mx-auto bg-gray-700" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-gray-800/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="group bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#ff6b35] text-2xl font-bold flex items-center gap-2">
            <span className="text-orange-500">🐋</span>
            Whale Movement Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-400 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading whale data: {error}</span>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[#ff6b35] text-2xl font-bold flex items-center gap-2 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
            <span className="text-orange-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 group-hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.6)]">🐋</span>
            Live Whale Movement Tracker
          </CardTitle>
          <p className="text-gray-400 text-sm transition-all duration-500 group-hover:text-gray-300">
            {whaleData ? 'Real-time BONK whale activity from Solana blockchain' : 'Monitor large BONK transactions and their market impact'}
          </p>
        </div>

      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group/item text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-orange-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
              ${marketData ? formatNumber(marketData.volume24h) : '9.6M'}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Total Volume</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">24 Hours</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-green-500/10 to-green-400/5 rounded-lg border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-green-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">
              {analytics ? analytics.whaleCount : '4'}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Active Whales</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-blue-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]">
              {analytics ? analytics.totalWhaleTransactions : '13'}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Whale Transactions</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-400/5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-purple-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]">
              ${analytics ? formatNumber(analytics.averageWhaleTransaction) : '639K'}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Avg Transaction</div>
          </div>
        </div>

        {/* Net Whale Flow */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 hover:scale-105 hover:shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-500 transform-gpu group/flow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white transition-all duration-500 group-hover/flow:text-green-300 group-hover/flow:drop-shadow-[0_0_2px_rgba(34,197,94,0.4)]">Net Whale Flow</h3>
            <Badge variant="outline" className={`transition-all duration-500 group-hover/flow:scale-110 group-hover/flow:shadow-[0_0_4px_rgba(34,197,94,0.5)] ${
              analytics?.accumulationPhase ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1 transition-all duration-500 group-hover/flow:rotate-2" />
              {analytics?.accumulationPhase ? 'Accumulation' : 'Distribution'}
            </Badge>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold transition-all duration-500 group-hover/flow:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)] ${
              analytics?.whaleNetFlow && analytics.whaleNetFlow > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics?.whaleNetFlow ? 
                `${analytics.whaleNetFlow > 0 ? '+' : ''}$${formatNumber(analytics.whaleNetFlow)}` : 
                '+$1.8M'
              }
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/flow:text-gray-300">
              {analytics?.accumulationPhase ? 'Net inflow indicates accumulation' : 'Net outflow indicates distribution'}
            </div>
          </div>
        </div>

        {/* Recent Whale Transactions */}
        <div className="space-y-4 group/transactions">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white transition-all duration-500 group-hover/transactions:text-orange-400 group-hover/transactions:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">
              {whaleData ? 'Live Whale Transactions' : 'Recent Large Transactions'}
            </h3>

          </div>

          <div className="space-y-2">
            {displayTransactions.slice(0, 10).map((tx, index) => {
              // Handle both real data and mock data structure
              const isRealData = 'signature' in tx;
              const transactionType = isRealData ? tx.type : tx.type;
              const wallet = isRealData ? formatAddress(tx.from) : tx.wallet;
              const exchange = isRealData ? (tx.exchange || 'Solana DEX') : tx.exchange;
              const usdValue = isRealData ? `$${formatNumber(tx.usdValue)}` : tx.usdValue;
              const bonkAmount = isRealData ? `${formatNumber(tx.amount)} BONK` : tx.bonkAmount;
              const timeDisplay = isRealData ? formatTimeAgo(tx.timestamp) : tx.time;
              const priceImpact = isRealData ? `${tx.priceImpact > 0 ? '+' : ''}${tx.priceImpact.toFixed(2)}%` : tx.priceImpact;
              
              const solscanUrl = isRealData ? `https://solscan.io/tx/${tx.signature}` : '#';
              
              return (
                <div key={isRealData ? tx.signature : index} className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu group/tx cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`${getTypeColor(transactionType)} transition-all duration-500 group-hover/tx:scale-110 group-hover/tx:shadow-[0_0_3px_rgba(255,107,53,0.4)]`}>
                        {getTypeIcon(transactionType)}
                        {transactionType}
                      </Badge>
                      {isRealData && (
                        <Badge variant="outline" className="border-orange-500 text-orange-400 transition-all duration-500 group-hover/tx:scale-110 group-hover/tx:shadow-[0_0_3px_rgba(255,107,53,0.4)]">
                          whale
                        </Badge>
                      )}
                      <div className="text-sm text-gray-400 transition-all duration-500 group-hover/tx:text-gray-300">
                        {isRealData ? (
                          <span 
                            className="hover:text-orange-400 cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://solscan.io/account/${tx.from}`, '_blank');
                            }}
                          >
                            {wallet}
                          </span>
                        ) : (
                          wallet
                        )} • {exchange}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 transition-all duration-500 group-hover/tx:text-gray-400">{timeDisplay}</div>
                      {isRealData && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(solscanUrl, '_blank');
                          }}
                        >
                          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          View
                        </Button>
                      )}
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between mt-2"
                    onClick={() => isRealData && window.open(solscanUrl, '_blank')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-white transition-all duration-500 group-hover/tx:text-orange-400 group-hover/tx:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">{usdValue}</div>
                      <div className="text-sm text-gray-400 transition-all duration-500 group-hover/tx:text-gray-300">{bonkAmount}</div>
                    </div>
                    <div
                      className={`text-sm font-semibold transition-all duration-500 group-hover/tx:scale-110 ${
                        priceImpact.startsWith("+") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {priceImpact} impact
                    </div>
                  </div>
                  
                  {isRealData && (
                    <div 
                      className="mt-2 pt-2 border-t border-gray-700/50 cursor-pointer"
                      onClick={() => window.open(solscanUrl, '_blank')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-mono hover:text-orange-400 transition-colors">
                          Tx: {tx.signature.slice(0, 16)}...
                        </div>
                        <div className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                          Click to view on Solscan
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Whale Activity Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4 hover:bg-gray-800/70 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu group/analysis">
          <h3 className="text-lg font-semibold text-white transition-all duration-500 group-hover/analysis:text-orange-400 group-hover/analysis:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">
            {whaleData ? 'Real-time Whale Analysis' : 'Whale Activity Analysis'}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group/impact">
              <h4 className="text-sm font-semibold text-orange-500 mb-3 transition-all duration-500 group-hover/impact:text-orange-400 group-hover/impact:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">Market Impact</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="transition-all duration-500 group-hover/impact:text-gray-200">
                  • {analytics ? `${analytics.totalWhaleTransactions} whale transactions detected` : '13 high-impact transactions detected'}
                </li>
                <li className="transition-all duration-500 group-hover/impact:text-gray-200">
                  • Average transaction size: ${analytics ? formatNumber(analytics.averageWhaleTransaction) : '639K'}
                </li>
                <li className="transition-all duration-500 group-hover/impact:text-gray-200">
                  • {analytics?.accumulationPhase ? 'Accumulation phase indicated' : 'Distribution phase indicated'}
                </li>
                <li className="transition-all duration-500 group-hover/impact:text-gray-200">
                  • Total whale volume: ${analytics ? formatNumber(analytics.totalWhaleVolume) : '9.6M'}
                </li>
              </ul>
            </div>

            <div className="group/patterns">
              <h4 className="text-sm font-semibold text-orange-500 mb-3 transition-all duration-500 group-hover/patterns:text-orange-400 group-hover/patterns:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">Trading Patterns</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="transition-all duration-500 group-hover/patterns:text-gray-200">
                  • Most active exchange: {dexData?.whaleActivity.topExchanges[0]?.name || 'Raydium (DEX)'}
                </li>
                <li className="transition-all duration-500 group-hover/patterns:text-gray-200">
                  • Trading pairs: {dexData ? dexData.totalPairs : '25+'} active pairs
                </li>
                <li className="transition-all duration-500 group-hover/patterns:text-gray-200">
                  • Active whales: {analytics ? analytics.activeWhales24h : '~4'} unique wallets
                </li>
                <li className="transition-all duration-500 group-hover/patterns:text-gray-200">
                  • Total liquidity: ${dexData ? formatNumber(dexData.totalLiquidity) : '45M'}
                </li>
              </ul>
            </div>
          </div>


        </div>
      </CardContent>
    </Card>
  )
}
