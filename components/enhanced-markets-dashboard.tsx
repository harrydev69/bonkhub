"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  AlertCircle,
  BarChart3,
  Target,
  Shield,
  SortAsc,
  SortDesc,
  ExternalLink,
  Leaf,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type EnhancedMarketsData = {
  venues: Array<{
    id: string;
    rank: number;
    exchange: string;
    exchangeLogo?: string;
    pair: string;
    price: number;
    spread: number;
    depth2Percent: {
      positive: number;
      negative: number;
    };
    volume24h: number;
    volumePercentage: number;
    lastUpdated: string;
    trustScore: string;
    marketType: "spot" | "perpetual" | "futures";
    exchangeType: "cex" | "dex";
    tradeUrl: string;
    priceChange24h: number;
    priceChangePercentage24h: number;
    high24h: number;
    low24h: number;
    bidAsk: {
      bid: number;
      ask: number;
      bidSize: number;
      askSize: number;
    };
    baseToken: string;
    targetToken: string;
    isAnomaly: boolean;
    isStale: boolean;
    lastTradedAt: string;
    timestamp: string;
    hasTradingIncentive: boolean;
    marketIdentifier: string;
    coinId: string;
    targetCoinId: string;
    tokenInfoUrl: string | null;
    // New derivatives-style analytics
    liquidationAnalysis: {
      zones: {
        immediate: { long: number; short: number };
        near: { long: number; short: number };
        medium: { long: number; short: number };
        far: { long: number; short: number };
      };
      riskScore: number;
      riskLevel: "low" | "medium" | "high";
      volatility: number;
      volumeFactor: number;
    };
    fundingRate: {
      rate: number;
      ratePercent: string;
      nextFunding: string;
      momentum: "bullish" | "bearish";
      intensity: "low" | "medium" | "high";
    };
  }>;
  summary: {
    totalVenues: number;
    totalVolume: number;
    averageSpread: number;
    averageTrustScore: string;
    marketTypeDistribution: {
      spot: number;
      perpetual: number;
      futures: number;
    };
    exchangeTypeDistribution: {
      cex: number;
      dex: number;
    };
    topExchanges: Array<{
      name: string;
      volume: number;
      venueCount: number;
      averageTrustScore: string;
    }>;
    totalPairs: number;
    uniqueExchanges: number;
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    volumeRange: {
      min: number;
      max: number;
    };
    spreadRange: {
      min: number;
      max: number;
    };
    // New derivatives-style analytics
    averageFundingRate: number;
    totalLiquidationRisk: number;
    averageLiquidationRisk: number;
    highRiskVenues: number;
    perpetualVenues: number;
    spotVenues: number;
    futuresVenues: number;
  };
  filters: {
    marketTypes: string[];
    exchangeTypes: string[];
    trustScores: string[];
    volumeRanges: string[];
    exchanges: string[];
    baseTokens: string[];
    targetTokens: string[];
    hasIncentive: boolean[];
  };
  metadata: {
    lastUpdated: string;
    dataSource: string;
    totalRecords: number;
    totalPairs: number;
    uniqueExchanges: number;
    uniquePairs: number;
    stalePairs: number;
    anomalyPairs: number;
    averageUpdateFrequency: number;
    dataQuality: {
      highTrust: number;
      mediumTrust: number;
      lowTrust: number;
    };
    dataFreshness: {
      recentlyUpdated: number;
      updatedWithin1Hour: number;
      updatedWithin24Hours: number;
      stale: number;
    };
    marketInsights: {
      topVolumeExchanges: Array<{
        exchange: string;
        volume: number;
        pair: string;
      }>;
      lowestSpreadExchanges: Array<{
        exchange: string;
        spread: number;
        pair: string;
      }>;
      highestSpreadExchanges: Array<{
        exchange: string;
        spread: number;
        pair: string;
      }>;
      mostActiveExchanges: Array<{
        exchange: string;
        venueCount: number;
        totalVolume: number;
      }>;
    };
  };
};

