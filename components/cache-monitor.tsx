"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCache } from '@/hooks/useCache'
import { Database, RefreshCw, Trash2, Activity, MemoryStick, Target, TrendingUp } from 'lucide-react'

interface CacheMonitorProps {
  showActions?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export const CacheMonitor: React.FC<CacheMonitorProps> = ({ 
  showActions = true, 
  autoRefresh = false, 
  refreshInterval = 30000 
}) => {
  const {
    loading,
    error,
    getCacheStats,
    clearCache,
    cleanupExpiredEntries,
    formatMemoryUsage,
    formatHitRate
  } = useCache()

  const [stats, setStats] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refreshStats = async () => {
    const newStats = await getCacheStats()
    if (newStats) {
      setStats(newStats)
      setLastUpdated(new Date())
    }
  }

  useEffect(() => {
    refreshStats()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const handleClearCache = async () => {
    const success = await clearCache()
    if (success) {
      await refreshStats()
    }
  }

  const handleCleanup = async () => {
    await cleanupExpiredEntries()
    await refreshStats()
  }

  if (loading && !stats) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#ff6b35]" />
            <span className="ml-2 text-gray-400">Loading cache stats...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-red-500/50">
        <CardContent className="p-6">
          <div className="text-red-400 text-center">
            Error loading cache stats: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const { stats: cacheStats, totalMemory, totalEntries, averageHitRate } = stats

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-[#ff6b35]" />
          Cache Monitor
          {autoRefresh && (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              Auto-refresh
            </Badge>
          )}
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-xs text-gray-400">Total Entries</span>
            </div>
            <div className="text-lg font-semibold text-white">{totalEntries}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MemoryStick className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Memory Usage</span>
            </div>
            <div className="text-lg font-semibold text-white">{formatMemoryUsage(totalMemory)}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Avg Hit Rate</span>
            </div>
            <div className="text-lg font-semibold text-white">{formatHitRate(averageHitRate)}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Cache Types</span>
            </div>
            <div className="text-lg font-semibold text-white">3</div>
          </div>
        </div>

        {/* Detailed Cache Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Cache Details</h4>
          
          {Object.entries(cacheStats).map(([cacheName, stats]: [string, any]) => (
            <div key={cacheName} className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium text-white capitalize">
                  {cacheName.replace('Cache', '')} Cache
                </h5>
                <Badge 
                  variant={stats.hitRate > 80 ? "default" : stats.hitRate > 50 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {formatHitRate(stats.hitRate)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Entries:</span>
                  <div className="text-white font-medium">{stats.totalEntries}</div>
                </div>
                <div>
                  <span className="text-gray-400">Memory:</span>
                  <div className="text-white font-medium">{formatMemoryUsage(stats.memoryUsage)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Hits/Misses:</span>
                  <div className="text-white font-medium">{stats.totalHits}/{stats.totalMisses}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Activity className="w-4 h-4" />
              Cleanup
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-800 border-red-600 text-red-400 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
