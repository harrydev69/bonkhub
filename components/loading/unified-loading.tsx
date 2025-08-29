"use client"

import React from 'react'
import { Search, Calendar, Volume2, Image, Brain, BarChart3, TrendingUp, Activity } from 'lucide-react'

interface UnifiedLoadingProps {
  title?: string
  description?: string
  icon?: string
  variant?: 'page' | 'card' | 'chart' | 'table' | 'skeleton'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function UnifiedLoading({
  title = "Loading...",
  description = "Fetching latest BONK data...",
  icon,
  variant = 'page',
  size = 'md',
  className = ""
}: UnifiedLoadingProps) {
  
  const sizeClasses = {
    sm: { container: 'py-8', icon: 'w-8 h-8', title: 'text-lg', desc: 'text-sm' },
    md: { container: 'py-12', icon: 'w-12 h-12', title: 'text-2xl', desc: 'text-base' },
    lg: { container: 'py-16', icon: 'w-16 h-16', title: 'text-3xl', desc: 'text-lg' },
    xl: { container: 'py-20', icon: 'w-24 h-24', title: 'text-4xl', desc: 'text-xl' }
  }

  const sizes = sizeClasses[size]

  const getIcon = () => {
    switch (icon) {
      case 'calendar': return Calendar
      case 'volume': return Volume2
      case 'image': return Image
      case 'brain': return Brain
      case 'chart': return BarChart3
      case 'trending': return TrendingUp
      case 'activity': return Activity
      case 'search': return Search
      default: return Activity
    }
  }

  const IconComponent = getIcon()

  // Page Loading (Full screen)
  if (variant === 'page') {
    return (
      <div className={`min-h-screen bg-black text-white flex items-center justify-center ${className}`}>
        <div className="text-center space-y-6">
          <div className={`mx-auto bg-gray-800 rounded-full flex items-center justify-center animate-pulse ${sizes.icon}`}>
            <IconComponent className={`text-orange-400 ${sizes.icon}`} />
          </div>
          <div className="space-y-3">
            <h2 className={`font-bold text-white ${sizes.title}`}>{title}</h2>
            <p className={`text-gray-400 ${sizes.desc}`}>{description}</p>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Card Loading (For metric cards)
  if (variant === 'card') {
    return (
      <div className={`bg-gray-900 border-gray-700 rounded-lg p-6 animate-pulse ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="h-8 bg-gray-800 rounded w-2/3"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Chart Loading (For chart areas)
  if (variant === 'chart') {
    return (
      <div className={`flex items-center justify-center h-full min-h-[300px] ${className}`}>
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Table Loading (For table data)
  if (variant === 'table') {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
          <span className="text-gray-400 font-medium">{title}</span>
        </div>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    )
  }

  // Skeleton Loading (For content areas)
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-800 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className={`text-center ${sizes.container} ${className}`}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}

// Predefined loading states for common BonkHub pages
export const BonkLoadingStates = {
  performance: (
    <UnifiedLoading 
      title="Loading Performance Analytics"
      description="Gathering comprehensive BONK performance data..."
      variant="page"
      size="lg"
    />
  ),
  
  analytics: (
    <UnifiedLoading 
      title="Loading Analytics"
      description="Processing BONK market analytics..."
      variant="page"
      size="lg"
    />
  ),

  dashboard: (
    <UnifiedLoading 
      title="Loading Dashboard"
      description="Preparing your BONK dashboard..."
      variant="page"
      size="lg"
    />
  ),

  charts: (
    <UnifiedLoading 
      title="Loading Chart"
      description="Fetching chart data..."
      variant="chart"
    />
  ),

  metrics: (
    <UnifiedLoading 
      title="Loading Metrics"
      description="Calculating performance metrics..."
      variant="table"
    />
  ),

  social: (
    <UnifiedLoading 
      title="Loading Social Data"
      description="Gathering social sentiment and engagement..."
      variant="page"
      size="md"
    />
  )
}
