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
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Manage your account, trading preferences, and community engagement</p>
            </div>

            <div className="grid gap-6">
              {/* Enhanced Profile Header */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-orange-600 text-white text-2xl">
                        {firstName.charAt(0)}
                        {lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">
                        {firstName} {lastName}
                      </h2>
                      <p className="text-gray-400 flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {userEmail}
                      </p>
                      <p className="text-gray-400 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Member since {joinDate}
                      </p>
                      <div className="flex space-x-2">
                        <Badge className="bg-orange-600">Pro User</Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          Verified
                        </Badge>
                        <Badge variant="outline" className="border-green-600 text-green-400">
                          BONK Supporter
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading & Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wallet className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-400">Portfolio Value</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{portfolioData.totalValue}</div>
                    <div className={`text-sm ${portfolioData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolioData.pnl} ({portfolioData.pnlPercentage})
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-400">BONK Holdings</span>
                    </div>
                    <div className="text-lg font-bold text-white">{portfolioData.bONKHoldings}</div>
                    <div className="text-sm text-gray-400">Current position</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-400">Influence Score</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{communityStats.influenceScore}/100</div>
                    <div className="text-sm text-gray-400">Community leader</div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Profile Tabs */}
              <Tabs defaultValue="trading" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-gray-700">
                  <TabsTrigger
                    value="trading"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Trading
                  </TabsTrigger>
                  <TabsTrigger
                    value="community"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Community
                  </TabsTrigger>
                  <TabsTrigger
                    value="personal"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Personal
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Trading & Analytics Tab */}
                <TabsContent value="trading" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Portfolio Overview */}
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Wallet className="mr-2 h-5 w-5 text-orange-500" />
                          Portfolio Overview
                        </CardTitle>
                        <CardDescription className="text-gray-400">Your BONK holdings and performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                            <span className="text-gray-300">Total Value</span>
                            <span className="text-white font-semibold">{portfolioData.totalValue}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                            <span className="text-gray-300">BONK Holdings</span>
                            <span className="text-white font-semibold">{portfolioData.bONKHoldings}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                            <span className="text-gray-300">P&L</span>
                            <span className={`font-semibold ${portfolioData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {portfolioData.pnl} ({portfolioData.pnlPercentage})
                            </span>
                          </div>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          View Full Portfolio
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Watchlist */}
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Star className="mr-2 h-5 w-5 text-orange-500" />
                          Watchlist
                        </CardTitle>
                        <CardDescription className="text-gray-400">Your favorite tokens and alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {watchlistData.map((token, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                            <div>
                              <span className="text-white font-semibold">{token.symbol}</span>
                              <p className="text-sm text-gray-400">{token.price}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-semibold ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change}
                              </span>
                              <div className="flex space-x-2 mt-1">
                                <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Alert
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button className="w-full bg-gray-700 hover:bg-gray-600">
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
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Users className="mr-2 h-5 w-5 text-orange-500" />
                          Community Stats
                        </CardTitle>
                        <CardDescription className="text-gray-400">Your engagement and influence</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-gray-800">
                            <div className="text-2xl font-bold text-white">{communityStats.postsShared}</div>
                            <div className="text-sm text-gray-400">Posts Shared</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gray-800">
                            <div className="text-2xl font-bold text-white">{communityStats.memesCreated}</div>
                            <div className="text-sm text-gray-400">Memes Created</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gray-800">
                            <div className="text-2xl font-bold text-white">{communityStats.followers}</div>
                            <div className="text-sm text-gray-400">Followers</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gray-800">
                            <div className="text-2xl font-bold text-white">{communityStats.totalLikes}</div>
                            <div className="text-sm text-gray-400">Total Likes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Community Badges */}
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Trophy className="mr-2 h-5 w-5 text-orange-500" />
                          Community Badges
                        </CardTitle>
                        <CardDescription className="text-gray-400">Your achievements and recognition</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">BONK Supporter</p>
                              <p className="text-sm text-gray-400">Early adopter of BONK</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                              <Heart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Meme Creator</p>
                              <p className="text-sm text-gray-400">Created popular BONK memes</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Community Leader</p>
                              <p className="text-sm text-gray-400">High influence score</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Content Contributions */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <MessageCircle className="mr-2 h-5 w-5 text-orange-500" />
                        Content Contributions
                      </CardTitle>
                      <CardDescription className="text-gray-400">Your memes, posts, and community engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { type: "Meme", title: "BONK to the moon!", engagement: "1.2K likes", time: "2 days ago" },
                          { type: "Post", title: "Great analysis on BONK ecosystem", engagement: "89 comments", time: "1 week ago" },
                          { type: "Comment", title: "Shared on BONK sentiment", engagement: "45 likes", time: "2 weeks ago" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-orange-600">{item.type}</Badge>
                              <div>
                                <p className="text-white font-medium">{item.title}</p>
                                <p className="text-sm text-gray-400">{item.engagement}</p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-400">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Personal Information</CardTitle>
                      <CardDescription className="text-gray-400">Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-white">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <Button onClick={handleSaveProfile} className="bg-orange-600 hover:bg-orange-700">
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                      <CardDescription className="text-gray-400">Your recent actions on Bonkhub</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <item.icon className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                              <p className="font-medium text-white">{item.action}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-400">{item.time}</p>
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
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
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Display Preferences</CardTitle>
                      <CardDescription className="text-gray-400">Customize your dashboard experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Default Currency</Label>
                        <select className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white">
                          <option>USD</option>
                          <option>EUR</option>
                          <option>BTC</option>
                          <option>SOL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Time Zone</Label>
                        <select className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white">
                          <option>UTC</option>
                          <option>EST</option>
                          <option>PST</option>
                          <option>GMT</option>
                        </select>
                      </div>
                      <Button className="bg-orange-600 hover:bg-orange-700">Save Preferences</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Security Settings</CardTitle>
                      <CardDescription className="text-gray-400">Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-white">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white">
                          New Password
                        </Label>
                        <Input id="newPassword" type="password" className="bg-gray-800 border-gray-700 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <Button className="bg-orange-600 hover:bg-orange-700">Update Password</Button>
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
