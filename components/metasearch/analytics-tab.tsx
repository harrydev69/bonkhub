"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { TokenStats } from "./types";
import { formatNumber, formatPrice } from "./utils";

interface AnalyticsTabProps {
  tokenStats: TokenStats | null;
}

export function AnalyticsTab({ tokenStats }: AnalyticsTabProps) {
  return (
    <Card className="group/analytics bg-gray-900 border-gray-800 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-orange-500/50 hover:scale-[1.01] transition-all duration-500 transform-gpu">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3 transition-all duration-500 group-hover/analytics:text-orange-400">
          <Activity className="h-6 w-6 text-purple-400 transition-all duration-500 group-hover/analytics:scale-110 group-hover/analytics:rotate-2" />
          Advanced Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Social Metrics
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Social Score</span>
                <span className="text-white font-semibold">
                  87/100
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Community Score</span>
                <span className="text-white font-semibold">
                  92/100
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Developer Score</span>
                <span className="text-white font-semibold">
                  78/100
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Market Metrics
            </h4>
            <div className="space-y-3">
              {tokenStats && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">ATH</span>
                    <span className="text-white font-semibold">
                      {formatPrice(tokenStats.ath)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">ATL</span>
                    <span className="text-white font-semibold">
                      {formatPrice(tokenStats.atl)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">
                      Circulating Supply
                    </span>
                    <span className="text-white font-semibold">
                      {formatNumber(tokenStats.circulatingSupply)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}