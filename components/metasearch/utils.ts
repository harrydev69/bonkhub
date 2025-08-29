import type { Sentiment } from "./types";

export function getSentimentVariant(v?: number): "default" | "secondary" | "destructive" {
  if (typeof v !== "number") return "secondary";
  if (v > 0.1) return "default";
  if (v < -0.1) return "destructive";
  return "secondary";
}

export function getSentimentText(v?: number): string {
  if (typeof v !== "number") return "neutral";
  if (v > 0.1) return "positive";
  if (v < -0.1) return "negative";
  return "neutral";
}

export function humanTime(ts?: number | string) {
  if (!ts) return "";
  let ms: number;
  if (typeof ts === "number") ms = ts < 1e12 ? ts * 1000 : ts;
  else {
    const n = Number(ts);
    ms = !Number.isNaN(n) ? (n < 1e12 ? n * 1000 : n) : Date.parse(ts);
  }
  const d = new Date(ms);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export function formatNumber(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function formatPrice(price: number) {
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

export function formatChartData(prices: [number, number][]) {
  return prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString(),
    price: price,
    formattedPrice: formatPrice(price),
  }));
}

// API fetch functions
export async function fetchTokenStats(tokenId: string) {
  const response = await fetch(`/api/coingecko/token/${tokenId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch token stats: ${response.statusText}`);
  }
  const data = await response.json();

  // Handle both regular token API and contract API response formats
  return {
    price: data.market_data?.current_price?.usd || 0,
    change24h: data.market_data?.price_change_percentage_24h_in_currency?.usd ||
               data.market_data?.price_change_percentage_24h || 0,
    marketCap: data.market_data?.market_cap?.usd || 0,
    volume24h: data.market_data?.total_volume?.usd || 0,
    circulatingSupply: data.market_data?.circulating_supply || 0,
    totalSupply: data.market_data?.total_supply || 0,
    ath: data.market_data?.ath?.usd || 0,
    athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
    atl: data.market_data?.atl?.usd || 0,
    atlChangePercentage: data.market_data?.atl_change_percentage?.usd || 0,
    rank: data.market_data?.market_cap_rank || 0,
    // Additional fields from contract API
    name: data.name || '',
    symbol: data.symbol || '',
    contractAddress: data.contract_address || tokenId,
    image: data.image?.small || data.image?.thumb || data.image?.large || '',
  };
}

export async function fetchCreators(tokenId: string) {
  const response = await fetch(`/api/influencers/${tokenId}?limit=10`);
  if (!response.ok) {
    throw new Error(`Failed to fetch creators: ${response.statusText}`);
  }
  const data = await response.json();

  return (
    data.influencers?.map((influencer: any, index: number) => ({
      id: influencer.creator_id || Math.random().toString(),
      name: influencer.creator_name || "Unknown",
      avatar: influencer.creator_avatar || "https://via.placeholder.com/40",
      followers: influencer.creator_followers || 0,
      rank: influencer.creator_rank || index + 1,
      interactions24h: influencer.interactions_24h || 0,
      platform: influencer.creator_id?.startsWith("youtube::")
        ? "youtube"
        : influencer.creator_id?.startsWith("twitter::")
        ? "twitter"
        : "twitter",
    })) || []
  );
}