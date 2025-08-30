"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  ExternalLink,
  UserCheck,
  Copy,
  Star,
  Activity,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Globe,
  Wallet,
  Plus,
  Minus,
  BarChart2,
} from "lucide-react"
import { TokenPriceChart } from "@/components/token-price-chart"
import { UnifiedLoading } from "@/components/loading"

interface TokenData {
  id: string
  symbol: string
  name: string
  image: {
    thumb: string
    small: string
    large: string
  }
  market_data: {
    current_price: {
      usd: number
      btc: number
    }
    market_cap: {
      usd: number
    }
    market_cap_rank: number
    total_volume: {
      usd: number
    }
    price_change_24h: number
    price_change_percentage_1h_in_currency?: number | null
    price_change_percentage_24h_in_currency?: number | null
    price_change_percentage_7d_in_currency?: number | null
    price_change_percentage_30d_in_currency?: number | null
    price_change_percentage_1y_in_currency?: number | null
    market_cap_change_percentage_24h_in_currency: number
    price_change_24h_in_currency: number
    market_cap_change_24h: number
    high_24h: {
      usd: number
    }
    low_24h: {
      usd: number
    }
    circulating_supply: number
    total_supply: number
    max_supply: number
    fully_diluted_valuation: {
      usd: number
    }
    // Add fallback fields for price changes
    price_change_percentage_1h?: number | null
    price_change_percentage_24h?: number | null
    price_change_percentage_7d?: number | null
    price_change_percentage_30d?: number | null
    price_change_percentage_1y?: number | null
    // Add ATH and ATL fields
    ath?: {
      usd: number
    }
    ath_change_percentage?: {
      usd: number
    }
    atl?: {
      usd: number
    }
    atl_change_percentage?: {
      usd: number
    }
  }
  description: {
    en: string
  }
  links: {
    homepage: string[]
    blockchain_site: string[]
    official_forum_url: string[]
    chat_url: string[]
    announcement_url: string[]
    twitter_screen_name: string
    telegram_channel_identifier: string
    subreddit_url: string
    repos_url: {
      github: string[]
      bitbucket: string[]
    }
  }
  categories: string[]
  contract_address: string
  platforms: Record<string, string>
  genesis_date?: string
  sentiment_votes_up_percentage?: number
  sentiment_votes_down_percentage?: number
  coingecko_rank?: number
  coingecko_score?: number
  developer_score?: number
  community_score?: number
  liquidity_score?: number
  public_interest_score?: number
  chartData: {
    prices: [number, number][]
    market_caps: [number, number][]
    total_volumes: [number, number][]
  }
  tickers?: Array<{
    base: string
    target: string
    market: {
      name: string
      logo: string
    }
    last: number
    volume: number
    converted_last: {
      usd: number
    }
    converted_volume: {
      usd: number
    }
    trade_url: string
  }>
}

