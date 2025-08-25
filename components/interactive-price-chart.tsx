'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export type TF = '24h' | '7d' | '30d' | '90d' | '1y';
export type View = 'price' | 'marketCap' | 'volume';

export type ChartDataPoint = { timestamp:number; price:number; marketCap:number; volume:number };

export type ChartPayload = {
  timeframe: '24H'|'7D'|'30D'|'90D'|'1Y';
  dataPoints: ChartDataPoint[];
  summary: {
    startPrice:number; endPrice:number; changePercent:number; changeAmount:number;
    highestPrice:number; lowestPrice:number; totalVolume:number; avgVolume:number;
    highestVolume:number; lowestVolume:number;
  };
  metadata: { totalPoints:number; timeRange:string; lastUpdated:string };
  currentPrice?: number;
  currentMarketCap?: number;
  currentVolume?: number;
};

export function computeYDomain<T extends { price:number; marketCap:number; volume:number }>(
  points: T[], view: View
): [number, number] | undefined {
  const vals = points
    .map(p => view === 'price' ? p.price : view === 'marketCap' ? p.marketCap : p.volume)
    .filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (!vals.length) return undefined;
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { const eps = Math.max(1e-12, Math.abs(min) * 0.01); min -= eps; max += eps; }
  const pad = (max - min) * 0.06; // ~6% padding like CG
  return [min - pad, max + pad];
}

export function fmtX(ts: number, tf: TF) {
  const d = new Date(ts);
  switch (tf) {
    case '24h': return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '1y':  return d.toLocaleDateString([], { month: 'short' });
    default:    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function floorToHour(ts: number, stepHours = 2) {
  const d = new Date(ts); d.setMinutes(0,0,0);
  const h = d.getHours(); d.setHours(Math.floor(h/stepHours)*stepHours);
  return +d;
}
function floorToUTCDate(ts: number) {
  const d = new Date(ts); d.setUTCHours(0,0,0,0); return +d;
}

export function computeXTicks(timestamps: number[], tf: TF): number[] {
  if (!timestamps.length) return [];
  const min = timestamps[0], max = timestamps[timestamps.length-1];
  let stepMs: number, start: number;

  switch (tf) {
    case '24h': stepMs = 2 * 3600_000; start = floorToHour(min, 2); break;     // every 2h
    case '7d':  stepMs = 24 * 3600_000; start = floorToUTCDate(min); break;     // daily
    case '30d': stepMs = 5  * 24 * 3600_000; start = floorToUTCDate(min); break;// ~5d
    case '90d': stepMs = 10 * 24 * 3600_000; start = floorToUTCDate(min); break;// ~10d
    case '1y':  stepMs = 30 * 24 * 3600_000; start = floorToUTCDate(min); break;// monthly-ish
    default:    stepMs = (max - min) / 6; start = min;
  }

  const ticks: number[] = [];
  for (let t = start; t <= max; t += stepMs) ticks.push(t);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

export const fmtPrice = (n: number) => (
  n == null || Number.isNaN(n) ? '—' :
  (Math.abs(n) >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(6)}`)
);
export const fmtCompact = (n: number) =>
  `$${Intl.NumberFormat('en-US', { notation:'compact', maximumFractionDigits:2 }).format(n)}`;

type Props = ChartPayload & {
  currentPrice?: number;
  currentMarketCap?: number;
  currentVolume?: number;
  onTimeframeChange?: (tf: TF) => void;
};

export default function InteractivePriceChart(props: Props) {
  // local view toggle (your outer page may already manage this)
  const [view, setView] = useState<View>('price');

  // Normalize timeframe string back to our TF union
  const tf: TF = (props.timeframe.toLowerCase() as TF) ?? '7d';

  const timestamps = props.dataPoints.map(d => d.timestamp);
  const xTicks = useMemo(() => computeXTicks(timestamps, tf), [timestamps, tf]);
  const yDomain = useMemo(() => computeYDomain(props.dataPoints, view), [props.dataPoints, view]);

  const dataKey = view === 'price' ? 'price' : view === 'marketCap' ? 'marketCap' : 'volume';

  return (
    <div className="w-full">
      {/* Controls (timeframe + view) */}
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex rounded-md overflow-hidden border border-neutral-700">
          {(['24h','7d','30d','90d','1y'] as TF[]).map(t => (
            <button
              key={t}
              onClick={() => props.onTimeframeChange?.(t)}
              className={`px-3 py-1 text-sm ${tf===t ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md overflow-hidden border border-neutral-700 ml-4">
                           {(['price','marketCap','volume'] as View[]).map(v => (
                   <button
                     key={v}
                     onClick={() => setView(v)}
                     className={`px-3 py-1 text-sm ${view===v ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                   >
                     {v === 'price' ? '$ Price' : v === 'marketCap' ? 'Market Cap' : 'Volume'}
                   </button>
                 ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={props.dataPoints}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255, 109, 41, 0.6)" />
                <stop offset="100%" stopColor="rgba(255, 109, 41, 0.05)" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={xTicks}
              tickFormatter={(ms: number) => fmtX(ms, tf)}
              minTickGap={10}
              tickMargin={8}
              stroke="rgba(255,255,255,0.35)"
            />
            <YAxis
              domain={yDomain ?? ['auto', 'auto']} // 👈 never start at 0
              tickFormatter={(v: number) => view === 'price' ? fmtPrice(v) : fmtCompact(v)}
              width={70}
              stroke="rgba(255,255,255,0.35)"
            />

            <Tooltip
              formatter={(value: any) => view === 'price' ? fmtPrice(Number(value)) : fmtCompact(Number(value))}
              labelFormatter={(ms: any) => fmtX(Number(ms), tf)}
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: 'white' }}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#ff6d29"
              strokeWidth={2}
              fill="url(#areaFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
