"use client"

import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { 
  Upload, Heart, MessageCircle, Share2, Search, Filter, 
  TrendingUp, Star, Users, Camera, Image, FileText,
  Plus, MoreHorizontal, Eye, Download
} from "lucide-react"

export default function MemeGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Mock data for memes
  const memeCategories = [
    { id: "all", name: "All Memes", count: 156, icon: TrendingUp },
    { id: "bull-run", name: "Bull Run", count: 42, icon: TrendingUp },
    { id: "bear-market", name: "Bear Market", count: 18, icon: TrendingUp },
    { id: "community", name: "Community", count: 67, icon: Users },
    { id: "news", name: "News & Events", count: 29, icon: FileText }
  ]

  const popularTags = [
    "#BONK", "#moon", "#diamondhands", "#hodl", "#to-the-moon",
    "#crypto", "#memecoin", "#solana", "#bullrun", "#community"
  ]

  const memes = [
    {
      id: 1,
      title: "BONK to the moon! 🚀",
      creator: "BONKWarrior",
      image: "/bonk-meme-1.jpg",
      category: "bull-run",
      tags: ["#BONK", "#moon", "#bullrun"],
      likes: 1247,
      comments: 89,
      shares: 156,
      views: 15420,
      isLiked: false,
      isFavorited: false,
      uploadTime: "2 hours ago"
    },
    {
      id: 2,
      title: "When BONK hits $1 🎯",
      creator: "MemeLord",
      image: "/bonk-meme-2.jpg",
      category: "community",
      tags: ["#BONK", "#diamondhands", "#hodl"],
      likes: 892,
      comments: 67,
      shares: 134,
      views: 12340,
      isLiked: true,
      isFavorited: false,
      uploadTime: "5 hours ago"
    },
    {
      id: 3,
      title: "BONK community be like 💎",
      creator: "CryptoArtist",
      image: "/bonk-meme-3.jpg",
      category: "community",
      tags: ["#BONK", "#community", "#diamondhands"],
      likes: 2156,
      comments: 234,
      shares: 445,
      views: 28940,
      isLiked: false,
      isFavorited: true,
      uploadTime: "1 day ago"
    },
    {
      id: 4,
      title: "BONK vs other memecoins 🥊",
      creator: "MemeMaster",
      image: "/bonk-meme-4.jpg",
      category: "bull-run",
      tags: ["#BONK", "#memecoin", "#competition"],
      likes: 1678,
      comments: 145,
      shares: 289,
      views: 22340,
      isLiked: true,
      isFavorited: true,
      uploadTime: "2 days ago"
    },
    {
      id: 5,
      title: "BONK ecosystem growing 🌱",
      creator: "EcoAnalyst",
      image: "/bonk-meme-5.jpg",
      category: "news",
      tags: ["#BONK", "#ecosystem", "#growth"],
      likes: 756,
      comments: 56,
      shares: 98,
      views: 9870,
      isLiked: false,
      isFavorited: false,
      uploadTime: "3 days ago"
    },
    {
      id: 6,
      title: "BONK holders unite! 🤝",
      creator: "CommunityLeader",
      image: "/bonk-meme-6.jpg",
      category: "community",
      tags: ["#BONK", "#community", "#unity"],
      likes: 1890,
      comments: 178,
      shares: 312,
      views: 25670,
      isLiked: true,
      isFavorited: false,
      uploadTime: "4 days ago"
    }
  ]

  const handleLike = (memeId: number) => {
    // In real app, this would update backend
    console.log(`Liked meme ${memeId}`)
  }

  const handleFavorite = (memeId: number) => {
    // In real app, this would update backend
    console.log(`Favorited meme ${memeId}`)
  }

  const handleShare = (memeId: number) => {
    // In real app, this would open share dialog
    console.log(`Sharing meme ${memeId}`)
  }

  const filteredMemes = memes.filter(meme => {
    const matchesCategory = selectedCategory === "all" || meme.category === selectedCategory
    const matchesSearch = meme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">BONK Meme Gallery</h1>
                <p className="text-gray-400 mt-2">The ultimate collection of BONK memes, created by the community</p>
              </div>
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-black font-semibold mt-4 sm:mt-0"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Meme
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search memes, tags, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                >
                  {memeCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm transition-all hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="gallery" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
                <TabsTrigger
                  value="gallery"
                  className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  Gallery
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="creators"
                  className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  Top Creators
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  Collections
                </TabsTrigger>
              </TabsList>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-6">
                {/* Meme Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMemes.map(meme => (
                    <Card key={meme.id} className="bg-gray-900 border-gray-800 overflow-hidden group hover:border-[#ff6b35]/50 hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] transition-all duration-300">
                      {/* Meme Image */}
                      <div className="relative">
                        <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Image className="w-16 h-16 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Meme Image</p>
                            <p className="text-xs text-gray-500">Click to view</p>
                          </div>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-orange-600 text-white text-xs">
                            {memeCategories.find(c => c.id === meme.category)?.name}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-gray-900 border-gray-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Meme Info */}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Title and Creator */}
                          <div>
                            <h3 className="text-white font-medium line-clamp-2 mb-1">{meme.title}</h3>
                            <p className="text-gray-400 text-sm">by {meme.creator}</p>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {meme.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                {tag}
                              </Badge>
                            ))}
                            {meme.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                +{meme.tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {meme.views.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {meme.likes.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs">{meme.uploadTime}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLike(meme.id)}
                              className={`flex-1 h-8 ${
                                meme.isLiked 
                                  ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' 
                                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${meme.isLiked ? 'fill-current' : ''}`} />
                              {meme.likes.toLocaleString()}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFavorite(meme.id)}
                              className={`h-8 w-8 p-0 ${
                                meme.isFavorited 
                                  ? 'bg-yellow-600 border-yellow-600 text-white hover:bg-yellow-700' 
                                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${meme.isFavorited ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShare(meme.id)}
                              className="h-8 w-8 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                            >
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center">
                  <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                    Load More Memes
                  </Button>
                </div>
              </TabsContent>

              {/* Trending Tab */}
              <TabsContent value="trending" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-orange-500" />
                      Trending This Week
                    </CardTitle>
                    <CardDescription className="text-gray-400">Most popular BONK memes based on engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {memes.slice(0, 6).map((meme, index) => (
                        <div key={meme.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                          <div className="text-2xl font-bold text-orange-500">#{index + 1}</div>
                          <div className="flex-1">
                            <p className="text-white font-medium line-clamp-1">{meme.title}</p>
                            <p className="text-sm text-gray-400">by {meme.creator}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white font-semibold">{meme.likes.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">likes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Top Creators Tab */}
              <TabsContent value="creators" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="mr-2 h-5 w-5 text-orange-500" />
                      Top Meme Creators
                    </CardTitle>
                    <CardDescription className="text-gray-400">Community leaders with the most popular memes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "BONKWarrior", memes: 24, totalLikes: 15420, followers: 1234, rank: 1 },
                        { name: "MemeLord", memes: 18, totalLikes: 12890, followers: 987, rank: 2 },
                        { name: "CryptoArtist", memes: 15, totalLikes: 11230, followers: 856, rank: 3 },
                        { name: "MemeMaster", memes: 12, totalLikes: 9870, followers: 654, rank: 4 },
                        { name: "CommunityLeader", memes: 9, totalLikes: 8230, followers: 543, rank: 5 }
                      ].map((creator, index) => (
                        <div key={creator.name} className="flex items-center justify-between p-4 rounded-lg bg-gray-800">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-orange-500">#{creator.rank}</div>
                            <div>
                              <p className="text-white font-semibold">{creator.name}</p>
                              <p className="text-sm text-gray-400">{creator.memes} memes • {creator.followers} followers</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg text-white font-bold">{creator.totalLikes.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">total likes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Collections Tab */}
              <TabsContent value="collections" className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="mr-2 h-5 w-5 text-orange-500" />
                      Featured Collections
                    </CardTitle>
                    <CardDescription className="text-gray-400">Curated meme collections by the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "BONK Bull Run", description: "Memes celebrating BONK's rise", count: 15, curator: "BONKWarrior" },
                        { name: "Diamond Hands", description: "HODL memes for the community", count: 12, curator: "MemeLord" },
                        { name: "Community Vibes", description: "Best community interaction memes", count: 18, curator: "CommunityLeader" },
                        { name: "BONK vs World", description: "BONK taking on other memecoins", count: 9, curator: "MemeMaster" }
                      ].map((collection, index) => (
                        <div key={collection.name} className="p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-semibold">{collection.name}</h3>
                            <Badge className="bg-orange-600">{collection.count} memes</Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{collection.description}</p>
                          <p className="text-xs text-gray-500">Curated by {collection.curator}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
