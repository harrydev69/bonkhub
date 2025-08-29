"use client"

import { useMemo } from "react"

type DataPoint = {
  time: number
  [key: string]: number
}

type TestChartProps = {
  data: DataPoint[]
  selectedMetrics: string[]
  height?: number
  width?: number
}

const COLORS = {
  close: "#10b981",
  sentiment: "#3b82f6", 
  interactions: "#f59e0b",
  contributors_active: "#8b5cf6",
  posts_active: "#ef4444",
  galaxy_score: "#06b6d4",
  volume_24h: "#84cc16",
  alt_rank: "#f97316"
}

export function TestChart({ data, selectedMetrics, height = 400, width = 800 }: TestChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const timeRange = {
      min: Math.min(...data.map(d => d.time)),
      max: Math.max(...data.map(d => d.time))
    }

    const metricRanges = selectedMetrics.reduce((acc, metric) => {
      const values = data.map(d => d[metric]).filter(v => typeof v === 'number' && !isNaN(v))
      if (values.length > 0) {
        acc[metric] = {
          min: Math.min(...values),
          max: Math.max(...values)
        }
      }
      return acc
    }, {} as Record<string, { min: number; max: number }>)

    return { timeRange, metricRanges }
  }, [data, selectedMetrics])

  if (!chartData || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available for chart
      </div>
    )
  }

  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const xScale = (time: number) => {
    return padding + ((time - chartData.timeRange.min) / (chartData.timeRange.max - chartData.timeRange.min)) * chartWidth
  }

  const yScale = (value: number, metric: string) => {
    const range = chartData.metricRanges[metric]
    if (!range) return padding
    return height - padding - ((value - range.min) / (range.max - range.min)) * chartHeight
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    })
  }

  const formatValue = (value: number, metric: string) => {
    if (metric === 'close') return `$${value.toFixed(8)}`
    if (metric === 'volume_24h') return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(1)
  }

  return (
    <div className="relative">
      <svg width={width} height={height} className="w-full h-full">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Y-axis labels */}
        {selectedMetrics.map((metric, index) => {
          const range = chartData.metricRanges[metric]
          if (!range) return null
          
          const step = chartHeight / 4
          return Array.from({ length: 5 }, (_, i) => {
            const value = range.min + (range.max - range.min) * (i / 4)
            const y = height - padding - (i / 4) * chartHeight
            return (
              <g key={`${metric}-${i}`}>
                <line 
                  x1={padding - 5} 
                  y1={y} 
                  x2={padding} 
                  y2={y} 
                  stroke="#6b7280" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-xs fill-gray-400"
                >
                  {formatValue(value, metric)}
                </text>
              </g>
            )
          })
        })}

        {/* X-axis labels */}
        {Array.from({ length: 6 }, (_, i) => {
          const time = chartData.timeRange.min + (chartData.timeRange.max - chartData.timeRange.min) * (i / 5)
          const x = padding + (i / 5) * chartWidth
          return (
            <g key={`time-${i}`}>
              <line 
                x1={x} 
                y1={height - padding} 
                x2={x} 
                y2={height - padding + 5} 
                stroke="#6b7280" 
                strokeWidth="1"
              />
              <text 
                x={x} 
                y={height - padding + 20} 
                textAnchor="middle" 
                className="text-xs fill-gray-400"
              >
                {formatTime(time)}
              </text>
            </g>
          )
        })}

        {/* Chart lines */}
        {selectedMetrics.map((metric) => {
          const points = data
            .map(d => ({ x: xScale(d.time), y: yScale(d[metric], metric) }))
            .filter(p => !isNaN(p.y))

          if (points.length < 2) return null

          const pathData = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ')

          return (
            <g key={metric}>
              <path
                d={pathData}
                fill="none"
                stroke={COLORS[metric as keyof typeof COLORS] || "#6b7280"}
                strokeWidth="2"
                opacity="0.8"
              />
              {/* Data points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill={COLORS[metric as keyof typeof COLORS] || "#6b7280"}
                  className="hover:r-4 transition-all duration-200"
                />
              ))}
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${width - 200}, 20)`}>
          {selectedMetrics.map((metric, index) => (
            <g key={metric} transform={`translate(0, ${index * 25})`}>
              <circle
                cx="10"
                cy="10"
                r="6"
                fill={COLORS[metric as keyof typeof COLORS] || "#6b7280"}
              />
              <text
                x="25"
                y="15"
                className="text-sm fill-gray-300"
              >
                {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
