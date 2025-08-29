"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

interface SocialDominanceChartProps {
  data: any[];
  loading: boolean;
  error: any;
}

export function SocialDominanceChart({ data, loading, error }: SocialDominanceChartProps) {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return []

    return data
      .filter(item => item.time && typeof item.time === 'number' && item.time > 0)
      .slice(-24) // Show last 24 hours for better social activity tracking
      .map((item) => ({
        time: item.time,
        // Use hour format for social activity (more relevant than dates)
        timeLabel: new Date(item.time * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric',
          hour12: true 
        }),
        date: new Date(item.time * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        postsActive: item.posts_active || 0,
        interactions: item.interactions || 0,
        // Additional social metrics
        sentiment: item.sentiment || 0,
        socialDominance: item.social_dominance || 0,
        contributors: item.contributors_active || 0,
      }))
      .filter(item => item.postsActive > 0 || item.interactions > 0); // Only valid social data
  }, [data])

  // Smart X-axis tick calculation
  const computeXTicks = (timestamps: number[]): number[] => {
    if (!timestamps.length) return []
    const min = timestamps[0], max = timestamps[timestamps.length-1]
    const range = max - min
    const stepMs = range / 6 // Show 6 ticks
    
    const ticks: number[] = []
    for (let t = min; t <= max; t += stepMs) ticks.push(t)
    if (ticks[ticks.length - 1] !== max) ticks.push(max)
    return ticks
  }

  // Improved Y-axis domain calculation for interactions (larger values)
  const getInteractionsDomain = () => {
    if (!processedData || processedData.length === 0) return [0, 0]
    
    const values = processedData.map(d => d.interactions)
    if (values.length === 0) return [0, 0]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Handle edge case where min === max
    if (min === max) {
      const eps = Math.max(1e-12, Math.abs(min) * 0.01)
      return [min - eps, max + eps]
    }
    
    // Use 6% padding
    const range = max - min
    const padding = range * 0.06
    
    return [min - padding, max + padding]
  }

  // Y-axis domain calculation for posts active
  const getPostsActiveDomain = () => {
    if (!processedData || processedData.length === 0) return [0, 0]
    
    const values = processedData.map(d => d.postsActive)
    if (values.length === 0) return [0, 0]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Handle edge case where min === max
    if (min === max) {
      const eps = Math.max(1e-12, Math.abs(min) * 0.01)
      return [min - eps, max + eps]
    }
    
    // Use 6% padding
    const range = max - min
    const padding = range * 0.06
    
    return [min - padding, max + padding]
  }

  // Format time as hours for social activity (more relevant than dates)
  const formatTimeLabel = (timestamp: number): string => {
    const date = new Date(timestamp * 1000) // Convert Unix timestamp to milliseconds
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  }

  // Get X-axis ticks for smart labeling
  const xTicks = useMemo(() => {
    const timestamps = processedData.map(d => d.time)
    return computeXTicks(timestamps)
  }, [processedData])

  // Format Y-axis values
  const formatInteractions = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  const formatPostsActive = (value: number) => {
    return value.toString()
  }

  // Enhanced tooltip content with detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-300 mb-2">
            {new Date(data.time * 1000).toLocaleString()}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Posts Active:</span>
              <span className="text-white font-medium">{data.postsActive.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Interactions:</span>
              <span className="text-white font-medium">{data.interactions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Social Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading chart data...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Social Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-red-400">
              <p>Failed to load social activity data</p>
              <p className="text-sm text-gray-500 mt-2">{String(error)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Social Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p>No social activity data available</p>
              <p className="text-sm text-gray-500 mt-2">Try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.01] hover:border-purple-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-purple-400">
              Social Activity
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:scale-110 bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-900/40"
              >
                <Activity className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                {processedData.length} data points
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-purple-500/10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <defs>
                <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                </linearGradient>
                <linearGradient id="interactionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                ticks={xTicks}
                tickFormatter={(ms: number) => formatTimeLabel(ms)}
                minTickGap={10}
                tickMargin={8}
                stroke="rgba(255,255,255,0.35)"
              />
              <YAxis
                yAxisId="left"
                domain={getPostsActiveDomain()}
                tickFormatter={formatPostsActive}
                width={70}
                stroke="rgba(139, 92, 246, 0.8)"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={getInteractionsDomain()}
                tickFormatter={formatInteractions}
                width={70}
                stroke="rgba(59, 130, 246, 0.8)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
                labelStyle={{ color: "#9ca3af" }}
                content={<CustomTooltip />}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="postsActive"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2 }}
                name="Posts Active"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="interactions"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
                name="Interactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Stats */}
        <div className="mt-6 grid grid-cols-3 gap-6 pt-6 border-t border-gray-800">
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:text-purple-400">
            <div className="text-sm text-gray-400 mb-1 transition-colors duration-300 group-hover:text-purple-300">Current Posts Active</div>
            <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-purple-400">
              {processedData[processedData.length - 1]?.postsActive.toLocaleString()}
            </div>
          </div>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:text-blue-400">
            <div className="text-sm text-gray-400 mb-1 transition-colors duration-300 group-hover:text-blue-300">Current Interactions</div>
            <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
              {formatInteractions(processedData[processedData.length - 1]?.interactions)}
            </div>
          </div>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:text-purple-400">
            <div className="text-sm text-gray-400 mb-1 transition-colors duration-300 group-hover:text-purple-300">Data Points</div>
            <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-purple-400">
              {processedData.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}