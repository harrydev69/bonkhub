"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TrendingUp, Users, MessageCircle, Activity, BarChart3, LineChart as LineChartIcon, PieChart, Coins } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar } from "recharts"

// Types for the LunarCrush coins v2 data
type LunarCrushCoinsV2DataPoint = {
  time: number
  // Price metrics
  open: number
  high: number
  low: number
  close: number
  volume: number
  
  // Market metrics
  market_cap: number
  market_dominance: number
  alt_rank: number
  
  // Social metrics
  social_volume: number
  social_dominance: number
  social_score: number
  social_contributors: number
  social_posts: number
  
  // Developer metrics
  github_commits: number
  github_forks: number
  github_stars: number
  
  // Additional metrics that might be available
  [key: string]: any
}

type LunarCrushCoinsV2Response = {
  config: {
    id: string
    name: string
    symbol: string
    generated: number
  }
  data: LunarCrushCoinsV2DataPoint[]
}

export default function TestLunarCrushCoinsV2Page() {
  const [data, setData] = useState<LunarCrushCoinsV2Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("24h")
  const [coinId, setCoinId] = useState("bonk")

  useEffect(() => {
    fetchData()
  }, [timeRange, coinId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/test/lunarcrush-coins-v2?timeRange=${timeRange}&coinId=${coinId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      
      console.log(`🔍 Coins API Response:`, result)
      console.log(`🔍 Time Range: ${timeRange}`)
      console.log(`🔍 Coin ID: ${coinId}`)
      console.log(`🔍 Data Points: ${result.data?.data?.length || 0}`)
      
      // Enhanced debugging
      if (result.data?.data && result.data.data.length > 0) {
        const firstPoint = result.data.data[0]
        const lastPoint = result.data.data[result.data.data.length - 1]
        
        console.log(`🔍 First Data Point:`, firstPoint)
        console.log(`🔍 Last Data Point:`, lastPoint)
        console.log(`🔍 Available Fields:`, Object.keys(firstPoint))
        console.log(`🔍 Sample Values:`, {
          time: firstPoint.time,
          close: firstPoint.close,
          volume: firstPoint.volume_24h,
          sentiment: firstPoint.sentiment,
          social_score: firstPoint.social_score,
          market_cap: firstPoint.market_cap
        })
        
        setData(result.data)
      } else {
        setError("No data available")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number | undefined | null) => {
    if (timestamp === undefined || timestamp === null || isNaN(timestamp)) return 'N/A'
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return '$0.00000000'
    return `$${price.toFixed(8)}`
  }

  const getMetricValue = (dataPoint: LunarCrushCoinsV2DataPoint, metric: string) => {
    return dataPoint[metric] || 0
  }

  // Format data for charts
  const getChartData = () => {
    return data.data.map((point, index) => {
      const date = new Date(point.time * 1000)
      
      // Format time based on selected time range
      let timeLabel: string
      if (timeRange === "1h" || timeRange === "24h") {
        // For hourly data, show time
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        // For daily data (7d, 30d), show date
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
      
      return {
        time: timeLabel,
        price: point.close,
        open: point.open,
        high: point.high,
        low: point.low,
        volume: point.volume_24h || 0,
        sentiment: point.sentiment || 0,
        interactions: point.interactions || 0,
        contributors: point.contributors_active || 0,
        posts: point.posts_active || 0,
        galaxyScore: point.galaxy_score || 0,
        altRank: point.alt_rank || 0,
        marketCap: point.market_cap || 0,
        marketDominance: point.market_dominance || 0,
        index
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-white mt-4">Loading LunarCrush Coins v2 data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-6">
              <h2 className="text-red-400 text-xl font-bold mb-2">Error Loading Data</h2>
              <p className="text-red-300">{error}</p>
              <Button onClick={fetchData} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-white text-xl font-bold mb-2">No Data Available</h2>
              <p className="text-gray-300">Please check the API endpoint and try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            LunarCrush Coins v2 Data Test
          </h1>
          <p className="text-gray-400 text-lg">
            Testing the new coins time-series endpoint for enhanced coin-specific data
          </p>
        </div>

                 {/* Controls */}
         <div className="flex flex-wrap justify-center items-center gap-4">
           {/* Coin ID Input */}
           <div className="flex items-center gap-2">
             <span className="text-gray-300 text-sm">Coin ID:</span>
             <Input
               value={coinId}
               onChange={(e) => setCoinId(e.target.value)}
               className="w-32 bg-gray-700 border-gray-600 text-white"
               placeholder="bonk"
             />
           </div>

           {/* Time Range Selector */}
           <div className="flex items-center gap-2">
             <span className="text-gray-300 text-sm">Time Range:</span>
             <Select value={timeRange} onValueChange={setTimeRange}>
               <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-gray-800 border-gray-700">
                 <SelectItem value="1h">Last Hour</SelectItem>
                 <SelectItem value="24h">Last 24 Hours</SelectItem>
                 <SelectItem value="7d">Last 7 Days</SelectItem>
                 <SelectItem value="30d">Last 30 Days</SelectItem>
               </SelectContent>
             </Select>
           </div>

           {/* Chart Type Selector */}
           <div className="flex items-center gap-2">
             <span className="text-gray-300 text-sm">Chart Style:</span>
             <div className="flex bg-gray-700 rounded-lg p-1">
               <Button
                 variant="ghost"
                 size="sm"
                 className="text-xs text-gray-300 hover:text-white"
                 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               >
                 📊 Charts
               </Button>
             </div>
           </div>
         </div>

        {/* Data Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.data.length}</div>
              <p className="text-xs text-gray-400">
                {timeRange === "1h" || timeRange === "24h" ? "Hourly" : "Daily"} intervals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Latest Price</CardTitle>
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-green-400">
                 {formatPrice(data.data[data.data.length - 1]?.close)}
               </div>
               <p className="text-xs text-gray-400">Current price</p>
             </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Social Score</CardTitle>
            </CardHeader>
            <CardContent>
                             <div className="text-2xl font-bold text-blue-400">
                 {data.data[data.data.length - 1]?.sentiment || 0}
               </div>
              <p className="text-xs text-gray-400">Social engagement</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Alt Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                #{data.data[data.data.length - 1]?.alt_rank || 0}
              </div>
              <p className="text-xs text-gray-400">Market ranking</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Exploration Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
                     <TabsList className="bg-gray-800 border-gray-700">
             <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
               Data Overview
             </TabsTrigger>
             <TabsTrigger value="raw" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
               Raw Data
             </TabsTrigger>
             <TabsTrigger value="metrics" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
               Available Metrics
             </TabsTrigger>
             <TabsTrigger value="price" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
               Price Charts
             </TabsTrigger>
             <TabsTrigger value="social" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
               Social Analytics
             </TabsTrigger>
                        <TabsTrigger value="market" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
             Market Health
           </TabsTrigger>
           <TabsTrigger value="debug" className="data-[state=active]:bg-red-500 data-[state=active]:text-black">
             Debug Data
           </TabsTrigger>
         </TabsList>

          {/* Data Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Data Structure Analysis</CardTitle>
                <CardDescription className="text-gray-400">
                  Understanding what data the coins endpoint provides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Sample Data Point</h3>
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <pre className="text-xs text-gray-300 overflow-auto">
                          {JSON.stringify(data.data[0], null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Data Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Points:</span>
                          <span className="text-white">{data.data.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Range:</span>
                          <span className="text-white">
                            {formatTime(data.data[0]?.time)} - {formatTime(data.data[data.data.length - 1]?.time)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Coin:</span>
                          <span className="text-white">{data.config?.name || coinId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Symbol:</span>
                          <span className="text-white">{data.config?.symbol || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Raw Data Tab */}
          <TabsContent value="raw" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Raw Data Table</CardTitle>
                <CardDescription className="text-gray-400">
                  {timeRange === "1h" || timeRange === "24h" ? "Hourly" : "Daily"} data points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2 text-gray-300">Time</th>
                        <th className="text-left p-2 text-gray-300">Price</th>
                        <th className="text-left p-2 text-gray-300">Volume</th>
                        <th className="text-left p-2 text-gray-300">Market Cap</th>
                        <th className="text-left p-2 text-gray-300">Social Score</th>
                        <th className="text-left p-2 text-gray-300">Alt Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.slice(-10).map((point, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-2 text-gray-300">{formatTime(point.time)}</td>
                          <td className="p-2 text-green-400">{formatPrice(point.close)}</td>
                                                     <td className="p-2 text-yellow-400">{formatNumber(point.volume_24h)}</td>
                          <td className="p-2 text-purple-400">{formatNumber(point.market_cap)}</td>
                                                     <td className="p-2 text-blue-400">{point.sentiment || 0}</td>
                          <td className="p-2 text-cyan-400">#{point.alt_rank || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Available Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  All the different data fields available from this endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.data[0] && Object.keys(data.data[0]).map((key) => (
                    <div key={key} className="bg-gray-900 p-3 rounded-lg">
                      <div className="text-sm font-medium text-white">{key}</div>
                      <div className="text-xs text-gray-400">
                        Value: {typeof data.data[0][key] === 'number' ? data.data[0][key] : typeof data.data[0][key]}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
                     </TabsContent>

           {/* Price Charts Tab */}
           <TabsContent value="price" className="space-y-4">
             <Card className="bg-gray-800 border-gray-700">
               <CardHeader>
                 <CardTitle className="text-white">Price Visualization</CardTitle>
                 <CardDescription className="text-gray-400">
                   OHLC price data with volume and market metrics
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-6">
                                       {/* Price Trend Chart */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Price Trend ({timeRange === "1h" ? "1h" : timeRange === "24h" ? "24h" : timeRange === "7d" ? "7d" : "30d"})
                      </h3>
                     <div className="h-64 bg-gray-900 rounded-lg p-4 border border-gray-700">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={getChartData()}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis 
                             dataKey="time" 
                             stroke="#9CA3AF" 
                             fontSize={12}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <YAxis 
                             stroke="#9CA3AF" 
                             fontSize={12}
                             tick={{ fill: '#9CA3AF' }}
                             tickFormatter={(value) => `$${value.toFixed(8)}`}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151',
                               borderRadius: '8px'
                             }}
                             labelStyle={{ color: '#F9FAFB' }}
                           />
                           <Legend />
                           <Line 
                             type="monotone" 
                             dataKey="price" 
                             stroke="#10B981" 
                             strokeWidth={2} 
                             dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                             name="Price"
                           />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   </div>

                   {/* Price Statistics */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Open</div>
                       <div className="text-white font-medium">{formatPrice(data.data[0]?.open)}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">High</div>
                       <div className="text-green-400 font-medium">{formatPrice(Math.max(...data.data.map(d => d.high || 0)))}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Low</div>
                       <div className="text-red-400 font-medium">{formatPrice(Math.min(...data.data.map(d => d.low || 0)))}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Close</div>
                       <div className="text-blue-400 font-medium">{formatPrice(data.data[data.data.length - 1]?.close)}</div>
                     </div>
                   </div>

                   {/* Volume Analysis */}
                   <div>
                     <h3 className="text-lg font-semibold text-white mb-3">Volume Analysis</h3>
                     <div className="h-32 bg-gray-900 rounded-lg p-4 border border-gray-700">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={getChartData()}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis 
                             dataKey="time" 
                             stroke="#9CA3AF" 
                             fontSize={10}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <YAxis 
                             stroke="#9CA3AF" 
                             fontSize={10}
                             tick={{ fill: '#9CA3AF' }}
                             tickFormatter={(value) => formatNumber(value)}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151',
                               borderRadius: '8px'
                             }}
                             labelStyle={{ color: '#F9FAFB' }}
                           />
                           <Bar 
                             dataKey="volume" 
                             fill="#F59E0B" 
                             name="Volume"
                           />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           {/* Social Analytics Tab */}
           <TabsContent value="social" className="space-y-4">
             <Card className="bg-gray-800 border-gray-700">
               <CardHeader>
                 <CardTitle className="text-white">Social Analytics</CardTitle>
                 <CardDescription className="text-gray-400">
                   Social engagement, sentiment, and contributor metrics
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-6">
                                       {/* Sentiment Trend */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Sentiment Trend ({timeRange === "1h" ? "1h" : timeRange === "24h" ? "24h" : timeRange === "7d" ? "7d" : "30d"})
                      </h3>
                     <div className="h-64 bg-gray-900 rounded-lg p-4 border border-gray-700">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={getChartData()}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis 
                             dataKey="time" 
                             stroke="#9CA3AF" 
                             fontSize={12}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <YAxis 
                             stroke="#9CA3AF" 
                             fontSize={12}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151',
                               borderRadius: '8px'
                             }}
                             labelStyle={{ color: '#F9FAFB' }}
                           />
                           <Legend />
                           <Area 
                             type="monotone" 
                             dataKey="sentiment" 
                             stroke="#3B82F6" 
                             fill="#3B82F6" 
                             fillOpacity={0.3}
                             name="Sentiment"
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                   </div>

                   {/* Social Metrics Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Avg Sentiment</div>
                       <div className="text-white font-medium">
                         {(data.data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / data.data.length).toFixed(1)}
                       </div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Total Interactions</div>
                       <div className="text-yellow-400 font-medium">{formatNumber(data.data.reduce((sum, d) => sum + (d.interactions || 0), 0))}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Active Contributors</div>
                       <div className="text-purple-400 font-medium">{formatNumber(data.data.reduce((sum, d) => sum + (d.contributors_active || 0), 0) / data.data.length)}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Active Posts</div>
                       <div className="text-green-400 font-medium">{formatNumber(data.data.reduce((sum, d) => sum + (d.posts_active || 0), 0) / data.data.length)}</div>
                     </div>
                   </div>

                   {/* Social Activity Heatmap */}
                   <div>
                     <h3 className="text-lg font-semibold text-white mb-3">Social Activity Heatmap</h3>
                     <div className="h-32 bg-gray-900 rounded-lg p-4 border border-gray-700">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={getChartData()}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis 
                             dataKey="time" 
                             stroke="#9CA3AF" 
                             fontSize={10}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <YAxis 
                             stroke="#9CA3AF" 
                             fontSize={10}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151',
                               borderRadius: '8px'
                             }}
                             labelStyle={{ color: '#F9FAFB' }}
                           />
                           <Legend />
                           <Line 
                             type="monotone" 
                             dataKey="interactions" 
                             stroke="#EF4444" 
                             strokeWidth={2}
                             name="Interactions"
                           />
                           <Line 
                             type="monotone" 
                             dataKey="posts" 
                             stroke="#8B5CF6" 
                             strokeWidth={2}
                             name="Posts"
                           />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           {/* Market Health Tab */}
           <TabsContent value="market" className="space-y-4">
             <Card className="bg-gray-800 border-gray-700">
               <CardHeader>
                 <CardTitle className="text-white">Market Health</CardTitle>
                 <CardDescription className="text-gray-400">
                   Galaxy score, market position, and performance indicators
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-6">
                                       {/* Health Score Radar */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Market Health Overview ({timeRange === "1h" ? "1h" : timeRange === "24h" ? "24h" : timeRange === "7d" ? "7d" : "30d"})
                      </h3>
                     <div className="h-64 bg-gray-900 rounded-lg p-4 border border-gray-700">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={getChartData()}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis 
                             dataKey="time" 
                             stroke="#9CA3AF" 
                             fontSize={12}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <YAxis 
                             stroke="#9CA3AF" 
                             fontSize={12}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151',
                               borderRadius: '8px'
                             }}
                             labelStyle={{ color: '#F9FAFB' }}
                           />
                           <Legend />
                           <Line 
                             type="monotone" 
                             dataKey="galaxyScore" 
                             stroke="#06B6D4" 
                             strokeWidth={2}
                             dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                             name="Galaxy Score"
                           />
                           <Line 
                             type="monotone" 
                             dataKey="altRank" 
                             stroke="#F97316" 
                             strokeWidth={2}
                             dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                             name="Alt Rank"
                           />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   </div>

                   {/* Market Metrics Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Galaxy Score</div>
                       <div className="text-cyan-400 font-medium">
                         {(data.data.reduce((sum, d) => sum + (d.galaxy_score || 0), 0) / data.data.length).toFixed(1)}
                       </div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Alt Rank</div>
                       <div className="text-orange-400 font-medium">#{Math.round(data.data.reduce((sum, d) => sum + (d.alt_rank || 0), 0) / data.data.length)}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Market Cap</div>
                       <div className="text-green-400 font-medium">{formatNumber(data.data[data.data.length - 1]?.market_cap)}</div>
                     </div>
                     <div className="bg-gray-900 p-3 rounded-lg">
                       <div className="text-xs text-gray-400">Dominance</div>
                       <div className="text-purple-400 font-medium">
                         {((data.data[data.data.length - 1]?.market_dominance || 0) * 100).toFixed(2)}%
                       </div>
                     </div>
                   </div>

                                       {/* Performance Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Performance Timeline ({timeRange === "1h" ? "1h" : timeRange === "24h" ? "24h" : timeRange === "7d" ? "7d" : "30d"})
                      </h3>
                     <div className="h-32 bg-gray-900 rounded-lg p-4 border border-gray-700">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={getChartData()}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis 
                             dataKey="time" 
                             stroke="#9CA3AF" 
                             fontSize={10}
                             tick={{ fill: '#9CA3AF' }}
                           />
                           <YAxis 
                             stroke="#9CA3AF" 
                             fontSize={10}
                             tick={{ fill: '#9CA3AF' }}
                             tickFormatter={(value) => formatNumber(value)}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#1F2937', 
                               border: '1px solid #374151',
                               borderRadius: '8px'
                             }}
                             labelStyle={{ color: '#F9FAFB' }}
                           />
                           <Legend />
                           <Area 
                             type="monotone" 
                             dataKey="marketCap" 
                             stroke="#84CC16" 
                             fill="#84CC16" 
                             fillOpacity={0.3}
                             name="Market Cap"
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           {/* Debug Data Tab */}
           <TabsContent value="debug" className="space-y-4">
             <Card className="bg-red-900/20 border-red-800">
               <CardHeader>
                 <CardTitle className="text-red-400">Debug Data Structure</CardTitle>
                 <CardDescription className="text-red-300">
                   Raw API response and data validation
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {/* API Response Summary */}
                   <div>
                     <h3 className="text-lg font-semibold text-red-300 mb-2">API Response Summary</h3>
                     <div className="bg-gray-900 p-4 rounded-lg">
                       <div className="grid grid-cols-2 gap-4 text-sm">
                         <div>
                           <span className="text-gray-400">Total Data Points:</span>
                           <span className="text-white ml-2">{data.data.length}</span>
                         </div>
                         <div>
                           <span className="text-gray-400">Time Range:</span>
                           <span className="text-white ml-2">
                             {formatTime(data.data[0]?.time)} - {formatTime(data.data[data.data.length - 1]?.time)}
                           </span>
                         </div>
                         <div>
                           <span className="text-gray-400">Available Fields:</span>
                           <span className="text-white ml-2">{Object.keys(data.data[0] || {}).length}</span>
                         </div>
                         <div>
                           <span className="text-gray-400">Coin Info:</span>
                           <span className="text-white ml-2">{data.config?.name || 'N/A'} ({data.config?.symbol || 'N/A'})</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Field Validation */}
                   <div>
                     <h3 className="text-lg font-semibold text-red-300 mb-2">Field Validation</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-gray-900 p-3 rounded-lg">
                         <h4 className="text-white font-medium mb-2">Price Fields</h4>
                         <div className="space-y-1 text-xs">
                           <div className="flex justify-between">
                             <span className="text-gray-400">open:</span>
                             <span className="text-white">{data.data[0]?.open !== undefined ? '✅' : '❌'} {data.data[0]?.open || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">high:</span>
                             <span className="text-white">{data.data[0]?.high !== undefined ? '✅' : '❌'} {data.data[0]?.high || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">low:</span>
                             <span className="text-white">{data.data[0]?.low !== undefined ? '✅' : '❌'} {data.data[0]?.low || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">close:</span>
                             <span className="text-white">{data.data[0]?.close !== undefined ? '✅' : '❌'} {data.data[0]?.close || 'undefined'}</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className="bg-gray-900 p-3 rounded-lg">
                         <h4 className="text-white font-medium mb-2">Volume & Market Fields</h4>
                         <div className="space-y-1 text-xs">
                           <div className="flex justify-between">
                             <span className="text-gray-400">volume_24h:</span>
                             <span className="text-white">{data.data[0]?.volume_24h !== undefined ? '✅' : '❌'} {data.data[0]?.volume_24h || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">market_cap:</span>
                             <span className="text-white">{data.data[0]?.market_cap !== undefined ? '✅' : '❌'} {data.data[0]?.market_cap || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">alt_rank:</span>
                             <span className="text-white">{data.data[0]?.alt_rank !== undefined ? '✅' : '❌'} {data.data[0]?.alt_rank || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">galaxy_score:</span>
                             <span className="text-white">{data.data[0]?.galaxy_score !== undefined ? '✅' : '❌'} {data.data[0]?.galaxy_score || 'undefined'}</span>
                           </div>
                         </div>
                       </div>

                       <div className="bg-gray-900 p-3 rounded-lg">
                         <h4 className="text-white font-medium mb-2">Social Fields</h4>
                         <div className="space-y-1 text-xs">
                           <div className="flex justify-between">
                             <span className="text-gray-400">sentiment:</span>
                             <span className="text-white">{data.data[0]?.sentiment !== undefined ? '✅' : '❌'} {data.data[0]?.sentiment || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">interactions:</span>
                             <span className="text-white">{data.data[0]?.interactions !== undefined ? '✅' : '❌'} {data.data[0]?.interactions || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">contributors_active:</span>
                             <span className="text-white">{data.data[0]?.contributors_active !== undefined ? '✅' : '❌'} {data.data[0]?.contributors_active || 'undefined'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">posts_active:</span>
                             <span className="text-white">{data.data[0]?.posts_active !== undefined ? '✅' : '❌'} {data.data[0]?.posts_active || 'undefined'}</span>
                           </div>
                         </div>
                       </div>

                       <div className="bg-gray-900 p-3 rounded-lg">
                         <h4 className="text-white font-medium mb-2">Raw Data Sample</h4>
                         <div className="bg-gray-800 p-2 rounded text-xs">
                           <pre className="text-gray-300 overflow-auto max-h-32">
                             {JSON.stringify(data.data[0], null, 2)}
                           </pre>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>

        {/* Data Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Data Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Time Range</div>
                <div className="text-white font-medium">
                  {formatTime(data.data[0]?.time)} - {formatTime(data.data[data.data.length - 1]?.time)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Price Range</div>
                <div className="text-white font-medium">
                  {formatPrice(Math.min(...data.data.map(d => d.close || 0)))} - {formatPrice(Math.max(...data.data.map(d => d.close || 0)))}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Avg Volume</div>
                <div className="text-white font-medium">
                                     {formatNumber(data.data.reduce((sum, d) => sum + (d.volume_24h || 0), 0) / data.data.length)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Avg Social Score</div>
                <div className="text-white font-medium">
                                     {(data.data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / data.data.length).toFixed(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
