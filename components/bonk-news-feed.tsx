"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react"

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
  image?: string
  interactions24h?: number
  creatorFollowers?: number
}

type BONKNewsResponse = {
  articles: BONKNewsArticle[]
  lastUpdated: string
  isFallback?: boolean
}

interface BONKNewsFeedProps {
  selectedCategory?: string
  searchQuery?: string
  articles?: any[] // Add articles prop
}

export function BONKNewsFeed({ selectedCategory = "all", searchQuery = "", articles: propArticles }: BONKNewsFeedProps) {
  const [news, setNews] = useState<BONKNewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [newArticlesCount, setNewArticlesCount] = useState(0)
  const [showNewIndicator, setShowNewIndicator] = useState(false)

  // Use prop articles if provided, otherwise use local state
  const actualArticles = propArticles || news

  // Filter articles based on selected category and search query
  const filteredNews = useMemo(() => {
    let filtered = actualArticles

    console.log('🔍 Filtering Debug:')
    console.log('📰 Total news articles:', actualArticles.length)
    console.log('🎯 Selected category:', selectedCategory || 'undefined')
    console.log('🔎 Search query:', searchQuery || 'undefined')
    console.log('📋 Sample article categories:', actualArticles.slice(0, 3).map(a => ({ 
      title: a.title.substring(0, 30) + '...', 
      category: a.category, 
      subCategory: a.subCategory 
    })))

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(article => {
        const articleSubCategory = article.subCategory || ""
        
        console.log(`🔍 Checking article: "${article.title.substring(0, 30)}..."`)
        console.log(`   Article subcategory: "${articleSubCategory}"`)
        console.log(`   Selected category: "${selectedCategory || 'undefined'}"`)
        
        // Normalize both the selected category and article subcategory for comparison
        const normalizedSelectedCategory = selectedCategory ? selectedCategory.toLowerCase().replace(/-/g, ' ') : ""
        const normalizedArticleSubCategory = articleSubCategory ? articleSubCategory.toLowerCase().trim() : ""
        
        // If no subcategory, treat as "General"
        if (!normalizedArticleSubCategory) {
          const isGeneral = normalizedSelectedCategory === "general"
          console.log(`   No subcategory found, treating as General. Match: ${isGeneral}`)
          return isGeneral
        }
        
        // Try exact match first
        const exactMatch = normalizedArticleSubCategory === normalizedSelectedCategory
        
        // If no exact match, try matching the normalized category ID
        const categoryIdMatch = articleSubCategory ? articleSubCategory.toLowerCase().replace(/\s+/g, '-') === selectedCategory : false
        
        const match = exactMatch || categoryIdMatch
        
        console.log(`   Normalized selected: "${normalizedSelectedCategory}"`)
        console.log(`   Normalized article: "${normalizedArticleSubCategory}"`)
        console.log(`   Exact match: ${exactMatch}`)
        console.log(`   Category ID match: ${categoryIdMatch}`)
        console.log(`   Final result: ${match}`)
        
        return match
      })
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      )
    }

    // Sort by publication date (latest first) to ensure newest content on page 1
    filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())

    console.log(`📊 Final filtering results:`)
    console.log(`   Total articles: ${actualArticles.length}`)
    console.log(`   Filtered articles: ${filtered.length}`)
    console.log(`   Selected category: ${selectedCategory || 'undefined'}`)
    
    return filtered
  }, [actualArticles, selectedCategory, searchQuery])

  // Pagination logic - Show only 3 latest articles by default for better UX
  const articlesPerPage = 3 // Show only 3 articles per page for cleaner look
  const totalPages = Math.ceil(filteredNews.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = filteredNews.slice(startIndex, endIndex)

  const fetchBONKNews = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch(`/api/bonk/news?limit=100&time_frame=24h&page=${page}`, {
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
      }

      setLastUpdated(data.lastUpdated)
      setHasMore(data.articles.length >= 100) // If we get less than 100, we've reached the end

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

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  // Initial fetch - only if no articles provided via props
  useEffect(() => {
    if (!propArticles || propArticles.length === 0) {
      fetchBONKNews()
    }
  }, [propArticles])

  // Auto-refresh every 30 minutes to check for new articles
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing news (30-minute interval)')
        const response = await fetch('/api/bonk/news?limit=100', {
          cache: "no-store"
        })
        
        if (response.ok) {
          const data = await response.json()
          const newArticles = data.articles || []
          
          // Count new articles (articles not in current list)
          const currentIds = new Set(actualArticles.map(a => a.id))
          const newArticlesCount = newArticles.filter((a: any) => !currentIds.has(a.id)).length
          
          if (newArticlesCount > 0) {
            console.log(`🆕 Found ${newArticlesCount} new articles!`)
            setNewArticlesCount(newArticlesCount)
            setShowNewIndicator(true)
            
            // Update articles if using local state
            if (!propArticles) {
              setNews(newArticles)
            }
          }
          
          setLastRefresh(new Date())
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      }
    }, 30 * 60 * 1000) // 30 minutes
    
    return () => clearInterval(interval)
  }, [actualArticles, propArticles])

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

  if (loading && actualArticles.length === 0) {
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Newspaper className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">BONK News Feed</h2>
              <p className="text-sm text-gray-400">
                {filteredNews.length} articles available • Showing {Math.min(articlesPerPage, filteredNews.length)} per page
              </p>
            </div>
          </div>
          
          {/* New Articles Indicator */}
          {showNewIndicator && newArticlesCount > 0 && (
            <Button
              onClick={() => {
                setCurrentPage(1) // Go to page 1 for latest articles
                setShowNewIndicator(false)
                setNewArticlesCount(0)
              }}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white animate-pulse"
            >
              🆕 {newArticlesCount} New Articles
            </Button>
          )}
        </div>

        {lastUpdated && (
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
            <Button
              onClick={() => {
                fetchBONKNews()
                setShowNewIndicator(false)
                setNewArticlesCount(0)
              }}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:border-orange-500"
            >
              🔄 Refresh
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Latest Articles Indicator */}
        {currentPage === 1 && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-blue-300">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">📰 Latest Articles</span>
                <span className="text-xs text-blue-400">
                  Showing most recent {Math.min(articlesPerPage, filteredNews.length)} of {filteredNews.length} articles
                </span>
              </div>
              {filteredNews.length > articlesPerPage && (
                <span className="text-xs text-blue-400">
                  {filteredNews.length - articlesPerPage} more articles available
                </span>
              )}
            </div>
          </div>
        )}
        
        {currentArticles.map((article, index) => {
          const sentimentDisplay = getSentimentDisplay(article.sentiment)
          // Create a unique key by combining article ID with index
          const uniqueKey = `${article.id}-${index}`

          return (
            <div
              key={uniqueKey}
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
                <div className="text-right">
                  <Badge variant="outline" className={`${sentimentDisplay.bgColor} ${sentimentDisplay.color} border-0 mb-1`}>
                    <sentimentDisplay.icon className="h-3 w-3 mr-1" />
                    {sentimentDisplay.text}
                  </Badge>
                  <div className="text-xs text-gray-400">
                    Score: {article.sentiment.score.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {article.image && (
                  <div className="flex-shrink-0">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-white font-medium mb-2 hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer"
                    onClick={() => window.open(article.link, "_blank")}
                  >
                    {article.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.summary}</p>

                  <div className="flex items-center text-xs text-gray-500">
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
                      {article.interactions24h && (
                        <>
                          <span>•</span>
                          <span>{article.interactions24h.toLocaleString()} interactions</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Article Summary and View More */}
        {filteredNews.length > articlesPerPage && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-6 mt-6 bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">
              <span className="font-medium">Showing {startIndex + 1}-{Math.min(endIndex, filteredNews.length)} of {filteredNews.length} articles</span>
              {totalPages > 1 && (
                <span className="ml-2 text-gray-500">(Page {currentPage} of {totalPages})</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:border-orange-500 disabled:opacity-50"
              >
                ← Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  if (totalPages <= 5) {
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={currentPage === pageNum 
                          ? "bg-orange-600 hover:bg-orange-700 text-white" 
                          : "border-gray-700 text-gray-300 hover:border-orange-500"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  } else {
                    // Show first, last, and current page with ellipsis
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={currentPage === pageNum 
                            ? "bg-orange-600 hover:bg-orange-700 text-white" 
                            : "border-gray-700 text-gray-300 hover:border-orange-500"
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    } else if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="text-gray-500 px-2">...</span>
                    }
                    return null
                  }
                })}
              </div>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:border-orange-500 disabled:opacity-50"
              >
                Next →
              </Button>
            </div>
          </div>
        )}



        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              {(searchQuery && searchQuery.trim()) || (selectedCategory && selectedCategory !== "all")
                ? "No articles match your current filters." 
                : "No BONK news available at the moment."}
            </p>
            <Button onClick={() => fetchBONKNews()} className="bg-orange-600 hover:bg-orange-700 text-white mt-2">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
