"use client";

import type React from "react";
import { useEffect } from "react";
import { EmptyState } from "./metasearch/empty-state";
import { LoadingState } from "./metasearch/loading-state";
import { SearchBar } from "./metasearch/search-bar";
import { toast } from "@/hooks/use-toast";
import { ResultsTabs } from "./metasearch/results-tabs";
import { useMetaSearchStore } from "./metasearch/store";
import {
  useInfluencersQuery,
  useSocialPostsQuery,
  useNewsQuery,
  usePriceChartQuery,
  useAiSummaryQuery,
} from "./metasearch/hooks";
import { fetchTokenStats, fetchCreators } from "./metasearch/utils";

interface MetaSearchDashboardProps {
  initialQuery?: string;
}

export function MetaSearchDashboard({
  initialQuery = "",
}: MetaSearchDashboardProps) {
  const {
    // State
    inputValue,
    loading,
    hasSearched,
    debouncedSearchQuery,
    // Actions
    setInputValue,
    setLoading,
    setHasSearched,
    setDebouncedSearchQuery,
    setTokenStats,
    setCreators,
    clearErrors,
  } = useMetaSearchStore();

  useInfluencersQuery();
  useSocialPostsQuery();
  useNewsQuery();
  usePriceChartQuery();
  useAiSummaryQuery();

  useEffect(() => {
    if (initialQuery && initialQuery !== inputValue) {
      setInputValue(initialQuery);
    }
  }, [initialQuery, inputValue, setInputValue]);

  async function handleSearch(query?: string) {
    const q = (query ?? debouncedSearchQuery).trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);

    // Clear previous errors
    clearErrors();

    try {
      // Detect if query is a contract address and provide feedback
      const isContractAddress = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/.test(q) && q.length >= 32 && q.length <= 44;

      if (isContractAddress) {
        toast({
          title: "Contract Address Detected",
          description: "Searching for token data using contract address...",
        });
      }

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
        if (isContractAddress && tokenStatsData.value.name) {
          toast({
            title: "Token Found!",
            description: `Found ${tokenStatsData.value.name} (${tokenStatsData.value.symbol})`,
          });
        }
      } else {
        console.error("Token stats error:", tokenStatsData.reason);
      }

      // Handle creators
      if (creatorsData.status === "fulfilled") {
        setCreators(creatorsData.value);
      } else {
        console.error("Creators error:", creatorsData.reason);
      }

      if (!isContractAddress) {
        toast({
          title: "Search Complete",
          description: `Found comprehensive data for "${q}"`,
        });
      }
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
      <SearchBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSearch={(query) => {
          setDebouncedSearchQuery(query);
          void handleSearch(query);
        }}
        loading={loading}
      />

      {/* Show empty state if no search has been performed */}
      {!hasSearched && !loading && <EmptyState />}

      {/* Show loading state */}
      {loading && <LoadingState />}

      {/* Show results only after search */}
      {hasSearched && !loading && <ResultsTabs />}
    </div>
  );
}