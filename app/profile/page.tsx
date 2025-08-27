"use client"

import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { 
  User, Mail, Calendar, TrendingUp, Activity, Settings, 
  DollarSign, Eye, Heart, MessageCircle, Share2, Trophy,
  AlertTriangle, Star, Users, BarChart3, Wallet, Target
} from "lucide-react"

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [joinDate] = useState(new Date().toLocaleDateString())

  useEffect(() => {
    const user = localStorage.getItem("bonkhub_user")
    if (user) {
      const userData = JSON.parse(user)
      setUserEmail(userData.email)
      // Extract name from email for demo purposes
      const emailName = userData.email.split("@")[0]
      setFirstName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
      setLastName("User")
    }
  }, [])

  const handleSaveProfile = () => {
    // In a real app, this would save to a backend
    alert("Profile updated successfully!")
  }

  // Mock data for trading & community features
  const portfolioData = {
    totalValue: "$2,847.63",
    bONKHoldings: "1,250,000 BONK",
    pnl: "+$847.63",
    pnlPercentage: "+42.4%",
    isPositive: true
  }

  const watchlistData = [
    { symbol: "BONK", price: "$0.00000228", change: "+5.2%", isPositive: true },
    { symbol: "SOL", price: "$98.45", change: "+2.1%", isPositive: true },
    { symbol: "DOGE", price: "$0.078", change: "-1.3%", isPositive: false }
  ]

  const communityStats = {
    postsShared: 24,
    memesCreated: 12,
    influenceScore: 87,
    followers: 156,
    following: 89,
    totalLikes: 1247
  }

  const recentActivity = [
    { action: "Viewed BONK analytics", time: "2 hours ago", icon: TrendingUp, category: "Analytics" },
    { action: "Updated dashboard settings", time: "1 day ago", icon: Settings, category: "Settings" },
    { action: "Logged in", time: "2 days ago", icon: User, category: "Account" },
    { action: "Checked ecosystem data", time: "3 days ago", icon: Activity, category: "Research" },
    { action: "Added SOL to watchlist", time: "4 days ago", icon: Star, category: "Trading" },
    { action: "Shared BONK meme", time: "5 days ago", icon: Heart, category: "Community" }
  ]

  return (
    <AuthGuard>
                           <div className="min-h-screen bg-black">
          <PornhubNavigation />
          <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
              <h1 className="text-2xl font-bold text-white transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
                Profile
              </h1>
              <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
                Manage your account, trading preferences, and community engagement
              </p>
            </div>

            <div className="grid gap-6">
              {/* Enhanced Profile Header */}
              <Card className="group/profile-header bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 transition-all duration-500 group-hover/profile-header:scale-110 group-hover/profile-header:shadow-[0_0_8px_rgba(255,107,53,0.3)]">
                      <AvatarFallback className="bg-orange-600 text-white text-2xl transition-all duration-500 group-hover/profile-header:bg-orange-500">
                        {firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white transition-all duration-500 group-hover/profile-header:text-orange-400">
                        {firstName} {lastName}
                      </h2>
                      <p className="text-gray-400 transition-all duration-500 group-hover/profile-header:text-gray-300">
                        {userEmail}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500 transition-all duration-500 group-hover/profile-header:text-gray-400">
                          Member since {joinDate}
                        </span>
                        <Badge variant="outline" className="transition-all duration-500 group-hover/profile-header:scale-105 group-hover/profile-header:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                          Premium
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveProfile}
                      className="group/save bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                    >
                      <Settings className="mr-2 h-4 w-4 transition-all duration-500 group-hover/save:scale-110 group-hover/save:rotate-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Main Profile Tabs */}
              <Tabs defaultValue="trading" className="space-y-4">
                <TabsList className="group/tabs grid w-full grid-cols-4 bg-gray-800 border-gray-700 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
                  <TabsTrigger
                    value="trading"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Trading & Analytics
                  </TabsTrigger>
                  <TabsTrigger
                    value="community"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Community
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Trading & Analytics Tab */}
                <TabsContent value="trading" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Portfolio Overview */}
                    <Card className="group/portfolio bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center transition-all duration-500 group-hover/portfolio:text-orange-400">
                          <Wallet className="mr-2 h-5 w-5 text-orange-500 transition-all duration-500 group-hover/portfolio:scale-110 group-hover/portfolio:rotate-2 group-hover/portfolio:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                          Portfolio Overview
                        </CardTitle>
                        <CardDescription className="text-gray-400 transition-all duration-500 group-hover/portfolio:text-gray-300">
                          Your BONK holdings and performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="group/stat flex justify-between items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <span className="text-gray-300 transition-all duration-500 group-hover/stat:text-gray-200">Total Value</span>
                            <span className="text-white font-semibold transition-all duration-500 group-hover/stat:text-orange-400">{portfolioData.totalValue}</span>
                          </div>
                          <div className="group/stat flex justify-between items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <span className="text-gray-300 transition-all duration-500 group-hover/stat:text-gray-200">BONK Holdings</span>
                            <span className="text-white font-semibold transition-all duration-500 group-hover/stat:text-orange-400">{portfolioData.bONKHoldings}</span>
                          </div>
                          <div className="group/stat flex justify-between items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <span className="text-gray-300 transition-all duration-500 group-hover/stat:text-gray-200">P&L</span>
                            <span className={`font-semibold transition-all duration-500 group-hover/stat:text-white ${portfolioData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {portfolioData.pnl} ({portfolioData.pnlPercentage})
                            </span>
                          </div>
                        </div>
                        <Button className="group/view w-full bg-orange-600 hover:bg-orange-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
                          View Full Portfolio
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Watchlist */}
                    <Card className="group/watchlist bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center transition-all duration-500 group-hover/watchlist:text-orange-400">
                          <Star className="mr-2 h-5 w-5 text-orange-500 transition-all duration-500 group-hover/watchlist:scale-110 group-hover/watchlist:rotate-2 group-hover/watchlist:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                          Watchlist
                        </CardTitle>
                        <CardDescription className="text-gray-400 transition-all duration-500 group-hover/watchlist:text-gray-300">
                          Your favorite tokens and alerts
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {watchlistData.map((token, index) => (
                          <div key={index} className="group/token flex justify-between items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <div>
                              <span className="text-white font-semibold transition-all duration-500 group-hover/token:text-orange-400">{token.symbol}</span>
                              <p className="text-sm text-gray-400 transition-all duration-500 group-hover/token:text-gray-300">{token.price}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-semibold transition-all duration-500 group-hover/token:text-white ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change}
                              </span>
                              <div className="flex space-x-2 mt-1">
                                <Button size="sm" variant="outline" className="group/alert h-6 px-2 text-xs hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                                  <AlertTriangle className="h-3 w-3 mr-1 transition-all duration-500 group-hover/alert:scale-110 group-hover/alert:rotate-2" />
                                  Alert
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button className="group/add w-full bg-gray-700 hover:bg-gray-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                          Add Token
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Market Alerts */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                        Market Alerts
                      </CardTitle>
                      <CardDescription className="text-gray-400">Custom price notifications and whale alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <Target className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-white font-medium">BONK Price Alert</p>
                              <p className="text-sm text-gray-400">Alert when BONK hits $0.000003</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <Target className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-white font-medium">Whale Alert</p>
                              <p className="text-sm text-gray-400">Notify on large BONK transfers</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Button className="w-full bg-orange-600 hover:bg-orange-700">
                            Create New Alert
                          </Button>
                          <Button className="w-full bg-gray-700 hover:bg-gray-600">
                            Manage Alerts
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Community Stats */}
                    <Card className="group/community-stats bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center transition-all duration-500 group-hover/community-stats:text-orange-400">
                          <Users className="mr-2 h-5 w-5 text-orange-500 transition-all duration-500 group-hover/community-stats:scale-110 group-hover/community-stats:rotate-2 group-hover/community-stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                          Community Stats
                        </CardTitle>
                        <CardDescription className="text-gray-400 transition-all duration-500 group-hover/community-stats:text-gray-300">
                          Your engagement and influence
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="group/stat text-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stat:text-orange-400">{communityStats.postsShared}</div>
                            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/stat:text-gray-300">Posts Shared</div>
                          </div>
                          <div className="group/stat text-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stat:text-orange-400">{communityStats.memesCreated}</div>
                            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/stat:text-gray-300">Memes Created</div>
                          </div>
                          <div className="group/stat text-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stat:text-orange-400">{communityStats.followers}</div>
                            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/stat:text-gray-300">Followers</div>
                          </div>
                          <div className="group/stat text-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-105 transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stat:text-orange-400">{communityStats.totalLikes}</div>
                            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/stat:text-gray-300">Total Likes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Community Badges */}
                    <Card className="group/community-badges bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center transition-all duration-500 group-hover/community-badges:text-orange-400">
                          <Trophy className="mr-2 h-5 w-5 text-orange-500 transition-all duration-500 group-hover/community-badges:scale-110 group-hover/community-badges:rotate-2 group-hover/community-badges:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                          Community Badges
                        </CardTitle>
                        <CardDescription className="text-gray-400 transition-all duration-500 group-hover/community-badges:text-gray-300">
                          Your achievements and recognition
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="group/badge flex items-center space-x-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center transition-all duration-500 group-hover/badge:scale-110 group-hover/badge:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                              <Trophy className="h-5 w-5 text-white transition-all duration-500 group-hover/badge:scale-110 group-hover/badge:rotate-2" />
                            </div>
                            <div>
                              <p className="text-white font-medium transition-all duration-500 group-hover/badge:text-orange-400">BONK Supporter</p>
                              <p className="text-sm text-gray-400 transition-all duration-500 group-hover/badge:text-gray-300">Early adopter of BONK</p>
                            </div>
                          </div>
                          <div className="group/badge flex items-center space-x-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center transition-all duration-500 group-hover/badge:scale-110 group-hover/badge:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                              <Heart className="h-5 w-5 text-white transition-all duration-500 group-hover/badge:scale-110 group-hover/badge:rotate-2" />
                            </div>
                            <div>
                              <p className="text-white font-medium transition-all duration-500 group-hover/badge:text-orange-400">Meme Creator</p>
                              <p className="text-sm text-gray-400 transition-all duration-500 group-hover/badge:text-gray-300">Created popular BONK memes</p>
                            </div>
                          </div>
                          <div className="group/badge flex items-center space-x-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center transition-all duration-500 group-hover/badge:scale-110 group-hover/badge:shadow-[0_0_4px_rgba(255,107,53,0.3)]">
                              <Users className="h-5 w-5 text-white transition-all duration-500 group-hover/badge:scale-110 group-hover/badge:rotate-2" />
                            </div>
                            <div>
                              <p className="text-white font-medium transition-all duration-500 group-hover/badge:text-orange-400">Community Leader</p>
                              <p className="text-sm text-gray-400 transition-all duration-500 group-hover/badge:text-gray-300">High influence score</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Content Contributions */}
                  <Card className="group/content-contributions bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center transition-all duration-500 group-hover/content-contributions:text-orange-400">
                        <MessageCircle className="mr-2 h-5 w-5 text-orange-500 transition-all duration-500 group-hover/content-contributions:scale-110 group-hover/content-contributions:rotate-2 group-hover/content-contributions:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                        Content Contributions
                      </CardTitle>
                      <CardDescription className="text-gray-400 transition-all duration-500 group-hover/content-contributions:text-gray-300">
                        Your memes, posts, and community engagement
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { type: "Meme", title: "BONK to the moon!", engagement: "1.2K likes", time: "2 days ago" },
                          { type: "Post", title: "Great analysis on BONK ecosystem", engagement: "89 comments", time: "1 week ago" },
                          { type: "Comment", title: "Shared on BONK sentiment", engagement: "45 likes", time: "2 weeks ago" }
                        ].map((item, index) => (
                          <div key={index} className="group/contribution flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-orange-600 transition-all duration-500 group-hover/contribution:scale-105 group-hover/contribution:shadow-[0_0_4px_rgba(255,107,53,0.2)]">{item.type}</Badge>
                              <div>
                                <p className="text-white font-medium transition-all duration-500 group-hover/contribution:text-orange-400">{item.title}</p>
                                <p className="text-sm text-gray-400 transition-all duration-500 group-hover/contribution:text-gray-300">{item.engagement}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 transition-all duration-500 group-hover/contribution:text-gray-400">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <Card className="group/personal bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white transition-all duration-500 group-hover/personal:text-orange-400">Personal Information</CardTitle>
                      <CardDescription className="text-gray-400 transition-all duration-500 group-hover/personal:text-gray-300">Update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white transition-all duration-500 group-hover/personal:text-gray-200">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-white transition-all duration-500 group-hover/personal:text-gray-200">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white transition-all duration-500 group-hover/personal:text-gray-200">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveProfile} 
                        className="group/save-changes bg-orange-600 hover:bg-orange-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                      >
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <Card className="group/activity bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white transition-all duration-500 group-hover/activity:text-orange-400">Recent Activity</CardTitle>
                      <CardDescription className="text-gray-400 transition-all duration-500 group-hover/activity:text-gray-300">Your recent actions on Bonkhub</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.map((item, index) => (
                          <div key={index} className="group/activity-item flex items-center space-x-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                            <item.icon className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover/activity-item:scale-110 group-hover/activity-item:rotate-2 group-hover/activity-item:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                            <div className="flex-1">
                              <p className="font-medium text-white transition-all duration-500 group-hover/activity-item:text-orange-400">{item.action}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-400 transition-all duration-500 group-hover/activity-item:text-gray-300">{item.time}</p>
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300 transition-all duration-500 group-hover/activity-item:scale-105 group-hover/activity-item:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                                  {item.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                  <Card className="group/preferences bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white transition-all duration-500 group-hover/preferences:text-orange-400">Display Preferences</CardTitle>
                      <CardDescription className="text-gray-400 transition-all duration-500 group-hover/preferences:text-gray-300">Customize your dashboard experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white transition-all duration-500 group-hover/preferences:text-gray-200">Default Currency</Label>
                        <select className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                          <option>USD</option>
                          <option>EUR</option>
                          <option>BTC</option>
                          <option>SOL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white transition-all duration-500 group-hover/preferences:text-gray-200">Time Zone</Label>
                        <select className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                          <option>UTC</option>
                          <option>EST</option>
                          <option>PST</option>
                          <option>GMT</option>
                        </select>
                      </div>
                      <Button className="group/save-preferences bg-orange-600 hover:bg-orange-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
                        Save Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                  <Card className="group/security bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white transition-all duration-500 group-hover/security:text-orange-400">Security Settings</CardTitle>
                      <CardDescription className="text-gray-400 transition-all duration-500 group-hover/security:text-gray-300">Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-white transition-all duration-500 group-hover/security:text-gray-200">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white transition-all duration-500 group-hover/security:text-gray-200">
                          New Password
                        </Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          className="bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white transition-all duration-500 group-hover/security:text-gray-200">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="bg-gray-800 border-gray-700 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                        />
                      </div>
                      <Button className="group/update-password bg-orange-600 hover:bg-orange-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
                        Update Password
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
