"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Newspaper, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react"

type BONKNewsArticle = {
  id: string
  title: string
  summary: string
  link: string
  source: string
  published: string
  relativeTime: string
  readingTime?: string
  category: string
  subCategory?: string
  sentiment: {
    label: "positive" | "negative" | "neutral"
    score: number
  }
  sourceCount: number
}

type BONKNewsResponse = {
  articles: BONKNewsArticle[]
  lastUpdated: string
  isFallback?: boolean
}

export function BONKNewsFeed() {
  const [news, setNews] = useState<BONKNewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [displayCount, setDisplayCount] = useState(6) // Show 6 items initially

  const fetchBONKNews = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch(`/api/bonk/news?limit=20&time_frame=24h&page=${page}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch BONK news: ${response.status}`)
      }

      const data: BONKNewsResponse = await response.json()

      if (append) {
        setNews((prev) => [...prev, ...data.articles])
      } else {
        setNews(data.articles || [])
        setCurrentPage(1)
        // Reset expanded articles when fetching new news
        setExpandedArticles(new Set())
      }

      setLastUpdated(data.lastUpdated)
      setHasMore(data.articles.length >= 20) // If we get less than 20, we've reached the end

      // Show fallback message if using fallback data
      if (data.isFallback) {
        setError("Using fallback news data due to API rate limit. Real-time news will resume shortly.")
      }
    } catch (err) {
      console.error("Error fetching BONK news:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch news")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBONKNews()
  }, [])

  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  const loadMoreNews = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchBONKNews(nextPage, true)
    }
  }

  const getSentimentDisplay = (sentiment: { label: "positive" | "negative" | "neutral"; score: number }) => {
    const { label, score } = sentiment

    if (label === "positive" || score > 0.6) {
      return { icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-100", text: "Positive" }
    } else if (label === "negative" || score < 0.4) {
      return { icon: TrendingDown, color: "text-red-600", bgColor: "bg-red-100", text: "Negative" }
    } else {
      return { icon: Minus, color: "text-gray-600", bgColor: "bg-gray-100", text: "Neutral" }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "Unknown date"
    }
  }

  if (loading && news.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-orange-500" />
            <span>BONK News Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Loading BONK news...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-orange-500" />
            <span>BONK News Feed</span>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              {news.length} articles
            </Badge>
          </CardTitle>
        </div>

        {lastUpdated && <p className="text-sm text-gray-400">Last updated: {new Date(lastUpdated).toLocaleString()}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </CardHeader>

      <CardContent className="space-y-4">
        {news.slice(0, displayCount).map((article, index) => {
          const sentimentDisplay = getSentimentDisplay(article.sentiment)
          const isExpanded = expandedArticles.has(article.id)

          return (
            <div
              key={article.id}
              className="border border-gray-800 rounded-lg p-4 hover:border-orange-500/30 transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.1)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-gray-700 text-gray-300">
                    {article.category}
                  </Badge>
                  {article.subCategory && (
                    <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                      {article.subCategory}
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className={`${sentimentDisplay.bgColor} ${sentimentDisplay.color} border-0`}>
                  <sentimentDisplay.icon className="h-3 w-3 mr-1" />
                  {sentimentDisplay.text}
                </Badge>
              </div>

              <h3 className="text-white font-medium mb-2 hover:text-orange-400 transition-colors">{article.title}</h3>

              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.summary}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-400">{article.source}</span>
                  <span>•</span>
                  <span>{formatDate(article.published)}</span>
                  <span>•</span>
                  <span>{article.relativeTime}</span>
                  {article.readingTime && (
                    <>
                      <span>•</span>
                      <span>{article.readingTime}</span>
                    </>
                  )}
                </div>

                {isExpanded && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => window.open(article.link, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Read Full Article
                    </Button>
                    {article.sourceCount > 1 && (
                      <Badge variant="outline" className="border-gray-700 text-gray-400">
                        {article.sourceCount} sources
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleArticleExpansion(article.id)}
                  className="text-gray-400 hover:text-orange-400 ml-2"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )
        })}

        {news.length > displayCount && (
          <Button
            onClick={() => setDisplayCount((prev) => prev + 6)}
            disabled={displayCount >= news.length}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white"
          >
            Show More Articles ({displayCount}/{news.length})
          </Button>
        )}

        {hasMore && (
          <Button
            onClick={loadMoreNews}
            disabled={loadingMore}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loadingMore ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin">🔄</span>
                Loading...
              </>
            ) : (
              "Load More News"
            )}
          </Button>
        )}

        {news.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No BONK news available at the moment.</p>
            <Button onClick={() => fetchBONKNews()} className="bg-orange-600 hover:bg-orange-700 text-white mt-2">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
