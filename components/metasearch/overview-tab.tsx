"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  BarChart3,
  User,
  ArrowUp,
  ArrowDown,
  Activity,
  AlertCircle,
  Loader2,
  UserCircle,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { TokenPriceChart } from "@/components/token-price-chart";
import { SocialDominanceChart } from "./social-dominance-chart";
import { CoinTechnicalChart } from "./coin-technical-chart";

import type { TokenStats, Creator, AIInsight } from "./types";
import { formatNumber, formatPrice } from "./utils";
import { useMetaSearchStore } from "./store";
import { useSocialDominanceQuery, useTechnicalDataQuery } from "./hooks";

interface OverviewTabProps {
  tokenStats: TokenStats | null;
  creators: Creator[];
  aiInsight: AIInsight | null;
  aiSummaryData: any;
  aiSummaryLoading: boolean;
  aiSummaryError: any;
  priceChartData: {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  };
  priceChartLoading: boolean;
  priceChartError: any;
  creatorsLoading?: boolean;
}

interface SocialDominanceData {
  time: number;
  social_dominance: number;
}

// Helper function to detect platform from creator ID with better logic
function detectPlatform(creatorId?: string): "twitter" | "youtube" | "reddit" | "tiktok" {
  if (!creatorId) return "twitter";
  
  const id = creatorId.toLowerCase();
  
  if (id.includes("youtube") || id.startsWith("youtube::") || id.includes("yt::")) {
    return "youtube";
  }
  if (id.includes("reddit") || id.startsWith("reddit::") || id.includes("r/")) {
    return "reddit";
  }
  if (id.includes("tiktok") || id.startsWith("tiktok::") || id.includes("tt::")) {
    return "tiktok";
  }
  
  // Default to twitter for unknown or twitter-like IDs
  return "twitter";
}

// Helper function to validate and provide fallback for avatar URLs
function getAvatarUrl(avatar?: string, name?: string): { src: string; hasError: boolean } {
  if (!avatar || avatar.trim() === "" || avatar === "https://via.placeholder.com/40") {
    // Create a better-looking avatar with gradient background
    const cleanName = (name || "User").replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const encodedName = encodeURIComponent(cleanName);
    return {
      src: `https://ui-avatars.com/api/?name=${encodedName}&background=1f2937&color=f97316&size=64&font-size=0.6&bold=true&format=svg`,
      hasError: false
    };
  }
  
  return {
    src: avatar,
    hasError: false
  };
}

// Helper function to validate creator data
function validateCreator(creator: any): creator is Creator {
  return (
    creator &&
    typeof creator === "object" &&
    creator.id &&
    creator.name &&
    typeof creator.name === "string" &&
    creator.name.trim() !== ""
  );
}

