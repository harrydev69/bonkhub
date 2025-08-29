"use client"

import React from 'react'
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react'

interface ChartLoadingProps {
  title?: string
  description?: string
  chartType?: 'line' | 'area' | 'bar' | 'pie' | 'generic'
  className?: string
}

export function ChartLoading({ 
  title = "Loading Chart", 
  description = "Fetching chart data...",
  chartType = 'generic',
  className = "" 
}: ChartLoadingProps) {
  
  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
      case 'area':
        return TrendingUp
      case 'bar':
        return BarChart3
      case 'pie':
        return PieChart
      default:
        return Activity
    }
  }

  const ChartIcon = getChartIcon()

  return (
    <div className={`flex items-center justify-center h-full min-h-[300px] bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="text-center space-y-4">
        {/* Animated icon container */}
        <div className="mx-auto w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-gray-600 hover:border-orange-500/30 transition-all duration-500">
          <ChartIcon className="w-8 h-8 text-orange-400 animate-pulse" />
        </div>
        
        {/* Loading content */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        
        {/* Bouncing dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Optional progress bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific chart loading variants
export const ChartLoadingVariants = {
  priceChart: (
    <ChartLoading 
      title="Loading Price Chart"
      description="Fetching BONK price data..."
      chartType="line"
    />
  ),
  
  volumeChart: (
    <ChartLoading 
      title="Loading Volume Chart"
      description="Analyzing trading volume..."
      chartType="bar"
    />
  ),
  
  sentimentChart: (
    <ChartLoading 
      title="Loading Sentiment Chart"
      description="Processing social sentiment..."
      chartType="area"
    />
  ),
  
  performanceChart: (
    <ChartLoading 
      title="Loading Performance Chart"
      description="Calculating performance metrics..."
      chartType="generic"
    />
  )
}
