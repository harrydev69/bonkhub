"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  MessageCircle, 
  Heart, 
  DollarSign,
  BarChart3,
  Activity,
  Star,
  Zap
} from "lucide-react";

// Types for the time-series data
interface TimeSeriesDataPoint {
  time: number;
  // Social Activity
  contributors_active?: number;
  contributors_created?: number;
  interactions?: number;
  posts_active?: number;
  posts_created?: number;
  sentiment?: number;
  spam?: number;
  
  // Market Data (coins endpoint)
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  market_cap?: number;
  volume_24h?: number;
  circulating_supply?: number;
  market_dominance?: number;
  
  // Scores & Rankings
  alt_rank?: number;
  galaxy_score?: number;
  social_dominance?: number;
}

interface TimeSeriesResponse {
  config: {
    id?: string;
    name: string;
    symbol?: string;
    topic?: string;
    generated: number;
  };
  data: TimeSeriesDataPoint[];
}

type TimeInterval = "24h" | "7d" | "30d";
type DataSource = "coins" | "topics";

interface UnifiedTimeSeriesTableProps {
  symbol?: string;
  topic?: string;
  defaultInterval?: TimeInterval;
  defaultSource?: DataSource;
}

// Utility functions
const formatNumber = (num?: number): string => {
  if (num === undefined || num === null) return "-";
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return "-";
  if (price < 0.001) return price.toExponential(3);
  return `$${price.toFixed(6)}`;
};

const formatPercentage = (pct?: number): string => {
  if (pct === undefined || pct === null) return "-";
  return `${pct.toFixed(2)}%`;
};

