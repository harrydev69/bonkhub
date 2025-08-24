"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Coins, PieChart, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type SupplyData = {
  circulating: number
  total: number | null
  max: number | null
  lastUpdated: string
}

export function SupplyChart() {
  const [supplyData, setSupplyData] = useState<SupplyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSupplyData()
  }, [])

  const fetchSupplyData = async () => {
    try {
      setLoading(true)
      setError(null)

      const mockData = {
        supply: {
          circulating: 77419592329436.58,
          total: 87995351634222.84,
          max: 87995351634222.84,
        },
      }

      setSupplyData({
        circulating: mockData.supply.circulating,
        total: mockData.supply.total,
        max: mockData.supply.max,
        lastUpdated: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch supply data")
    } finally {
      setLoading(false)
    }
  }

  const formatSupply = (amount: number) => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(2)}T`
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`
    return amount.toFixed(0)
  }

  const calculatePercentage = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0
  }

  const getSupplyStatus = () => {
    if (!supplyData) return { status: "unknown", color: "gray", label: "Unknown" }

    const { circulating, max } = supplyData
    if (!max) return { status: "unknown", color: "gray", label: "No Max Supply" }

    const percentage = calculatePercentage(circulating, max)

    if (percentage >= 90) return { status: "high", color: "red", label: "High Utilization" }
    if (percentage >= 70) return { status: "medium", color: "yellow", label: "Medium Utilization" }
    return { status: "low", color: "green", label: "Low Utilization" }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-gray-700" />
          <Skeleton className="h-4 w-96 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 bg-gray-700" />
            <Skeleton className="h-32 bg-gray-700" />
            <Skeleton className="h-32 bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-red-400">Supply Data Error</CardTitle>
          <CardDescription className="text-gray-400">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Please reload the page to try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!supplyData) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">No supply data available</p>
        </CardContent>
      </Card>
    )
  }

  const { circulating, total, max } = supplyData
  const supplyStatus = getSupplyStatus()
  const circulatingPercentage = max ? calculatePercentage(circulating, max) : 0
  const totalPercentage = max && total ? calculatePercentage(total, max) : 0

  return (
    <TooltipProvider>
      <Card className="bg-gray-900 border-gray-700 hover:border-[#ff6b35]/50 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#ff6b35] text-2xl font-bold flex items-center gap-2">
              <Coins className="h-6 w-6" />
              BONK Supply Analysis
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Token supply distribution and utilization metrics • Last updated:{" "}
              {new Date(supplyData.lastUpdated).toLocaleString()}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Supply Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Supply Utilization</h3>
              <Badge
                variant="outline"
                className={`border-${supplyStatus.color === "red" ? "red" : supplyStatus.color === "yellow" ? "yellow" : "green"}-500 text-${supplyStatus.color === "red" ? "red" : supplyStatus.color === "yellow" ? "yellow" : "green"}-400`}
              >
                {supplyStatus.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>0%</span>
                <span className="text-[#ff6b35] font-semibold">{circulatingPercentage.toFixed(1)}%</span>
                <span>100%</span>
              </div>
              <Progress
                value={circulatingPercentage}
                className="h-3 bg-gray-800"
                style={{
                  background: `linear-gradient(to right, #ff6b35 ${circulatingPercentage}%, #374151 ${circulatingPercentage}%)`,
                }}
              />
            </div>
          </div>

          {/* Supply Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-600 hover:border-[#ff6b35]/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#ff6b35] text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Circulating Supply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">{formatSupply(circulating)}</div>
                <p className="text-sm text-gray-400">
                  {max ? `${circulatingPercentage.toFixed(2)}% of max supply` : "Active tokens"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600 hover:border-[#ff6b35]/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#ff6b35] text-lg flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Total Supply
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total tokens created (may include locked/burned tokens)</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">{total ? formatSupply(total) : "N/A"}</div>
                <p className="text-sm text-gray-400">
                  {total && max ? `${totalPercentage.toFixed(2)}% of max supply` : "Not specified"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600 hover:border-[#ff6b35]/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#ff6b35] text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Max Supply
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum tokens that can ever exist</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">{max ? formatSupply(max) : "Unlimited"}</div>
                <p className="text-sm text-gray-400">{max ? "Hard cap" : "No maximum limit"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Supply Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart Placeholder */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-[#ff6b35]">Supply Distribution</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl mb-4">🥧</div>
                <p className="text-gray-400 mb-4">Supply Distribution Chart</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Circulating:</span>
                    <span className="text-[#ff6b35] font-semibold">{formatSupply(circulating)}</span>
                  </div>
                  {total && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Locked/Burned:</span>
                      <span className="text-yellow-400 font-semibold">{formatSupply(total - circulating)}</span>
                    </div>
                  )}
                  {max && total && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Remaining:</span>
                      <span className="text-green-400 font-semibold">{formatSupply(max - total)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supply Timeline */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-[#ff6b35]">Supply Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Initial Launch</span>
                  <span className="text-white font-semibold">Dec 2022</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Current Status</span>
                  <Badge className="bg-[#ff6b35] text-white">{circulatingPercentage.toFixed(1)}% Circulating</Badge>
                </div>
                {max && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Max Supply</span>
                    <span className="text-white font-semibold">{formatSupply(max)} Tokens</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Utilization</span>
                  <Badge
                    variant="outline"
                    className={`border-${supplyStatus.color === "red" ? "red" : supplyStatus.color === "yellow" ? "yellow" : "green"}-500 text-${supplyStatus.color === "red" ? "red" : supplyStatus.color === "yellow" ? "yellow" : "green"}-400`}
                  >
                    {supplyStatus.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-[#ff6b35]">Supply Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Circulation Rate:</span>
                  <span className="text-[#ff6b35] font-semibold">
                    {max ? `${circulatingPercentage.toFixed(2)}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Locked Tokens:</span>
                  <span className="text-yellow-400 font-semibold">
                    {total ? formatSupply(total - circulating) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Available for Mining:</span>
                  <span className="text-green-400 font-semibold">
                    {max && total ? formatSupply(max - total) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Supply Type:</span>
                  <span className="text-white font-semibold">{max ? "Fixed Cap" : "Unlimited"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Inflation Rate:</span>
                  <span className="text-white font-semibold">{max ? "0%" : "Variable"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white font-semibold">
                    {new Date(supplyData.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
