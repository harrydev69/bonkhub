import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { TokenStats, Creator, SocialPost, NewsArticle } from "./types";

interface MetaSearchState {
  // Search state
  searchQuery: string;
  debouncedSearchQuery: string;
  inputValue: string;
  loading: boolean;
  activeTab: string;
  hasSearched: boolean;

  // API data states
  tokenStats: TokenStats | null;
  creators: Creator[];
  influencersData: any[];
  rawSocialPostsData: SocialPost[];
  rawNewsData: NewsArticle[];
  priceChartData: { prices: [number, number][]; market_caps: [number, number][]; total_volumes: [number, number][] };
  aiSummaryData: any;
  socialDominanceData: any[];
  technicalData: any[];

  // Error states
  tokenStatsError: string | null;
  creatorsError: string | null;
  socialPostsQueryError: any;
  newsQueryError: any;
  priceChartError: any;
  aiSummaryError: any;
  socialDominanceError: any;
  technicalDataError: any;

  // Loading states
  socialPostsLoading: boolean;
  newsLoading: boolean;
  priceChartLoading: boolean;
  aiSummaryLoading: boolean;
  socialDominanceLoading: boolean;
  technicalDataLoading: boolean;

  // News fallback state
  newsIsFallback: boolean;

  // Pagination states
  currentSocialPage: number;
  currentNewsPage: number;
  postsPerPage: number;
  newsPerPage: number;

  // Computed states
  filteredSocialPosts: SocialPost[];
  filteredNews: NewsArticle[];
  totalSocialPages: number;
  totalNewsPages: number;
  influencerNames: Set<string>;

  // Actions
  setSearchQuery: (query: string) => void;
  setDebouncedSearchQuery: (query: string) => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: string) => void;
  setHasSearched: (searched: boolean) => void;

  setTokenStats: (stats: TokenStats | null) => void;
  setCreators: (creators: Creator[]) => void;
  setInfluencersData: (data: any[]) => void;
  setRawSocialPostsData: (data: SocialPost[]) => void;
  setRawNewsData: (data: NewsArticle[]) => void;
  setPriceChartData: (data: { prices: [number, number][]; market_caps: [number, number][]; total_volumes: [number, number][] }) => void;
  setAiSummaryData: (data: any) => void;
  setSocialDominanceData: (data: any[]) => void;
  setTechnicalData: (data: any[]) => void;

  setTokenStatsError: (error: string | null) => void;
  setCreatorsError: (error: string | null) => void;
  setSocialPostsQueryError: (error: any) => void;
  setNewsQueryError: (error: any) => void;
  setPriceChartError: (error: any) => void;
  setAiSummaryError: (error: any) => void;
  setSocialDominanceError: (error: any) => void;
  setTechnicalDataError: (error: any) => void;

  setSocialPostsLoading: (loading: boolean) => void;
  setNewsLoading: (loading: boolean) => void;
  setPriceChartLoading: (loading: boolean) => void;
  setAiSummaryLoading: (loading: boolean) => void;
  setSocialDominanceLoading: (loading: boolean) => void;
  setTechnicalDataLoading: (loading: boolean) => void;

  setNewsIsFallback: (isFallback: boolean) => void;

  setCurrentSocialPage: (page: number) => void;
  setCurrentNewsPage: (page: number) => void;

  // Computed state updaters
  updateFilteredSocialPosts: () => void;
  updateFilteredNews: () => void;
  updateInfluencerNames: () => void;

  // Reset functions
  resetSearch: () => void;
  clearErrors: () => void;

  // Query management
  queryKeys: {
    influencers: (query: string, limit: number) => string[];
    socialPosts: (query: string, limit: number) => string[];
    news: (query: string, limit: number) => string[];
    priceChart: (query: string, days: number) => string[];
    aiSummary: (query: string) => string[];
    socialDominance: (query: string) => string[];
    technical: (query: string) => string[];
  };
}

const initialState = {
  searchQuery: "",
  debouncedSearchQuery: "",
  inputValue: "",
  loading: false,
  activeTab: "overview",
  hasSearched: false,

  tokenStats: null,
  creators: [],
  influencersData: [],
  rawSocialPostsData: [],
  rawNewsData: [],
  priceChartData: { prices: [] as any[], market_caps: [] as any[], total_volumes: [] as any[] },
  aiSummaryData: null,
  socialDominanceData: [],
  technicalData: [],

  tokenStatsError: null,
  creatorsError: null,
  socialPostsQueryError: null,
  newsQueryError: null,
  priceChartError: null,
  aiSummaryError: null,
  socialDominanceError: null,
  technicalDataError: null,

  socialPostsLoading: false,
  newsLoading: false,
  priceChartLoading: false,
  aiSummaryLoading: false,
  socialDominanceLoading: false,
  technicalDataLoading: false,

  newsIsFallback: false,

  currentSocialPage: 1,
  currentNewsPage: 1,
  postsPerPage: 7,
  newsPerPage: 6,

  filteredSocialPosts: [],
  filteredNews: [],
  totalSocialPages: 0,
  totalNewsPages: 0,
  influencerNames: new Set<string>(),
};

