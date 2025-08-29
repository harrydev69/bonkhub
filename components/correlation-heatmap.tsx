"use client"

import { useMemo } from "react"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from "recharts"

type CorrelationData = {
  x: string
  y: string
  value: number
  metric1: string
  metric2: string
}

type CorrelationHeatmapProps = {
  correlations: { [key: string]: { [key: string]: number } }
  availableMetrics: Array<{ key: string; label: string }>
}

export function CorrelationHeatmap({ correlations, availableMetrics }: CorrelationHeatmapProps) {
  const heatmapData = useMemo(() => {
    const data: CorrelationData[] = []
    const metrics = Object.keys(correlations)
    
    metrics.forEach((metric1, i) => {
      metrics.forEach((metric2, j) => {
        const value = correlations[metric1][metric2]
        const metric1Label = availableMetrics.find(m => m.key === metric1)?.label || metric1
        const metric2Label = availableMetrics.find(m => m.key === metric2)?.label || metric2
        
        data.push({
          x: metric1Label,
          y: metric2Label,
          value,
          metric1,
          metric2
        })
      })
    })
    
    return data
  }, [correlations, availableMetrics])

  const getColor = (value: number) => {
    const absValue = Math.abs(value)
    
    if (value > 0) {
      // Positive correlation: white to green
      const intensity = Math.min(255, Math.floor(absValue * 255))
      return `rgb(0, ${intensity}, 0)`
    } else if (value < 0) {
      // Negative correlation: white to red
      const intensity = Math.min(255, Math.floor(absValue * 255))
      return `rgb(${intensity}, 0, 0)`
    } else {
      // No correlation: white
      return 'rgb(128, 128, 128)'
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CorrelationData
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="text-white font-medium mb-2">
            {data.x} vs {data.y}
          </div>
          <div className="text-sm">
            <div className="text-gray-300">Correlation:</div>
            <div className={`font-bold ${data.value > 0 ? 'text-green-400' : data.value < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {data.value.toFixed(3)}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {data.value === 1 ? 'Perfect positive correlation' :
               data.value > 0.7 ? 'Strong positive correlation' :
               data.value > 0.5 ? 'Moderate positive correlation' :
               data.value > 0.3 ? 'Weak positive correlation' :
               data.value > 0 ? 'Very weak positive correlation' :
               data.value === 0 ? 'No correlation' :
               data.value > -0.3 ? 'Very weak negative correlation' :
               data.value > -0.5 ? 'Weak negative correlation' :
               data.value > -0.7 ? 'Moderate negative correlation' :
               'Strong negative correlation'}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        >
          <XAxis
            type="category"
            dataKey="x"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            type="category"
            dataKey="y"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={heatmapData} shape="square">
            {heatmapData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(entry.value)}
                stroke={entry.value === 1 ? '#10b981' : 'none'}
                strokeWidth={entry.value === 1 ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-300">Negative Correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-gray-300">No Correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-300">Positive Correlation</span>
        </div>
      </div>
    </div>
  )
}
