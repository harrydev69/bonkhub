"use client"

import { useMemo } from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

type DataPoint = {
  time: number
  [key: string]: number
}

type LineChartProps = {
  data: DataPoint[]
  selectedMetrics: string[]
  height?: number
}

const COLORS = {
  close: "#10b981",           // Green for price
  sentiment: "#3b82f6",       // Blue for sentiment
  interactions: "#f59e0b",     // Orange for interactions
  contributors_active: "#8b5cf6", // Purple for contributors
  posts_active: "#ef4444",    // Red for posts
  galaxy_score: "#06b6d4",    // Cyan for galaxy score
  social_dominance: "#84cc16",      // Lime for social dominance
  alt_rank: "#f97316"         // Orange-red for alt rank
}

const METRIC_LABELS = {
  close: "Price",
  sentiment: "Sentiment",
  interactions: "Interactions",
  contributors_active: "Active Contributors",
  posts_active: "Active Posts",
  galaxy_score: "Galaxy Score",
  social_dominance: "Social Dominance",
  alt_rank: "Alt Rank"
}

export function LineChart({ data, selectedMetrics, height = 400 }: LineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map(point => {
      const formattedPoint: any = {
        time: new Date(point.time * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          hour12: true
        }),
        timestamp: point.time
      }

      // Add selected metrics to the chart data
      selectedMetrics.forEach(metric => {
        if (point[metric] !== undefined) {
          formattedPoint[metric] = point[metric]
        }
      })

      return formattedPoint
    })
  }, [data, selectedMetrics])

  const formatValue = (value: number, metric: string) => {
    if (metric === 'close') {
      return `$${value.toFixed(8)}`
    }
    if (metric === 'social_dominance') {
      return value.toFixed(4)
    }
    if (metric === 'sentiment' || metric === 'galaxy_score') {
      return value.toFixed(1)
    }
    return value.toLocaleString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {METRIC_LABELS[entry.dataKey as keyof typeof METRIC_LABELS]}: {formatValue(entry.value, entry.dataKey)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available for selected metrics
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ color: '#9CA3AF' }}
          formatter={(value) => <span style={{ color: '#9CA3AF' }}>{METRIC_LABELS[value as keyof typeof METRIC_LABELS]}</span>}
        />
        
        {selectedMetrics.map(metric => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={COLORS[metric as keyof typeof COLORS]}
            strokeWidth={3}
            dot={{ fill: COLORS[metric as keyof typeof COLORS], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
