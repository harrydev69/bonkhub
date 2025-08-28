"use client";

import { Search, Brain, Users, BarChart3 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-20 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center group/icon transition-all duration-500 hover:scale-110">
        <Search className="w-12 h-12 text-gray-400 group-hover/icon:text-orange-400 transition-all duration-500" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-white">
          Search for a Token to Get Started
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover comprehensive social intelligence, market data, and community
          insights for any cryptocurrency. Search by token name, symbol, or
          contract address.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          AI-Powered Insights
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          Social Sentiment
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          Real-time Data
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
          <p className="text-gray-400 text-sm">
            Get AI-generated summaries of current developments, sentiment
            analysis, and market context.
          </p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Social Intelligence
          </h3>
          <p className="text-gray-400 text-sm">
            Track top creators, trending conversations, and community engagement
            across all platforms.
          </p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all duration-300">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Market Data</h3>
          <p className="text-gray-400 text-sm">
            Access real-time prices, market cap, volume, and comprehensive token
            statistics.
          </p>
        </div>
      </div>
    </div>
  );
}