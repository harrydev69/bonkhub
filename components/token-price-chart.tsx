"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react"

interface ChartData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

interface TokenPriceChartProps {
  chartData: ChartData
  currentPrice: number
  priceChange24h: number
  symbol: string
  onTimeRangeChange: (timeRange: string) => void
  currentTimeRange: string
}

type TimeRange = "24H" | "7D" | "1M" | "3M" | "1Y"
type ChartType = "price" | "market_cap" | "volume"

export function TokenPriceChart({
  chartData,
  currentPrice,
  priceChange24h,
  symbol,
  onTimeRangeChange,
  currentTimeRange,
}: TokenPriceChartProps) {
  const [chartType, setChartType] = useState<ChartType>("price")

  const timeRangeMap = {
    "24H": "1",
    "7D": "7",
    "1M": "30",
    "3M": "90",
    "1Y": "365",
  }

  // Convert currentTimeRange to display format
  const getDisplayTimeRange = (timeRange: string): TimeRange => {
    switch (timeRange) {
      case "1": return "24H"
      case "7": return "7D"
      case "30": return "1M"
      case "90": return "3M"
      case "365": return "1Y"
      default: return "7D"
    }
  }

  const displayTimeRange = getDisplayTimeRange(currentTimeRange)

  const processedData = useMemo(() => {
    if (!chartData.prices || chartData.prices.length === 0) return []

    const days = parseInt(currentTimeRange)
    
    return chartData.prices.map(([timestamp, price]) => {
      const date = new Date(timestamp)
      let dateLabel: string
      
             if (days === 1) {
         // For 24H: show time in HH:MM format
         dateLabel = date.toLocaleTimeString("en-US", {
           hour: "2-digit",
           minute: "2-digit",
           hour12: false
         })
       } else if (days === 7) {
         // For 7D: show just numerical date (cleaner format)
         dateLabel = date.toLocaleDateString("en-US", {
           month: "numeric",
           day: "numeric"
         })
       } else if (days === 30) {
         // For 1M: show day and month (cleaner)
         dateLabel = date.toLocaleDateString("en-US", {
           month: "short",
           day: "numeric"
         })
       } else if (days === 90) {
         // For 3M: show day and month
         dateLabel = date.toLocaleDateString("en-US", {
           month: "short",
           day: "numeric"
         })
       } else {
         // For 1Y: show day and month
         dateLabel = date.toLocaleDateString("en-US", {
           month: "short",
           day: "numeric"
         })
       }
      
      return {
        date: dateLabel,
        price: price,
        marketCap: chartData.market_caps.find(([t]) => t === timestamp)?.[1] || 0,
        volume: chartData.total_volumes.find(([t]) => t === timestamp)?.[1] || 0,
        timestamp,
      }
    })
  }, [chartData, currentTimeRange])

  // Smart X-axis tick calculation (like ecosystem chart)
  const computeXTicks = (timestamps: number[], days: number): number[] => {
    if (!timestamps.length) return []
    const min = timestamps[0], max = timestamps[timestamps.length-1]
    let stepMs: number, start: number

    switch (days) {
      case 1: // 24H: every 2 hours
        stepMs = 2 * 3600_000
        start = new Date(min).setMinutes(0, 0, 0)
        break
      case 7: // 7D: daily
        stepMs = 24 * 3600_000
        start = new Date(min).setUTCHours(0, 0, 0, 0)
        break
      case 30: // 1M: every ~5 days
        stepMs = 5 * 24 * 3600_000
        start = new Date(min).setUTCHours(0, 0, 0, 0)
        break
      case 90: // 3M: every ~10 days
        stepMs = 10 * 24 * 3600_000
        start = new Date(min).setUTCHours(0, 0, 0, 0)
        break
      case 365: // 1Y: monthly-ish
        stepMs = 30 * 24 * 3600_000
        start = new Date(min).setUTCHours(0, 0, 0, 0)
        break
      default:
        stepMs = (max - min) / 6
        start = min
    }

    const ticks: number[] = []
    for (let t = start; t <= max; t += stepMs) ticks.push(t)
    if (ticks[ticks.length - 1] !== max) ticks.push(max)
    return ticks
  }

  // Improved Y-axis domain calculation (like ecosystem chart)
  const getYAxisDomain = () => {
    if (!processedData || processedData.length === 0) return [0, 0]
    
    const days = parseInt(currentTimeRange)
    let values: number[] = []
    
    if (chartType === "price") {
      values = processedData.map(d => d.price)
    } else if (chartType === "market_cap") {
      values = processedData.map(d => d.marketCap)
    } else if (chartType === "volume") {
      values = processedData.map(d => d.volume)
    }
    
    if (values.length === 0) return [0, 0]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Handle edge case where min === max
    if (min === max) {
      const eps = Math.max(1e-12, Math.abs(min) * 0.01)
      return [min - eps, max + eps]
    }
    
    // Use 6% padding like CoinGecko (ecosystem chart approach)
    const range = max - min
    const padding = range * 0.06
    
    // For price charts, never start at 0
    if (chartType === "price") {
      return [min - padding, max + padding]
    } else {
      // For market cap and volume, ensure we don't go below 0
      const minValue = Math.max(0, min - padding)
      return [minValue, max + padding]
    }
  }

  // Clean time formatting (like ecosystem chart)
  const formatTimeLabel = (timestamp: number, days: number): string => {
    const date = new Date(timestamp)
    switch (days) {
      case 1: // 24H: time only
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case 365: // 1Y: month only
        return date.toLocaleDateString([], { month: 'short' })
      default: // 7D, 30D, 90D: date only
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // Get X-axis ticks for smart labeling
  const xTicks = useMemo(() => {
    const timestamps = processedData.map(d => d.timestamp)
    return computeXTicks(timestamps, parseInt(currentTimeRange))
  }, [processedData, currentTimeRange])

  const formatYAxis = (value: number) => {
    if (chartType === "price") {
      if (value < 0.01) return `$${value.toFixed(8)}`
      if (value < 1) return `$${value.toFixed(6)}`
      if (value < 100) return `$${value.toFixed(4)}`
      return `$${value.toFixed(2)}`
    }
    if (chartType === "market_cap") {
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
      if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
      return `$${value.toFixed(0)}`
    }
    if (chartType === "volume") {
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
      if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
      return `$${value.toFixed(0)}`
    }
    return value.toString()
  }

  const formatTooltip = (value: any, name: string) => {
    if (name === "price") {
      return [`$${value.toFixed(8)}`, "Price"]
    }
    if (name === "marketCap") {
      return [`$${value.toLocaleString()}`, "Market Cap"]
    }
    if (name === "volume") {
      return [`$${value.toLocaleString()}`, "Volume"]
    }
    return [value, name]
  }

  // Enhanced tooltip content with detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const days = parseInt(currentTimeRange)
      
      // Format the full date and time
      let fullDateTime: string
      if (days === 1) {
        // For 24H: show full date and time
        fullDateTime = new Date(data.timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZoneName: "short"
        })
      } else if (days === 7) {
        // For 7D: show date and time
        fullDateTime = new Date(data.timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        })
      } else {
        // For longer periods: show date
        fullDateTime = new Date(data.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      }

      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-300 mb-2">{fullDateTime}</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Price:</span>
              <span className="text-white font-medium">${data.price.toFixed(8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Market Cap:</span>
              <span className="text-white font-medium">${data.marketCap.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Volume:</span>
              <span className="text-white font-medium">${data.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const getChartColor = () => {
    if (chartType === "price") {
      return (typeof priceChange24h === 'number' && priceChange24h >= 0) ? "#10b981" : "#ef4444"
    }
    return "#3b82f6"
  }

  const getChartData = () => {
    if (chartType === "price") return processedData.map(d => ({ ...d, value: d.price }))
    if (chartType === "market_cap") return processedData.map(d => ({ ...d, value: d.marketCap }))
    if (chartType === "volume") return processedData.map(d => ({ ...d, value: d.volume }))
    return processedData
  }

  const chartDataKey = chartType === "price" ? "price" : chartType === "market_cap" ? "marketCap" : "volume"

  if (!chartData.prices || chartData.prices.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading chart data...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.01] hover:border-orange-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">
              {chartType === "price" ? "Price Chart" : 
               chartType === "market_cap" ? "Market Cap Chart" : "Volume Chart"}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={`transition-all duration-300 hover:scale-110 ${
                  (typeof priceChange24h === 'number' && priceChange24h >= 0) ? "bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-900/40" : 
                  "bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40"
                }`}
              >
                {(typeof priceChange24h === 'number' && priceChange24h >= 0) ? (
                  <TrendingUp className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:-rotate-12" />
                )}
                {priceChange24h >= 0 ? "+" : ""}{(typeof priceChange24h === 'number' ? priceChange24h.toFixed(2) : '0.00')}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Buttons */}
            <div className="flex items-center space-x-1 mr-4">
              <Button
                variant={chartType === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("price")}
                className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  chartType === "price" 
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/50" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                $ Price
              </Button>
              <Button
                variant={chartType === "market_cap" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("market_cap")}
                className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  chartType === "market_cap" 
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/50" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                Market Cap
              </Button>
              <Button
                variant={chartType === "volume" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("volume")}
                className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  chartType === "volume" 
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/50" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                Volume
              </Button>
            </div>

            {/* Time Range Buttons */}
            <div className="inline-flex rounded-md overflow-hidden border border-gray-700 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
              {["24H", "7D", "1M", "3M", "1Y"].map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTimeRangeChange(timeRangeMap[range as TimeRange])}
                  className={`px-3 py-1 text-sm rounded-none transition-all duration-300 hover:scale-105 ${
                    displayTimeRange === range 
                      ? "bg-orange-600 text-white shadow-orange-500/50" 
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-orange-400"
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-orange-500/10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()}>
              <defs>
                                 <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="rgba(255, 109, 41, 0.6)" />
                   <stop offset="100%" stopColor="rgba(255, 109, 41, 0.05)" />
                 </linearGradient>
              </defs>
                             <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                             <XAxis 
                 dataKey="timestamp"
                 type="number"
                 domain={['dataMin', 'dataMax']}
                 ticks={xTicks}
                 tickFormatter={(ms: number) => formatTimeLabel(ms, parseInt(currentTimeRange))}
                 minTickGap={10}
                 tickMargin={8}
                 stroke="rgba(255,255,255,0.35)"
               />
                             <YAxis 
                 domain={getYAxisDomain() ?? ['auto', 'auto']}
                 tickFormatter={(v: number) => chartType === "price" ? formatYAxis(v) : formatYAxis(v)}
                 width={70}
                 stroke="rgba(255,255,255,0.35)"
               />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={formatTooltip}
                content={<CustomTooltip />}
              />
                             <Area
                 type="monotone"
                 dataKey={chartDataKey}
                 stroke="#ff6d29"
                 strokeWidth={2}
                 fill="url(#chartGradient)"
                 dot={false}
                 activeDot={{ r: 6, fill: "#ff6d29", stroke: "#ffffff", strokeWidth: 2 }}
               />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Stats */}
        <div className="mt-6 grid grid-cols-3 gap-6 pt-6 border-t border-gray-800">
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:text-orange-400">
            <div className="text-sm text-gray-400 mb-1 transition-colors duration-300 group-hover:text-orange-300">Current {chartType === "price" ? "Price" : chartType === "market_cap" ? "Market Cap" : "Volume"}</div>
            <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">
              {chartType === "price" 
                ? `$${currentPrice.toFixed(8)}`
                : chartType === "market_cap"
                ? `$${(chartData.market_caps[chartData.market_caps.length - 1]?.[1] || 0).toLocaleString()}`
                : `$${(chartData.total_volumes[chartData.total_volumes.length - 1]?.[1] || 0).toLocaleString()}`
              }
            </div>
          </div>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-105">
            <div className="text-sm text-gray-400 mb-1 transition-colors duration-300 group-hover:text-gray-300">24h Change</div>
            <div className={`text-xl font-bold transition-all duration-300 group-hover:scale-110 ${
              (typeof priceChange24h === 'number' && priceChange24h >= 0) ? "text-green-500" : "text-red-500"
            }`}>
              {priceChange24h >= 0 ? "+" : ""}{(typeof priceChange24h === 'number' ? priceChange24h.toFixed(2) : '0.00')}%
            </div>
          </div>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:text-orange-400">
            <div className="text-sm text-gray-400 mb-1 transition-colors duration-300 group-hover:text-orange-300">Data Points</div>
            <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">
              {processedData.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
