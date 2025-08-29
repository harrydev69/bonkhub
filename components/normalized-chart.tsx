"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
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

type NormalizedChartProps = {
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

export function NormalizedChart({ data, selectedMetrics, height = 400 }: NormalizedChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Calculate min/max for each metric to normalize to 0-100
    const metricRanges: { [key: string]: { min: number; max: number } } = {}
    
    selectedMetrics.forEach(metric => {
      const values = data.map(d => d[metric as keyof DataPoint] as number).filter(v => !isNaN(v))
      if (values.length > 0) {
        metricRanges[metric] = {
          min: Math.min(...values),
          max: Math.max(...values)
        }
      }
    })

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

      // Normalize each metric to 0-100 scale
      selectedMetrics.forEach(metric => {
        if (point[metric] !== undefined && metricRanges[metric]) {
          const { min, max } = metricRanges[metric]
          if (max === min) {
            formattedPoint[metric] = 50 // If all values are the same, put at middle
          } else {
            formattedPoint[metric] = ((point[metric] - min) / (max - min)) * 100
          }
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
              {METRIC_LABELS[entry.dataKey as keyof typeof METRIC_LABELS]}: {formatValue(entry.payload[entry.dataKey], entry.dataKey)}
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
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {selectedMetrics.map(metric => (
            <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[metric as keyof typeof COLORS]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS[metric as keyof typeof COLORS]} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        
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
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ color: '#9CA3AF' }}
          formatter={(value) => <span style={{ color: '#9CA3AF' }}>{METRIC_LABELS[value as keyof typeof METRIC_LABELS]}</span>}
        />
        
        {selectedMetrics.map(metric => (
          <Area
            key={metric}
            type="monotone"
            dataKey={metric}
            stackId="1"
            stroke={COLORS[metric as keyof typeof COLORS]}
            fill={`url(#gradient-${metric})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
