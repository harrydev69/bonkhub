"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BarChart3, User, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Streamdown } from "streamdown";
import type { TokenStats, Creator, AIInsight } from "./types";
import { formatNumber, formatPrice, formatChartData } from "./utils";

interface OverviewTabProps {
  tokenStats: TokenStats | null;
  creators: Creator[];
  aiInsight: AIInsight | null;
  aiSummaryData: any;
  aiSummaryLoading: boolean;
  aiSummaryError: any;
  priceChartData: any;
  priceChartLoading: boolean;
  priceChartError: any;
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
  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {aiInsight && (
        <Card className="group/ai bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
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
                    <strong>Market Context:</strong>{" "}
                    {aiInsight.marketContext}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      <Card className="group/ai-summary bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/ai-summary:text-orange-400">
            <Brain className="h-6 w-6 text-orange-400 transition-all duration-500 group-hover/ai-summary:scale-110 group-hover/ai-summary:rotate-2" />
            AI Summary
            <Badge
              variant="secondary"
              className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30"
            >
              {aiSummaryData?.generatedAt ? new Date(aiSummaryData.generatedAt).toLocaleTimeString() : 'Live'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiSummaryLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
          ) : aiSummaryError ? (
            <div className="text-red-400 text-sm">
              Failed to generate AI summary: {String(aiSummaryError)}
            </div>
          ) : aiSummaryData?.summary ? (
            <div className="space-y-4">
              <Streamdown className="text-gray-300 leading-relaxed">
                {aiSummaryData.summary}
              </Streamdown>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Brain className="h-3 w-3" />
                Generated by AI • {aiSummaryData.tokenId?.toUpperCase()} Analysis
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              No AI summary available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card className="group/chart bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/chart:text-orange-400">
            <Brain className="h-6 w-6 text-orange-400 transition-all duration-500 group-hover/chart:scale-110 group-hover/chart:rotate-2" />
            Price Chart (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceChartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">
                Loading price chart...
              </div>
            </div>
          ) : priceChartError ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-red-400 text-sm">
                Failed to load price chart: {String(priceChartError)}
              </div>
            </div>
          ) : priceChartData && priceChartData.length > 0 ? (
            <ChartContainer
              config={{
                price: {
                  label: "Price",
                  color: "var(--chart-1)",
                },
              }}
              className="min-h-48 "
            >
              <LineChart
                accessibilityLayer
                data={formatChartData(priceChartData)}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickFormatter={(value) => formatPrice(value)}
                  domain={['dataMin - 5%', 'dataMax + 5%']}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) => [formatPrice(Number(value)), "Price"]}
                    />
                  }
                />
                <Line
                  dataKey="price"
                  type="linear"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400 text-sm">
                No price data available
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Creators */}
      <Card className="group/creators bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
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
                    <Badge
                      variant="outline"
                      className="text-xs capitalize"
                    >
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
                    <span>
                      {formatNumber(creator.followers)} followers
                    </span>
                    <span>
                      {formatNumber(creator.interactions24h)}{" "}
                      interactions (24h)
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

      {/* Token Stats */}
      {tokenStats && (
        <Card className="group/stats bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/stats:text-orange-400">
              <BarChart3 className="h-6 w-6 text-green-400 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2" />
              Full Token Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-1">
                  Current Price
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatPrice(tokenStats.price)}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    tokenStats.change24h >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {tokenStats.change24h >= 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  {Math.abs(tokenStats.change24h)}%
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-1">
                  Market Cap
                </div>
                <div className="text-2xl font-bold text-white">
                  {(tokenStats.marketCap / 1_000_000).toFixed(1)}M
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-1">
                  24h Volume
                </div>
                <div className="text-2xl font-bold text-white">
                  {(tokenStats.volume24h / 1_000_000).toFixed(1)}M
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-1">Rank</div>
                <div className="text-2xl font-bold text-white">
                  #{tokenStats.rank}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
