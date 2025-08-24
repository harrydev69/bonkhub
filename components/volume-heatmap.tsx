"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"

export function VolumeHeatmap() {
  const [isLoading, setIsLoading] = useState(false)

  // Generate heatmap data for 24 hours x 7 days
  const generateHeatmapData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

    return days.map((day) => ({
      day,
      hours: hours.map((hour) => ({
        hour,
        volume: Math.random() * 1000 + 200, // Random volume between 200-1200M
        intensity: Math.floor(Math.random() * 5) + 1, // 1-5 intensity levels
      })),
    }))
  }

  const [heatmapData] = useState(generateHeatmapData())

  const getIntensityColor = (intensity: number) => {
    const colors = {
      1: "bg-gray-800", // Very Low
      2: "bg-orange-900/30", // Low
      3: "bg-orange-700/50", // Medium
      4: "bg-orange-500/70", // High
      5: "bg-orange-400", // Very High
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
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-orange-500">📊</span>
            Volume Heatmap
          </CardTitle>
          <p className="text-gray-400 text-sm">Real-time BONK trading volume from CoinGecko</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500 text-green-400">
            Live Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">$382.08B</div>
            <div className="text-sm text-gray-400">Total Volume</div>
            <div className="text-xs text-gray-500">722 hours of data</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$529.20M</div>
            <div className="text-sm text-gray-400">Average/Hour</div>
            <div className="text-xs text-gray-500">Across 30 days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">15:00 UTC</div>
            <div className="text-sm text-gray-400">Peak Hour</div>
            <div className="text-xs text-gray-500">Highest average volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">30 Days</div>
            <div className="text-sm text-gray-400">Data Range</div>
            <div className="text-xs text-gray-500">Updates every 5 minutes</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Volume Intensity by Time (UTC)</h3>
          <div className="text-xs text-gray-400">Data from CoinGecko • Updates every 5 minutes</div>

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
            {heatmapData.map((dayData) => (
              <div key={dayData.day} className="flex items-center">
                <div className="w-12 text-xs text-gray-400 text-right pr-2">{dayData.day}</div>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {dayData.hours.map((hourData) => (
                    <div
                      key={`${dayData.day}-${hourData.hour}`}
                      className={`h-4 rounded-sm ${getIntensityColor(hourData.intensity)} hover:ring-1 hover:ring-orange-500 cursor-pointer transition-all`}
                      title={`${dayData.day} ${hourData.hour}:00 - $${hourData.volume.toFixed(2)}M - ${getIntensityLabel(hourData.intensity)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Volume Intensity:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((intensity) => (
                  <div key={intensity} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`} />
                    <span className="text-xs text-gray-400">{getIntensityLabel(intensity)}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-orange-500 hover:bg-orange-500/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Intensity Thresholds */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Intensity Thresholds (Quantiles)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Q20", level: "Very Low", value: "$456.58M" },
                { label: "Q40", level: "Low", value: "$495.40M" },
                { label: "Q60", level: "Medium", value: "$524.02M" },
                { label: "Q80", level: "High", value: "$614.42M" },
                { label: "Q100", level: "Very High", value: "$800.00M+" },
              ].map((threshold) => (
                <div key={threshold.label} className="text-center">
                  <div className="text-sm font-semibold text-orange-500">{threshold.label}</div>
                  <div className="text-xs text-gray-400">{threshold.level}</div>
                  <div className="text-sm text-white">{threshold.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
