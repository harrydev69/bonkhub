"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BONKNewsFeed } from "@/components/bonk-news-feed"
import { Newspaper, TrendingUp, Clock, Search, Filter } from "lucide-react"

interface Category {
  id: string;
  label: string;
  count: number;
}

export function NewsDashboard() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<any[]>([]) // Store articles data
  const [newsStats, setNewsStats] = useState({
    totalArticles: 0,
    todayArticles: 0,
    positiveNews: 0,
  })
  const [loading, setLoading] = useState(true)

  // Pass filter state to BONKNewsFeed
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  // Fetch real news statistics
  useEffect(() => {
    const fetchNewsStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bonk/news?limit=100')
        if (!response.ok) throw new Error('Failed to fetch news')
        
        const data = await response.json()
        
        // Store articles data for consistency
        setArticles(data.articles || [])
        
        // Update statistics
        setNewsStats({
          totalArticles: data.metadata.totalArticles || 0,
          todayArticles: data.metadata.todayArticles || 0,
          positiveNews: data.metadata.positiveNews || 0,
        })

        // Generate dynamic categories based on SubCategory values
        const categoryMap = new Map<string, number>()
        
        data.articles.forEach((article: any) => {
          if (article.subCategory && article.subCategory.trim()) {
            // Article has a subcategory - count it
            const subCategory = article.subCategory
            categoryMap.set(subCategory, (categoryMap.get(subCategory) || 0) + 1)
          } else {
            // Article has no subcategory - count as "General"
            categoryMap.set("General", (categoryMap.get("General") || 0) + 1)
          }
        })
        
        console.log('🏷️ SubCategory-based category generation:')
        console.log('   Raw subcategory map:', Object.fromEntries(categoryMap))
        console.log('   Total articles:', data.articles.length)
        console.log('   Subcategory sum:', Array.from(categoryMap.values()).reduce((a, b) => a + b, 0))
        
        // Convert to array and sort by count (highest first)
        const dynamicCategories = Array.from(categoryMap.entries())
          .sort(([,a], [,b]) => b - a)
          .map(([subCategory, count]) => ({
            id: subCategory.toLowerCase().replace(/\s+/g, '-'),
            label: subCategory,
            count
          }))
        
        // Add "All News" at the beginning
        const allCategories = [
          { id: "all", label: "All News", count: data.metadata.totalArticles || 0 },
          ...dynamicCategories
        ]
        
        console.log('📋 Final categories (SubCategory-based):', allCategories)
        setCategories(allCategories)

      } catch (error) {
        console.error('Error fetching news stats:', error)
        // Fallback to default values
        setNewsStats({
          totalArticles: 0,
          todayArticles: 0,
          positiveNews: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNewsStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* News Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Articles</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : newsStats.totalArticles}
                </p>
              </div>
              <Newspaper className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Articles</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : newsStats.todayArticles}
                </p>
                <p className="text-blue-400 text-xs">Update every 30 minutes</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Positive News</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : newsStats.positiveNews}
                </p>
                <p className="text-green-400 text-xs">
                  {loading ? '...' : `${Math.round((newsStats.positiveNews / Math.max(newsStats.totalArticles, 1)) * 100)}% positive sentiment`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info - Remove after fixing */}
      {/* <Card className="bg-blue-900/20 border-blue-700 mb-4">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm">Debug: Category Counts vs Total Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-300 space-y-1">
            <div><strong>Total Articles:</strong> {newsStats.totalArticles}</div>
            <div><strong>Category Sum:</strong> {categories.slice(1).reduce((sum, cat) => sum + cat.count, 0)}</div>
            <div><strong>Difference:</strong> {categories.slice(1).reduce((sum, cat) => sum + cat.count, 0) - newsStats.totalArticles}</div>
            <div><strong>Reason:</strong> Articles can have multiple categories/subcategories</div>
          </div>
        </CardContent>
      </Card> */}

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Filter className="h-5 w-5 text-orange-500" />
            <span>News Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-400"
                }
              >
                {category.label}
                <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main News Feed */}
      <BONKNewsFeed 
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        articles={articles} // Pass articles to the news feed
      />
    </div>
  )
}
