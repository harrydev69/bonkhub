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
      <div className="group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <h1 className="text-3xl font-bold text-white mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
          BONK Alerts Dashboard
        </h1>
        <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
          Monitor BONK price movements, volume spikes, social activity, and news with customizable alerts
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Active Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-orange-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-orange-400">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              Currently monitoring
            </p>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Triggered Today
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 transition-all duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-2 group-hover/stats:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-red-400">
              {alerts.filter((a) => a.triggered).length}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              Alerts fired
            </p>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              High Priority
            </CardTitle>
            <Badge className="bg-red-600 text-white transition-all duration-500 group-hover/stats:scale-105 group-hover/stats:shadow-[0_0_4px_rgba(239,68,68,0.3)]">
              High
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-red-400">
              {alerts.filter((a) => a.priority === "high").length}
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              Critical alerts
            </p>
          </CardContent>
        </Card>

        <Card className="group/stats bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 transition-all duration-500 group-hover/stats:text-gray-300">
              Weekly
            </CardTitle>
            <Badge className="bg-blue-600 text-white transition-all duration-500 group-hover/stats:scale-105 group-hover/stats:shadow-[0_0_4px_rgba(59,130,246,0.3)]">
              Weekly
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white transition-all duration-500 group-hover/stats:text-blue-400">
              12
            </div>
            <p className="text-xs text-gray-500 transition-all duration-500 group-hover/stats:text-gray-400">
              This Week
            </p>
            <p className="text-xs text-blue-500 transition-all duration-500 group-hover/stats:text-blue-400">
              Total triggers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="group/main bg-gray-900 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 transition-all duration-500 group-hover/main:scale-110 group-hover/main:rotate-2 group-hover/main:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
                  <div>
                    <CardTitle className="text-white transition-all duration-500 group-hover/main:text-orange-400">
                      Alert Management
                    </CardTitle>
                    <p className="text-sm text-gray-400 transition-all duration-500 group-hover/main:text-gray-300">
                      Configure and manage your BONK price and activity alerts
                    </p>
                  </div>
                </div>
                <Button className="group/button bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
                  <Plus className="h-4 w-4 mr-2 transition-all duration-500 group-hover/button:scale-110 group-hover/button:rotate-2" />
                  New Alert
                </Button>
              </div>
            </CardHeader>

            {/* Content area */}
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="group/tabs grid w-full grid-cols-3 bg-gray-800 border-gray-700 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Active Alerts ({activeAlerts.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Create Alert
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white transition-all duration-500 hover:scale-105"
                  >
                    Alert History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4 mt-4">
                  {loading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="group/loading bg-gray-800 rounded-lg p-4 animate-pulse hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                          <div className="h-4 bg-gray-700 rounded mb-2 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                          <div className="h-3 bg-gray-700 rounded transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                        </div>
                      ))}
                    </>
                  ) : alerts.length === 0 ? (
                    <div className="group/empty text-center py-12 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                      <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4 transition-all duration-500 group-hover/empty:text-orange-400 group-hover/empty:scale-110" />
                      <h3 className="text-lg font-medium text-white mb-2 transition-all duration-500 group-hover/empty:text-orange-400">
                        No alerts created
                      </h3>
                      <p className="text-gray-400 mb-4 transition-all duration-500 group-hover/empty:text-gray-300">
                        Create your first alert to start monitoring BONK.
                      </p>
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const AlertIcon = getAlertIcon(alert.type)
                      return (
                        <Card
                          key={alert.id}
                          className="group/alert bg-gray-800 border-gray-700 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <AlertIcon className="h-5 w-5 text-[#ff6b35] transition-all duration-500 group-hover/alert:scale-110 group-hover/alert:rotate-2 group-hover/alert:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
                                <div>
                                  <h3 className="font-medium text-white transition-all duration-500 group-hover/alert:text-orange-400">
                                    {alert.name}
                                  </h3>
                                  <Badge variant="outline" className="text-xs mt-1 transition-all duration-500 group-hover/alert:scale-105 group-hover/alert:shadow-[0_0_4px_rgba(255,107,53,0.2)]">
                                    {alert.type}
                                  </Badge>
                                </div>
                              </div>
                              <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="text-sm">
                                <span className="text-gray-400 transition-all duration-500 group-hover/alert:text-gray-300">Condition:</span>
                                <span className="text-white ml-2 transition-all duration-500 group-hover/alert:text-orange-400">{alert.condition}</span>
                              </div>
                            </div>

                            {alert.triggered && (
                              <div className="group/triggered flex items-center gap-2 p-2 bg-red-900/20 rounded-lg mb-3 hover:bg-red-900/30 hover:shadow-[0_0_8px_rgba(239,68,68,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                                <AlertTriangle className="h-4 w-4 text-red-500 transition-all duration-500 group-hover/triggered:scale-110 group-hover/triggered:rotate-2" />
                                <div className="text-sm">
                                  <span className="text-red-400 font-medium transition-all duration-500 group-hover/triggered:text-red-300">Alert Triggered</span>
                                  {alert.lastTriggered && (
                                    <div className="text-xs text-gray-500 transition-all duration-500 group-hover/triggered:text-gray-400">{alert.lastTriggered}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)} transition-all duration-500 group-hover/alert:scale-150`}></div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="group/edit text-gray-400 hover:text-white hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                                  <Edit className="h-4 w-4 mr-1 transition-all duration-500 group-hover/edit:scale-110 group-hover/edit:rotate-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="group/delete text-red-400 hover:text-red-300 hover:scale-105 hover:shadow-[0_0_4px_rgba(239,68,68,0.2)] transition-all duration-500 transform-gpu"
                                  onClick={() => setDeleteConfirm(alert.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1 transition-all duration-500 group-hover/delete:scale-110 group-hover/delete:rotate-2" />
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
                      <label className="text-sm font-medium text-gray-300 transition-all duration-500 hover:text-gray-200">Alert Name</label>
                      <Input
                        placeholder="Enter alert name"
                        value={newAlert.name}
                        onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                        className="group/input border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 transition-all duration-500 hover:text-gray-200">Alert Type</label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value: Alert["type"]) => setNewAlert({ ...newAlert, type: value })}
                      >
                        <SelectTrigger className="group/select border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="price" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <TrendingUp className="h-4 w-4 mr-2 inline transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2" />
                            Price Alert
                          </SelectItem>
                          <SelectItem value="volume" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <Volume2 className="h-4 w-4 mr-2 inline transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2" />
                            Volume Alert
                          </SelectItem>
                          <SelectItem value="social" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <Users className="h-4 w-4 mr-2 inline transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2" />
                            Social Alert
                          </SelectItem>
                          <SelectItem value="news" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <Bell className="h-4 w-4 mr-2 inline transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-2" />
                            News Alert
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 transition-all duration-500 hover:text-gray-200">Priority</label>
                      <Select
                        value={newAlert.priority}
                        onValueChange={(value: Alert["priority"]) => setNewAlert({ ...newAlert, priority: value })}
                      >
                        <SelectTrigger className="group/select border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="low" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 inline-block transition-all duration-500 group-hover/item:scale-150"></div>
                            Low Priority
                          </SelectItem>
                          <SelectItem value="medium" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 inline-block transition-all duration-500 group-hover/item:scale-150"></div>
                            Medium Priority
                          </SelectItem>
                          <SelectItem value="high" className="group/item hover:bg-gray-700 transition-all duration-500">
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2 inline-block transition-all duration-500 group-hover/item:scale-150"></div>
                            High Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 transition-all duration-500 hover:text-gray-200">Condition</label>
                      <Input
                        placeholder="e.g., Price above $0.01"
                        value={newAlert.condition}
                        onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                        className="group/input border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 transition-all duration-500 hover:text-gray-200">Trigger Value</label>
                      <Input
                        placeholder="e.g., 0.01"
                        value={newAlert.value}
                        onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                        className="group/input border-orange-300 focus:border-orange-500 h-12 text-base bg-gray-800 border-gray-600 text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={createAlert}
                      disabled={creating}
                      className="group/create bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white h-12 text-base hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                    >
                      {creating ? "Creating..." : "Create Alert"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setNewAlert({ name: "", type: "price", condition: "", value: "", priority: "medium" })
                      }
                      className="group/reset h-12 text-base border-gray-600 text-gray-300 hover:bg-gray-800 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
                    >
                      Reset
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-4">
                  <div className="group/history text-center py-12 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4 transition-all duration-500 group-hover/history:text-orange-400 group-hover/history:scale-110" />
                    <h3 className="text-lg font-medium text-white mb-2 transition-all duration-500 group-hover/history:text-orange-400">
                      Alert History
                    </h3>
                    <p className="text-gray-400 mb-4 transition-all duration-500 group-hover/history:text-gray-300">
                      View your complete alert history and performance analytics.
                    </p>
                    <Button
                      variant="outline"
                      className="group/view-history border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
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
          <div className="group/dialog bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu">
            <h3 className="text-lg font-medium text-white mb-2 transition-all duration-500 group-hover/dialog:text-orange-400">
              Delete Alert
            </h3>
            <p className="text-gray-400 mb-4 transition-all duration-500 group-hover/dialog:text-gray-300">
              Are you sure you want to delete this alert? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="group/cancel border-gray-600 text-gray-300 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
              >
                Cancel
              </Button>
              <Button onClick={() => deleteAlert(deleteConfirm)} className="group/confirm bg-red-600 hover:bg-red-700 text-white hover:scale-105 hover:shadow-[0_0_8px_rgba(239,68,68,0.3)] transition-all duration-500 transform-gpu">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