export function OverviewTab({
  tokenStats,
  creators,
  aiInsight,
  aiSummaryData,
  aiSummaryLoading,
  aiSummaryError,
  priceChartData,
  priceChartLoading,
  priceChartError,
  creatorsLoading = false,
}: OverviewTabProps) {
  const router = useRouter();
  const [currentTimeRange, setCurrentTimeRange] = useState("7");
  const {
    debouncedSearchQuery,
    setPriceChartData,
    setPriceChartError,
    setPriceChartLoading,
    socialDominanceData,
    socialDominanceLoading,
    socialDominanceError,
    technicalData,
    technicalDataLoading,
    technicalDataError,
    creatorsError,
  } = useMetaSearchStore();

  // Fetch social dominance data
  useSocialDominanceQuery();
  useTechnicalDataQuery();

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange: string) => {
    setCurrentTimeRange(newTimeRange);
  };

  // Fetch chart data when time range changes
  useEffect(() => {
    const fetchChartData = async () => {
      if (!debouncedSearchQuery) return;

      setPriceChartLoading(true);
      setPriceChartError(null);

      try {
        const tokenId = debouncedSearchQuery || "bonk";
        const res = await fetch(
          `/api/coingecko/token/${tokenId}?days=${currentTimeRange}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(
            `price chart ${res.status}: ${body || res.statusText}`
          );
        }

        const json = await res.json().catch(() => ({}));
        const chartData = json.chartData || {
          prices: [],
          market_caps: [],
          total_volumes: [],
        };
        setPriceChartData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setPriceChartError(error);
      } finally {
        setPriceChartLoading(false);
      }
    };

    fetchChartData();
  }, [
    currentTimeRange,
    debouncedSearchQuery,
    setPriceChartData,
    setPriceChartError,
    setPriceChartLoading,
  ]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* AI Insights */}
      {aiInsight && (
        <Card className="group/ai bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-500 transform-gpu lg:col-span-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/ai:text-orange-400">
              <Brain className="h-6 w-6 text-orange-400 transition-all duration-500 group-hover/ai:scale-110 group-hover/ai:rotate-2" />
              AI Insights
              <Badge
                variant="secondary"
                className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30"
              >
                {aiInsight.timestamp}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-3 h-3 rounded-full mt-2 ${
                  aiInsight.sentiment === "bullish"
                    ? "bg-green-500"
                    : aiInsight.sentiment === "bearish"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {aiInsight.summary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsight.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      {point}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-gray-800 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm text-gray-300">
                    <strong>Market Context:</strong> {aiInsight.marketContext}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Left Panel - Market Info */}
      <div className="lg:col-span-1 space-y-6">
        {/* Token Header */}
        {tokenStats && (tokenStats.name || tokenStats.symbol || tokenStats.image) && (
          <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {tokenStats.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={tokenStats.image}
                      alt={tokenStats.name || tokenStats.symbol || 'Token'}
                      className="w-12 h-12 rounded-full ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 transition-all duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {tokenStats.name && (
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-orange-400 transition-colors duration-300">
                        {tokenStats.name}
                      </h3>
                    )}
                    {tokenStats.symbol && (
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs uppercase">
                        {tokenStats.symbol}
                      </Badge>
                    )}
                  </div>
                  {tokenStats.rank && (
                    <div className="text-sm text-gray-400">
                      Rank #{tokenStats.rank}
                    </div>
                  )}
                  {tokenStats.contractAddress && (
                    <div className="text-sm font-mono text-gray-400 mt-2 break-all">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Contract:</span>
                      <div className="text-xs text-orange-400 mt-1 select-all cursor-pointer hover:text-orange-300 transition-colors duration-200">
                        {tokenStats.contractAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Stats */}
        <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400">
              Market Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tokenStats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Market Cap</span>
                  <span className="text-white font-medium">
                    ${(tokenStats.marketCap / 1_000_000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">24h Volume</span>
                  <span className="text-white font-medium">
                    {formatNumber(tokenStats.marketCap * 0.1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Circulating Supply</span>
                  <span className="text-white font-medium">
                    {formatNumber(tokenStats.circulatingSupply)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Price Changes */}
        <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400">
              Price Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tokenStats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">1h</span>
                  <span
                    className={`font-medium ${
                      tokenStats.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {tokenStats.change24h >= 0 ? "+" : ""}
                    {(tokenStats.change24h * 0.1).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">24h</span>
                  <span
                    className={`font-medium ${
                      tokenStats.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {tokenStats.change24h >= 0 ? "+" : ""}
                    {tokenStats.change24h}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">7d</span>
                  <span
                    className={`font-medium ${
                      tokenStats.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {tokenStats.change24h >= 0 ? "+" : ""}
                    {(tokenStats.change24h * 2).toFixed(2)}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ATH & ATL */}
        <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-lg text-white transition-colors duration-300 group-hover:text-orange-400">
              All Time Highs & Lows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tokenStats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">All Time High</span>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatPrice(tokenStats.ath)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">All Time Low</span>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatPrice(tokenStats.atl)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-3">
                    Current Price Comparison
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">From ATH:</span>
                      <span
                        className={`font-medium ${
                          tokenStats.price < tokenStats.ath
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {tokenStats.ath > 0
                          ? `${(
                              ((tokenStats.ath - tokenStats.price) /
                                tokenStats.ath) *
                              100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">From ATL:</span>
                      <span
                        className={`font-medium ${
                          tokenStats.price > tokenStats.atl
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      >
                        {tokenStats.atl > 0
                          ? `${(
                              ((tokenStats.price - tokenStats.atl) /
                                tokenStats.atl) *
                              100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="group/analytics bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-500 transform-gpu">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/analytics:text-orange-400">
              <Activity className="h-6 w-6 text-purple-400 transition-all duration-500 group-hover/analytics:scale-110 group-hover/analytics:rotate-2" />
              Advanced Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Performance Metrics
                </h4>
                <div className="space-y-2">
                  {/* Real data from social dominance API (more comprehensive) */}
                  {socialDominanceData && socialDominanceData.length > 0 && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Galaxy Score</span>
                        <span className="text-white font-semibold text-sm">
                          {socialDominanceData[socialDominanceData.length - 1]?.galaxy_score || 0}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Sentiment Score</span>
                        <span className="text-white font-semibold text-sm">
                          {socialDominanceData[socialDominanceData.length - 1]?.sentiment || 0}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Social Dominance</span>
                        <span className="text-white font-semibold text-sm">
                          {(socialDominanceData[socialDominanceData.length - 1]?.social_dominance || 0).toFixed(2)}%
                        </span>
                      </div>
                    </>
                  )}
                  {/* Fallback to static data if no technical data */}
                  {(!technicalData || technicalData.length === 0) && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Galaxy Score</span>
                        <span className="text-gray-500 font-semibold text-sm">N/A</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Sentiment Score</span>
                        <span className="text-gray-500 font-semibold text-sm">N/A</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Social Dominance</span>
                        <span className="text-gray-500 font-semibold text-sm">N/A</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Market Metrics
                </h4>
                <div className="space-y-2">
                  {/* Use social dominance data for market metrics (more comprehensive) */}
                  {socialDominanceData && socialDominanceData.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Market Dominance</span>
                        <span className="text-white font-semibold text-sm">
                          {(socialDominanceData[socialDominanceData.length - 1]?.market_dominance || 0).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Alt Rank</span>
                        <span className="text-white font-semibold text-sm">
                          #{socialDominanceData[socialDominanceData.length - 1]?.alt_rank || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">24h Volume</span>
                        <span className="text-white font-semibold text-sm">
                          ${formatNumber(socialDominanceData[socialDominanceData.length - 1]?.volume_24h || 0)}
                        </span>
                      </div>
                    </>
                  ) : tokenStats && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">ATH</span>
                        <span className="text-white font-semibold text-sm">
                          {formatPrice(tokenStats.ath)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">ATL</span>
                        <span className="text-white font-semibold text-sm">
                          {formatPrice(tokenStats.atl)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">
                          Circulating Supply
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {formatNumber(tokenStats.circulatingSupply)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Creators */}
        <Card className="group/creators bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-500 transform-gpu">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/creators:text-orange-400">
              <User className="h-6 w-6 text-purple-400 transition-all duration-500 group-hover/creators:scale-110 group-hover/creators:rotate-2" />
              Top Creators & Influencers
            </CardTitle>
          </CardHeader>
          <CardContent>
             {/* Loading State */}
             {creatorsLoading && (
            <div className="space-y-4">
                 {[...Array(5)].map((_, index) => (
                   <div
                     key={index}
                     className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 animate-pulse"
                   >
                     <div className="w-12 h-12 bg-gray-700 rounded-full" />
                     <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-700 rounded w-1/3" />
                       <div className="h-3 bg-gray-700 rounded w-2/3" />
                     </div>
                     <div className="w-8 h-8 bg-gray-700 rounded" />
                   </div>
                 ))}
               </div>
             )}

             {/* Error State */}
             {!creatorsLoading && creatorsError && (
               <div className="flex flex-col items-center justify-center py-8 text-center">
                 <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                 <h3 className="text-lg font-semibold text-white mb-2">
                   Failed to Load Creators
                 </h3>
                 <p className="text-gray-400 text-sm mb-4 max-w-md">
                   {typeof creatorsError === 'string' 
                     ? creatorsError 
                     : 'Unable to fetch creator data. Please try searching again.'}
                 </p>
                 <div className="text-xs text-gray-500 bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/30">
                   <strong>API Error:</strong> LunarCrush creators endpoint may be temporarily unavailable
                 </div>
               </div>
             )}

             {/* Empty State */}
             {!creatorsLoading && !creatorsError && creators.length === 0 && (
               <div className="flex flex-col items-center justify-center py-8 text-center">
                 <UserCircle className="h-12 w-12 text-gray-500 mb-4" />
                 <h3 className="text-lg font-semibold text-white mb-2">
                   No Creators Found
                 </h3>
                 <p className="text-gray-400 text-sm max-w-md">
                   No influencers or creators were found for this token. This could be because:
                 </p>
                 <ul className="text-xs text-gray-500 mt-3 space-y-1 text-left">
                   <li>• The token is new or has limited social coverage</li>
                   <li>• No active creators are discussing this token</li>
                   <li>• The token name may need exact symbol matching</li>
                 </ul>
               </div>
             )}

             {/* Success State - Display Creators */}
             {!creatorsLoading && !creatorsError && creators.length > 0 && (
               <div className="space-y-2">
                 {creators
                   .filter(validateCreator) // Filter out invalid creator data
                   .slice(0, 6) // Limit to top 6 for cleaner display
                   .map((creator, index) => {
                     const avatarData = getAvatarUrl(creator.avatar, creator.name);
                     const platform = detectPlatform(creator.id);
                     
                     const handleCreatorClick = () => {
                       // Extract creator ID from the full ID (remove prefixes like "twitter::")
                       const creatorId = creator.id.replace(/^(twitter::|youtube::|reddit::|tiktok::)/, '');
                       router.push(`/creator/${creatorId}`);
                     };

                     return (
                       <div
                         key={creator.id || `creator-${index}`}
                         className="group/creator relative bg-gray-800/80 hover:bg-gray-800 border border-gray-700/50 hover:border-orange-500/30 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
                         onClick={handleCreatorClick}
                       >
                         {/* Rank Badge - Top Right Corner */}
                         <div className="absolute top-2 right-2">
                           <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg">
                             {index + 1}
                           </div>
                         </div>

                         <div className="flex items-start gap-3">
                           {/* Avatar */}
                           <div className="relative flex-shrink-0">
                             <img
                               src={avatarData.src}
                               alt={`${creator.name} avatar`}
                               className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-600/50 group-hover/creator:ring-orange-500/50 transition-all duration-300 shadow-lg bg-gray-700"
                               onError={(e) => {
                                 const img = e.target as HTMLImageElement;
                                 if (!img.src.includes('ui-avatars.com')) {
                                   const fallback = getAvatarUrl("", creator.name);
                                   img.src = fallback.src;
                                 }
                               }}
                             />
                             {/* Platform indicator */}
                             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center">
                               {platform === 'twitter' && (
                                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                               )}
                               {platform === 'youtube' && (
                                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                               )}
                               {platform === 'reddit' && (
                                 <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                               )}
                               {platform === 'tiktok' && (
                                 <div className="w-3 h-3 bg-black border border-gray-500 rounded-full"></div>
                               )}
                             </div>
                  </div>

                           {/* Creator Info */}
                           <div className="flex-1 min-w-0 pr-8">
                             <div className="mb-2">
                               <h4 className="font-bold text-white text-lg leading-tight group-hover/creator:text-orange-400 transition-colors duration-300 truncate">
                        {creator.name}
                      </h4>
                               <div className="flex items-center gap-2 mt-1">
                      <Badge
                                   variant="outline" 
                                   className="text-xs capitalize text-gray-400 border-gray-600 hover:border-orange-500/30 transition-colors"
                      >
                                   {platform}
                      </Badge>
                                 <span className="text-xs text-gray-500">
                                   Rank #{creator.rank || index + 1}
                      </span>
                    </div>
                  </div>
                             
                             {/* Stats */}
                             <div className="grid grid-cols-2 gap-3 text-sm">
                               <div>
                                 <div className="text-gray-400 text-xs mb-1">Followers</div>
                                 <div className="text-white font-semibold">
                                   {formatNumber(creator.followers || 0)}
                                 </div>
                               </div>
                               <div>
                                 <div className="text-gray-400 text-xs mb-1">24h Interactions</div>
                                 <div className="text-orange-400 font-semibold">
                                   {formatNumber(creator.interactions24h || 0)}
                                 </div>
                               </div>
                             </div>
                    </div>
                  </div>
                </div>
                     );
                   })}
                 
                 {/* Show message if some creators were filtered out due to invalid data */}
                 {creators.length > creators.filter(validateCreator).length && (
                   <div className="text-xs text-gray-500 text-center py-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                     <User className="w-4 h-4 inline mr-2 opacity-50" />
                     Some creator entries were filtered out due to incomplete data
                   </div>
                 )}

                 {/* Show more indicator if there are more creators */}
                 {creators.filter(validateCreator).length > 6 && (
                   <div className="text-center pt-2">
                     <div className="text-xs text-gray-500 bg-gray-800/30 rounded-lg border border-gray-700/30 py-2 px-3 inline-flex items-center gap-1">
                       <User className="w-3 h-3 opacity-50" />
                       +{creators.filter(validateCreator).length - 6} more creators available
                     </div>
                   </div>
                 )}
            </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chart and Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Price Chart */}
        {priceChartLoading ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <Brain className="h-6 w-6 text-orange-400" />
                Price Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Loading chart data...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please wait while we fetch the latest data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : priceChartError ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <Brain className="h-6 w-6 text-orange-400" />
                Price Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-red-400 text-sm">
                  Failed to load price chart: {String(priceChartError)}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : priceChartData &&
          priceChartData.prices &&
          priceChartData.prices.length > 0 &&
          tokenStats ? (
          <TokenPriceChart
            chartData={priceChartData}
            currentPrice={tokenStats.price}
            priceChange24h={tokenStats.change24h}
            symbol={tokenStats.symbol || "TOKEN"}
            currentTimeRange={currentTimeRange}
            onTimeRangeChange={handleTimeRangeChange}
          />
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <Brain className="h-6 w-6 text-orange-400" />
                Price Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-sm">
                  No price data available
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* AI Summary */}
        <Card className="group/ai-summary bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-500 transform-gpu">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/ai-summary:text-orange-400">
              <Brain className="h-6 w-6 text-orange-400 transition-all duration-500 group-hover/ai-summary:scale-110 group-hover/ai-summary:rotate-2" />
              AI Summary
              <Badge
                variant="secondary"
                className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30"
              >
                Live Analysis
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiSummaryLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
              </div>
            ) : aiSummaryError ? (
              <div className="text-red-400 text-sm p-4 bg-red-900/20 rounded-lg border border-red-800">
                Failed to generate AI summary: {String(aiSummaryError)}
              </div>
            ) : aiSummaryData?.summary ? (
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-300 leading-relaxed text-sm font-mono whitespace-pre-wrap break-words">
                      {aiSummaryData.summary}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-800/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-3 w-3 text-orange-400" />
                    <span>Generated by AI • {aiSummaryData.tokenId?.toUpperCase()} Analysis</span>
                  </div>
                  <div className="text-orange-400 font-medium">
                    Live Analysis
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                <Brain className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p>No AI summary available</p>
                <p className="text-xs text-gray-600 mt-1">Try searching for a different token</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Dominance Chart */}
        <SocialDominanceChart
          data={socialDominanceData}
          loading={socialDominanceLoading}
          error={socialDominanceError}
        />

        <CoinTechnicalChart
          data={socialDominanceData}
          loading={socialDominanceLoading}
          error={socialDominanceError}
        />
      </div>


    </div>
  );
}
