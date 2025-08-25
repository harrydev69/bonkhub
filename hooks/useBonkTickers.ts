'use client';
import { useEffect, useState } from 'react';

export type TickerData = {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_volume: {
    btc: number;
    eth: number;
    usd: number;
  };
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
};

export type TickersPayload = {
  name: string;
  tickers: TickerData[];
  last_updated: string;
};

export function useBonkTickers(page: number = 1, order: string = 'volume_desc') {
  const [data, setData] = useState<TickersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    
    fetch(`/api/bonk/tickers?page=${page}&order=${order}`)
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
  }, [page, order]);

  return { data, loading, error };
}
