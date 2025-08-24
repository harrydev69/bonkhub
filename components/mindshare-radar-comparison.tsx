"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts"
import { Download } from "lucide-react"

export function MindshareRadarComparison() {
  const [selectedTokens, setSelectedTokens] = useState(["BONK", "DOGE", "SHIB"])

  const availableTokens = ["BONK", "DOGE", "SHIB", "PEPE", "WIF"]

  const tokenData = {
    BONK: { mindshare: 87, social: 94, technical: 71, community: 89, utility: 76, momentum: 92, color: "#F97316" },
    DOGE: { mindshare: 72, social: 85, technical: 68, community: 78, utility: 45, momentum: 62, color: "#EAB308" },
    SHIB: { mindshare: 58, social: 71, technical: 54, community: 65, utility: 52, momentum: 48, color: "#EF4444" },
    PEPE: { mindshare: 45, social: 67, technical: 42, community: 58, utility: 38, momentum: 55, color: "#10B981" },
    WIF: { mindshare: 38, social: 52, technical: 35, community: 45, utility: 28, momentum: 42, color: "#8B5CF6" },
  }

  const radarData = [
    {
      subject: "Mindshare",
      ...Object.fromEntries(
        selectedTokens.map((token) => [token, tokenData[token as keyof typeof tokenData].mindshare]),
      ),
    },
    {
      subject: "Social",
      ...Object.fromEntries(selectedTokens.map((token) => [token, tokenData[token as keyof typeof tokenData].social])),
    },
    {
      subject: "Technical",
      ...Object.fromEntries(
        selectedTokens.map((token) => [token, tokenData[token as keyof typeof tokenData].technical]),
      ),
    },
    {
      subject: "Community",
      ...Object.fromEntries(
        selectedTokens.map((token) => [token, tokenData[token as keyof typeof tokenData].community]),
      ),
    },
    {
      subject: "Utility",
      ...Object.fromEntries(selectedTokens.map((token) => [token, tokenData[token as keyof typeof tokenData].utility])),
    },
    {
      subject: "Momentum",
      ...Object.fromEntries(
        selectedTokens.map((token) => [token, tokenData[token as keyof typeof tokenData].momentum]),
      ),
    },
  ]

  const toggleToken = (token: string) => {
    if (selectedTokens.includes(token)) {
      setSelectedTokens(selectedTokens.filter((t) => t !== token))
    } else if (selectedTokens.length < 3) {
      setSelectedTokens([...selectedTokens, token])
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-orange-500">🎯</span>
            Mindshare Radar Comparison
          </CardTitle>
          <p className="text-gray-400 text-sm">Multi-dimensional token comparison across key metrics</p>
        </div>
        <Badge variant="outline" className="border-blue-500 text-blue-400">
          Interactive
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Select Tokens to Compare</h3>
          <div className="flex flex-wrap gap-2">
            {availableTokens.map((token) => (
              <Button
                key={token}
                variant={selectedTokens.includes(token) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleToken(token)}
                className={`${
                  selectedTokens.includes(token)
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "border-gray-600 hover:border-orange-500 hover:bg-orange-500/10"
                }`}
                disabled={!selectedTokens.includes(token) && selectedTokens.length >= 3}
              >
                {token}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">Select up to 3 tokens for comparison</p>
        </div>

        {/* Radar Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Radar Chart</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  {selectedTokens.map((token) => (
                    <Radar
                      key={token}
                      name={token}
                      dataKey={token}
                      stroke={tokenData[token as keyof typeof tokenData].color}
                      fill={tokenData[token as keyof typeof tokenData].color}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Metrics Breakdown</h3>
            <div className="space-y-4">
              {["Mindshare", "Social", "Technical", "Community", "Utility", "Momentum"].map((metric) => (
                <div key={metric} className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300">{metric}</h4>
                  <div className="space-y-1">
                    {selectedTokens.map((token) => {
                      const value =
                        tokenData[token as keyof typeof tokenData][metric.toLowerCase() as keyof typeof tokenData.BONK]
                      return (
                        <div key={token} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{token}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${value}%`,
                                  backgroundColor: tokenData[token as keyof typeof tokenData].color,
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-white w-8">{value}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competitive Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Competitive Analysis Summary</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-3">BONK's Strengths</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Highest social engagement (94/100)</li>
                <li>• Strong momentum indicators (92/100)</li>
                <li>• Leading mindshare position (87/100)</li>
                <li>• Active community participation (89/100)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-3">Growth Opportunities</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Technical analysis improvements needed</li>
                <li>• Utility expansion potential</li>
                <li>• Cross-chain integration opportunities</li>
                <li>• DeFi protocol partnerships</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-orange-500 hover:bg-orange-500/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Comparison
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
