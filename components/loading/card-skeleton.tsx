"use client"

import React from 'react'

interface CardSkeletonProps {
  className?: string
  showTrend?: boolean
}

export function CardSkeleton({ className = "", showTrend = false }: CardSkeletonProps) {
  return (
    <div className={`group/skeleton bg-gray-900 border-gray-700 rounded-lg p-6 animate-pulse hover:shadow-[0_0_15px_rgba(255,107,53,0.1)] hover:border-orange-500/20 transition-all duration-500 transform-gpu ${className}`}>
      <div className="space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded transition-all duration-500 group-hover/skeleton:bg-orange-500/20"></div>
          <div className="h-4 bg-gray-800 rounded w-24 transition-all duration-500 group-hover/skeleton:bg-orange-500/20"></div>
        </div>
        
        {/* Value skeleton */}
        <div className="h-8 bg-gray-800 rounded w-32 transition-all duration-500 group-hover/skeleton:bg-orange-500/20"></div>
        
        {/* Trend skeleton */}
        {showTrend && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-800 rounded transition-all duration-500 group-hover/skeleton:bg-orange-500/20"></div>
            <div className="h-3 bg-gray-800 rounded w-20 transition-all duration-500 group-hover/skeleton:bg-orange-500/20"></div>
          </div>
        )}
      </div>
    </div>
  )
}

// Grid of card skeletons for dashboard layouts
export function CardSkeletonGrid({ count = 8, showTrend = false, className = "" }: { count?: number, showTrend?: boolean, className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} showTrend={showTrend} />
      ))}
    </div>
  )
}
