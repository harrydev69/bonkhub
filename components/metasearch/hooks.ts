import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMetaSearchStore } from "./store";

export function useInfluencersQuery() {
  const { debouncedSearchQuery, hasSearched, queryKeys, setInfluencersData } = useMetaSearchStore();

  const query = useQuery({
    queryKey: queryKeys.influencers(debouncedSearchQuery, 200),
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

  useEffect(() => {
    if (query.data) {
      setInfluencersData(query.data);
    }
  }, [query.data, setInfluencersData]);

  return query;
}

export function useSocialPostsQuery() {
  const {
    debouncedSearchQuery,
    hasSearched,
    queryKeys,
    setRawSocialPostsData,
    setSocialPostsQueryError,
  } = useMetaSearchStore();

  const query = useQuery({
    queryKey: queryKeys.socialPosts(debouncedSearchQuery, 30),
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

      let posts: any[] = [];
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

  useEffect(() => {
    if (query.data) {
      setRawSocialPostsData(query.data);
    }
  }, [query.data, setRawSocialPostsData]);

  useEffect(() => {
    if (query.error) {
      setSocialPostsQueryError(query.error);
    }
  }, [query.error, setSocialPostsQueryError]);

  return query;
}

export function useNewsQuery() {
  const {
    debouncedSearchQuery,
    hasSearched,
    queryKeys,
    setRawNewsData,
    setNewsQueryError,
  } = useMetaSearchStore();

  const query = useQuery({
    queryKey: queryKeys.news(debouncedSearchQuery, 50),
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

  useEffect(() => {
    if (query.data) {
      setRawNewsData(query.data);
    }
  }, [query.data, setRawNewsData]);

  useEffect(() => {
    if (query.error) {
      setNewsQueryError(query.error);
    }
  }, [query.error, setNewsQueryError]);

  return query;
}

export function usePriceChartQuery(timeRange = "7") {
  const {
    debouncedSearchQuery,
    hasSearched,
    queryKeys,
    setPriceChartData,
    setPriceChartError,
  } = useMetaSearchStore();

  const query = useQuery({
    queryKey: queryKeys.priceChart(debouncedSearchQuery, parseInt(timeRange)),
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      const res = await fetch(`/api/coingecko/token/${tokenId}?days=${timeRange}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`price chart ${res.status}: ${body || res.statusText}`);
      }
      const json = await res.json().catch(() => ({}));
      return json.chartData || { prices: [], market_caps: [], total_volumes: [] };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  useEffect(() => {
    if (query.data) {
      setPriceChartData(query.data);
    }
  }, [query.data, setPriceChartData]);

  useEffect(() => {
    if (query.error) {
      setPriceChartError(query.error);
    }
  }, [query.error, setPriceChartError]);

  return query;
}

export function useAiSummaryQuery() {
  const {
    debouncedSearchQuery,
    hasSearched,
    queryKeys,
    setAiSummaryData,
    setAiSummaryError,
  } = useMetaSearchStore();

  const query = useQuery({
    queryKey: queryKeys.aiSummary(debouncedSearchQuery),
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

  useEffect(() => {
    if (query.data) {
      setAiSummaryData(query.data);
    }
  }, [query.data, setAiSummaryData]);

  useEffect(() => {
    if (query.error) {
      setAiSummaryError(query.error);
    }
  }, [query.error, setAiSummaryError]);

  return query;
}

export function useSocialDominanceQuery() {
  const {
    debouncedSearchQuery,
    hasSearched,
    queryKeys,
    setSocialDominanceData,
    setSocialDominanceError,
  } = useMetaSearchStore();

  const query = useQuery({
    queryKey: queryKeys.socialDominance(debouncedSearchQuery),
    queryFn: async () => {
      const tokenId = debouncedSearchQuery || "bonk";
      
      // Fetch social dominance data from our API route
      const res = await fetch(`/api/social-dominance/${tokenId}`, {
        cache: "no-store",
      });
      
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`social dominance ${res.status}: ${body || res.statusText}`);
      }
      
      const json = await res.json().catch(() => ({}));
      return json.data || [];
    },
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    staleTime: 25 * 60 * 1000, // Consider stale after 25 minutes
    enabled: !!debouncedSearchQuery || hasSearched,
  });

  useEffect(() => {
    if (query.data) {
      setSocialDominanceData(query.data);
    }
  }, [query.data, setSocialDominanceData]);

  useEffect(() => {
    if (query.error) {
      setSocialDominanceError(query.error);
    }
  }, [query.error, setSocialDominanceError]);

  return query;
}