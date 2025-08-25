'use client';
import { useEffect, useState } from 'react';

export type HolderDeltas = {
  '1hour': number;
  '2hours': number;
  '4hours': number;
  '12hours': number;
  '1day': number;
  '3days': number;
  '7days': number;
  '14days': number;
  '30days': number;
};

export type HolderBreakdowns = {
  total_holders: number;
  holders_over_10_usd: number;
  holders_over_100_usd: number;
  holders_over_1000_usd: number;
  holders_over_10000_usd: number;
  holders_over_100k_usd: number;
  holders_over_1m_usd: number;
  categories: {
    shrimp: number;
    crab: number;
    fish: number;
    dolphin: number;
    whale: number;
  };
};

export type HoldersPayload = {
  deltas: HolderDeltas;
  breakdowns: HolderBreakdowns;
  last_updated: string;
};

export function useBonkHolders() {
  const [data, setData] = useState<HoldersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    setLoading(true);

    fetch('/api/bonk/holders')
      .then(r => r.json())
      .then(j => {
        if (!dead) {
          setData(j);
          setError(null);
        }
      })
      .catch(err => {
        if (!dead) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!dead) {
          setLoading(false);
        }
      });

    return () => { dead = true; };
  }, []);

  return { data, loading, error };
}
