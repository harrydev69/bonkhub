"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Download, TrendingUp } from "lucide-react"

export function WhaleMovementTracker() {
  const [filter, setFilter] = useState("all")

  const whaleTransactions = [
    {
      type: "sell",
      impact: "high",
      wallet: "5cMy...pw00",
      exchange: "Orca",
      time: "8/24/2025, 5:56:18 PM",
      usdValue: "$1071K",
      bonkAmount: "48.5B BONK",
      priceImpact: "+3.28%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "3dFw...d5uf",
      exchange: "Binance",
      time: "8/24/2025, 12:56:18 PM",
      usdValue: "$979K",
      bonkAmount: "44.3B BONK",
      priceImpact: "-3.42%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "5cMy...ub5x",
      exchange: "OKX",
      time: "8/24/2025, 2:56:18 AM",
      usdValue: "$971K",
      bonkAmount: "44.0B BONK",
      priceImpact: "+0.24%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "4vBz...bpib",
      exchange: "Orca",
      time: "8/24/2025, 6:56:18 PM",
      usdValue: "$961K",
      bonkAmount: "43.5B BONK",
      priceImpact: "-4.39%",
    },
    {
      type: "transfer",
      impact: "high",
      wallet: "4vBz...g9ko",
      exchange: "Direct Transfer",
      time: "8/24/2025, 6:56:18 PM",
      usdValue: "$953K",
      bonkAmount: "43.1B BONK",
      priceImpact: "+4.06%",
    },
    {
      type: "sell",
      impact: "high",
      wallet: "3dFw...iz6d",
      exchange: "Orca",
      time: "8/23/2025, 10:56:18 PM",
      usdValue: "$929K",
      bonkAmount: "42.0B BONK",
      priceImpact: "-1.06%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "3dFw...boqt",
      exchange: "Binance",
      time: "8/24/2025, 4:56:18 PM",
      usdValue: "$894K",
      bonkAmount: "40.5B BONK",
      priceImpact: "+0.98%",
    },
    {
      type: "sell",
      impact: "high",
      wallet: "8kLp...yzj4",
      exchange: "Jupiter",
      time: "8/24/2025, 6:56:18 AM",
      usdValue: "$661K",
      bonkAmount: "29.9B BONK",
      priceImpact: "-1.57%",
    },
    {
      type: "transfer",
      impact: "high",
      wallet: "5cMy...ket7",
      exchange: "Direct Transfer",
      time: "8/24/2025, 11:56:18 AM",
      usdValue: "$565K",
      bonkAmount: "25.6B BONK",
      priceImpact: "-3.12%",
    },
    {
      type: "buy",
      impact: "high",
      wallet: "5cMy...vdsb",
      exchange: "OKX",
      time: "8/24/2025, 4:56:18 PM",
      usdValue: "$492K",
      bonkAmount: "22.3B BONK",
      priceImpact: "-1.74%",
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case "sell":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return "border-green-500 text-green-400"
      case "sell":
        return "border-red-500 text-red-400"
      case "transfer":
        return "border-blue-500 text-blue-400"
      default:
        return "border-gray-500 text-gray-400"
    }
  }

  const totalBuyVolume = whaleTransactions
    .filter((tx) => tx.type === "buy")
    .reduce((sum, tx) => sum + Number.parseFloat(tx.usdValue.replace("$", "").replace("K", "")), 0)

  const totalSellVolume = whaleTransactions
    .filter((tx) => tx.type === "sell")
    .reduce((sum, tx) => sum + Number.parseFloat(tx.usdValue.replace("$", "").replace("K", "")), 0)

  const netFlow = totalBuyVolume - totalSellVolume

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-orange-500">🐋</span>
            Whale Movement Tracker
          </CardTitle>
          <p className="text-gray-400 text-sm">Monitor large BONK transactions and their market impact</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            All Types
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-400">
            Live Tracking
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">$9.6M</div>
            <div className="text-sm text-gray-400">Total Volume</div>
            <div className="text-xs text-gray-500">24 Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">${totalBuyVolume.toFixed(1)}M</div>
            <div className="text-sm text-gray-400">Buy Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">${totalSellVolume.toFixed(1)}M</div>
            <div className="text-sm text-gray-400">Sell Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">13</div>
            <div className="text-sm text-gray-400">High Impact</div>
          </div>
        </div>

        {/* Net Whale Flow */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Net Whale Flow</h3>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bullish Signal
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">+${netFlow.toFixed(2)}M</div>
            <div className="text-sm text-gray-400">Net inflow indicates accumulation</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Large Transactions</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-orange-500 hover:bg-orange-500/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Whale Data
            </Button>
          </div>

          <div className="space-y-2">
            {whaleTransactions.map((tx, index) => (
              <div key={index} className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getTypeColor(tx.type)}>
                      {getTypeIcon(tx.type)}
                      {tx.type}
                    </Badge>
                    <Badge variant="outline" className="border-orange-500 text-orange-400">
                      {tx.impact} impact
                    </Badge>
                    <div className="text-sm text-gray-400">
                      {tx.wallet} • {tx.exchange}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{tx.time}</div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-white">{tx.usdValue}</div>
                    <div className="text-sm text-gray-400">{tx.bonkAmount}</div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      tx.priceImpact.startsWith("+") ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.priceImpact} impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Whale Activity Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Whale Activity Analysis</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-orange-500 mb-3">Market Impact</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 13 high-impact transactions detected</li>
                <li>• Average transaction size: $639K</li>
                <li>• Accumulation phase indicated</li>
                <li>• Price correlation: 21.1%</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-orange-500 mb-3">Trading Patterns</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Most active exchange: Raydium (DEX)</li>
                <li>• Peak activity: 12:00 - 18:00 UTC</li>
                <li>• Whale count: ~4 unique wallets</li>
                <li>• Average hold time: 16 days</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
