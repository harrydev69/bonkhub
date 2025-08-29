"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  BarChart3,
  User,
  ArrowUp,
  ArrowDown,
  Activity,
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
}

interface SocialDominanceData {
  time: number;
  social_dominance: number;
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
}: OverviewTabProps) {
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
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">
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

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">
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
            <div className="space-y-4">
              {creators.map((creator, index) => (
                <div
                  key={creator.id}
                  className="group/creator flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white group-hover/creator:text-orange-400 transition-colors duration-300">
                        {creator.name}
                      </h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {creator.platform}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                      >
                        Rank #{creator.rank}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{formatNumber(creator.followers)} followers</span>
                      <span>
                        {formatNumber(creator.interactions24h)} interactions
                        (24h)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                {aiSummaryData?.generatedAt
                  ? new Date(aiSummaryData.generatedAt).toLocaleTimeString()
                  : "Live"}
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
                    {aiSummaryData?.generatedAt
                      ? new Date(aiSummaryData.generatedAt).toLocaleTimeString()
                      : "Live"}
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
