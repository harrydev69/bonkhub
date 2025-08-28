export type Category = "news" | "analysis" | "social" | "defi" | "nft";
export type Sentiment = "positive" | "negative" | "neutral";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  timestamp: string;
  relevance: number;
  category: Category;
  sentiment: Sentiment;
  engagement: number;
  trending?: boolean;
  verified?: boolean;
  author?: {
    name: string;
    verified: boolean;
  };
}

export interface AIInsight {
  summary: string;
  timestamp: string;
  sentiment: "bullish" | "bearish" | "neutral";
  keyPoints: string[];
  marketContext: string;
}

export interface RelatedTopic {
  name: string;
  symbol: string;
  relevance: number;
  sentiment: "positive" | "negative" | "neutral";
  change24h: number;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  rank: number;
  interactions24h: number;
  platform: "twitter" | "youtube" | "reddit" | "tiktok";
}

export interface SocialPost {
  id: string;
  post_type: string;
  post_title: string;
  post_link: string;
  post_image: string | null;
  post_created: number;
  post_sentiment: number;
  creator_id: string;
  creator_name: string;
  creator_display_name: string;
  creator_followers: number;
  creator_avatar: string;
  interactions_24h: number;
  interactions_total: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: string;
  sentiment: "positive" | "negative" | "neutral";
  relevance: number;
  image?: string;
}

export interface TokenStats {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  ath: number;
  athChangePercentage: number;
  atl: number;
  atlChangePercentage: number;
  rank: number;
}

export interface MetaSearchDashboardProps {
  initialQuery?: string;
}