export const useMetaSearchStore = create<MetaSearchState>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        ...initialState,

        setSearchQuery: (query: string) => set({ searchQuery: query }),
        setDebouncedSearchQuery: (query: string) => set({ debouncedSearchQuery: query }),
        setInputValue: (value: string) => set({ inputValue: value }),
        setLoading: (loading: boolean) => set({ loading }),
        setActiveTab: (tab: string) => set({ activeTab: tab }),
        setHasSearched: (searched: boolean) => set({ hasSearched: searched }),

        setTokenStats: (stats: TokenStats | null) => set({ tokenStats: stats }),
        setCreators: (creators: Creator[]) => set({ creators }),
        setInfluencersData: (data: any[]) => {
          set({ influencersData: data });
          get().updateInfluencerNames();
        },
        setRawSocialPostsData: (data: SocialPost[]) => {
          set({ rawSocialPostsData: data });
          get().updateFilteredSocialPosts();
        },
        setRawNewsData: (data: NewsArticle[]) => {
          set({ rawNewsData: data });
          get().updateFilteredNews();
        },
        setPriceChartData: (data: { prices: [number, number][]; market_caps: [number, number][]; total_volumes: [number, number][] }) => set({ priceChartData: data }),
        setAiSummaryData: (data: any) => set({ aiSummaryData: data }),
        setSocialDominanceData: (data: any[]) => set({ socialDominanceData: data }),
        setTechnicalData: (data: any[]) => set({ technicalData: data }),

        setTokenStatsError: (error: string | null) => set({ tokenStatsError: error }),
        setCreatorsError: (error: string | null) => set({ creatorsError: error }),
        setSocialPostsQueryError: (error: any) => set({ socialPostsQueryError: error }),
        setNewsQueryError: (error: any) => set({ newsQueryError: error }),
        setPriceChartError: (error: any) => set({ priceChartError: error }),
        setAiSummaryError: (error: any) => set({ aiSummaryError: error }),
        setSocialDominanceError: (error: any) => set({ socialDominanceError: error }),
        setTechnicalDataError: (error: any) => set({ technicalDataError: error }),

        setSocialPostsLoading: (loading: boolean) => set({ socialPostsLoading: loading }),
        setNewsLoading: (loading: boolean) => set({ newsLoading: loading }),
        setPriceChartLoading: (loading: boolean) => set({ priceChartLoading: loading }),
        setAiSummaryLoading: (loading: boolean) => set({ aiSummaryLoading: loading }),
        setSocialDominanceLoading: (loading: boolean) => set({ socialDominanceLoading: loading }),
        setTechnicalDataLoading: (loading: boolean) => set({ technicalDataLoading: loading }),

        setNewsIsFallback: (isFallback: boolean) => set({ newsIsFallback: isFallback }),

        setCurrentSocialPage: (page: number) => set({ currentSocialPage: page }),
        setCurrentNewsPage: (page: number) => set({ currentNewsPage: page }),

        updateInfluencerNames: () => {
          const { influencersData } = get();
          const names = new Set(
            influencersData
              .filter((inf: any) => inf.creator_name)
              .map((inf: any) => inf.creator_name.toLowerCase())
          );
          set({ influencerNames: names });
          get().updateFilteredSocialPosts();
        },

        updateFilteredSocialPosts: () => {
          const { rawSocialPostsData, influencerNames, postsPerPage, currentSocialPage } = get();
          
          // Show all posts about the token, but prioritize posts from top influencers
          const influencerPosts = rawSocialPostsData.filter(
            (post: SocialPost) =>
              post.creator_name &&
              influencerNames.has(post.creator_name.toLowerCase())
          );
          
          const otherPosts = rawSocialPostsData.filter(
            (post: SocialPost) =>
              !post.creator_name ||
              !influencerNames.has(post.creator_name.toLowerCase())
          );
          
          // Combine: influencer posts first, then other posts
          const filtered = [...influencerPosts, ...otherPosts];
          const totalPages = Math.ceil(filtered.length / postsPerPage);
          set({
            filteredSocialPosts: filtered,
            totalSocialPages: totalPages,
          });
        },

        updateFilteredNews: () => {
          const { rawNewsData, newsPerPage } = get();
          const filtered = Array.isArray(rawNewsData) ? rawNewsData : [];
          const totalPages = Math.ceil(filtered.length / newsPerPage);
          set({
            filteredNews: filtered,
            totalNewsPages: totalPages,
          });
        },

        resetSearch: () => set({
          ...initialState,
          activeTab: get().activeTab, // Keep current tab
        }),

        clearErrors: () => set({
          tokenStatsError: null,
          creatorsError: null,
          socialPostsQueryError: null,
          newsQueryError: null,
          priceChartError: null,
          aiSummaryError: null,
          socialDominanceError: null,
          technicalDataError: null,
          newsIsFallback: false,
        }),

        queryKeys: {
          influencers: (query: string, limit: number) => ["influencers", query || "bonk", limit],
          socialPosts: (query: string, limit: number) => ["feeds", query || "bonk", limit],
          news: (query: string, limit: number) => ["news", query || "bonk", limit],
          priceChart: (query: string, days: number) => ["priceChart", query || "bonk", days],
          aiSummary: (query: string) => ["aiSummary", query || "bonk"],
          socialDominance: (query: string) => ["socialDominance", query || "bonk"],
          technical: (query: string) => ["technical", query || "bonk"],
        },
      }),
      {
        name: "meta-search-store",
      }
    )
  )
);