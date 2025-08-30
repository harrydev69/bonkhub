"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Users,
  ExternalLink,
} from "lucide-react";

// Helper function for consistent number formatting
function formatNumber(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

type Sentiment = "bullish" | "bearish" | "neutral";

type Influencer = {
  creator_id?: string;
  creator_name?: string;
  creator_avatar?: string;
  creator_followers?: number;
  creator_rank?: number;
  interactions_24h?: number;
};

function labelFromSentiment(n?: number): Sentiment {
  if (typeof n !== "number" || Number.isNaN(n)) return "neutral";
  // support both -1..1 and 0..100 scales
  const v = Math.abs(n) <= 1.2 ? n : (n - 50) / 50;
  if (v > 0.1) return "bullish";
  if (v < -0.1) return "bearish";
  return "neutral";
}
function sentimentBadgeVariant(s: Sentiment) {
  return s === "bullish"
    ? "default"
    : s === "bearish"
    ? "destructive"
    : "secondary";
}

type SortKey = "impact" | "followers";
const sorters: Record<SortKey, (a: any, b: any) => number> = {
  impact: (a, b) => (b.impact ?? 0) - (a.impact ?? 0),
  followers: (a, b) => (b.followers ?? 0) - (a.followers ?? 0),
};

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).influencers))
    return (data as any).influencers;
  if (data && Array.isArray((data as any).data)) return (data as any).data;
  if (data && Array.isArray((data as any).items)) return (data as any).items;
  return [];
}

function dedupeByKey<T extends Record<string, any>>(
  arr: T[],
  pick: (x: T, i: number) => string
) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const k = pick(arr[i], i);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(arr[i]);
    }
  }
  return out;
}

export default function InfluencerList({ tokenId = "bonk", limit = 20 }: { tokenId?: string; limit?: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("impact");

  const { data: influencers, isLoading, error } = useQuery({
    queryKey: ["influencers", tokenId, limit],
    queryFn: async () => {
      const res = await fetch(`/api/influencers/${tokenId}?limit=${limit}`, {
        cache: "force-cache",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`influencers ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      // Handle the nested response structure from the API
      // API returns: { success: true, data: { influencers: [...] } }
      return json.data?.influencers || json.influencers || []
    },
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 55 * 60 * 1000, // Consider stale after 55 minutes
  })

  const rows = useMemo(() => {
    const mapped = (influencers || []).map((i: any, idx: number) => {
      const handle = i.creator_name || `user_${idx}`;
      const normHandle = handle.startsWith("@") ? handle : `@${handle}`;
      const name = i.creator_name || handle.replace(/^@/, "");
      const followers = Number(i.creator_followers ?? 0);
      const impact = Number(i.interactions_24h ?? 0);
      const avatar = i.creator_avatar || "";
      const sentimentNum = 0; // API does not provide sentiment
      const sentiment = labelFromSentiment(sentimentNum);
      const url = `https://twitter.com/${handle.replace(/^@/, "")}`;

      return {
        id: i.creator_id ?? `${idx}`,
        name,
        handle: normHandle,
        followers,
        impact,
        avatar,
        sentiment,
        url,
      };
    });

    const filtered = mapped.filter((r: any) => {
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        r.name.toLowerCase().includes(needle) ||
        r.handle.toLowerCase().includes(needle)
      );
    });

    return filtered.sort(sorters[sortKey]).slice(0, limit);
  }, [influencers, q, sortKey, limit]);

  return (
    <Card className="group/leaderboard bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 transition-all duration-500 transform-gpu">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/leaderboard:text-orange-400">
          <Users className="h-6 w-6 text-purple-400 transition-all duration-500 group-hover/leaderboard:scale-110 group-hover/leaderboard:rotate-2" />
          Creator Leaderboard
          <span className="text-sm font-normal text-gray-400 ml-2">
            Top voices ranked by impact and reach
          </span>
        </CardTitle>
        
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="flex gap-2">
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 transition-all duration-300">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="impact" className="text-white hover:bg-gray-700">Impact</SelectItem>
                <SelectItem value="followers" className="text-white hover:bg-gray-700">Followers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Input
              className="w-48 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-orange-500 hover:border-orange-500/50 transition-all duration-300"
              placeholder="Search creators…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() =>
                setSortKey(sortKey === "impact" ? "followers" : "impact")
              }
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-orange-500/50 transition-all duration-300"
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="relative bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 animate-pulse"
              >
                <div className="absolute top-3 right-3 w-8 h-8 bg-gray-700 rounded-full" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="h-3 bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-700 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Failed to Load Creators
            </h3>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Unable to load influencers: {error.message}
            </p>
            <div className="text-xs text-gray-500 bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/30">
              <strong>API Error:</strong> LunarCrush influencers endpoint may be temporarily unavailable
            </div>
          </div>
        )}

        {!isLoading &&
          !error &&
          rows.map((r: any, idx: number) => {
            const handleCreatorClick = () => {
              // Extract creator ID from the full ID (remove prefixes like "twitter::")
              const creatorId = r.id.replace(/^(twitter::|youtube::|reddit::|tiktok::)/, '');
              router.push(`/creator/${creatorId}`);
            };

            return (
              <div
                key={`${r.id}-${idx}`}
                className="group/creator relative bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-orange-500/30 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
                onClick={handleCreatorClick}
              >
              {/* Rank Badge - Top Right Corner */}
              <div className="absolute top-3 right-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg">
                  {idx + 1}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 transition-all duration-300 group-hover/creator:scale-110 group-hover/creator:shadow-lg ring-2 ring-gray-600/50 group-hover/creator:ring-orange-500/50">
                    <AvatarImage 
                      src={r.avatar || ""} 
                      className="object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white font-bold text-sm transition-all duration-300 group-hover/creator:from-orange-500 group-hover/creator:to-orange-600">
                      {r.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Platform indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex-1 min-w-0 pr-10">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base leading-tight group-hover/creator:text-orange-400 transition-colors duration-300 truncate">
                      {r.name}
                    </h4>
                    <Badge 
                      variant={r.sentiment === "bullish" ? "default" : r.sentiment === "bearish" ? "destructive" : "secondary"}
                      className="text-xs shrink-0 transition-all duration-300 group-hover/creator:scale-105"
                    >
                      {r.sentiment}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mb-2 truncate">
                    {r.handle}
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                        {r.impact >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        Impact
                      </div>
                      <div className="text-orange-400 font-bold">
                        {formatNumber(r.impact ?? 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Followers</div>
                      <div className="text-white font-semibold">
                        {formatNumber(r.followers ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Link */}
                {r.url && (
                  <div className="absolute bottom-3 right-3">
                    <a 
                      href={r.url} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering creator navigation
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-orange-500 hover:scale-110 transition-all duration-300 group-hover/creator:shadow-lg"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-300 hover:text-white transition-colors duration-300" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
            );
          })}

        {!isLoading && !error && !rows.length && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Creators Found
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              {q ? `No creators match your search "${q}"` : "No creators found for this token"}
            </p>
            {q && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQ("")}
                className="mt-3 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all duration-300"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
