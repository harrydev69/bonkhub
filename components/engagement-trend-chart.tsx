"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

export type ChartData = {
  hour: string
  engagement: number
  sentiment: number
}

interface EngagementTrendChartProps {
  data: ChartData[]
}

export function EngagementTrendChart({ data }: EngagementTrendChartProps) {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Engagement & Sentiment Trends</CardTitle>
        <CardDescription className="text-gray-400">24-hour engagement volume and sentiment correlation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="engagement" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="sentiment" orientation="right" stroke="#9ca3af" fontSize={12} domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
                formatter={(value: any, name: string) => [
                  name === "engagement" ? value.toLocaleString() : (value * 100).toFixed(1) + "%",
                  name === "engagement" ? "Engagement" : "Sentiment",
                ]}
              />
              <Area
                yAxisId="engagement"
                type="monotone"
                dataKey="engagement"
                stroke="#ff6b35"
                strokeWidth={2}
                fill="url(#engagementGradient)"
              />
              <Line
                yAxisId="sentiment"
                type="monotone"
                dataKey="sentiment"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#ff6b35] rounded-full"></div>
            <span className="text-sm text-gray-400">Engagement Volume</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Sentiment Score</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
