"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, MessageCircle, Activity, BarChart3, LineChart as LineChartIcon, PieChart } from "lucide-react"
import { LineChart } from "@/components/line-chart"
import { NormalizedChart } from "@/components/normalized-chart"


// Types for the LunarCrush v2 data
type LunarCrushV2DataPoint = {
  time: number
  contributors_active: number
  contributors_created: number
  interactions: number
  posts_active: number
  posts_created: number
  sentiment: number
  spam: number
  alt_rank: number
  circulating_supply: number
  close: number
  galaxy_score: number
  high: number
  low: number
  market_cap: number
  market_dominance: number
  open: number
  social_dominance: number
}

type LunarCrushV2Response = {
  config: {
    id: string
    name: string
    symbol: string
    topic: string
    generated: number
  }
  data: LunarCrushV2DataPoint[]
}

export default function TestLunarCrushV2Page() {
  const [data, setData] = useState<LunarCrushV2Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["close", "sentiment", "interactions"])
  const [timeRange, setTimeRange] = useState("24h")
  const [chartType, setChartType] = useState<"line" | "normalized">("normalized")

  // Available metrics for selection
  const availableMetrics = [
    { key: "close", label: "Price", color: "#10b981", icon: TrendingUp },
    { key: "sentiment", label: "Sentiment", color: "#3b82f6", icon: Activity },
    { key: "interactions", label: "Interactions", color: "#f59e0b", icon: MessageCircle },
    { key: "contributors_active", label: "Active Contributors", color: "#8b5cf6", icon: Users },
    { key: "posts_active", label: "Active Posts", color: "#ef4444", icon: MessageCircle },
    { key: "galaxy_score", label: "Galaxy Score", color: "#06b6d4", icon: BarChart3 },
    { key: "social_dominance", label: "Social Dominance", color: "#84cc16", icon: TrendingUp },
    { key: "alt_rank", label: "Alt Rank", color: "#f97316", icon: BarChart3 },
  ]

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/test/lunarcrush-timeseries-v2?timeRange=${timeRange}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      
      console.log(`🔍 API Response:`, result)
      console.log(`🔍 Time Range: ${timeRange}`)
      console.log(`🔍 Data Points: ${result.results?.hour?.data?.length || 0}`)
      
      if (result.results?.hour?.data) {
        setData({
          config: result.results.hour.config,
          data: result.results.hour.data
        })
      } else {
        setError("No hourly data available")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(8)}`
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "bg-green-500"
    if (sentiment >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Calculate correlations between different metrics
  const calculateCorrelations = (data: LunarCrushV2DataPoint[]) => {
    const metrics = ['close', 'sentiment', 'interactions', 'contributors_active', 'posts_active', 'galaxy_score', 'social_dominance', 'alt_rank']
    const correlations: { [key: string]: { [key: string]: number } } = {}
    
    metrics.forEach(metric1 => {
      correlations[metric1] = {}
      metrics.forEach(metric2 => {
        if (metric1 === metric2) {
          correlations[metric1][metric2] = 1
        } else {
          const values1 = data.map(d => d[metric1 as keyof LunarCrushV2DataPoint] as number)
          const values2 = data.map(d => d[metric2 as keyof LunarCrushV2DataPoint] as number)
          correlations[metric1][metric2] = calculatePearsonCorrelation(values1, values2)
        }
      })
    })
    
    return correlations
  }

  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length
    if (n !== y.length) return 0
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-white mt-4">Loading LunarCrush v2 data...</p>
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
            LunarCrush v2 Data Visualization Test
          </h1>
          <p className="text-gray-400 text-lg">
            Experimenting with different ways to visualize the new rich timeseries data
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-2 border border-gray-700">
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
                {formatPrice(data.data[data.data.length - 1]?.close || 0)}
              </div>
              <p className="text-xs text-gray-400">Current BONK price</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Latest Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {data.data[data.data.length - 1]?.sentiment || 0}
              </div>
              <p className="text-xs text-gray-400">Out of 100</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Latest Galaxy Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {data.data[data.data.length - 1]?.galaxy_score || 0}
              </div>
              <p className="text-xs text-gray-400">Asset health metric</p>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Tabs */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="table" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
              Data Table
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
              Metrics Comparison
            </TabsTrigger>
            <TabsTrigger value="correlation" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
              Correlation Analysis
            </TabsTrigger>
          </TabsList>

          {/* Data Table Tab */}
          <TabsContent value="table" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Raw Data Table</CardTitle>
                <CardDescription className="text-gray-400">
                  {timeRange === "1h" || timeRange === "24h" ? "Hourly" : "Daily"} data points with all available metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2 text-gray-300">Time</th>
                        <th className="text-left p-2 text-gray-300">Price</th>
                        <th className="text-left p-2 text-gray-300">Sentiment</th>
                        <th className="text-left p-2 text-gray-300">Interactions</th>
                        <th className="text-left p-2 text-gray-300">Contributors</th>
                        <th className="text-left p-2 text-gray-300">Galaxy Score</th>
                        <th className="text-left p-2 text-gray-300">Social Dominance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((point, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-2 text-gray-300">{formatTime(point.time)}</td>
                          <td className="p-2 text-green-400">{formatPrice(point.close)}</td>
                          <td className="p-2">
                            <Badge className={getSentimentColor(point.sentiment)}>
                              {point.sentiment}
                            </Badge>
                          </td>
                          <td className="p-2 text-yellow-400">{formatNumber(point.interactions)}</td>
                          <td className="p-2 text-purple-400">{point.contributors_active}</td>
                          <td className="p-2 text-cyan-400">{point.galaxy_score}</td>
                          <td className="p-2 text-lime-400">{formatNumber(point.social_dominance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Comparison Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Metrics Comparison</CardTitle>
                <CardDescription className="text-gray-400">
                  Compare different metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                                     {/* Chart Controls */}
                   <div className="flex flex-wrap items-center gap-4">
                     {/* Chart Type Selector */}
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-300">Chart Type:</span>
                                               <div className="flex bg-gray-700 rounded-lg p-1">
                          <Button
                            variant={chartType === "normalized" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setChartType("normalized")}
                            className="text-xs"
                          >
                            Stacked Area
                          </Button>
                          <Button
                            variant={chartType === "line" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setChartType("line")}
                            className="text-xs"
                          >
                            Line Chart
                          </Button>
                        </div>
                     </div>
                     
                     {/* Metric Selection */}
                     <div className="flex flex-wrap gap-2">
                       {availableMetrics.map((metric) => (
                         <Button
                           key={metric.key}
                           variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
                           size="sm"
                           onClick={() => {
                             if (selectedMetrics.includes(metric.key)) {
                               setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key))
                             } else {
                               setSelectedMetrics([...selectedMetrics, metric.key])
                             }
                           }}
                           className="flex items-center gap-2"
                         >
                           <metric.icon className="h-4 w-4" />
                           {metric.label}
                         </Button>
                       ))}
                     </div>
                   </div>

                                                                           {/* Chart Visualization */}
                     <div className="h-96 bg-gray-900 rounded-lg p-4 border border-gray-700">
                                               {chartType === "normalized" ? (
                          <NormalizedChart 
                            data={data.data} 
                            selectedMetrics={selectedMetrics}
                            height={320}
                          />
                        ) : (
                          <LineChart 
                            data={data.data} 
                            selectedMetrics={selectedMetrics}
                            height={320}
                          />
                        )}
                     </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                     {/* Correlation Analysis Tab */}
           <TabsContent value="correlation" className="space-y-4">
             <Card className="bg-gray-800 border-gray-700">
               <CardHeader>
                 <CardTitle className="text-white">Correlation Analysis</CardTitle>
                 <CardDescription className="text-gray-400">
                   See how different metrics relate to each other over time
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div className="text-sm text-gray-400 text-center mb-4">
                     Correlation values range from -1 (perfect negative) to +1 (perfect positive)
                   </div>
                                       <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="p-3 text-gray-300 text-left font-medium">Metric</th>
                            {['Price', 'Sentiment', 'Interactions', 'Contributors', 'Posts', 'Galaxy', 'Volume', 'Alt Rank'].map(label => (
                              <th key={label} className="p-3 text-gray-300 text-center font-medium">{label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(calculateCorrelations(data.data)).map(([metric, correlations]) => (
                            <tr key={metric} className="border-b border-gray-700">
                              <td className="p-3 text-gray-300 font-medium">
                                {availableMetrics.find(m => m.key === metric)?.label || metric}
                              </td>
                              {Object.entries(correlations).map(([metric2, correlation]) => {
                                const absCorr = Math.abs(correlation)
                                const intensity = absCorr > 0.7 ? 'bg-opacity-90' : absCorr > 0.5 ? 'bg-opacity-70' : absCorr > 0.3 ? 'bg-opacity-50' : 'bg-opacity-30'
                                const color = correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                                
                                                                 return (
                                   <td key={metric2} className="p-3 text-center">
                                     <div className={`inline-block w-16 h-12 rounded-lg ${color} ${intensity} flex items-center justify-center text-white font-bold text-sm`}>
                                       {correlation.toFixed(2)}
                                     </div>
                                   </td>
                                 )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                  {formatTime(data.data[0]?.time || 0)} - {formatTime(data.data[data.data.length - 1]?.time || 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Price Range</div>
                <div className="text-white font-medium">
                  {formatPrice(Math.min(...data.data.map(d => d.close)))} - {formatPrice(Math.max(...data.data.map(d => d.close)))}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Avg Sentiment</div>
                <div className="text-white font-medium">
                  {(data.data.reduce((sum, d) => sum + d.sentiment, 0) / data.data.length).toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Total Interactions</div>
                <div className="text-white font-medium">
                  {formatNumber(data.data.reduce((sum, d) => sum + d.interactions, 0))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
