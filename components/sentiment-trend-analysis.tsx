"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Download, TrendingDown } from "lucide-react"

export function SentimentTrendAnalysis() {
  // Generate sample sentiment data for 24 hours
  const generateSentimentData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, "0")}:00`,
      overall: Math.random() * 40 + 40, // 40-80 range
      social: Math.random() * 40 + 35, // 35-75 range
      news: Math.random() * 40 + 45, // 45-85 range
      technical: Math.random() * 40 + 50, // 50-90 range
    }))
  }

  const [sentimentData] = useState(generateSentimentData())

  const sentimentMetrics = [
    {
      title: "Overall Sentiment",
      value: 69,
      change: -3.5,
      color: "text-orange-500",
    },
    {
      title: "Social Sentiment",
      value: 62,
      change: -1.9,
      color: "text-blue-400",
    },
    {
      title: "News Sentiment",
      value: 62,
      change: +1.1,
      color: "text-green-400",
    },
    {
      title: "Technical Sentiment",
      value: 76,
      change: -0.7,
      color: "text-purple-400",
    },
  ]

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-orange-500">📈</span>
            Sentiment Trend Analysis
          </CardTitle>
          <p className="text-gray-400 text-sm">Real-time sentiment tracking across multiple sources</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500 text-green-400">
            Live Updates
          </Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            24 Hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentiment Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sentimentMetrics.map((metric) => (
            <div key={metric.title} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-sm text-gray-400 mb-2">{metric.title}</div>
              <div
                className={`text-sm flex items-center justify-center gap-1 ${
                  metric.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {metric.change >= 0 ? "+" : ""}
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Sentiment Trends Over Time</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-orange-500 hover:bg-orange-500/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Chart
            </Button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#F97316"
                  strokeWidth={2}
                  name="Overall"
                  dot={{ fill: "#F97316", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="social"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  name="Social"
                  dot={{ fill: "#60A5FA", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="news"
                  stroke="#34D399"
                  strokeWidth={2}
                  name="News"
                  dot={{ fill: "#34D399", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="technical"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  name="Technical"
                  dot={{ fill: "#A78BFA", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Sentiment Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">AI Sentiment Analysis</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-orange-500 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Current Trend
              </h4>
              <p className="text-gray-300 text-sm">
                📉 Sentiment shows slight decline but remains within normal volatility range.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-orange-500 mb-2 flex items-center gap-2">🎯 Key Drivers</h4>
              <p className="text-gray-300 text-sm">
                🎮 Gaming partnerships and Solana ecosystem growth are primary positive sentiment drivers.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
