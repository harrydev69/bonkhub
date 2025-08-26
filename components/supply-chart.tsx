"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Coins, PieChart, Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchSupplyData()
    
    // Auto-refresh every 5 minutes (300000ms)
    const interval = setInterval(fetchSupplyData, 300000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchSupplyData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch real data from our API endpoint
      const response = await fetch('/api/bonk/overview')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      setSupplyData({
        circulating: data.circulatingSupply || 0,
        total: data.totalSupply || null,
        max: data.maxSupply || null,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      })
      
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching supply data:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch supply data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchSupplyData()
  }

  const formatSupply = (amount: number) => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(4)}T`
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(4)}B`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(4)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(4)}K`
    return amount.toFixed(4)
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
             <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20 transition-all duration-500 transform hover:scale-105 cursor-pointer">
               <CardHeader className="pb-3">
                 <CardTitle className="text-[#ff6b35] text-lg flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                   <TrendingUp className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                   Circulating Supply
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-white mb-2 group-hover:text-[#ff6b35] transition-colors duration-300">{formatSupply(circulating)}</div>
                 <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                   {max ? `${circulatingPercentage.toFixed(2)}% of max supply` : "Active tokens"}
                 </p>
               </CardContent>
             </Card>

             <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20 transition-all duration-500 transform hover:scale-105 cursor-pointer">
               <CardHeader className="pb-3">
                 <CardTitle className="text-[#ff6b35] text-lg flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                   <Coins className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                   Total Supply
                   <Tooltip>
                     <TooltipTrigger>
                       <Info className="h-4 w-4 text-gray-400 group-hover:text-[#ff6b35] transition-colors duration-300" />
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Total tokens created (may include locked/burned tokens)</p>
                     </TooltipContent>
                   </Tooltip>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-white mb-2 group-hover:text-[#ff6b35] transition-colors duration-300">{total ? formatSupply(total) : "N/A"}</div>
                 <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                   {total && max ? `${totalPercentage.toFixed(2)}% of max supply` : "Not specified"}
                 </p>
               </CardContent>
             </Card>

             <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20 transition-all duration-500 transform hover:scale-105 cursor-pointer">
               <CardHeader className="pb-3">
                 <CardTitle className="text-[#ff6b35] text-lg flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                   <PieChart className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                   Max Supply
                   <Tooltip>
                     <TooltipTrigger>
                       <Info className="h-4 w-4 text-gray-400 group-hover:text-[#ff6b35] transition-colors duration-300" />
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Maximum tokens that can ever exist</p>
                     </TooltipContent>
                   </Tooltip>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-white mb-2 group-hover:text-[#ff6b35] transition-colors duration-300">{max ? formatSupply(max) : "Unlimited"}</div>
                 <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{max ? "Hard cap" : "No maximum limit"}</p>
               </CardContent>
             </Card>
           </div>

          {/* Supply Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         {/* Supply Distribution with Exact Numbers */}
             <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20 transition-all duration-500">
               <CardHeader>
                 <CardTitle className="text-[#ff6b35] group-hover:text-white transition-colors duration-300">Supply Distribution</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Circulating Supply */}
                 <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                   <div className="flex items-center gap-3">
                     <div className="w-4 h-4 rounded-full bg-[#ff6b35] group-hover/item:scale-125 transition-transform duration-300 shadow-lg shadow-[#ff6b35]/30"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Circulating Supply</span>
                   </div>
                   <div className="text-right">
                     <div className="text-lg font-bold text-[#ff6b35] group-hover/item:text-white transition-colors duration-300">{formatSupply(circulating)}</div>
                     <div className="text-xs text-gray-500 group-hover/item:text-gray-300 transition-colors duration-300">
                       {max ? `${((circulating / max) * 100).toFixed(2)}% of total` : ''}
                     </div>
                   </div>
                 </div>
                 
                 {/* Locked/Burned Supply */}
                 {total && (
                   <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                     <div className="flex items-center gap-3">
                       <div className="w-4 h-4 rounded-full bg-yellow-400 group-hover/item:scale-125 transition-transform duration-300 shadow-lg shadow-yellow-400/30"></div>
                       <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Locked/Burned</span>
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-bold text-yellow-400 group-hover/item:text-white transition-colors duration-300">{formatSupply(total - circulating)}</div>
                       <div className="text-xs text-gray-500 group-hover/item:text-gray-300 transition-colors duration-300">
                         {max ? `${(((total - circulating) / max) * 100).toFixed(2)}% of total` : ''}
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {/* Remaining Supply */}
                 {max && total && (
                   <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                     <div className="flex items-center gap-3">
                       <div className="w-4 h-4 rounded-full bg-green-400 group-hover/item:scale-125 transition-transform duration-300 shadow-lg shadow-green-400/30"></div>
                       <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Remaining</span>
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-bold text-green-400 group-hover/item:text-white transition-colors duration-300">{formatSupply(max - total)}</div>
                       <div className="text-xs text-gray-500 group-hover/item:text-gray-300 transition-colors duration-300">
                         {max ? `${(((max - total) / max) * 100).toFixed(2)}% of total` : ''}
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {/* Total Supply Summary */}
                 <div className="flex justify-between items-center py-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg px-3 border border-gray-600 group-hover:border-[#ff6b35] transition-all duration-300">
                   <span className="text-gray-300 font-semibold group-hover:text-white transition-colors duration-300">Total Supply</span>
                   <div className="text-right">
                     <div className="text-lg font-bold text-white group-hover:text-[#ff6b35] transition-colors duration-300">{max ? formatSupply(max) : 'Unlimited'}</div>
                     <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Maximum Cap</div>
                   </div>
                 </div>
               </CardContent>
             </Card>

                         {/* Supply Timeline */}
             <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20 transition-all duration-500">
               <CardHeader>
                 <CardTitle className="text-[#ff6b35] group-hover:text-white transition-colors duration-300">Supply Timeline</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Initial Launch</span>
                   </div>
                   <span className="text-white font-semibold group-hover/item:text-blue-400 transition-colors duration-300">Dec 2022</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#ff6b35] group-hover/item:scale-150 transition-transform duration-300"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Current Status</span>
                   </div>
                   <Badge className="bg-[#ff6b35] text-white group-hover/item:scale-110 transition-transform duration-300">{circulatingPercentage.toFixed(1)}% Circulating</Badge>
                 </div>
                 {max && (
                   <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                       <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Max Supply</span>
                     </div>
                     <span className="text-white font-semibold group-hover/item:text-purple-400 transition-colors duration-300">{formatSupply(max)} Tokens</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center py-3 hover:bg-gray-700/30 rounded-lg px-2 transition-all duration-300 group/item">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Utilization</span>
                   </div>
                   <Badge
                     variant="outline"
                     className={`border-${supplyStatus.color === "red" ? "red" : supplyStatus.color === "yellow" ? "yellow" : "green"}-500 text-${supplyStatus.color === "red" ? "red" : supplyStatus.color === "yellow" ? "yellow" : "green"}-400 group-hover/item:scale-110 transition-transform duration-300`}
                   >
                     {supplyStatus.label}
                   </Badge>
                 </div>
               </CardContent>
             </Card>
          </div>

                     {/* Additional Insights */}
           <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-[#ff6b35] group-hover:text-white transition-colors duration-300">Supply Insights</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="flex justify-between items-center py-3 px-3 bg-gradient-to-r from-green-500/10 to-green-400/5 rounded-lg border border-green-500/20 hover:border-green-400/40 hover:bg-green-500/20 transition-all duration-300 group/item">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Available for Mining:</span>
                   </div>
                   <span className="text-green-400 font-semibold group-hover/item:text-white transition-colors duration-300">
                     {max && total ? formatSupply(max - total) : "N/A"}
                   </span>
                 </div>
                 <div className="flex justify-between items-center py-3 px-3 bg-gradient-to-r from-blue-500/10 to-blue-400/5 rounded-lg border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/20 transition-all duration-300 group/item">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Supply Type:</span>
                   </div>
                   <span className="text-white font-semibold group-hover/item:text-blue-400 transition-colors duration-300">{max ? "Fixed Cap" : "Unlimited"}</span>
                 </div>
                 <div className="flex justify-between items-center py-3 px-3 bg-gradient-to-r from-purple-500/10 to-purple-400/5 rounded-lg border border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-500/20 transition-all duration-300 group/item">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                     <span className="text-gray-400 group-hover/item:text-white transition-colors duration-300">Inflation Rate:</span>
                   </div>
                   <span className="text-white font-semibold group-hover/item:text-purple-400 transition-colors duration-300">{max ? "0%" : "Variable"}</span>
                 </div>
               </div>
             </CardContent>
           </Card>
          
          
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