export default function TokenPage() {
  const params = useParams()
  const tokenId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [chartTimeRange, setChartTimeRange] = useState("7") // Default to 7 days
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false)
  const [influencers, setInfluencers] = useState<any[]>([])
  const [influencersLoading, setInfluencersLoading] = useState(true)
  const [showAllInfluencers, setShowAllInfluencers] = useState(false)
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null)
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(true)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/coingecko/token/${tokenId}?days=${chartTimeRange}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        setTokenData(data)
      } catch (err) {
        console.error('Error fetching token data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    const fetchInfluencers = async () => {
      try {
        setInfluencersLoading(true)
        const response = await fetch(`/api/influencers/${tokenId}?limit=10`)
        if (response.ok) {
          const data = await response.json()
          console.log('Influencers API response:', data)
          if (data.success && data.data) {
            setInfluencers(data.data.influencers || [])
          } else if (data.influencers) {
            // Handle legacy response format
            setInfluencers(data.influencers || [])
          }
        }
      } catch (err) {
        console.error('Error fetching influencers:', err)
      } finally {
        setInfluencersLoading(false)
      }
    }

    const fetchTimeSeriesData = async () => {
      try {
        setTimeSeriesLoading(true)
        const response = await fetch(`/api/public/coins/${tokenId}/time-series/v2?days=7&interval=1d`)
        if (response.ok) {
          const data = await response.json()
          console.log('Time Series API response:', data)
          if (data.success) {
            setTimeSeriesData(data.data)
          }
        }
      } catch (err) {
        console.error('Error fetching time series data:', err)
      } finally {
        setTimeSeriesLoading(false)
      }
    }

    if (tokenId) {
      fetchTokenData()
      fetchInfluencers()
      fetchTimeSeriesData()
    }
  }, [tokenId, chartTimeRange])

  // Function to handle chart time range changes
  const handleChartTimeRangeChange = (newTimeRange: string) => {
    setChartTimeRange(newTimeRange)
  }

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
    if (num === null || num === undefined || typeof num !== 'number') return '-'
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Get Jupiter trading URL
  const getJupiterUrl = () => {
    // Get the Solana contract address if available
    const solanaAddress = tokenData?.platforms?.solana || tokenData?.contract_address
    if (solanaAddress) {
      return `https://jup.ag/swap/SOL-${solanaAddress}`
    }
    // Fallback to Jupiter tokens page with token symbol
    return `https://jup.ag/tokens/${tokenData?.symbol?.toLowerCase()}`
  }

  // Get Twitter URL
  const getTwitterUrl = () => {
    if (tokenData?.links?.twitter_screen_name) {
      return `https://twitter.com/${tokenData.links.twitter_screen_name}`
    }
    // Fallback to homepage if no Twitter
    const homepage = tokenData?.links?.homepage?.[0]
    return homepage || '#'
  }

  // Handle Add to Portfolio click
  const handleAddToPortfolio = () => {
    setShowPortfolioDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <UnifiedLoading 
          title="Loading Token Data"
          description="Fetching comprehensive token information..."
          icon="activity"
          variant="page"
          size="lg"
        />
      </div>
    )
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-2">Error Loading Token</h1>
            <p className="text-red-300 mb-6">{error || 'Failed to load token data'}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Helper functions for ATH/ATL percentages (only called after tokenData null check)
  const getAthChangePercentage = () => {
    return tokenData.market_data.ath_change_percentage?.usd ?? null;
  }

  const getAtlChangePercentage = () => {
    return tokenData.market_data.atl_change_percentage?.usd ?? null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Ecosystem
        </Button>

        {/* Token Header */}
        <div className="mb-8 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative transition-all duration-300 hover:scale-110">
              <img
                src={tokenData.image.large}
                alt={tokenData.name}
                className="w-16 h-16 rounded-full transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder-logo.svg"
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300 font-medium border-2 border-gray-950 transition-all duration-300 group-hover:bg-orange-600 group-hover:scale-110">
                #{tokenData.market_data.market_cap_rank}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">{tokenData.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-2xl font-bold text-gray-300 uppercase transition-colors duration-300 group-hover:text-orange-300">{tokenData.symbol}</span>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-orange-900/20 hover:text-orange-400 hover:border-orange-500/30">
                  #{tokenData.market_data.market_cap_rank}
                </Badge>
              </div>
            </div>
          </div>

                     {/* Current Price and Change */}
           <div className="flex items-center space-x-6 mb-6 group">
             <div className="transition-all duration-300 hover:scale-105">
               <div className="text-3xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">
                 {formatPrice(tokenData.market_data.current_price.usd)}
               </div>
               <div className="text-lg text-gray-400 transition-colors duration-300 group-hover:text-orange-300">
                 {tokenData.market_data.current_price.btc.toFixed(8)} BTC
               </div>
             </div>
             
             <div className="flex items-center space-x-4">
               {tokenData.market_data.price_change_percentage_24h_in_currency && (
                 <div className={`flex items-center space-x-2 transition-all duration-300 hover:scale-110 ${
                   tokenData.market_data.price_change_percentage_24h_in_currency >= 0 
                     ? "text-green-500" 
                     : "text-red-500"
                 }`}>
                   {tokenData.market_data.price_change_percentage_24h_in_currency >= 0 ? (
                     <TrendingUp className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                   ) : (
                     <TrendingDown className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                   )}
                   <span className="font-medium">
                     {formatPercentage(tokenData.market_data.price_change_percentage_24h_in_currency)} (24h)
                   </span>
                 </div>
               )}
             </div>
           </div>

           {/* 24h Range */}
           <div className="mb-6 group">
             <div className="text-sm text-gray-400 mb-2 transition-colors duration-300 group-hover:text-orange-300">24h Range</div>
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                 <span className="text-gray-400 text-sm">Low:</span>
                 <span className="text-white font-medium transition-colors duration-300 group-hover:text-red-400">
                   {formatPrice(tokenData.market_data.low_24h.usd)}
                 </span>
               </div>
               <div className="flex-1 bg-gray-800 rounded-full h-2 relative transition-all duration-300 group-hover:bg-gray-700 group-hover:shadow-lg group-hover:shadow-orange-500/20">
                 <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full opacity-20 transition-opacity duration-300 group-hover:opacity-30"></div>
                 <div 
                   className="absolute h-2 w-2 bg-white rounded-full shadow-lg border-2 border-gray-900 transition-all duration-300 hover:scale-125 group-hover:bg-orange-400 group-hover:shadow-orange-500/50"
                   style={{
                     left: `${Math.max(0, Math.min(100, 
                       tokenData.market_data.high_24h?.usd && tokenData.market_data.low_24h?.usd && tokenData.market_data.high_24h.usd !== tokenData.market_data.low_24h.usd
                         ? ((tokenData.market_data.current_price.usd - tokenData.market_data.low_24h.usd) / 
                            (tokenData.market_data.high_24h.usd - tokenData.market_data.low_24h.usd)) * 100
                         : 50
                     ))}%`,
                     transform: 'translateX(-50%)'
                   }}
                 />
               </div>
               <div className="flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                 <span className="text-gray-400 text-sm">High:</span>
                 <span className="text-white font-medium transition-colors duration-300 group-hover:text-green-400">
                   {formatPrice(tokenData.market_data.high_24h.usd)}
                 </span>
               </div>
             </div>
           </div>

                                              {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleAddToPortfolio}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 group"
              >
                <Plus className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                Add to Portfolio
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-orange-500/50 hover:text-orange-400 px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 group"
                asChild
              >
                <a 
                  href={getJupiterUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Wallet className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Buy / Sell
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-orange-500/50 hover:text-orange-400 px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 group"
                asChild
              >
                <a 
                  href={getTwitterUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                  {tokenData?.links?.twitter_screen_name ? 'Twitter' : 'Website'}
                </a>
              </Button>
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 group">
          {/* Left Panel - Token Info */}
          <div className="lg:col-span-1 space-y-6">
                         {/* Market Stats */}
             <Card className="group bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
               <CardHeader>
                 <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400">Market Stats</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">Market Cap</span>
                   <span className="text-white font-medium">
                     {formatNumber(tokenData.market_data.market_cap.usd)}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">24h Volume</span>
                   <span className="text-white font-medium">
                     {formatNumber(tokenData.market_data.total_volume.usd)}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">Fully Diluted Val.</span>
                   <span className="text-white font-medium">
                     {formatNumber(tokenData.market_data.fully_diluted_valuation.usd)}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">Circulating Supply</span>
                   <span className="text-white font-medium">
                     {tokenData.market_data.circulating_supply.toLocaleString()}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">Total Supply</span>
                   <span className="text-white font-medium">
                     {tokenData.market_data.total_supply.toLocaleString()}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">Max Supply</span>
                   <span className="text-white font-medium">
                     {tokenData.market_data.max_supply ? tokenData.market_data.max_supply.toLocaleString() : '∞'}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">Supply Ratio</span>
                   <span className="text-white font-medium">
                     {tokenData.market_data.total_supply && tokenData.market_data.total_supply > 0
                       ? ((tokenData.market_data.circulating_supply / tokenData.market_data.total_supply) * 100).toFixed(1)
                       : '0.0'}%
                   </span>
                 </div>
               </CardContent>
             </Card>

                         {/* Price Changes */}
             <Card className="group bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
               <CardHeader>
                 <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400">Price Changes</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {[
                   { 
                     label: '1h', 
                     value: tokenData.market_data.price_change_percentage_1h_in_currency ?? tokenData.market_data.price_change_percentage_1h 
                   },
                   { 
                     label: '24h', 
                     value: tokenData.market_data.price_change_percentage_24h_in_currency ?? tokenData.market_data.price_change_percentage_24h 
                   },
                   { 
                     label: '7d', 
                     value: tokenData.market_data.price_change_percentage_7d_in_currency ?? tokenData.market_data.price_change_percentage_7d 
                   },
                   { 
                     label: '30d', 
                     value: tokenData.market_data.price_change_percentage_30d_in_currency ?? tokenData.market_data.price_change_percentage_30d 
                   },
                   { 
                     label: '1y', 
                     value: tokenData.market_data.price_change_percentage_1y_in_currency ?? tokenData.market_data.price_change_percentage_1y 
                   }
                 ].map(({ label, value }) => (
                   <div key={label} className="flex justify-between items-center">
                     <span className="text-gray-400">{label}</span>
                     <span className={`font-medium ${
                       value && typeof value === 'number' && value >= 0 ? 'text-green-500' : 'text-red-500'
                     }`}>
                       {formatPercentage(value)}
                     </span>
                   </div>
                 ))}
               </CardContent>
             </Card>

             {/* ATH & ATL */}
             <Card className="group bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
               <CardHeader>
                 <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400">All Time Highs & Lows</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* ATH Value */}
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">All Time High</span>
                   <div className="text-right">
                     <div className="text-white font-medium">
                       {formatPrice(tokenData.market_data.ath?.usd || 0)}
                     </div>
                   </div>
                 </div>
                 
                 {/* ATL Value */}
                 <div className="flex justify-between items-center">
                   <span className="text-gray-400">All Time Low</span>
                   <div className="text-right">
                     <div className="text-white font-medium">
                       {formatPrice(tokenData.market_data.atl?.usd || 0)}
                     </div>
                   </div>
                 </div>
                 
                 {/* Current Price Comparison */}
                 <div className="pt-3 border-t border-gray-700">
                   <div className="text-xs text-gray-500 mb-3">Current Price Comparison</div>
                   <div className="space-y-3">
                     {/* From ATH */}
                     <div className="flex justify-between items-center">
                       <span className="text-gray-400">From ATH:</span>
                       {(() => {
                         const athChange = getAthChangePercentage();
                         if (athChange === null) {
                           return <span className="font-medium text-gray-400">N/A</span>;
                         }
                         return (
                           <span className={`font-medium ${
                             athChange < 0 ? 'text-red-500' : 'text-gray-400'
                           }`}>
                             {formatPercentage(athChange)}
                           </span>
                         );
                       })()}
                     </div>
                     
                     {/* From ATL */}
                     <div className="flex justify-between items-center">
                       <span className="text-gray-400">From ATL:</span>
                       {(() => {
                         const atlChange = getAtlChangePercentage();
                         if (atlChange === null) {
                           return <span className="font-medium text-gray-400">N/A</span>;
                         }
                         return (
                           <span className={`font-medium ${
                             atlChange > 0 ? 'text-green-500' : 'text-gray-400'
                           }`}>
                             {formatPercentage(atlChange)}
                           </span>
                         );
                       })()}
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Top Influencers */}
             <Card className="group bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
               <CardHeader>
                 <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400 flex items-center gap-2">
                   <UserCheck className="h-5 w-5" />
                   Top Influencers
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {influencersLoading ? (
                   <div className="space-y-3">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="flex items-center space-x-3 animate-pulse">
                         <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                         <div className="flex-1">
                           <div className="h-3 bg-gray-700 rounded mb-1"></div>
                           <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : influencers.length > 0 ? (
                   <div className="space-y-3">
                     {influencers.slice(0, showAllInfluencers ? influencers.length : 5).map((influencer, index) => (
                       <div key={influencer.id || index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-300 group/influencer">
                         <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-black font-bold text-xs rounded-full transition-all duration-300 group-hover/influencer:scale-110">
                           #{index + 1}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="font-medium text-white text-sm truncate transition-colors duration-300 group-hover/influencer:text-orange-400">
                             {influencer.creator_name || influencer.display_name || influencer.name || 'Unknown'}
                           </div>
                           <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/influencer:text-gray-300">
                             {influencer.creator_followers 
                               ? `${(influencer.creator_followers / 1000).toFixed(1)}K followers` 
                               : influencer.followers 
                               ? `${(influencer.followers / 1000).toFixed(1)}K followers` 
                               : 'Influencer'}
                           </div>
                         </div>
                         {(influencer.url || influencer.creator_name) && (
                           <Button
                             size="sm"
                             variant="ghost"
                             className="h-6 w-6 p-0 text-gray-400 hover:text-orange-400 transition-colors"
                             asChild
                           >
                             <a 
                               href={influencer.url || `https://twitter.com/${influencer.creator_name}`}
                               target="_blank"
                               rel="noopener noreferrer"
                             >
                               <ExternalLink className="h-3 w-3" />
                             </a>
                           </Button>
                         )}
                       </div>
                     ))}
                     {influencers.length > 5 && !showAllInfluencers && (
                       <div className="text-center pt-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           className="text-xs text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-300"
                           onClick={() => setShowAllInfluencers(true)}
                         >
                           +{influencers.length - 5} more influencers
                         </Button>
                       </div>
                     )}
                     {showAllInfluencers && influencers.length > 5 && (
                       <div className="text-center pt-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           className="text-xs text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-300"
                           onClick={() => setShowAllInfluencers(false)}
                         >
                           Show less
                         </Button>
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="text-center py-4">
                     <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                     <p className="text-gray-500 text-sm">No influencer data available</p>
                   </div>
                 )}
               </CardContent>
             </Card>

             

                         
          </div>

          {/* Right Panel - Chart and Tabs */}
          <div className="lg:col-span-3 space-y-6">
                         {/* Chart Card */}
             <TokenPriceChart
               chartData={tokenData.chartData}
               currentPrice={tokenData.market_data.current_price.usd}
               priceChange24h={tokenData.market_data.price_change_percentage_24h_in_currency || tokenData.market_data.price_change_percentage_24h || 0}
               symbol={tokenData.symbol}
               onTimeRangeChange={handleChartTimeRangeChange}
               currentTimeRange={chartTimeRange}
             />

            {/* Tabs */}
            <Card className="group bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.01]">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-800 border-gray-700 transition-all duration-300 group-hover:border-orange-500/30">
                    <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-300 hover:text-orange-400">
                      Overview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                     <TabsContent value="overview" className="space-y-4">
                     <div className="space-y-6">
                       {/* Contract Address */}
                       {tokenData.contract_address && (
                         <div className="group">
                           <div className="flex items-center justify-between mb-3">
                             <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-orange-400">Contract Address</h3>
                             <div className="flex items-center space-x-2">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => copyToClipboard(tokenData.contract_address)}
                                 className="text-gray-400 hover:text-white hover:text-orange-400 p-1 transition-all duration-300 hover:scale-110 hover:bg-orange-900/20"
                               >
                                 <Copy className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                               </Button>
                               {/* Solscan Link for Solana */}
                               {tokenData.platforms && Object.keys(tokenData.platforms).includes('solana') && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => window.open(`https://solscan.io/token/${tokenData.contract_address}`, '_blank')}
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 p-1 transition-all duration-300 hover:scale-110 hover:bg-orange-900/20"
                                 >
                                   <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                                 </Button>
                               )}
                               {/* Etherscan Link for Ethereum */}
                               {tokenData.platforms && Object.keys(tokenData.platforms).includes('ethereum') && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => window.open(`https://etherscan.io/token/${tokenData.contract_address}`, '_blank')}
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 p-1 transition-all duration-300 hover:scale-110 hover:bg-orange-900/20"
                                 >
                                   <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                                 </Button>
                               )}
                               {/* BSCScan Link for BSC */}
                               {tokenData.platforms && Object.keys(tokenData.platforms).includes('binance-smart-chain') && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => window.open(`https://bscscan.com/token/${tokenData.contract_address}`, '_blank')}
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 p-1 transition-all duration-300 hover:scale-110 hover:bg-orange-900/20"
                                 >
                                   <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                                 </Button>
                               )}
                             </div>
                           </div>
                           <div className="text-white text-sm font-mono bg-gray-800 p-3 rounded-lg border border-gray-700 transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-gray-750 group-hover:shadow-lg group-hover:shadow-orange-500/10">
                             {tokenData.contract_address}
                           </div>
                         </div>
                       )}

                       {/* Categories */}
                       {tokenData.categories && tokenData.categories.length > 0 && (
                         <div className="group">
                           <h3 className="text-lg font-semibold text-white mb-3 transition-colors duration-300 group-hover:text-orange-400">Categories</h3>
                           <div className="flex flex-wrap gap-2">
                             {tokenData.categories.map((category) => (
                               <Badge key={category} variant="secondary" className="bg-gray-800 text-gray-300 px-3 py-1 transition-all duration-300 hover:scale-110 hover:bg-orange-900/20 hover:text-orange-400 hover:border-orange-500/30">
                                 {category}
                               </Badge>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Social & Links */}
                       <div>
                         <h3 className="text-lg font-semibold text-white mb-3">Social & Links</h3>
                         <div className="space-y-3">
                           {/* Website */}
                           {tokenData.links.homepage[0] && (
                             <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                               <Globe className="h-5 w-5 text-blue-400" />
                               <div className="flex-1">
                                 <div className="text-white font-medium">Website</div>
                                 <a 
                                   href={tokenData.links.homepage[0]} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300 text-sm break-all"
                                 >
                                   {tokenData.links.homepage[0]}
                                 </a>
                               </div>
                             </div>
                           )}
                           
                           {/* Twitter */}
                           {tokenData.links.twitter_screen_name && (
                             <div className="group flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 hover:border-orange-500/50 hover:bg-gray-750 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
                               <div className="h-5 w-5 text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:text-orange-400 group-hover:scale-110">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                 </svg>
                               </div>
                               <div className="flex-1">
                                 <div className="text-white font-medium transition-colors duration-300 group-hover:text-orange-400">Twitter</div>
                                 <a 
                                   href={`https://twitter.com/${tokenData.links.twitter_screen_name}`}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 text-sm transition-colors duration-300"
                                 >
                                   @{tokenData.links.twitter_screen_name}
                                 </a>
                               </div>
                             </div>
                           )}
                           
                           {/* Telegram */}
                           {tokenData.links.telegram_channel_identifier && (
                             <div className="group flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 hover:border-orange-500/50 hover:bg-gray-750 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
                               <div className="h-5 w-5 text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:text-orange-400 group-hover:scale-110">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                 </svg>
                               </div>
                               <div className="flex-1">
                                 <div className="text-white font-medium transition-colors duration-300 group-hover:text-orange-400">Telegram</div>
                                 <a 
                                   href={`https://t.me/${tokenData.links.telegram_channel_identifier}`}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 text-sm transition-colors duration-300"
                                 >
                                   @{tokenData.links.telegram_channel_identifier}
                                 </a>
                               </div>
                             </div>
                           )}
                           
                           {/* Discord */}
                           {tokenData.links.chat_url && tokenData.links.chat_url.includes('discord') && (
                             <div className="group flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 hover:border-orange-500/50 hover:bg-gray-750 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
                               <div className="h-5 w-5 text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:text-orange-400 group-hover:scale-110">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                 </svg>
                               </div>
                               <div className="flex-1">
                                 <div className="text-white font-medium transition-colors duration-300 group-hover:text-orange-400">Discord</div>
                                 <a 
                                   href={tokenData.links.chat_url[0]}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 text-sm break-all transition-colors duration-300"
                                 >
                                   Join Discord Server
                                 </a>
                               </div>
                             </div>
                           )}
                           
                           {/* Reddit */}
                           {tokenData.links.subreddit_url && (
                             <div className="group flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 hover:border-orange-500/50 hover:bg-gray-750 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
                               <div className="h-5 w-5 text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:text-orange-400 group-hover:scale-110">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .31-.003c.186.096.257.325.18.504l-.709 2.375c.916.28 1.65.76 2.177 1.42.308-.309.73-.491 1.207-.491zm-.96 6.744c0 .532-.407.974-.944.974-.537 0-.944-.442-.944-.974 0-.531.407-.974.944-.974.537 0 .944.443.944.974zm-5.056 0c0 .532-.407.974-.944.974-.537 0-.944-.442-.944-.974 0-.531.407-.974.944-.974.537 0 .944.443.944.974zm5.056-2.974c0 .531-.407.974-.944.974-.537 0-.944-.443-.944-.974 0-.531.407-.974.944-.974.537 0 .944.443.944.974zm-5.056 0c0 .531-.407.974-.944.974-.537 0-.944-.443-.944-.974 0-.531.407-.974.944-.974.537 0 .944.443.944.974z"/>
                                 </svg>
                               </div>
                               <div className="flex-1">
                                 <div className="text-white font-medium transition-colors duration-300 group-hover:text-orange-400">Reddit</div>
                                 <a 
                                   href={tokenData.links.subreddit_url}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 text-sm break-all transition-colors duration-300"
                                 >
                                   {tokenData.links.subreddit_url}
                                 </a>
                               </div>
                             </div>
                           )}
                           
                           {/* GitHub */}
                           {tokenData.links.repos_url?.github && tokenData.links.repos_url.github.length > 0 && (
                             <div className="group flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 hover:border-orange-500/50 hover:bg-gray-750 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
                               <div className="h-5 w-5 text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:text-orange-400 group-hover:scale-110">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                 </svg>
                               </div>
                               <div className="flex-1">
                                 <div className="text-white font-medium transition-colors duration-300 group-hover:text-orange-400">GitHub</div>
                                 <a 
                                   href={tokenData.links.repos_url.github[0]}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300 hover:text-orange-400 text-sm break-all transition-colors duration-300"
                                 >
                                   View Repository
                                 </a>
                               </div>
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Trading Pairs */}
                       {tokenData.tickers && tokenData.tickers.length > 0 && (
                         <div className="group">
                           <h3 className="text-lg font-semibold text-white mb-3 transition-colors duration-300 group-hover:text-orange-400">Trading Pairs</h3>
                           <div className="space-y-2 max-h-64 overflow-y-auto">
                             {tokenData.tickers.slice(0, 20).map((ticker: any, index: number) => (
                               <div key={index} className="group/ticker grid grid-cols-12 gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]">
                                 {/* Exchange Logo & Name */}
                                 <div className="col-span-2 flex flex-col items-center space-y-1">
                                   <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                     {ticker.market?.logo ? (
                                       <img 
                                         src={ticker.market.logo} 
                                         alt={ticker.market.name}
                                         className="w-6 h-6 rounded-full"
                                         onError={(e) => {
                                           const target = e.target as HTMLImageElement
                                           target.src = "/placeholder-logo.svg"
                                         }}
                                       />
                                     ) : (
                                       <span className="text-gray-400 text-xs font-medium">
                                         {ticker.market?.name?.slice(0, 2) || 'EX'}
                                       </span>
                                     )}
                                   </div>
                                   <div className="text-gray-400 text-xs text-center leading-tight">
                                     {ticker.market?.name || 'Unknown'}
                                   </div>
                                 </div>
                                 
                                 {/* Trading Pair */}
                                 <div className="col-span-4 flex flex-col justify-center">
                                   <div className="text-white font-medium text-sm truncate" title={ticker.base + '/' + ticker.target}>
                                     {ticker.base.length > 20 ? ticker.base.slice(0, 20) + '...' : ticker.base}/{ticker.target}
                                   </div>
                                   {ticker.base.length > 20 && (
                                     <div className="text-gray-500 text-xs truncate" title={ticker.base}>
                                       {ticker.base}
                                     </div>
                                   )}
                                 </div>
                                 
                                 {/* Price */}
                                 <div className="col-span-2 flex flex-col justify-center text-right">
                                   <div className="text-white font-medium text-sm">
                                     ${ticker.converted_last?.usd?.toFixed(6) || 'N/A'}
                                   </div>
                                 </div>
                                 
                                 {/* Volume */}
                                 <div className="col-span-2 flex flex-col justify-center text-right">
                                   <div className="text-gray-400 text-xs">
                                     Vol: ${(ticker.converted_volume?.usd || 0).toLocaleString()}
                                   </div>
                                 </div>
                                 
                                 {/* Trade Button */}
                                 <div className="col-span-2 flex justify-end">
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => window.open(ticker.trade_url, '_blank')}
                                     className="text-blue-400 hover:text-blue-300 hover:text-orange-400 hover:bg-orange-900/20 px-3 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/20"
                                   >
                                     Trade
                                   </Button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Description (if available) */}
                       {tokenData.description.en && tokenData.description.en !== 'No description available for this token.' && (
                         <div className="group">
                           <h3 className="text-lg font-semibold text-white mb-3 transition-colors duration-300 group-hover:text-orange-400">About {tokenData.name}</h3>
                           <p className="text-gray-300 leading-relaxed bg-gray-800 p-4 rounded-lg border border-gray-700 transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-gray-750 group-hover:shadow-lg group-hover:shadow-orange-500/10">
                             {tokenData.description.en}
                           </p>
                         </div>
                       )}
                     </div>
                   </TabsContent>
                   

                </Tabs>
              </CardContent>
            </Card>

            {/* Analytics Overview */}
            <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {timeSeriesLoading ? (
                  <div className="grid grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-3 h-16"></div>
                    ))}
                  </div>
                ) : timeSeriesData?.summary ? (
                  <div className="grid grid-cols-6 gap-3">
                    {/* Sentiment */}
                    <div className="group text-center p-3 bg-gray-800/50 rounded-lg border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer" 
                         title="Community sentiment score (0-100). Poor: <30, Fair: 30-69, Good: ≥70">
                      <div className="text-lg font-bold text-blue-400 mb-1 group-hover:text-blue-300 transition-colors duration-300">
                        {(timeSeriesData.summary.sentiment_avg || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Sentiment</div>
                      <div className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                        timeSeriesData.summary.sentiment_avg >= 70 ? 'text-green-400 group-hover:text-green-300' : 
                        timeSeriesData.summary.sentiment_avg >= 30 ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-red-400 group-hover:text-red-300'
                      }`}>
                        {timeSeriesData.summary.sentiment_avg >= 70 ? 'Good' : 
                         timeSeriesData.summary.sentiment_avg >= 30 ? 'Fair' : 'Poor'}
                      </div>
                    </div>

                    {/* Social Dominance */}
                    <div className="group text-center p-3 bg-gray-800/50 rounded-lg border border-green-500/20 hover:border-green-400/50 hover:bg-green-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
                         title="Share of social media discussions. High: ≥1%, Medium: 0.5-1%, Low: <0.5%">
                      <div className="text-lg font-bold text-green-400 mb-1 group-hover:text-green-300 transition-colors duration-300">
                        {((timeSeriesData.summary.social_dominance_avg || 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Social</div>
                      <div className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                        ((timeSeriesData.summary.social_dominance_avg || 0) * 100) >= 1 ? 'text-green-400 group-hover:text-green-300' : 
                        ((timeSeriesData.summary.social_dominance_avg || 0) * 100) >= 0.5 ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-red-400 group-hover:text-red-300'
                      }`}>
                        {((timeSeriesData.summary.social_dominance_avg || 0) * 100) >= 1 ? 'High' : 
                         ((timeSeriesData.summary.social_dominance_avg || 0) * 100) >= 0.5 ? 'Medium' : 'Low'}
                      </div>
                    </div>

                    {/* Interactions */}
                    <div className="group text-center p-3 bg-gray-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                         title="Total social media interactions (likes, shares, comments)">
                      <div className="text-lg font-bold text-purple-400 mb-1 group-hover:text-purple-300 transition-colors duration-300">
                        {(timeSeriesData.summary.total_interactions || 0) >= 1000000 
                          ? `${((timeSeriesData.summary.total_interactions || 0) / 1000000).toFixed(1)}M`
                          : (timeSeriesData.summary.total_interactions || 0) >= 1000
                          ? `${((timeSeriesData.summary.total_interactions || 0) / 1000).toFixed(1)}K`
                          : (timeSeriesData.summary.total_interactions || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Interactions</div>
                      <div className="text-xs text-purple-400 mt-1 group-hover:text-purple-300 transition-colors duration-300">
                        Engagements
                      </div>
                    </div>

                    {/* Posts */}
                    <div className="group text-center p-3 bg-gray-800/50 rounded-lg border border-orange-500/20 hover:border-orange-400/50 hover:bg-orange-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
                         title="Total number of posts and mentions about this token">
                      <div className="text-lg font-bold text-orange-400 mb-1 group-hover:text-orange-300 transition-colors duration-300">
                        {(timeSeriesData.summary.total_posts_created || 0) >= 1000 
                          ? `${((timeSeriesData.summary.total_posts_created || 0) / 1000).toFixed(1)}K`
                          : (timeSeriesData.summary.total_posts_created || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Posts</div>
                      <div className="text-xs text-orange-400 mt-1 group-hover:text-orange-300 transition-colors duration-300">
                        Content
                      </div>
                    </div>

                    {/* Contributors */}
                    <div className="group text-center p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                         title="Number of unique users discussing this token">
                      <div className="text-lg font-bold text-cyan-400 mb-1 group-hover:text-cyan-300 transition-colors duration-300">
                        {Math.round(timeSeriesData.summary.active_contributors || 0)}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Contributors</div>
                      <div className="text-xs text-cyan-400 mt-1 group-hover:text-cyan-300 transition-colors duration-300">
                        Users
                      </div>
                    </div>

                    {/* Market Share */}
                    <div className="group text-center p-3 bg-gray-800/50 rounded-lg border border-yellow-500/20 hover:border-yellow-400/50 hover:bg-yellow-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer"
                         title="This token's share of total crypto market discussions">
                      <div className="text-lg font-bold text-yellow-400 mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                        {((timeSeriesData.summary.market_dominance_avg || 0) * 100).toFixed(3)}%
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Market</div>
                      <div className="text-xs text-yellow-400 mt-1 group-hover:text-yellow-300 transition-colors duration-300">
                        Share
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BarChart2 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">No Analytics Data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Portfolio Dialog */}
      <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-400 flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Add to Portfolio
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Portfolio tracking functionality for {tokenData?.name} ({tokenData?.symbol?.toUpperCase()})
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 rounded-lg p-6 border border-orange-700/50">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-orange-300 mb-2">Feature Coming Soon!</h3>
                <p className="text-gray-300 mb-4">
                  Portfolio tracking functionality is currently under development. 
                  You'll soon be able to:
                </p>
                <ul className="text-left text-gray-300 space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span> Track your token holdings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span> Monitor portfolio performance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span> Set price alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span> View profit/loss analytics
                  </li>
                </ul>
                <p className="text-sm text-gray-400">
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => setShowPortfolioDialog(false)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
