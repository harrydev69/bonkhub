"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, DollarSign } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

type ChartDataPoint = {
  timestamp: number
  price: number
  marketCap: number
  volume: number
  date: string
}

type ChartPayload = {
  timeframe: string
  dataPoints: ChartDataPoint[]
  summary: {
    startPrice: number
    endPrice: number
    changePercent: number
    changeAmount: number
    highestPrice: number
    lowestPrice: number
    totalVolume: number
    avgVolume: number
    highestVolume: number
    lowestVolume: number
  }
  metadata: {
    totalPoints: number
    timeRange: string
    lastUpdated: string
  }
}

const timeRanges = [
  { value: "1", label: "24H" },
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "365", label: "1Y" },
]

export function InteractivePriceChart() {
  const [chartData, setChartData] = useState<ChartPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState("1")
  const [chartMode, setChartMode] = useState<"price" | "marketCap">("price")
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null)

  useEffect(() => {
    fetchChartData(selectedRange)
  }, [selectedRange])

  const fetchChartData = async (days: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching chart data for ${days} days...`)
      const response = await fetch(`/api/bonk/chart?days=${days}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`)
      }

      const data = await response.json()
      console.log("Chart data received:", data)
      console.log("Data points:", data.dataPoints)
      console.log("First data point:", data.dataPoints?.[0])
      console.log("Last data point:", data.dataPoints?.[data.dataPoints?.length - 1])

      setChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch chart data")
      console.error("Chart fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price < 0.0001) return `$${price.toFixed(8)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatPercentage = (pct: number) => {
    const isPositive = pct >= 0
    return (
      <span className={`flex items-center ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {Math.abs(pct).toFixed(2)}%
      </span>
    )
  }

  const formatChartDate = (date: string | number) => {
    if (typeof date === "string") {
      const d = new Date(date)
      if (isNaN(d.getTime())) return "Invalid Date"

      // Format based on selectedRange
      if (selectedRange === "1") {
        return d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      } else if (selectedRange === "7") {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      } else {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }
    }
    return "Invalid Date"
  }

  // Process chart data for proper display
  const dataPoints = useMemo(() => {
    if (!chartData?.dataPoints) {
      console.log("No dataPoints found in chartData, checking alternative structure...")
      console.log("chartData keys:", Object.keys(chartData || {}))

      // Try alternative data structure - check if it's a different API response format
      if (chartData && typeof chartData === "object" && "data" in chartData) {
        console.log("Found alternative data structure, using that instead")
        return (chartData as any).data || []
      }

      console.log("No valid chart data structure found")
      return []
    }

    // Sort data points by timestamp to ensure proper chronological order
    const sortedData = [...chartData.dataPoints].sort((a, b) => a.timestamp - b.timestamp)

    // Filter out any invalid data points
    const validData = sortedData.filter(
      (point) => point.price > 0 && point.timestamp > 0 && !isNaN(point.price) && !isNaN(point.timestamp),
    )

    const processed = validData.map((point) => ({
      ...point,
      date: formatChartDate(point.date),
      // Ensure price is properly formatted for display
      displayPrice: formatPrice(point.price),
    }))

    return processed
  }, [chartData])

  const summary = chartData?.summary || {
    startPrice: 0,
    endPrice: 0,
    changePercent: 0,
    changeAmount: 0,
    highestPrice: 0,
    lowestPrice: 0,
    totalVolume: 0,
    avgVolume: 0,
    highestVolume: 0,
    lowestVolume: 0,
  }

  const metadata = chartData?.metadata || {
    totalPoints: 0,
    timeRange: "",
    lastUpdated: "",
  }

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-400">
            <span>{error}</span>
          </div>
          <Button
            onClick={() => fetchChartData(selectedRange)}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!chartData) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <span className="text-gray-400">No chart data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/95 border-gray-700 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <CardTitle className="text-white flex items-center space-x-2 text-xl">
              <BarChart3 className="h-6 w-6 text-orange-500" />
              <span>BONK Price Chart</span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 font-medium">Timeframe:</span>
              <ToggleGroup
                type="single"
                value={selectedRange}
                onValueChange={(value) => value && setSelectedRange(value)}
                className="bg-gray-800/80 border border-gray-600 rounded-lg p-1"
              >
                {timeRanges.map((range) => (
                  <ToggleGroupItem
                    key={range.value}
                    value={range.value}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 data-[state=on]:bg-orange-600 data-[state=on]:text-white transition-all duration-200 px-3 py-1.5"
                  >
                    {range.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 font-medium">View:</span>
              <ToggleGroup
                type="single"
                value={chartMode}
                onValueChange={(value) => value && setChartMode(value as "price" | "marketCap")}
                className="bg-gray-800/80 border border-gray-600 rounded-lg p-1"
              >
                <ToggleGroupItem
                  value="price"
                  className="text-gray-300 hover:text-white hover:bg-gray-700 data-[state=on]:bg-orange-600 data-[state=on]:text-white transition-all duration-200 px-3 py-1.5"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Price
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="marketCap"
                  className="text-gray-300 hover:text-white hover:bg-gray-700 data-[state=on]:bg-orange-600 data-[state=on]:text-white transition-all duration-200 px-3 py-1.5"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Market Cap
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-96 w-full bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp)
                  if (isNaN(date.getTime())) return ""

                  if (selectedRange === "1") {
                    const hour = date.getHours()
                    if (hour % 3 === 0) {
                      return date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    }
                    return ""
                  } else if (selectedRange === "7") {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  } else {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (chartMode === "price") {
                    return `$${value.toFixed(8)}`
                  }
                  return `$${formatNumber(value)}`
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #FF6B35",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  backdropFilter: "blur(10px)",
                }}
                formatter={(value: number) => {
                  if (chartMode === "price") {
                    return [formatPrice(value), "Price"]
                  }
                  return [`$${formatNumber(value)}`, "Market Cap"]
                }}
                labelFormatter={(timestamp) => {
                  const date = new Date(timestamp)
                  if (isNaN(date.getTime())) return "Invalid Date"

                  const formattedDate = date.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })

                  return `Date: ${formattedDate}`
                }}
              />
              <Area
                type="monotone"
                dataKey={chartMode}
                stroke="#FF6B35"
                strokeWidth={3}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#FF6B35",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                  filter: "drop-shadow(0 0 6px rgba(255,107,53,0.6))",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="text-center bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200">
            <div className="flex items-center justify-center mb-2">{formatPercentage(summary.changePercent)}</div>
            <div className="text-sm text-gray-300 font-medium">Price Change</div>
            <div className="text-xs text-gray-500 mt-1">{formatPrice(summary.changeAmount)}</div>
          </div>

          <div className="text-center bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200">
            <div className="text-white font-bold text-lg">${formatNumber(summary.totalVolume)}</div>
            <div className="text-sm text-gray-300 font-medium">Total Volume</div>
            <div className="text-xs text-gray-500 mt-1">Avg: ${formatNumber(summary.avgVolume)}</div>
          </div>

          <div className="text-center bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200">
            <div className="text-white font-bold text-lg">${formatNumber(summary.highestVolume)}</div>
            <div className="text-sm text-gray-300 font-medium">Peak Volume</div>
            <div className="text-xs text-gray-500 mt-1">Low: ${formatNumber(summary.lowestVolume)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 bg-gray-800" />
            <Skeleton className="h-4 w-32 bg-gray-800 mt-2" />
          </div>
          <Skeleton className="h-10 w-20 bg-gray-800" />
        </div>

        <div className="flex items-center space-x-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-12 bg-gray-800" />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full bg-gray-800" />

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-6 w-16 bg-gray-800 mx-auto" />
              <Skeleton className="h-4 w-20 bg-gray-800 mx-auto mt-2" />
              <Skeleton className="h-3 w-12 bg-gray-800 mx-auto mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
