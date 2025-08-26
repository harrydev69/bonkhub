"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw } from "lucide-react"

// Type definitions
interface HourData {
  hour: string
  volume: number
  intensity: number
}

interface DayData {
  day: string
  hours: HourData[]
}

interface SummaryData {
  totalVolume: number
  averagePerHour: number
  peakHour: string
  dataRange: string
  updateFrequency: string
}

export function VolumeHeatmap() {
  const [isLoading, setIsLoading] = useState(false)
  const [heatmapData, setHeatmapData] = useState<DayData[]>([])
  const [summary, setSummary] = useState<SummaryData>({
    totalVolume: 0,
    averagePerHour: 0,
    peakHour: "",
    dataRange: "",
    updateFrequency: ""
  })
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Fetch real volume data
  const fetchVolumeData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/bonk/volume-heatmap')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error && data.fallback) {
        // Use fallback data if API fails
        setHeatmapData(data.fallback.heatmap)
        setSummary(data.fallback.summary)
        setLastUpdated(new Date().toISOString())
      } else {
        // Use real data
        setHeatmapData(data.heatmap)
        setSummary(data.summary)
        setLastUpdated(data.lastUpdated)
      }
    } catch (err) {
      console.error('Error fetching volume data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch volume data')
      // Generate fallback data on complete failure
      const fallbackData = generateFallbackData()
      setHeatmapData(fallbackData.heatmap)
      setSummary(fallbackData.summary)
      setLastUpdated(new Date().toISOString())
    } finally {
      setIsLoading(false)
    }
  }

  // Generate fallback data for initial state and errors
  const generateFallbackData = (): { heatmap: DayData[], summary: SummaryData } => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

    const seed = 12345
    let currentSeed = seed

    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280
      return currentSeed / 233280
    }

    return {
      heatmap: days.map((day, dayIndex) => ({
        day,
        hours: hours.map((hour, hourIndex) => {
          const volumeSeed = (dayIndex * 24 + hourIndex) * seed
          const volume = 200 + (volumeSeed % 800) + (seededRandom() * 200)
          const intensity = Math.floor((volumeSeed % 5) + 1)
          
          return {
            hour,
            volume: Math.round(volume),
            intensity,
          }
        }),
      })),
      summary: {
        totalVolume: 382080000000,
        averagePerHour: 529200000,
        peakHour: "15:00 UTC",
        dataRange: "7 Days",
        updateFrequency: "Every 5 minutes"
      }
    }
  }

  // Initialize with fallback data and fetch real data
  useEffect(() => {
    const fallbackData = generateFallbackData()
    setHeatmapData(fallbackData.heatmap)
    setSummary(fallbackData.summary)
    setLastUpdated(new Date().toISOString())
    
    fetchVolumeData()
    
         // Auto-refresh every 30 minutes (1800000ms)
     const interval = setInterval(fetchVolumeData, 1800000)
    
    return () => clearInterval(interval)
  }, [])

  const getIntensityColor = (intensity: number) => {
    const colors = {
      1: "bg-gray-700", // Very Low - Dark gray
      2: "bg-blue-600", // Low - Blue
      3: "bg-yellow-500", // Medium - Yellow
      4: "bg-orange-500", // High - Orange
      5: "bg-red-500", // Very High - Bright red
    }
    return colors[intensity as keyof typeof colors] || colors[1]
  }

  const getIntensityLabel = (intensity: number) => {
    const labels = {
      1: "Very Low",
      2: "Low",
      3: "Medium",
      4: "High",
      5: "Very High",
    }
    return labels[intensity as keyof typeof labels] || "Very Low"
  }

  return (
    <Card className="group bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[#ff6b35] text-2xl font-bold flex items-center gap-2 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
            <span className="text-orange-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 group-hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.6)]">📊</span>
            Volume Heatmap
          </CardTitle>
                     <p className="text-gray-400 text-sm transition-all duration-500 group-hover:text-gray-300">
             Real-time BONK trading volume • Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : '...'}
           </p>
        </div>

      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group/item text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-orange-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
              ${isLoading ? '...' : (summary.totalVolume / 1e9).toFixed(2)}B
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Total Volume</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">168 hours of data</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-gray-700/10 to-gray-600/5 rounded-lg border border-gray-600/20 hover:border-gray-500/40 hover:bg-gray-600/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-white transition-all duration-500 group-hover/item:text-orange-400 group-hover/item:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
              ${isLoading ? '...' : (summary.averagePerHour / 1e6).toFixed(2)}M
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Average/Hour</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">Across 7 days</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-green-500/10 to-green-400/5 rounded-lg border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-green-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">
              {isLoading ? '...' : summary.peakHour}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Peak Hour</div>
            <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">Highest average volume</div>
          </div>
          <div className="group/item text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-3xl font-bold text-blue-400 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]">
              {isLoading ? '...' : summary.dataRange}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Data Range</div>
                         <div className="text-xs text-gray-500 transition-all duration-500 group-hover/item:text-gray-400">Every 30 minutes</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="space-y-4 group/heatmap">
          <h3 className="text-lg font-semibold text-white transition-all duration-500 group-hover/heatmap:text-orange-400 group-hover/heatmap:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">Volume Intensity by Time (UTC)</h3>
                     <div className="text-xs text-gray-400 transition-all duration-500 group-hover/heatmap:text-gray-300">Updates every 30 minutes</div>

          {/* Hour labels */}
          <div className="flex">
            <div className="w-12"></div>
            <div className="flex-1 grid grid-cols-24 gap-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-xs text-gray-400 text-center">
                  {i.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="flex items-center">
                  <div className="w-12 text-xs text-gray-400 text-right pr-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex]}
                  </div>
                  <div className="flex-1 grid grid-cols-24 gap-1">
                    {Array.from({ length: 24 }).map((_, hourIndex) => (
                      <div
                        key={hourIndex}
                        className="h-4 rounded-sm bg-gray-700 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              heatmapData.map((dayData) => (
                <div key={dayData.day} className="flex items-center">
                  <div className="w-12 text-xs text-gray-400 text-right pr-2">{dayData.day}</div>
                  <div className="flex-1 grid grid-cols-24 gap-1">
                    {dayData.hours.map((hourData) => (
                      <div
                        key={`${dayData.day}-${hourData.hour}`}
                        className={`h-4 rounded-sm ${getIntensityColor(hourData.intensity)} hover:ring-2 hover:ring-orange-500 hover:scale-110 hover:shadow-[0_0_4px_rgba(255,107,53,0.4)] cursor-pointer transition-all duration-500 transform-gpu`}
                        title={`${dayData.day} ${hourData.hour}:00 - $${(hourData.volume / 1e6).toFixed(2)}M - ${getIntensityLabel(hourData.intensity)}`}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between group/legend">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 transition-all duration-500 group-hover/legend:text-gray-300">Volume Intensity:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((intensity) => (
                  <div key={intensity} className="flex items-center gap-1 group/intensity">
                    <div className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)} transition-all duration-500 group-hover/intensity:scale-125 group-hover/intensity:shadow-[0_0_3px_rgba(255,107,53,0.4)]`} />
                    <span className="text-xs text-gray-400 transition-all duration-500 group-hover/intensity:text-gray-300">{getIntensityLabel(intensity)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Intensity Thresholds */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30 hover:border-orange-500/50 hover:bg-gray-800/70 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu group/thresholds">
            <h4 className="text-sm font-semibold text-white mb-3 transition-all duration-500 group-hover/thresholds:text-orange-400 group-hover/thresholds:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">Intensity Thresholds (Dynamic)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                             {[
                 { label: "Very Low", level: "Intensity 1", value: "<$5M", color: "from-gray-700/20 to-gray-600/10" },
                 { label: "Low", level: "Intensity 2", value: "$5M-$10M", color: "from-blue-600/20 to-blue-500/10" },
                 { label: "Medium", level: "Intensity 3", value: "$10M-$25M", color: "from-yellow-500/20 to-yellow-400/10" },
                 { label: "High", level: "Intensity 4", value: "$25M-$50M", color: "from-orange-500/20 to-orange-400/10" },
                 { label: "Very High", level: "Intensity 5", value: "$50M+", color: "from-red-500/20 to-red-400/10" },
               ].map((threshold) => (
                <div key={threshold.label} className={`group/item text-center p-3 bg-gradient-to-br ${threshold.color} rounded-lg border border-gray-600/20 hover:border-orange-500/50 hover:bg-orange-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer`}>
                  <div className="text-sm font-semibold text-orange-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">{threshold.label}</div>
                  <div className="text-xs text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">{threshold.level}</div>
                  <div className="text-sm text-white transition-all duration-500 group-hover/item:text-orange-400 group-hover/item:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)]">{threshold.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
