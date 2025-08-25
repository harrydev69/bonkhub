'use client';
import { useEffect, useState } from 'react';
import InteractivePriceChart, { ChartPayload, TF } from '@/components/interactive-price-chart';

export default function ChartWrapper() {
  const [tf, setTf] = useState<TF>('7d');
  const [payload, setPayload] = useState<ChartPayload & {
    currentPrice?: number; currentMarketCap?: number; currentVolume?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bonk/chart?tf=${tf}`).then(r => r.json()).then(j => { if (!cancelled) setPayload(j); });
    return () => { cancelled = true; };
  }, [tf]);

  if (!payload) return <div className="h-72 flex items-center justify-center text-neutral-400">Loading chart…</div>;

  return (
    <InteractivePriceChart
      {...payload}
      currentPrice={payload.currentPrice ?? 0}
      currentMarketCap={payload.currentMarketCap ?? 0}
      currentVolume={payload.currentVolume ?? 0}
      onTimeframeChange={setTf}
    />
  );
}
