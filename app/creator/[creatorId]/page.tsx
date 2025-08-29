"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { TrendingUp, Users, MessageCircle, ArrowLeft, Star, Activity, Target, ThumbsUp, Repeat2, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from "react";

// Creator Posts Feed Component
function CreatorPostsFeed({ network, creatorId }: { network: string; creatorId: string }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const postsPerPage = 3;
  
  // Reset to first page when network or creatorId changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [network, creatorId]);
  const {
    data: postsResponse,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ["creatorPosts", network, creatorId, currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/creator/${network}/${creatorId}/posts?page=${currentPage}&perPage=${postsPerPage}`);
      if (!res.ok) throw new Error("Failed to fetch creator posts");
      const data = await res.json();
      return data;
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  });

  const posts = postsResponse?.data || [];
  const totalPosts = postsResponse?.total || 0;
  const totalPages = postsResponse?.totalPages || 0;
  // API now handles pagination, so posts contains only current page data
  const currentPosts = posts;

  if (postsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="text-gray-400 text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <div className="text-lg font-semibold mb-2">Failed to load posts</div>
        <div className="text-sm">Unable to fetch creator posts at this time</div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <div className="text-lg font-semibold mb-2">No posts available</div>
        <div className="text-sm">This creator hasn't posted recently</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentPosts.map((post: any, index: number) => {
        const name = post.creator_display_name || post.creator_name || "Creator"
        const handle = post.creator_name ? `@${post.creator_name}` : ""
        const platform = post.post_type || "Social"
        const likeCount = post.likes || 0
        const rtCount = post.retweets || 0
        const replyCount = post.replies || 0
        const text = post.post_title || post.post_text || ""
        // Create truly unique key for React
        const uniqueKey = `${currentPage}-${index}-${post.id || post.post_link || index}`

        return (
          <div key={uniqueKey} className="group/post p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 transition-all duration-500 group-hover/post:scale-110 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                <AvatarImage src={post.creator_avatar || post.post_image || ""} />
                <AvatarFallback className="bg-orange-600 text-white transition-all duration-500 group-hover/post:bg-orange-500">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white transition-all duration-500 group-hover/post:text-orange-400">
                      {name}
                    </span>
                    {handle && (
                      <span className="text-sm text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                        {handle}
                      </span>
                    )}
                    <Badge variant="secondary" className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                      {platform}
                    </Badge>
                    {post.post_sentiment !== undefined && (
                      <div className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                        {post.post_sentiment > 0.1 ? (
                          <Badge variant="default" className="bg-green-600 text-white">positive</Badge>
                        ) : post.post_sentiment < -0.1 ? (
                          <Badge variant="destructive">negative</Badge>
                        ) : (
                          <Badge variant="secondary">neutral</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                    {new Date(post.post_created * 1000).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-300 transition-all duration-500 group-hover/post:text-gray-200">
                  {text}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                    <ThumbsUp className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                    {likeCount}
                  </span>
                  <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                    <Repeat2 className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                    {rtCount}
                  </span>
                  <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                    <MessageCircle className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                    {replyCount}
                  </span>
                  <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                    Followers: {post.creator_followers || 0}
                  </span>
                  <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                    Interactions: {post.interactions_24h || 0}
                  </span>
                  {post.post_link && (
                    <a href={post.post_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="group/open h-7 px-2 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                        <ExternalLink className="h-3 w-3 mr-1 transition-all duration-500 group-hover/open:scale-110 group-hover/open:rotate-2" />
                        Open
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
             {/* Pagination Info */}
       <div className="mt-4 text-center text-sm text-gray-400">
         Showing {currentPosts.length} of {totalPosts} posts (Page {currentPage} of {totalPages})
       </div>

       {/* Pagination Controls */}
       {totalPages > 0 && (
         <div className="mt-6 flex justify-center">
           <Pagination>
             <PaginationContent className="flex-wrap justify-center gap-1">
               <PaginationItem>
                 <PaginationPrevious 
                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                   className={`group/prev transition-all duration-500 ${
                     currentPage === 1 
                       ? "pointer-events-none opacity-50" 
                       : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                   }`}
                 />
               </PaginationItem>
               
               {/* Show limited page numbers around current page */}
               {(() => {
                 const pages = [];
                 const maxVisiblePages = 7; // Limit visible pages
                 
                 if (totalPages <= maxVisiblePages) {
                   // Show all pages if total is small
                   for (let i = 1; i <= totalPages; i++) {
                     pages.push(i);
                   }
                 } else {
                   // Show pages around current page with ellipsis
                   const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                   const end = Math.min(totalPages, start + maxVisiblePages - 1);
                   
                   if (start > 1) {
                     pages.push(1);
                     if (start > 2) pages.push('...');
                   }
                   
                   for (let i = start; i <= end; i++) {
                     pages.push(i);
                   }
                   
                   if (end < totalPages) {
                     if (end < totalPages - 1) pages.push('...');
                     pages.push(totalPages);
                   }
                 }
                 
                 return pages.map((page, index) => (
                   <PaginationItem key={index}>
                     {page === '...' ? (
                       <span className="px-3 py-2 text-sm text-gray-400">...</span>
                     ) : (
                       <PaginationLink
                         isActive={currentPage === page}
                         onClick={() => setCurrentPage(page as number)}
                         className="group/page cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                       >
                         {page}
                       </PaginationLink>
                     )}
                   </PaginationItem>
                 ));
               })()}
               
               <PaginationItem>
                 <PaginationNext 
                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                   className={`group/next transition-all duration-500 ${
                     currentPage === totalPages 
                       ? "pointer-events-none opacity-50" 
                       : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                   }`}
                 />
               </PaginationItem>
             </PaginationContent>
           </Pagination>
         </div>
       )}
    </div>
  );
}

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
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
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
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-6 pb-8">
      {/* Header with back button and creator info */}
      <div className="flex items-center space-x-3">
        <Link href="/sentiment" className="text-[#ff6b35] hover:text-[#ff6b35]/80 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center space-x-3">
          {profile.creator_avatar && (
            <img 
              src={profile.creator_avatar} 
              alt={profile.creator_display_name}
              className="w-12 h-12 rounded-full border-2 border-[#ff6b35]"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.creator_display_name}</h1>
            <p className="text-gray-400 text-sm">@{profile.creator_name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="bg-[#ff6b35] text-white text-xs">
                #{profile.creator_rank} Global Rank
              </Badge>
              <Badge variant="outline" className="border-[#ff6b35] text-[#ff6b35] text-xs">
                <Star className="w-3 h-3 mr-1" />
                Creator
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="group/followers bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#ff6b35] hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-300 transition-all duration-500 group-hover/followers:text-gray-200">
              Total Followers
            </CardTitle>
            <Users className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/followers:scale-110" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/followers:text-orange-400">
              {profile.creator_followers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1 transition-all duration-500 group-hover/followers:text-gray-300">Audience reach</p>
          </CardContent>
        </Card>

        <Card className="group/interactions bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#10b981] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-300 transition-all duration-500 group-hover/interactions:text-gray-200">
              24h Interactions
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-[#10b981] transition-all duration-500 group-hover/interactions:scale-110" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/interactions:text-green-400">
              {profile.interactions_24h?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1 transition-all duration-500 group-hover/interactions:text-gray-300">Recent engagement</p>
          </CardContent>
        </Card>

        <Card className="group/rank bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#8b5cf6] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-300 transition-all duration-500 group-hover/rank:text-gray-200">
              Creator Rank
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#8b5cf6] transition-all duration-500 group-hover/rank:scale-110" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/rank:text-purple-400">
              #{profile.creator_rank || 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1 transition-all duration-500 group-hover/rank:text-gray-300">Global ranking</p>
          </CardContent>
        </Card>
      </div>

             {/* Performance Trends Chart */}
       {chartData.length > 0 ? (
         <Card className="group/chart bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
           <CardHeader className="pb-3">
             <CardTitle className="text-white flex items-center space-x-2 transition-all duration-500 group-hover/chart:text-orange-400 text-lg">
               <TrendingUp className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/chart:scale-110" />
               Performance Trends
             </CardTitle>
             <CardDescription className="text-gray-400 transition-all duration-500 group-hover/chart:text-gray-300 text-sm">
               Last 30 days of activity and engagement trends
             </CardDescription>
           </CardHeader>
           <CardContent className="pt-0">
             <div className="space-y-4">
               {/* Summary Stats */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <div className="group/stat text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-750 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                   <div className="text-xl font-bold text-[#FF6B35] transition-all duration-500 group-hover/stat:text-orange-400">
                     {chartData.length > 0 ? 
                       (chartData[chartData.length - 1]?.followers - chartData[0]?.followers).toLocaleString() : 
                       '0'
                     }
                   </div>
                   <div className="text-gray-400 text-xs transition-all duration-500 group-hover/stat:text-gray-300">Follower Growth</div>
                 </div>
                 <div className="group/stat text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-750 hover:border-green-500/50 hover:shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                   <div className="text-xl font-bold text-[#10B981] transition-all duration-500 group-hover/stat:text-green-400">
                     {chartData.length > 0 ? 
                       Math.round(chartData.reduce((sum, point) => sum + point.interactions, 0) / chartData.length).toLocaleString() : 
                       '0'
                     }
                   </div>
                   <div className="text-gray-400 text-xs transition-all duration-500 group-hover/stat:text-gray-300">Avg Daily Interactions</div>
                 </div>
                 <div className="group/stat text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-750 hover:border-blue-500/50 hover:shadow-[0_0_8px_rgba(59,130,246,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                   <div className="text-xl font-bold text-[#3B82F6] transition-all duration-500 group-hover/stat:text-blue-400">
                     {chartData.length > 0 ? 
                       Math.round(chartData.reduce((sum, point) => sum + point.posts, 0) / chartData.length) : 
                       '0'
                     }
                   </div>
                   <div className="text-gray-400 text-xs transition-all duration-500 group-hover/stat:text-gray-300">Avg Daily Posts</div>
                 </div>
                 <div className="group/stat text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-750 hover:border-purple-500/50 hover:shadow-[0_0_8px_rgba(139,92,246,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                   <div className="text-xl font-bold text-[#8B5CF6] transition-all duration-500 group-hover/stat:text-purple-400">
                     {chartData.length > 0 ? 
                       `#${Math.min(...chartData.map(p => p.rank))}` : 
                       'N/A'
                     }
                   </div>
                   <div className="text-gray-400 text-xs transition-all duration-500 group-hover/stat:text-gray-300">Best Rank</div>
                 </div>
               </div>
               
               {/* Chart */}
               <div className="h-80 w-full">
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
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                 <div className="flex flex-col items-center space-y-1">
                   <div className="w-3 h-3 bg-[#FF6B35] rounded-full"></div>
                   <div className="text-white font-semibold text-sm">Followers</div>
                   <div className="text-gray-400 text-xs">
                     {chartData.length > 0 ? chartData[chartData.length - 1]?.followers?.toLocaleString() : '0'}
                   </div>
                 </div>
                 <div className="flex flex-col items-center space-y-1">
                   <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                   <div className="text-white font-semibold text-sm">Interactions</div>
                   <div className="text-gray-400 text-xs">
                     {chartData.length > 0 ? chartData[chartData.length - 1]?.interactions?.toLocaleString() : '0'}
                   </div>
                 </div>
                 <div className="flex flex-col items-center space-y-1">
                   <div className="w-3 h-3 bg-[#3B82F6] rounded-full"></div>
                   <div className="text-white font-semibold text-sm">Posts</div>
                   <div className="text-gray-400 text-xs">
                     {chartData.length > 0 ? chartData[chartData.length - 1]?.posts : '0'}
                   </div>
                 </div>
                 <div className="flex flex-col items-center space-y-1">
                   <div className="w-3 h-3 bg-[#8B5CF6] rounded-full"></div>
                   <div className="text-white font-semibold text-sm">Rank</div>
                   <div className="text-gray-400 text-xs">
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

      {/* Topic Influence & Creator Posts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Topic Influence - Compact Version */}
        <Card className="group/topics bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 transition-all duration-500 group-hover/topics:text-orange-400 text-lg">
              <Target className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/topics:scale-110" />
              Top Topics
            </CardTitle>
                         <CardDescription className="text-gray-400 transition-all duration-500 group-hover/topics:text-gray-300 text-sm">
               Most influential topics (Top 10)
             </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {profile.topic_influence && profile.topic_influence.length > 0 ? (
                                 profile.topic_influence.slice(0, 10).map((topic, index) => (
                                     <div
                     key={topic.topic}
                     className="group/topic flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.02] transition-all duration-300 transform-gpu cursor-pointer border border-gray-700/50"
                   >
                     <div className="flex items-center space-x-2">
                       <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-full text-black font-bold text-xs transition-all duration-300 group-hover/topic:scale-110">
                         #{index + 1}
                       </div>
                       <div>
                         <div className="text-white font-semibold text-xs transition-all duration-300 group-hover/topic:text-orange-400">
                           {topic.topic}
                         </div>
                         <div className="text-gray-400 text-xs transition-all duration-300 group-hover/topic:text-gray-300">
                           {topic.count?.toLocaleString()} mentions
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-[#ff6b35] font-bold text-base transition-all duration-300 group-hover/topic:text-orange-400">
                         {topic.percent?.toFixed(1)}%
                       </div>
                       <div className="text-gray-400 text-xs transition-all duration-300 group-hover/topic:text-gray-300">Score</div>
                     </div>
                   </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-6">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm">No topic data available</div>
                </div>
              )}
                             {profile.topic_influence && profile.topic_influence.length > 10 && (
                 <div className="text-center pt-2">
                   <div className="text-gray-400 text-xs">
                     +{profile.topic_influence.length - 10} more topics
                   </div>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

                 {/* Creator Posts Feed */}
         <Card className="group/posts bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
           <CardHeader className="pb-3">
             <CardTitle className="text-white flex items-center space-x-2 transition-all duration-500 group-hover/posts:text-orange-400 text-lg">
               <MessageCircle className="h-4 w-4 text-[#ff6b35] transition-all duration-500 group-hover/posts:scale-110" />
               Recent Posts
             </CardTitle>
             <CardDescription className="text-gray-400 transition-all duration-500 group-hover/posts:text-gray-300 text-sm">
               Latest content from this creator
             </CardDescription>
           </CardHeader>
           <CardContent className="pt-0">
             <CreatorPostsFeed network={network} creatorId={cleanCreatorId} />
           </CardContent>
         </Card>
      </div>


    </div>
  );
}
