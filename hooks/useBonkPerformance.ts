'use client';
import { useEffect, useState } from 'react';

export type PerfData = {
  base: 'usd';
  changes: { '1h': number|null; '24h': number|null; '7d': number|null; '14d': number|null; '30d': number|null; '1y': number|null; };
  lastUpdated: string;
};

export function useBonkPerformance(vs: 'usd' = 'usd') {
  const [data, setData] = useState<PerfData | null>(null);

  useEffect(() => {
    let dead = false;
    fetch(`/api/bonk/performance?vs=${vs}`)
      .then(r => r.json())
      .then(j => { if (!dead) setData(j); });
    return () => { dead = true; };
  }, [vs]);

  return data;
}