export default function EnhancedMarketsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [marketsData, setMarketsData] = useState<EnhancedMarketsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState("overview"); // Tab filter (overview, venues, analysis, quality)
  const [marketTypeFilter, setMarketTypeFilter] = useState("all"); // Market type filter (all, cex, dex, spot, perpetual, futures)
  const [sortBy, setSortBy] = useState("volume24h");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterExchangeType, setFilterExchangeType] = useState("all");
  const [filterTrustScore, setFilterTrustScore] = useState("all");
  const [filterBaseToken, setFilterBaseToken] = useState("all");
  const [filterTargetToken, setFilterTargetToken] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch data with error handling
  const fetchMarketsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bonk/markets/enhanced", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMarketsData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching markets data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch markets data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketsData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarketsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // URL-based state management useEffect
  useEffect(() => {
    if (!marketsData) return; // Early return if no data
    
    const params = new URLSearchParams();
    if (activeFilter !== "overview") params.set("tab", activeFilter);
    if (marketTypeFilter !== "all") params.set("marketType", marketTypeFilter);
    if (sortBy !== "volume24h") params.set("sort", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    if (filterExchangeType !== "all")
      params.set("exchangeType", filterExchangeType);
    if (filterTrustScore !== "all") params.set("trustScore", filterTrustScore);
    if (filterBaseToken !== "all") params.set("baseToken", filterBaseToken);
    if (filterTargetToken !== "all")
      params.set("targetToken", filterTargetToken);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/markets${newUrl}`, { scroll: false });
  }, [
    marketsData,
    activeFilter,
    marketTypeFilter,
    sortBy,
    sortOrder,
    filterExchangeType,
    filterTrustScore,
    filterBaseToken,
    filterTargetToken,
    router,
  ]);

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMarketsData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-3 w-24 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <Skeleton className="h-5 w-48 bg-gray-700" />
                <Skeleton className="h-3 w-32 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6 rounded-full bg-gray-700" />
                      <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 bg-gray-700 mb-1" />
                        <Skeleton className="h-3 w-16 bg-gray-700" />
                      </div>
                      <Skeleton className="h-6 flex-1 bg-gray-700 rounded-full" />
                      <Skeleton className="h-4 w-16 bg-gray-700" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-900/20 border-red-500/30">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-400">
          {error}. Please try refreshing the page or contact support if the
          problem persists.
        </AlertDescription>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Alert>
    );
  }

  if (!marketsData) {
    return (
      <Alert className="bg-yellow-900/20 border-yellow-500/30">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-400">
          No markets data available. Please check your API configuration.
        </AlertDescription>
      </Alert>
    );
  }

  const { venues, summary, filters, metadata } = marketsData;

  // State management - all hooks moved to top level

  // Computed values
  const totalPages = Math.ceil(venues.length / itemsPerPage);

  // Helper functions
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // URL-based state management useEffect moved to top level

  // Helper functions
  const getTrustScoreColor = (trustScore: string) => {
    switch (trustScore.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(2) + "%";
  };

  const formatPrice = (num: number) => {
    return "$" + num.toFixed(6);
  };

  // New helper function to format trading pairs
  const formatTradingPair = (pair: string) => {
    if (!pair) return "N/A";

    // If it's a simple pair like "BONK/USDT", return as is
    if (pair.includes("/") && pair.split("/").length === 2) {
      const [base, target] = pair.split("/");
      
      // If either part is longer than 12 characters, truncate it to first 4 + last 4
      const shortBase = base.length > 12 
        ? base.substring(0, 4) + "..." + base.substring(base.length - 4)
        : base;
      const shortTarget = target.length > 12 
        ? target.substring(0, 4) + "..." + target.substring(target.length - 4)
        : target;
      
      return `${shortBase}/${shortTarget}`;
    }

    // If it's a single long string (no slash), truncate it to first 4 + last 4
    if (pair.length > 12) {
      return pair.substring(0, 4) + "..." + pair.substring(pair.length - 4);
    }

    return pair;
  };

  const getMarketTypeColor = (type: string) => {
    switch (type) {
      case "spot":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "perpetual":
        return "bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100";
      case "futures":
        return "bg-orange-300 text-orange-900 dark:bg-orange-700 dark:text-orange-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getExchangeTypeColor = (type: string) => {
    switch (type) {
      case "cex":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "dex":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Filter and sort venues
  const filteredVenues = venues.filter((venue) => {
    if (
      filterExchangeType !== "all" &&
      venue.exchangeType !== filterExchangeType
    )
      return false;
    if (filterTrustScore !== "all" && venue.trustScore !== filterTrustScore)
      return false;
    if (filterBaseToken !== "all" && venue.baseToken !== filterBaseToken)
      return false;
    if (filterTargetToken !== "all" && venue.targetToken !== filterTargetToken)
      return false;
    return true;
  });

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "volume":
        aValue = a.volume24h;
        bValue = b.volume24h;
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "spread":
        aValue = a.spread;
        bValue = b.spread;
        break;
      case "exchange":
        aValue = a.exchange;
        bValue = b.exchange;
        break;
      case "trust":
        aValue = a.trustScore;
        bValue = b.trustScore;
        break;
      default:
        aValue = a.volume24h;
        bValue = b.volume24h;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // formatPairDisplay function removed - using formatTradingPair consistently

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Enhanced Markets Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Comprehensive analysis of BONK trading venues with depth, spread,
              and trust metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleDateString() : "Loading..."}
            </span>
            <Button
              onClick={handleRefresh}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs
          value={activeFilter}
          onValueChange={setActiveFilter}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="venues"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Trading Venues
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Market Analysis
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Data Quality
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Total Venues
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {summary.totalVenues}
                  </div>
                  <p className="text-xs text-gray-400">
                    {venues.length} total venues
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Total Volume
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(summary.totalVolume)}
                  </div>
                  <p className="text-xs text-gray-400">24h trading volume</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Avg Spread
                  </CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatPercentage(summary.averageSpread)}
                  </div>
                  <p className="text-xs text-gray-400">Bid-ask spread</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Trust Score
                  </CardTitle>
                  <Shield className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {summary.averageTrustScore}
                  </div>
                  <p className="text-xs text-gray-400">Average quality</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Market Stats - 6 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Price Analysis</CardTitle>
                  <CardDescription className="text-gray-400">Current price ranges across exchanges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Average Price</span>
                    <span className="text-white font-semibold">{formatPrice(summary.averagePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Price Range</span>
                    <span className="text-white font-semibold">
                      {formatPrice(summary.priceRange.min)} - {formatPrice(summary.priceRange.max)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Volume Range</span>
                    <span className="text-white font-semibold">
                      {formatNumber(summary.volumeRange.min)} - {formatNumber(summary.volumeRange.max)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Data Freshness</CardTitle>
                  <CardDescription className="text-gray-400">Market data update status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Recently Updated</span>
                    <span className="text-green-400 font-semibold">{metadata.dataFreshness.recentlyUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Within 1 Hour</span>
                    <span className="text-green-400 font-semibold">{metadata.dataFreshness.updatedWithin1Hour}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Stale Data</span>
                    <span className="text-red-400 font-semibold">{metadata.dataFreshness.stale}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Market Insights</CardTitle>
                  <CardDescription className="text-gray-400">Top performers & analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Unique Exchanges</span>
                    <span className="text-white font-semibold">{metadata.uniqueExchanges}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Unique Pairs</span>
                    <span className="text-white font-semibold">{metadata.uniquePairs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg Update Freq</span>
                    <span className="text-white font-semibold">{Math.round(metadata.averageUpdateFrequency)}m</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Funding Rate</CardTitle>
                  <CardDescription className="text-gray-400">Estimated perpetual funding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {summary.averageFundingRate.toFixed(4)}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      {summary.averageFundingRate > 0 ? 'Longs pay shorts' : 'Shorts pay longs'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Liquidation Risk</CardTitle>
                  <CardDescription className="text-gray-400">Market risk assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {summary.averageLiquidationRisk.toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {summary.highRiskVenues} high-risk venues
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Market Types</CardTitle>
                  <CardDescription className="text-gray-400">Venue distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Perpetual</span>
                    <span className="text-blue-400 font-semibold">{summary.perpetualVenues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Spot</span>
                    <span className="text-green-400 font-semibold">{summary.spotVenues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Futures</span>
                    <span className="text-orange-400 font-semibold">{summary.futuresVenues}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bonk Markets Table - Like the second screenshot */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Bonk Markets</CardTitle>
                <CardDescription className="text-gray-400">Affiliate disclosures</CardDescription>
              </CardHeader>
              
              {/* Filter Buttons */}
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={marketTypeFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMarketTypeFilter('all')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    All
                  </Button>
                  <Button 
                    variant={marketTypeFilter === 'cex' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMarketTypeFilter('cex')}
                  >
                    CEX
                  </Button>
                  <Button 
                    variant={marketTypeFilter === 'dex' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMarketTypeFilter('dex')}
                  >
                    DEX
                  </Button>
                  <Button 
                    variant={marketTypeFilter === 'spot' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMarketTypeFilter('spot')}
                  >
                    Spot
                  </Button>
                  <Button 
                    variant={marketTypeFilter === 'perpetual' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMarketTypeFilter('perpetual')}
                  >
                    Perpetuals
                  </Button>
                  <Button 
                    variant={marketTypeFilter === 'futures' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMarketTypeFilter('futures')}
                  >
                    Futures
                  </Button>
                </div>
              </div>

              {/* Sponsored Row */}
              <div className="px-6 pb-4">
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="text-green-400 text-sm">
                    Trustless Sol-EVM swaps via 1inch. Best rates! Sponsored.
                  </div>
                </div>
              </div>

              {/* Markets Table */}
              <CardContent className="px-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300 cursor-pointer hover:text-white" onClick={() => handleSort('rank')}>
                          <div className="flex items-center gap-1">
                            #
                            {sortBy === 'rank' && (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300 cursor-pointer hover:text-white" onClick={() => handleSort('exchange')}>
                          <div className="flex items-center gap-1">
                            Exchange
                            {sortBy === 'exchange' && (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Pair</TableHead>
                        <TableHead className="text-gray-300 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                          <div className="flex items-center gap-1">
                            Price
                            {sortBy === 'price' && (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300 cursor-pointer hover:text-white" onClick={() => handleSort('spread')}>
                          <div className="flex items-center gap-1">
                            Spread
                            {sortBy === 'spread' && (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">+2% Depth</TableHead>
                        <TableHead className="text-gray-300">-2% Depth</TableHead>
                        <TableHead className="text-gray-300 cursor-pointer hover:text-white" onClick={() => handleSort('volume24h')}>
                          <div className="flex items-center gap-1">
                            24h Volume
                            {sortBy === 'volume24h' && (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Volume %</TableHead>
                        <TableHead className="text-gray-300">Last Updated</TableHead>
                        <TableHead className="text-gray-300">Trust Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venues
                        .filter(venue => {
                          if (marketTypeFilter === 'all') return true;
                          if (marketTypeFilter === 'cex') return venue.exchangeType === 'cex';
                          if (marketTypeFilter === 'dex') return venue.exchangeType === 'dex';
                          if (marketTypeFilter === 'spot') return venue.marketType === 'spot';
                          if (marketTypeFilter === 'perpetual') return venue.marketType === 'perpetual';
                          if (marketTypeFilter === 'futures') return venue.marketType === 'futures';
                          return true;
                        })
                        .sort((a, b) => {
                          if (sortBy === 'rank') return sortOrder === 'asc' ? a.rank - b.rank : b.rank - a.rank;
                          if (sortBy === 'exchange') return sortOrder === 'asc' ? a.exchange.localeCompare(b.exchange) : b.exchange.localeCompare(a.exchange);
                          if (sortBy === 'price') return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
                          if (sortBy === 'spread') return sortOrder === 'asc' ? a.spread - b.spread : b.spread - a.spread;
                          if (sortBy === 'volume24h') return sortOrder === 'asc' ? a.volume24h - b.volume24h : b.volume24h - a.volume24h;
                          return b.volume24h - a.volume24h; // Default sort by volume
                        })
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((venue, index) => (
                          <TableRow key={venue.id} data-venue-id={venue.id} className="border-gray-700 hover:bg-gray-800/50">
                            <TableCell className="text-white font-medium">{venue.rank}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {venue.exchangeLogo ? (
                                  <Image 
                                    src={venue.exchangeLogo} 
                                    alt={venue.exchange} 
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-sm object-cover exchange-logo"
                                    onError={() => {
                                      // Fallback to letter if image fails to load
                                      const target = document.querySelector(`[data-venue-id="${venue.id}"] .exchange-logo`) as HTMLElement;
                                      if (target) target.style.display = 'none';
                                      const fallback = target?.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold ${venue.exchangeLogo ? 'hidden' : ''}`}>
                                  {venue.exchange.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-white font-medium">{venue.exchange}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-white">{formatTradingPair(venue.pair)}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{formatTradingPair(venue.pair)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-white">{formatPrice(venue.price)}</TableCell>
                            <TableCell className="text-white">{formatPercentage(venue.spread)}</TableCell>
                            <TableCell className="text-white">{formatNumber(venue.depth2Percent.positive)}</TableCell>
                            <TableCell className="text-white">{formatNumber(venue.depth2Percent.negative)}</TableCell>
                            <TableCell className="text-white">{formatNumber(venue.volume24h)}</TableCell>
                            <TableCell className="text-white">{venue.volumePercentage.toFixed(2)}%</TableCell>
                            <TableCell className="text-gray-300">{formatDate(venue.lastUpdated)}</TableCell>
                            <TableCell>
                              <div className={`w-3 h-3 rounded-full ${
                                venue.trustScore.toLowerCase() === 'green' ? 'bg-green-500' :
                                venue.trustScore.toLowerCase() === 'yellow' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, venues.length)} of {venues.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      &lt;
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        if (pageNum <= totalPages) {
                          return (
                                                         <Button
                               key={pageNum}
                               variant={pageNum === currentPage ? 'default' : 'outline'}
                               size="sm"
                               onClick={() => setCurrentPage(pageNum)}
                               className={pageNum === currentPage ? 'bg-orange-600 hover:bg-orange-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                             >
                               {pageNum}
                             </Button>
                          );
                        }
                        return null;
                      })}
                      
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VENUES */}
          <TabsContent value="venues" className="space-y-6">
            {/* Enhanced Filters */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Enhanced Filters</CardTitle>
                <CardDescription className="text-gray-400">
                  Filter and sort trading venues by various criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Market Type
                    </label>
                    <Select
                      value={activeFilter}
                      onValueChange={setActiveFilter}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="spot">Spot</SelectItem>
                        <SelectItem value="perpetual">Perpetual</SelectItem>
                        <SelectItem value="futures">Futures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Exchange Type
                    </label>
                    <Select
                      value={filterExchangeType}
                      onValueChange={setFilterExchangeType}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All</SelectItem>
                        {filters.exchangeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Trust Score
                    </label>
                    <Select
                      value={filterTrustScore}
                      onValueChange={setFilterTrustScore}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Scores</SelectItem>
                        {filters.trustScores.map((score) => (
                          <SelectItem key={score} value={score}>
                            {score}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Sort By
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="spread">Spread</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Order
                    </label>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venues Table */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Trading Venues ({filteredVenues.length})
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed view of all BONK trading venues with metrics
                </CardDescription>
              </CardHeader>

              {/* Quick Stats */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {filteredVenues.length}
                    </div>
                    <div className="text-gray-400">Active Venues</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {formatNumber(
                        filteredVenues.reduce((sum, v) => sum + v.volume24h, 0),
                      )}
                    </div>
                    <div className="text-gray-400">Total Volume</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {formatPercentage(
                        filteredVenues.reduce((sum, v) => sum + v.spread, 0) /
                          Math.max(filteredVenues.length, 1),
                      )}
                    </div>
                    <div className="text-gray-400">Avg Spread</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {
                        filteredVenues.filter((v) => v.trustScore === "green")
                          .length
                      }
                    </div>
                    <div className="text-gray-400">High Trust</div>
                  </div>
                </div>
              </div>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Rank</TableHead>
                        <TableHead className="text-gray-300">
                          Exchange
                        </TableHead>
                        <TableHead className="text-gray-300">Pair</TableHead>
                        <TableHead className="text-gray-300">Price</TableHead>
                        <TableHead className="text-gray-300">Spread</TableHead>
                        <TableHead className="text-gray-300">
                          24h Volume
                        </TableHead>
                        <TableHead className="text-gray-300">Vol %</TableHead>
                        <TableHead className="text-gray-300">Trust</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">
                          Base/Target
                        </TableHead>
                        <TableHead className="text-gray-300">Updated</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVenues.map((venue) => (
                        <TableRow
                          key={venue.id}
                          className="border-gray-700 hover:bg-gray-800"
                        >
                          <TableCell className="text-gray-300">
                            #{venue.rank}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <a
                                href={venue.tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white font-medium hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-2 group"
                              >
                                {venue.exchange}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <Badge
                                className={`text-xs w-fit ${getExchangeTypeColor(venue.exchangeType)}`}
                              >
                                {venue.exchangeType.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-white">
                                  {formatTradingPair(venue.pair)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatTradingPair(venue.pair)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-white">
                            {formatPrice(venue.price)}
                          </TableCell>
                          <TableCell className="text-white">
                            {formatPercentage(venue.spread)}
                          </TableCell>
                          <TableCell className="text-white">
                            {formatNumber(venue.volume24h)}
                          </TableCell>
                          <TableCell className="text-white">
                            {formatPercentage(venue.volumePercentage)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getTrustScoreColor(venue.trustScore)}
                            >
                              {venue.trustScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getMarketTypeColor(venue.marketType)}
                            >
                              {venue.marketType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div className="text-white">
                                {venue.baseToken}
                              </div>
                              <div className="text-gray-400">
                                → {venue.targetToken}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatDate(venue.lastUpdated)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                              onClick={() =>
                                window.open(venue.tradeUrl, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-gray-400 text-center">
                  Showing {filteredVenues.length} venues • Scroll to see more •
                  Hover over pairs to see full details
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYSIS */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Market Depth Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    +2% and -2% depth analysis for liquidity assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredVenues.slice(0, 6).map((venue) => (
                      <div
                        key={venue.id}
                        className="p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <a
                            href={venue.tradeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-white hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-2 group"
                          >
                            {venue.exchange}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm text-gray-400">
                                {formatTradingPair(venue.pair)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatTradingPair(venue.pair)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">+2% Depth</div>
                            <div className="text-green-400 font-semibold">
                              {formatNumber(venue.depth2Percent.positive)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">-2% Depth</div>
                            <div className="text-red-400 font-semibold">
                              {formatNumber(venue.depth2Percent.negative)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Bid: {formatPrice(venue.bidAsk.bid)} | Ask:{" "}
                          {formatPrice(venue.bidAsk.ask)} | Spread:{" "}
                          {formatPercentage(venue.spread)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Volume Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Top venues by trading volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredVenues.slice(0, 5).map((venue) => (
                      <div
                        key={venue.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-white">
                            {venue.exchange}
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm text-gray-400">
                                ({formatTradingPair(venue.pair)})
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatTradingPair(venue.pair)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-orange-400 font-semibold">
                          {formatPercentage(venue.volumePercentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QUALITY */}
          <TabsContent value="quality" className="space-y-6">
            {/* Data Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    High Trust
                  </CardTitle>
                  <Shield className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {metadata.dataQuality.highTrust}
                  </div>
                  <p className="text-xs text-gray-400">Venues</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Medium Trust
                  </CardTitle>
                  <Shield className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {metadata.dataQuality.mediumTrust}
                  </div>
                  <p className="text-xs text-gray-400">Venues</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Low Trust
                  </CardTitle>
                  <Shield className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {metadata.dataQuality.lowTrust}
                  </div>
                  <p className="text-xs text-gray-400">Venues</p>
                </CardContent>
              </Card>
            </div>

            {/* Market Data Summary */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Market Data Summary
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Data quality and freshness overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {metadata.totalRecords}
                    </div>
                    <div className="text-gray-400">Total Records</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {metadata.uniqueExchanges}
                    </div>
                    <div className="text-gray-400">Exchanges</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {metadata.uniquePairs}
                    </div>
                    <div className="text-gray-400">Trading Pairs</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-white font-semibold">
                      {metadata.stalePairs}
                    </div>
                    <div className="text-gray-400">Stale Data</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Issues and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Data Issues</CardTitle>
                  <CardDescription className="text-gray-400">
                    Potential problems and anomalies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-900/20 rounded-lg">
                    <span className="text-red-400">Anomaly Pairs</span>
                    <Badge variant="destructive">{metadata.anomalyPairs}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-900/20 rounded-lg">
                    <span className="text-yellow-400">Stale Pairs</span>
                    <Badge variant="secondary">{metadata.stalePairs}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Market Insights</CardTitle>
                  <CardDescription className="text-gray-400">
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">
                        Lowest Spreads
                      </h4>
                      <div className="space-y-2">
                        {metadata.marketInsights.lowestSpreadExchanges.map(
                          (exchange, index) => (
                            <div
                              key={exchange.exchange}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-white">
                                {exchange.exchange}
                              </span>
                              <span className="text-green-400">
                                {formatPercentage(exchange.spread)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">
                        Highest Spreads
                      </h4>
                      <div className="space-y-2">
                        {metadata.marketInsights.highestSpreadExchanges.map(
                          (exchange, index) => (
                            <div
                              key={exchange.exchange}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-white">
                                {exchange.exchange}
                              </span>
                              <span className="text-red-400">
                                {formatPercentage(exchange.spread)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Freshness Analysis */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Data Freshness Analysis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Market data update patterns and frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {metadata.dataFreshness.recentlyUpdated}
                    </div>
                    <div className="text-sm text-gray-400">
                      Recently Updated
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {metadata.dataFreshness.updatedWithin1Hour}
                    </div>
                    <div className="text-sm text-gray-400">Within 1 Hour</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {metadata.dataFreshness.updatedWithin24Hours}
                    </div>
                    <div className="text-sm text-gray-400">Within 24 Hours</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {metadata.dataFreshness.stale}
                    </div>
                    <div className="text-sm text-gray-400">Stale Data</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-blue-400 text-sm">
                    <strong>Data Source:</strong> CoinGecko Pro API • Last
                    refresh:{" "}
                    {lastUpdated ? lastUpdated.toLocaleString() : "Loading..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function EnhancedMarketsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-gray-700" />
          <Skeleton className="h-4 w-96 bg-gray-700" />
        </div>
        <Skeleton className="h-6 w-32 bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-16 bg-gray-700" />
              <Skeleton className="h-3 w-20 bg-gray-700" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-gray-700" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-full bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
