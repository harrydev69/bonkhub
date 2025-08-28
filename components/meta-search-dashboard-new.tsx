"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ResultsTabs } from "./metasearch/results-tabs";
import type { TokenStats, Creator, SocialPost, NewsArticle } from "./metasearch/types";
import { fetchTokenStats, fetchCreators } from "./metasearch/utils";

interface MetaSearchDashboardProps {
  initialQuery?: string;
}

export function MetaSearchDashboard({
  initialQuery = "",
}: MetaSearchDashboardProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [hasSearched, setHasSearched] = useState(false);

  // API data states
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);

  // Error states
  const [tokenStatsError, setTokenStatsError] = useState<string | null>(null);
  const [creatorsError, setCreatorsError] = useState<string | null>(null);

  // Social posts pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  const { data: influencersData } = useQuery({
    queryKey: ["influencers", debouncedSearchQuery || "bonk", 200],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      const res = await fetch(`/api/influencers/${tokenId}?limit=200`, {
        cache: "force-cache",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`influencers ${res.status}: ${body || res.statusText}`);
      }
      const json = await res.json().catch(() => ({}));
      return json.influencers || [];
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  const {
    data: rawSocialPostsData,
    isLoading: socialPostsLoading,
    error: socialPostsQueryError,
  } = useQuery({
    queryKey: ["feeds", debouncedSearchQuery || "bonk", 30],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      const res = await fetch(`/api/feeds/${tokenId}?limit=30`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`feeds ${res.status}: ${body || res.statusText}`);
      }
      const json = await res.json().catch(() => ({}));

      let posts: SocialPost[] = [];
      if (json.feeds && Array.isArray(json.feeds)) {
        posts = json.feeds;
      } else if (json.data && Array.isArray(json.data)) {
        posts = json.data;
      }

      return posts;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  // Get influencer names for filtering
  const influencerNames = useMemo(() => {
    if (!influencersData || !Array.isArray(influencersData)) return new Set();
    return new Set(
      influencersData.map((inf: any) => inf.creator_name?.toLowerCase())
    );
  }, [influencersData]);

  // Filter posts to only include those from influencers
  const filteredSocialPosts = useMemo(() => {
    if (!rawSocialPostsData || !Array.isArray(rawSocialPostsData)) return [];
    return rawSocialPostsData.filter(
      (post: SocialPost) =>
        post.creator_name &&
        influencerNames.has(post.creator_name.toLowerCase())
    );
  }, [rawSocialPostsData, influencerNames]);

  const totalPages = Math.ceil(filteredSocialPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredSocialPosts.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (initialQuery && initialQuery !== inputValue) {
      setInputValue(initialQuery);
    }
  }, [initialQuery]);

  async function handleSearch(query?: string) {
    const q = (query ?? debouncedSearchQuery).trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);

    // Clear previous errors
    setTokenStatsError(null);
    setCreatorsError(null);

    try {
      // Fetch all data in parallel
      const [tokenStatsData, creatorsData] = await Promise.allSettled([
        fetchTokenStats(q).catch((err) => {
          throw new Error(`Token stats: ${err.message}`);
        }),
        fetchCreators(q).catch((err) => {
          throw new Error(`Creators: ${err.message}`);
        }),
      ]);

      // Handle token stats
      if (tokenStatsData.status === "fulfilled") {
        setTokenStats(tokenStatsData.value);
      } else {
        setTokenStatsError(tokenStatsData.reason.message);
        console.error("Token stats error:", tokenStatsData.reason);
      }

      // Handle creators
      if (creatorsData.status === "fulfilled") {
        setCreators(creatorsData.value);
      } else {
        setCreatorsError(creatorsData.reason.message);
        console.error("Creators error:", creatorsData.reason);
      }

      toast({
        title: "Search Complete",
        description: `Found comprehensive data for "${q}"`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Search Failed",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger immediate search on form submit
    if (inputValue.trim()) {
      setDebouncedSearchQuery(inputValue.trim());
      void handleSearch(inputValue.trim());
    }
  };

  // News pagination
  const [newsCurrentPage, setNewsCurrentPage] = useState(1);
  const newsPerPage = 6;

  const {
    data: rawNewsData,
    isLoading: newsLoading,
    error: newsQueryError,
  } = useQuery({
    queryKey: ["news", debouncedSearchQuery || "bonk", 50],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      const res = await fetch(`/api/news/${tokenId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`news ${res.status}: ${body || res.statusText}`);
      }
      const json = await res.json().catch(() => ({}));
      return json.data?.data || [];
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 9 * 60 * 1000, // Consider stale after 9 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  const {
    data: priceChartData,
    isLoading: priceChartLoading,
    error: priceChartError,
  } = useQuery({
    queryKey: ["priceChart", debouncedSearchQuery || "bonk", 7],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      const res = await fetch(`/api/coingecko/token/${tokenId}?days=7`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`price chart ${res.status}: ${body || res.statusText}`);
      }
      const json = await res.json().catch(() => ({}));
      return json.chartData?.prices || [];
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  const {
    data: aiSummaryData,
    isLoading: aiSummaryLoading,
    error: aiSummaryError,
  } = useQuery({
    queryKey: ["aiSummary", debouncedSearchQuery || "bonk"],
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      const res = await fetch(`/api/ai-summary/${tokenId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`AI summary ${res.status}: ${body || res.statusText}`);
      }
      const json = await res.json().catch(() => ({}));
      return json;
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 8 * 60 * 1000, // Consider stale after 8 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  // Filter and paginate news
  const filteredNews = useMemo(() => {
    if (!rawNewsData || !Array.isArray(rawNewsData)) return [];
    return rawNewsData;
  }, [rawNewsData]);

  const newsTotalPages = Math.ceil(filteredNews.length / newsPerPage);
  const newsIndexOfLast = newsCurrentPage * newsPerPage;
  const newsIndexOfFirst = newsIndexOfLast - newsPerPage;
  const currentNews = filteredNews.slice(newsIndexOfFirst, newsIndexOfLast);

  const handleNewsPageChange = (page: number) => {
    setNewsCurrentPage(page);
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-20 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center group/icon transition-all duration-500 hover:scale-110">
        <Search className="w-12 h-12 text-gray-400 group-hover/icon:text-orange-400 transition-all duration-500" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-white">
          Search for a Token to Get Started
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover comprehensive social intelligence, market data, and community
          insights for any cryptocurrency. Search by token name, symbol, or
          contract address.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          AI-Powered Insights
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          Social Sentiment
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          Real-time Data
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-orange-400 rounded" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
          <p className="text-gray-400 text-sm">
            Get AI-generated summaries of current developments, sentiment
            analysis, and market context.
          </p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-blue-400 rounded" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Social Intelligence
          </h3>
          <p className="text-gray-400 text-sm">
            Track top creators, trending conversations, and community engagement
            across all platforms.
          </p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-green-400 rounded" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Market Data</h3>
          <p className="text-gray-400 text-sm">
            Access real-time prices, market cap, volume, and comprehensive token
            statistics.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <h1 className="text-4xl font-bold text-white transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
          Meta Search
        </h1>
        <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
          Search across multiple platforms for comprehensive crypto intelligence
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <form
          onSubmit={handleFormSubmit}
          className="relative w-full max-w-2xl group/search"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110" />
          <Input
            type="text"
            placeholder="Search for tokens, topics, or trends..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10 pr-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
          />
          <Button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 h-7 text-sm font-medium hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-300 transform-gpu z-10 rounded-md"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {/* Show empty state if no search has been performed */}
      {!hasSearched && !loading && <EmptyState />}

      {/* Show loading state */}
      {loading && (
        <div className="text-center py-20 space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
            <Search className="w-12 h-12 text-orange-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Searching...</h2>
            <p className="text-gray-400 text-lg">
              Gathering comprehensive data from multiple sources...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className=" w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Show results only after search */}
      {hasSearched && !loading && (
        <ResultsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          // Overview props
          tokenStats={tokenStats}
          creators={creators}
          aiInsight={null} // TODO: Add AI insight data
          aiSummaryData={aiSummaryData}
          aiSummaryLoading={aiSummaryLoading}
          aiSummaryError={aiSummaryError}
          priceChartData={priceChartData}
          priceChartLoading={priceChartLoading}
          priceChartError={priceChartError}
          // Social props
          socialPostsLoading={socialPostsLoading}
          socialPostsQueryError={socialPostsQueryError}
          filteredSocialPosts={filteredSocialPosts}
          currentSocialPage={currentPage}
          socialTotalPages={totalPages}
          onSocialPageChange={handlePageChange}
          // News props
          newsLoading={newsLoading}
          newsQueryError={newsQueryError}
          filteredNews={filteredNews}
          currentNewsPage={newsCurrentPage}
          newsTotalPages={newsTotalPages}
          onNewsPageChange={handleNewsPageChange}
        />
      )}
    </div>
  );
}