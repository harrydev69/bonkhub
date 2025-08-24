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
import { User, Mail, Calendar, TrendingUp, Activity, Settings } from "lucide-react"

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>

            <div className="grid gap-6">
              {/* Profile Header */}
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Tabs */}
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
                  <TabsTrigger
                    value="personal"
                    className="text-gray-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    Personal Info
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

                <TabsContent value="activity" className="space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                      <CardDescription className="text-gray-400">Your recent actions on Bonkhub</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { action: "Viewed BONK analytics", time: "2 hours ago", icon: TrendingUp },
                          { action: "Updated dashboard settings", time: "1 day ago", icon: Settings },
                          { action: "Logged in", time: "2 days ago", icon: User },
                          { action: "Checked ecosystem data", time: "3 days ago", icon: Activity },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                            <item.icon className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                              <p className="font-medium text-white">{item.action}</p>
                              <p className="text-sm text-gray-400">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

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
