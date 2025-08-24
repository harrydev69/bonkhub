"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Bell, Plus, TrendingUp, Volume2, Users, Clock, AlertTriangle, Edit, Trash2 } from "lucide-react"

interface Alert {
  id: string
  name: string
  type: "price" | "volume" | "social" | "news"
  condition: string
  value: string
  isActive: boolean
  triggered: boolean
  lastTriggered?: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

export function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [newAlert, setNewAlert] = useState<{
    name: string
    type: Alert["type"]
    condition: string
    value: string
    priority: Alert["priority"]
  }>({
    name: "",
    type: "price",
    condition: "",
    value: "",
    priority: "medium",
  })

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      // Simulate loading stored alerts
      const storedAlerts: Alert[] = []
      setAlerts(storedAlerts)
    } catch (error) {
      console.error("Failed to load alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAlert = async (id: string) => {
    try {
      const alert = alerts.find((a) => a.id === id)
      if (!alert) return

      const updatedAlert = { ...alert, isActive: !alert.isActive }
      setAlerts((prev) => prev.map((a) => (a.id === id ? updatedAlert : a)))
    } catch (error) {
      console.error("Failed to toggle alert:", error)
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      setAlerts((prev) => prev.filter((a) => a.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error("Failed to delete alert:", error)
    }
  }

  const createAlert = async () => {
    if (!newAlert.name || !newAlert.condition || !newAlert.value) {
      return
    }

    setCreating(true)
    try {
      const alert: Alert = {
        id: Date.now().toString(),
        ...newAlert,
        isActive: true,
        triggered: false,
        createdAt: new Date().toISOString(),
      }
      setAlerts((prev) => [alert, ...prev])
      setNewAlert({ name: "", type: "price", condition: "", value: "", priority: "medium" })
    } catch (error) {
      console.error("Failed to create alert:", error)
    } finally {
      setCreating(false)
    }
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "price":
        return TrendingUp
      case "volume":
        return Volume2
      case "social":
        return Users
      case "news":
        return Bell
      default:
        return Bell
    }
  }

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.isActive)
  const triggeredAlerts = alerts.filter((alert) => alert.triggered)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Alerts</h1>
            <p className="text-gray-400">Custom BONK alerts for price, volume, and social activity</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Total</CardTitle>
              <Badge className="bg-[#ff6b35] text-white">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{alerts.length}</div>
            <p className="text-xs text-gray-500">Total Alerts</p>
            <p className="text-xs text-[#ff6b35]">All configured</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{activeAlerts.length}</div>
            <p className="text-xs text-gray-500">Active Alerts</p>
            <p className="text-xs text-green-500">Monitoring</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Triggered</CardTitle>
              <Badge className="bg-red-600 text-white">Triggered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{triggeredAlerts.length}</div>
            <p className="text-xs text-gray-500">Triggered Today</p>
            <p className="text-xs text-red-500">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Weekly</CardTitle>
              <Badge className="bg-blue-600 text-white">Weekly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <p className="text-xs text-gray-500">This Week</p>
            <p className="text-xs text-blue-500">Total triggers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <CardTitle className="text-white">Alert Management</CardTitle>
                    <p className="text-sm text-gray-400">Configure and manage your BONK price and activity alerts</p>
                  </div>
                </div>
                <Button className="bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </div>
            </CardHeader>

            {/* Content area */}
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
                  >
                    Active Alerts ({activeAlerts.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
                  >
                    Create Alert
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
                  >
                    Alert History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4 mt-4">
                  {loading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No alerts created</h3>
                      <p className="text-gray-400 mb-4">Create your first alert to start monitoring BONK.</p>
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const AlertIcon = getAlertIcon(alert.type)
                      return (
                        <Card
                          key={alert.id}
                          className="bg-gray-800 border-gray-700 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <AlertIcon className="h-5 w-5 text-[#ff6b35]" />
                                <div>
                                  <h3 className="font-medium text-white">{alert.name}</h3>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {alert.type}
                                  </Badge>
                                </div>
                              </div>
                              <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="text-sm">
                                <span className="text-gray-400">Condition:</span>
                                <span className="text-white ml-2">{alert.condition}</span>
                              </div>
                            </div>

                            {alert.triggered && (
                              <div className="flex items-center gap-2 p-2 bg-red-900/20 rounded-lg mb-3">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <div className="text-sm">
                                  <span className="text-red-400 font-medium">Alert Triggered</span>
                                  {alert.lastTriggered && (
                                    <div className="text-xs text-gray-500">{alert.lastTriggered}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)}`}></div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => setDeleteConfirm(alert.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>

                <TabsContent value="create" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Alert Name</label>
                      <Input
                        placeholder="Enter alert name"
                        value={newAlert.name}
                        onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                        className="border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Alert Type</label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value: Alert["type"]) => setNewAlert({ ...newAlert, type: value })}
                      >
                        <SelectTrigger className="border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="price">
                            <TrendingUp className="h-4 w-4 mr-2 inline" />
                            Price Alert
                          </SelectItem>
                          <SelectItem value="volume">
                            <Volume2 className="h-4 w-4 mr-2 inline" />
                            Volume Alert
                          </SelectItem>
                          <SelectItem value="social">
                            <Users className="h-4 w-4 mr-2 inline" />
                            Social Alert
                          </SelectItem>
                          <SelectItem value="news">
                            <Bell className="h-4 w-4 mr-2 inline" />
                            News Alert
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Priority</label>
                      <Select
                        value={newAlert.priority}
                        onValueChange={(value: Alert["priority"]) => setNewAlert({ ...newAlert, priority: value })}
                      >
                        <SelectTrigger className="border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="low">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 inline-block"></div>
                            Low Priority
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 inline-block"></div>
                            Medium Priority
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2 inline-block"></div>
                            High Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Condition</label>
                      <Input
                        placeholder="e.g., Price above $0.01"
                        value={newAlert.condition}
                        onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                        className="border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Trigger Value</label>
                      <Input
                        placeholder="e.g., 0.01"
                        value={newAlert.value}
                        onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                        className="border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={createAlert}
                      disabled={creating}
                      className="bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white h-12 text-base"
                    >
                      {creating ? "Creating..." : "Create Alert"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setNewAlert({ name: "", type: "price", condition: "", value: "", priority: "medium" })
                      }
                      className="h-12 text-base border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Reset
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-4">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Alert History</h3>
                    <p className="text-gray-400 mb-4">View your complete alert history and performance analytics.</p>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      View Full History
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-2">Delete Alert</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete this alert? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={() => deleteAlert(deleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
