"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, MessageCircle, ArrowLeft, Star, Activity, Target } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from "react";

// Types based on the actual API responses
type CreatorProfile = {
  data: {
    creator_id: string;
    creator_name: string;
    creator_display_name: string;
    creator_avatar: string;
    creator_followers: number;
    creator_rank: string;
    interactions_24h: number;
    topic_influence: Array<{
      topic: string;
      count: number;
      percent: number;
      rank: number;
    }>;
  };
};

type CreatorTimeSeries = {
  config: {
    network: string;
    influencer_id: string;
    interval: string;
    start: number;
    end: number;
    bucket: string;
  };
  data: Array<{
    time: number;
    followers?: number;
    interactions?: number;
    posts_active?: number;
    posts_created?: number;
    creator_rank?: number;
  }>;
};

export default function CreatorProfilePage() {
  const params = useParams();
  const creatorId = params.creatorId as string;
  
  // Extract network from creator ID (e.g., "twitter::1755899659040555009" -> "twitter")
  const network = creatorId.includes("::") ? creatorId.split("::")[0] : "twitter";
  const cleanCreatorId = creatorId.includes("::") ? creatorId.split("::")[1] : creatorId;

  // Fetch creator profile data
  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<CreatorProfile>({
    queryKey: ["creatorProfile", network, cleanCreatorId],
    queryFn: async () => {
      const res = await fetch(`/api/creator/${network}/${cleanCreatorId}/profile`);
      if (!res.ok) throw new Error("Failed to fetch creator profile");
      const data = await res.json();
      return data;
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  });

  // Fetch creator time series data
  const {
    data: timeseriesData,
    isLoading: timeseriesLoading,
    error: timeseriesError,
  } = useQuery<CreatorTimeSeries>({
    queryKey: ["creatorTimeseries", network, cleanCreatorId],
    queryFn: async () => {
      const res = await fetch(`/api/creator/${network}/${cleanCreatorId}/timeseries?interval=1m`);
      if (!res.ok) throw new Error("Failed to fetch creator time series");
      const data = await res.json();
      return data;
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  });

  const loading = profileLoading || timeseriesLoading;
  const error = profileError || timeseriesError;

  // Extract profile data from the nested structure
  const profile = profileResponse?.data;

  // Prepare chart data for visualization
  const chartData = useMemo(() => {
    if (!timeseriesData?.data || !Array.isArray(timeseriesData.data) || timeseriesData.data.length === 0) {
      return [];
    }
    
    const processed = timeseriesData.data
      .filter(point => point && point.time && point.followers) // Only show points with valid data
      .map(point => ({
        date: new Date(point.time * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric'
        }),
        followers: point.followers || 0,
        interactions: point.interactions || 0,
        posts: point.posts_active || 0,
        rank: point.creator_rank || 0,
        timestamp: point.time
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by time
    
    return processed;
  }, [timeseriesData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/sentiment" className="text-[#ff6b35] hover:text-[#ff6b35]/80">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <Skeleton className="h-8 w-64 bg-gray-700" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/sentiment" className="text-[#ff6b35] hover:text-[#ff6b35]/80">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Creator Profile</h1>
        </div>
        
        <div className="text-red-400 text-center py-8">
          <div className="text-lg font-semibold mb-2">Failed to load creator profile</div>
          <div className="text-sm">
            {error?.message || "Unknown error occurred"}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Creator ID: {creatorId} | Network: {network}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Profile Response: {JSON.stringify(profileResponse, null, 2)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and creator info */}
      <div className="flex items-center space-x-4">
        <Link href="/sentiment" className="text-[#ff6b35] hover:text-[#ff6b35]/80 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center space-x-4">
          {profile.creator_avatar && (
            <img 
              src={profile.creator_avatar} 
              alt={profile.creator_display_name}
              className="w-16 h-16 rounded-full border-2 border-[#ff6b35]"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{profile.creator_display_name}</h1>
            <p className="text-gray-400">@{profile.creator_name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="bg-[#ff6b35] text-white">
                #{profile.creator_rank} Global Rank
              </Badge>
              <Badge variant="outline" className="border-[#ff6b35] text-[#ff6b35]">
                <Star className="w-3 h-3 mr-1" />
                Creator
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#ff6b35] transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6b35]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Followers</CardTitle>
            <Users className="h-5 w-5 text-[#ff6b35]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {profile.creator_followers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">Audience reach</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#10b981] transition-all duration-300 hover:shadow-lg hover:shadow-[#10b981]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">24h Interactions</CardTitle>
            <MessageCircle className="h-5 w-5 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {profile.interactions_24h?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">Recent engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#8b5cf6] transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Creator Rank</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#8b5cf6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              #{profile.creator_rank || 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1">Global ranking</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      {chartData.length > 0 ? (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[#ff6b35]" />
              Performance Trends
            </CardTitle>
            <CardDescription className="text-gray-400">
              Last 30 days of activity and engagement trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="text-2xl font-bold text-[#FF6B35]">
                    {chartData.length > 0 ? 
                      (chartData[chartData.length - 1]?.followers - chartData[0]?.followers).toLocaleString() : 
                      '0'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Follower Growth</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="text-2xl font-bold text-[#10B981]">
                    {chartData.length > 0 ? 
                      Math.round(chartData.reduce((sum, point) => sum + point.interactions, 0) / chartData.length).toLocaleString() : 
                      '0'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Avg Daily Interactions</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="text-2xl font-bold text-[#3B82F6]">
                    {chartData.length > 0 ? 
                      Math.round(chartData.reduce((sum, point) => sum + point.posts, 0) / chartData.length) : 
                      '0'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Avg Daily Posts</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="text-2xl font-bold text-[#8B5CF6]">
                    {chartData.length > 0 ? 
                      `#${Math.min(...chartData.map(p => p.rank))}` : 
                      'N/A'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Best Rank</div>
                </div>
              </div>
              
              {/* Chart */}
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    
                    {/* Left Y-axis for Followers (Orange) */}
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      stroke="#FF6B35"
                      fontSize={12}
                      tick={{ fill: '#FF6B35' }}
                      label={{ value: 'Followers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#FF6B35' } }}
                      domain={['dataMin - 1000', 'dataMax + 1000']}
                    />
                    
                    {/* Right Y-axis for Interactions (Green) */}
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#10B981"
                      fontSize={12}
                      tick={{ fill: '#10B981' }}
                      label={{ value: 'Interactions', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10B981' } }}
                      domain={[0, 'dataMax + 1000']}
                    />
                    
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#F9FAFB' }}
                    />
                    
                    {/* Followers Line - Left Y-axis */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="followers"
                      stroke="#FF6B35"
                      strokeWidth={3}
                      name="Followers"
                    />
                    
                    {/* Interactions Line - Right Y-axis */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="interactions"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Interactions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Chart Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-4 h-4 bg-[#FF6B35] rounded-full"></div>
                  <div className="text-white font-semibold">Followers</div>
                  <div className="text-gray-400 text-sm">
                    {chartData.length > 0 ? chartData[chartData.length - 1]?.followers?.toLocaleString() : '0'}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-4 h-4 bg-[#10B981] rounded-full"></div>
                  <div className="text-white font-semibold">Interactions</div>
                  <div className="text-gray-400 text-sm">
                    {chartData.length > 0 ? chartData[chartData.length - 1]?.interactions?.toLocaleString() : '0'}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-4 h-4 bg-[#3B82F6] rounded-full"></div>
                  <div className="text-white font-semibold">Posts</div>
                  <div className="text-gray-400 text-sm">
                    {chartData.length > 0 ? chartData[chartData.length - 1]?.posts : '0'}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-4 h-4 bg-[#8B5CF6] rounded-full"></div>
                  <div className="text-white font-semibold">Rank</div>
                  <div className="text-gray-400 text-sm">
                    {chartData.length > 0 ? `#${chartData[chartData.length - 1]?.rank}` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[#ff6b35]" />
              Performance Trends
            </CardTitle>
            <CardDescription className="text-gray-400">
              Time series data not available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-400 text-center py-8">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <div className="text-lg font-semibold mb-2">No historical performance data available</div>
              <div className="text-sm">Time series data is not available for this creator</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Influence */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Target className="h-5 w-5 text-[#ff6b35]" />
            Topic Influence
          </CardTitle>
          <CardDescription className="text-gray-400">
            Topics this creator is most influential in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.topic_influence && profile.topic_influence.length > 0 ? (
              profile.topic_influence.slice(0, 10).map((topic, index) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-700/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-full text-black font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">{topic.topic}</div>
                      <div className="text-gray-400 text-sm">
                        {topic.count?.toLocaleString()} mentions • Rank #{topic.rank}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#ff6b35] font-bold text-2xl">
                      {topic.percent?.toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-xs">Influence Score</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <div className="text-lg font-semibold mb-2">No topic influence data available</div>
                <div className="text-sm">This creator hasn't been analyzed for topic influence yet</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