const formatTimestamp = (timestamp: number, interval: TimeInterval): string => {
  const date = new Date(timestamp * 1000);
  
  // Match the performance page formatting logic
  if (interval === "24h") {
    // For 24h, show hour:minute format (hourly data)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // For 7d and 30d, show month/day format (daily data)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const getSentimentBadge = (sentiment?: number) => {
  if (sentiment === undefined || sentiment === null) return { variant: "secondary" as const, label: "Neutral" };
  if (sentiment >= 70) return { variant: "default" as const, label: "Bullish" };
  if (sentiment <= 30) return { variant: "destructive" as const, label: "Bearish" };
  return { variant: "secondary" as const, label: "Neutral" };
};

const getIntervalParams = (interval: TimeInterval) => {
  const now = Math.floor(Date.now() / 1000);
  switch (interval) {
    case "24h":
      // 24 hourly data points for last 24 hours
      return { start: now - 24 * 60 * 60, end: now, points: 24, intervalType: "hour" as const };
    case "7d":
      // 7 daily data points for last 7 days  
      return { start: now - 7 * 24 * 60 * 60, end: now, points: 7, intervalType: "day" as const };
    case "30d":
      // 30 daily data points for last 30 days
      return { start: now - 30 * 24 * 60 * 60, end: now, points: 30, intervalType: "day" as const };
  }
};

export function UnifiedTimeSeriesTable({
  symbol = "BONK",
  topic = "bonk", 
  defaultInterval = "24h",
  defaultSource = "coins"
}: UnifiedTimeSeriesTableProps) {
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(defaultInterval);
  const [selectedSource, setSelectedSource] = useState<DataSource>(defaultSource);

  const { start, end, intervalType } = getIntervalParams(selectedInterval);

  // Data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ["timeseries", selectedSource, symbol, topic, selectedInterval, start, end],
    queryFn: async (): Promise<TimeSeriesResponse> => {
      const tokenForEndpoint = selectedSource === "coins" ? symbol : topic;
      const { points, intervalType } = getIntervalParams(selectedInterval);
      
      // Use the new generic timeseries endpoint
      const endpoint = `/api/sentiment/${tokenForEndpoint}/timeseries?interval=${intervalType}&points=${points}&source=${selectedSource}`;
      
      console.log(`Fetching ${selectedSource} data from:`, endpoint);
      console.log(`Expected data points: ${points} (${selectedInterval})`);
      
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Failed to fetch ${selectedSource} data (${res.status}): ${errorText || res.statusText}`);
      }
      
      const json = await res.json();
      
      // Log response metadata for debugging
      if (json.metadata) {
        console.log(`📊 ${json.metadata.tokenId} (${json.metadata.dataSource}): Requested ${json.metadata.requestedPoints}, Got ${json.metadata.actualDataPoints} data points (${json.metadata.interval})`);
        if (!json.metadata.limitingApplied) {
          console.warn(`⚠️ Expected exactly ${json.metadata.requestedPoints} data points but got ${json.metadata.actualDataPoints}`);
        }
      }
      
      // Handle different response structures
      if (json.timeseries) {
        return json.timeseries;
      } else if (json.data) {
        return { config: json.config || {}, data: json.data };
      } else {
        return { config: {}, data: json };
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
  });

  // Process and sort data
  const processedData = useMemo(() => {
    if (!data?.data) return [];
    
    const { points } = getIntervalParams(selectedInterval);
    const sortedData = [...data.data].sort((a, b) => b.time - a.time); // Most recent first
    
    // Safety check: ensure we never show more than the requested number of points
    const limitedData = sortedData.slice(0, points);
    
    if (sortedData.length !== limitedData.length) {
      console.warn(`⚠️ Received ${sortedData.length} data points but expected ${points} for ${selectedInterval}. Limited to ${limitedData.length}.`);
    }
    
    return limitedData;
  }, [data, selectedInterval]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!processedData.length) return null;

    const latest = processedData[0];
    const oldest = processedData[processedData.length - 1];

    // Social metrics
    const totalInteractions = processedData.reduce((sum, item) => sum + (item.interactions || 0), 0);
    const totalSpam = processedData.reduce((sum, item) => sum + (item.spam || 0), 0);
    const avgSentiment = processedData.reduce((sum, item) => sum + (item.sentiment || 0), 0) / processedData.length;
    const avgGalaxyScore = processedData.reduce((sum, item) => sum + (item.galaxy_score || 0), 0) / processedData.length;
    const avgAltRank = processedData.reduce((sum, item) => sum + (item.alt_rank || 0), 0) / processedData.length;

    // Market metrics (for coins data)
    let marketStats = null;
    if (selectedSource === "coins") {
      const validPrices = processedData.filter(item => item.close && item.close > 0);
      const allPrices = processedData.map(item => [item.open, item.high, item.low, item.close]).flat().filter(p => p && p > 0);
      
      const avgMarketCap = processedData.reduce((sum, item) => sum + (item.market_cap || 0), 0) / processedData.length;
      const avgVolume = processedData.reduce((sum, item) => sum + (item.volume_24h || 0), 0) / processedData.length;
      
      marketStats = {
        priceChange: latest.close && oldest.close 
          ? ((latest.close - oldest.close) / oldest.close * 100).toFixed(2) 
          : null,
        priceRange: {
          high: Math.max(...allPrices),
          low: Math.min(...allPrices)
        },
        avgMarketCap: formatNumber(avgMarketCap),
        avgVolume: formatNumber(avgVolume)
      };
    }

    return {
      latest,
      oldest,
      totalInteractions: formatNumber(totalInteractions),
      totalSpam: formatNumber(totalSpam),
      avgSentiment: avgSentiment.toFixed(1),
      avgGalaxyScore: avgGalaxyScore.toFixed(1),
      avgAltRank: Math.round(avgAltRank),
      ...marketStats
    };
  }, [processedData, selectedSource]);

  return (
    <Card className="group/timeseries bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 transition-all duration-500">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Unified Time-Series Data
          </CardTitle>
          <Badge variant="outline" className="text-gray-300">
            {data?.config.name || symbol}
          </Badge>
        </div>

        {/* Time Interval & Source Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={selectedInterval} onValueChange={(val) => setSelectedInterval(val as TimeInterval)}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="24h" className="data-[state=active]:bg-orange-500">24H</TabsTrigger>
              <TabsTrigger value="7d" className="data-[state=active]:bg-orange-500">7D</TabsTrigger>
              <TabsTrigger value="30d" className="data-[state=active]:bg-orange-500">30D</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button
              variant={selectedSource === "coins" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource("coins")}
              className="bg-orange-500 hover:bg-orange-600 data-[state=active]:bg-orange-500"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Coins Data
            </Button>
            <Button
              variant={selectedSource === "topics" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource("topics")}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Topics Data
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {summaryStats && processedData.length > 0 && (
          <div className="space-y-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-400">Data Points</div>
                <div className="text-lg font-semibold text-orange-400">{processedData.length}</div>
                <div className="text-xs text-gray-500">{selectedInterval.toUpperCase()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Total Interactions</div>
                <div className="text-lg font-semibold text-white">{summaryStats.totalInteractions}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Total Spam</div>
                <div className="text-lg font-semibold text-red-400">{summaryStats.totalSpam}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Avg Sentiment</div>
                <div className="text-lg font-semibold text-white">{summaryStats.avgSentiment}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Avg Galaxy Score</div>
                <div className="text-lg font-semibold text-white">{summaryStats.avgGalaxyScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Avg Alt Rank</div>
                <div className="text-lg font-semibold text-gray-300">#{summaryStats.avgAltRank}</div>
              </div>
            </div>

            {/* Market Performance Row (Coins only) */}
            {selectedSource === "coins" && summaryStats.priceChange && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/70 rounded-lg border border-blue-500/20">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Price Change</div>
                  <div className={`text-lg font-semibold ${Number(summaryStats.priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Number(summaryStats.priceChange) >= 0 ? '+' : ''}{summaryStats.priceChange}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Price Range</div>
                  <div className="text-sm font-semibold text-white">
                    {formatPrice(summaryStats.priceRange?.low)} - {formatPrice(summaryStats.priceRange?.high)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Avg Market Cap</div>
                  <div className="text-lg font-semibold text-blue-400">{summaryStats.avgMarketCap}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Avg Volume 24h</div>
                  <div className="text-lg font-semibold text-purple-400">{summaryStats.avgVolume}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400">Loading time-series data...</div>
          </div>
        )}

        {error && (
          <div className="h-64 flex items-center justify-center">
            <div className="text-red-500">Error loading data: {error.message}</div>
          </div>
        )}

        {!isLoading && !error && processedData.length === 0 && (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400">No data available for the selected period</div>
          </div>
        )}

        {!isLoading && !error && processedData.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time
                  </TableHead>
                  {/* Social Activity Columns */}
                  <TableHead className="text-gray-300">
                    <Users className="h-4 w-4 inline mr-1" />
                    Contributors
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Interactions
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <MessageCircle className="h-4 w-4 inline mr-1" />
                    Posts
                  </TableHead>
                  <TableHead className="text-gray-300 text-red-400">
                    <MessageCircle className="h-4 w-4 inline mr-1" />
                    Spam
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Activity className="h-4 w-4 inline mr-1" />
                    Sentiment
                  </TableHead>
                  
                  {/* Market Data Columns (Coins only) */}
                  {selectedSource === "coins" && (
                    <>
                      <TableHead className="text-gray-300">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Open
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        High
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <TrendingDown className="h-4 w-4 inline mr-1" />
                        Low
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Close
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <BarChart3 className="h-4 w-4 inline mr-1" />
                        Market Cap
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        Volume 24h
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <Users className="h-4 w-4 inline mr-1" />
                        Circulating Supply
                      </TableHead>
                      <TableHead className="text-gray-300">
                        <BarChart3 className="h-4 w-4 inline mr-1" />
                        Market Dom.
                      </TableHead>
                    </>
                  )}
                  
                  {/* Ranking & Scores Columns */}
                  <TableHead className="text-gray-300">
                    <Star className="h-4 w-4 inline mr-1" />
                    Galaxy Score
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Social Dom.
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <BarChart3 className="h-4 w-4 inline mr-1" />
                    Alt Rank
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.map((item, index) => {
                  const sentimentBadge = getSentimentBadge(item.sentiment);
                  
                  return (
                    <TableRow key={`${item.time}-${index}`} className="border-gray-700">
                      {/* Time */}
                      <TableCell className="text-gray-300 font-mono text-xs">
                        {formatTimestamp(item.time, selectedInterval)}
                      </TableCell>
                      
                      {/* Social Activity */}
                      <TableCell className="text-white">
                        <div className="text-sm">
                          <div>Active: {formatNumber(item.contributors_active)}</div>
                          <div className="text-xs text-gray-400">New: {formatNumber(item.contributors_created)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatNumber(item.interactions)}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="text-sm">
                          <div>Active: {formatNumber(item.posts_active)}</div>
                          <div className="text-xs text-gray-400">New: {formatNumber(item.posts_created)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-red-400 font-semibold">
                        {formatNumber(item.spam)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sentimentBadge.variant}>
                          {sentimentBadge.label} ({item.sentiment || 0})
                        </Badge>
                      </TableCell>
                      
                      {/* Market Data (Coins only) */}
                      {selectedSource === "coins" && (
                        <>
                          <TableCell className="text-green-400 font-mono text-sm">
                            {formatPrice(item.open)}
                          </TableCell>
                          <TableCell className="text-green-500 font-mono text-sm">
                            {formatPrice(item.high)}
                          </TableCell>
                          <TableCell className="text-red-400 font-mono text-sm">
                            {formatPrice(item.low)}
                          </TableCell>
                          <TableCell className="text-white font-mono text-sm font-semibold">
                            {formatPrice(item.close)}
                          </TableCell>
                          <TableCell className="text-blue-400">
                            {formatNumber(item.market_cap)}
                          </TableCell>
                          <TableCell className="text-purple-400">
                            {formatNumber(item.volume_24h)}
                          </TableCell>
                          <TableCell className="text-yellow-400">
                            {formatNumber(item.circulating_supply)}
                          </TableCell>
                          <TableCell className="text-cyan-400">
                            {formatPercentage(item.market_dominance)}
                          </TableCell>
                        </>
                      )}
                      
                      {/* Ranking & Scores */}
                      <TableCell className="text-white">
                        <div className="flex items-center gap-1">
                          <span>{item.galaxy_score || "-"}</span>
                          {item.galaxy_score && (
                            <div className="w-16 h-2 bg-gray-700 rounded-full">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                                style={{ width: `${Math.min(item.galaxy_score, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-orange-400">
                        {formatPercentage(item.social_dominance)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">#{item.alt_rank || "-"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
