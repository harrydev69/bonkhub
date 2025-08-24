"use client"

import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Manage your preferences and account settings</p>
            </div>

            <div className="grid gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">API Configuration</CardTitle>
                  <CardDescription className="text-gray-400">Configure external data sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">CoinMarketCap API Key</Label>
                    <Input
                      placeholder="Enter your API key"
                      type="password"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">CoinGecko API Key</Label>
                    <Input
                      placeholder="Enter your API key"
                      type="password"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700">Save API Keys</Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Notifications</CardTitle>
                  <CardDescription className="text-gray-400">Manage alert preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Price alerts</Label>
                      <p className="text-sm text-gray-400">Get notified when token prices change significantly</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
