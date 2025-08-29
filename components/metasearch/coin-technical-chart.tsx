"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

interface CoinTechnicalChartProps {
  data: any[];
  loading: boolean;
  error: any;
}

export function CoinTechnicalChart({ data, loading, error }: CoinTechnicalChartProps) {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data
      .filter(item => item.time && typeof item.time === 'number' && item.time > 0)
      .slice(-30) // Show last 30 days for better readability
      .map((item) => ({
        time: item.time,
        date: new Date(item.time * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        // Use real market cap if available, otherwise calculate
        marketCap: item.market_cap || ((item.circulating_supply || 0) * (item.close || 0)),
        interactions: item.interactions || 0,
        volume: item.volume_24h || 0,
        price: item.close || 0,
        // Additional performance metrics
        galaxyScore: item.galaxy_score || 0,
        socialDominance: item.social_dominance || 0,
        marketDominance: item.market_dominance || 0,
      }))
      .filter(item => item.marketCap > 0 || item.interactions > 0); // Only valid data
  }, [data]);

  const computeXTicks = (timestamps: number[]): number[] => {
    if (!timestamps.length) return [];
    const min = timestamps[0],
      max = timestamps[timestamps.length - 1];
    const range = max - min;
    const step = range / 6; // Show ~7 ticks

    const ticks: number[] = [];
    for (let t = min; t <= max; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] < max) ticks.push(max);
    return ticks;
  };

  const getYAxisDomain = (dataKey: "interactions" | "marketCap"): [number, number] => {
    if (!processedData || processedData.length === 0) return [0, 0];
    
    const values = processedData.map(d => d[dataKey]);
    if (values.length === 0) return [0, 0];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (min === max) {
      const offset = Math.max(1, Math.abs(min * 0.01));
      return [min - offset, max + offset];
    }
    
    const padding = (max - min) * 0.06;
    return [min - padding, max + padding];
  };

  const formatTimeLabel = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const xTicks = useMemo(() => {
    if (!processedData.length) return [];
    const timestamps = processedData.map(d => d.time);
    return computeXTicks(timestamps);
  }, [processedData]);

  const formatValue = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-300 mb-2">
            {new Date(data.time * 1000).toLocaleString()}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm mr-2">Market Cap:</span>
              <span className="text-white font-medium">${formatValue(data.marketCap)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm mr-2">Interactions:</span>
              <span className="text-white font-medium">{formatValue(data.interactions)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-red-400">
              <p>Failed to load technical data</p>
              <p className="text-sm text-gray-500 mt-2">{String(error)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p>No technical data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.01] hover:border-purple-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-purple-400">
              Market Cap & Interactions
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:scale-110 bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-900/40"
              >
                <Activity className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                {processedData.length} data points
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-600"
              >
                Last 30 days
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-purple-500/10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={xTicks}
                tickFormatter={formatTimeLabel}
                minTickGap={20}
                tickMargin={8}
                stroke="rgba(255,255,255,0.35)"
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={getYAxisDomain("marketCap")}
                tickFormatter={(value) => `$${formatValue(value)}`}
                width={80}
                stroke="rgba(139, 92, 246, 0.8)"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={getYAxisDomain("interactions")}
                tickFormatter={formatValue}
                width={80}
                stroke="rgba(59, 130, 246, 0.8)"
              />
              <Tooltip content={<CustomTooltip />} />
               <defs>
                <linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                </linearGradient>
                <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                </linearGradient>
              </defs>
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="marketCap"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2 }}
                name="Market Cap"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="interactions"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
                name="Interactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Current Market Cap</div>
            <div className="text-xl font-bold text-white">
              ${formatValue(processedData[processedData.length - 1]?.marketCap)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Interactions</div>
             <div className="text-xl font-bold text-white">
              {formatValue(processedData[processedData.length - 1]?.interactions)}
            </div>
          </div>
           <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Insight</div>
            <div className="text-l text-white">
              Tracking interactions alongside market cap can provide insights into community engagement and its impact on market valuation.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}