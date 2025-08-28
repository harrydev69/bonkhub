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
import { ExternalLink, ThumbsUp, Repeat2, MessageCircle } from "lucide-react";
import type { SocialPost } from "./types";
import { getSentimentVariant, humanTime } from "./utils";

interface SocialTabProps {
  socialPostsLoading: boolean;
  socialPostsQueryError: any;
  filteredSocialPosts: SocialPost[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SocialTab({
  socialPostsLoading,
  socialPostsQueryError,
  filteredSocialPosts,
  currentPage,
  totalPages,
  onPageChange,
}: SocialTabProps) {
  const postsPerPage = 7;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredSocialPosts.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  if (socialPostsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live BONK Social Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (socialPostsQueryError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live BONK Social Feed</CardTitle>
          <Badge variant="destructive">error</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Feed unavailable: {String(socialPostsQueryError)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group/social-feed bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white transition-all duration-500 group-hover/social-feed:text-orange-400">
          Live BONK Social Feed
        </CardTitle>
        <Badge
          variant="outline"
          className="transition-all duration-500 group-hover/social-feed:scale-105 group-hover/social-feed:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
        >
          {filteredSocialPosts.length} posts
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPosts.map((p) => {
          const name =
            p.creator_display_name || p.creator_name || "Creator";
          const handle = p.creator_name ? `@${p.creator_name}` : "";
          const platform = p.post_type || "Social";
          const likeCount = 0;
          const rtCount = 0;
          const replyCount = 0;
          const text = p.post_title || "";
          const id = String(p.id);

          return (
            <div
              key={id}
              className="group/post p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 transition-all duration-500 group-hover/post:scale-110 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                  <AvatarImage src={p.creator_avatar || ""} />
                  <AvatarFallback className="bg-orange-600 text-white transition-all duration-500 group-hover/post:bg-orange-500">
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white transition-all duration-500 group-hover/post:text-orange-400">
                        {name}
                      </span>
                      {handle && (
                        <span className="text-sm text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                          {handle}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]"
                      >
                        {platform}
                      </Badge>
                      <div className="transition-all duration-500 group-hover/post:scale-105 group-hover/post:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                        <Badge variant={getSentimentVariant(p.post_sentiment)}>
                          {p.post_sentiment !== undefined ? p.post_sentiment > 0.1 ? "positive" : p.post_sentiment < -0.1 ? "negative" : "neutral" : "neutral"}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground transition-all duration-500 group-hover/post:text-gray-300">
                      {humanTime(p.post_created)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-300 transition-all duration-500 group-hover/post:text-gray-200">
                    {text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <ThumbsUp className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      {likeCount}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <Repeat2 className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      {rtCount}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      <MessageCircle className="h-3 w-3 transition-all duration-500 group-hover/post:scale-110 group-hover/post:rotate-2" />
                      {replyCount}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      Followers: {p.creator_followers}
                    </span>
                    <span className="flex items-center gap-1 transition-all duration-500 group-hover/post:text-gray-300">
                      Interactions: {p.interactions_24h}
                    </span>
                    {p.post_link && (
                      <a
                        href={p.post_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group/open h-7 px-2 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
                        >
                          <ExternalLink className="h-3 w-3 mr-1 transition-all duration-500 group-hover/open:scale-110 group-hover/open:rotate-2" />
                          Open
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!filteredSocialPosts.length && (
          <div className="group/empty text-sm text-muted-foreground hover:text-gray-300 transition-all duration-500">
            No recent posts found.
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      onPageChange(Math.max(1, currentPage - 1))
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
                        Math.min(totalPages, currentPage + 1)
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