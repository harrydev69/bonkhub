"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "./types";
import { getSentimentVariant, humanTime } from "./utils";

interface NewsTabProps {
  newsLoading: boolean;
  newsQueryError: any;
  filteredNews: NewsArticle[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFallback?: boolean;
}

export function NewsTab({
  newsLoading,
  newsQueryError,
  filteredNews,
  currentPage,
  totalPages,
  onPageChange,
  isFallback = false,
}: NewsTabProps) {
  const newsPerPage = 6;
  const newsIndexOfLast = currentPage * newsPerPage;
  const newsIndexOfFirst = newsIndexOfLast - newsPerPage;
  const currentNews = filteredNews.slice(newsIndexOfFirst, newsIndexOfLast);

  if (newsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (newsQueryError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest News & Updates</CardTitle>
          <Badge variant="destructive">error</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            News unavailable: {String(newsQueryError)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group/news bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white transition-all duration-500 group-hover/news:text-orange-400">
          {isFallback ? "General Crypto News" : "Latest News & Updates"}
        </CardTitle>
        <div className="flex items-center gap-2">
          {isFallback && (
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs transition-all duration-500 group-hover/news:scale-105 group-hover/news:shadow-[0_0_4px_rgba(59,130,246,0.2)]"
            >
              Fallback News
            </Badge>
          )}
          <Badge
            variant="outline"
            className="transition-all duration-500 group-hover/news:scale-105 group-hover/news:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
          >
            {filteredNews.length} articles
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFallback && filteredNews.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>
                No token-specific news found. Showing general cryptocurrency news instead.
              </span>
            </div>
          </div>
        )}
        {currentNews.map((article) => {
          const name = article.creator_display_name || "Source";
          const handle = article.creator_name ? `@${article.creator_name}` : "";
          const text = article.post_title || "";
          const id = String(article.id);

          return (
            <div
              key={id}
              className="group/article p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 transition-all duration-500 group-hover/article:scale-110 group-hover/article:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                  <AvatarImage src={article.creator_avatar || article.post_image || ""} />
                  <AvatarFallback className="bg-orange-600 text-white transition-all duration-500 group-hover/article:bg-orange-500">
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white transition-all duration-500 group-hover/article:text-orange-400">
                        {name}
                      </span>
                      {handle && (
                        <span className="text-sm text-muted-foreground transition-all duration-500 group-hover/article:text-gray-300">
                          {handle}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className="transition-all duration-500 group-hover/article:scale-105 group-hover/article:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                      >
                        {article.post_type}
                      </Badge>
                      <div className="transition-all duration-500 group-hover/article:scale-105 group-hover/article:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                        <Badge variant={getSentimentVariant(article.post_sentiment)}>
                          {article.post_sentiment > 0 ? "positive" : article.post_sentiment < 0 ? "negative" : "neutral"}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground transition-all duration-500 group-hover/article:text-gray-300">
                      {humanTime(article.post_created)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-300 transition-all duration-500 group-hover/article:text-gray-200">
                    {text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/article:text-gray-300">
                      👥 {article.creator_followers?.toLocaleString()} followers
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/article:text-gray-300">
                      💬 {article.interactions_24h} interactions (24h)
                    </span>
                    {article.post_link && (
                      <a
                        href={article.post_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group/open h-7 px-2 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
                        >
                          <ExternalLink className="h-3 w-3 mr-1 transition-all duration-500 group-hover/open:scale-110 group-hover/open:rotate-2" />
                          Read
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!filteredNews.length && (
          <div className="group/empty text-sm text-muted-foreground hover:text-gray-300 transition-all duration-500">
            No recent news found.
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      onPageChange(
                        Math.max(1, currentPage - 1)
                      )
                    }
                    className={`group/prev transition-all duration-500 ${
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                    }`}
                  />
                </PaginationItem>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => onPageChange(page)}
                      className="group/page cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      onPageChange(
                        Math.min(
                          totalPages,
                          currentPage + 1
                        )
                      )
                    }
                    className={`group/next transition-all duration-500 ${
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}