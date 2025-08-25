import { NextResponse } from 'next/server';
import { CoinGecko } from '@/lib/services/coingecko';

export async function GET() {
  try {
    const data = await CoinGecko.coin('bonk');
    
    // Transform CoinGecko data to match the component's expected format
    const md = data.market_data || {};
    const ath = md.ath || {};
    const atl = md.atl || {};
    const ath_change_pct = md.ath_change_percentage || {};
    const atl_change_pct = md.atl_change_percentage || {};
    const ath_date = md.ath_date || {};
    const atl_date = md.atl_date || {};

    const transformedData = {
      // Price & Rank
      price: md.current_price?.usd || 0,
      rank: data.market_cap_rank || null,
      change24h: md.price_change_percentage_24h || 0,
      
      // 24h Range
      low24h: md.low_24h?.usd || 0,
      high24h: md.high_24h?.usd || 0,
      
      // Market Data
      marketCap: md.market_cap?.usd || 0,
      fdv: md.fully_diluted_valuation?.usd || null,
      volume24h: md.total_volume?.usd || 0,
      
      // Supply Data
      circulatingSupply: md.circulating_supply || 0,
      totalSupply: md.total_supply || 0,
      maxSupply: md.max_supply || 0,
      
      // Historical Data
      ath: {
        price: ath.usd || 0,
        date: ath_date.usd || '',
        changePct: ath_change_pct.usd || 0
      },
      atl: {
        price: atl.usd || 0,
        date: atl_date.usd || '',
        changePct: atl_change_pct.usd || 0
      },
      
      // Performance (calculate from price changes)
      changePct: {
        h1: md.price_change_percentage_1h_in_currency?.usd || 0,
        h24: md.price_change_percentage_24h || 0,
        d7: md.price_change_percentage_7d_in_currency?.usd || 0,
        d14: md.price_change_percentage_14d_in_currency?.usd || 0,
        d30: md.price_change_percentage_30d_in_currency?.usd || 0,
        y1: md.price_change_percentage_1y_in_currency?.usd || 0
      },
      
      // Chart Data
      sparkline7d: md.sparkline_7d?.price || [],
      
      // Metadata
      lastUpdated: data.last_updated || new Date().toISOString()
    };

    return NextResponse.json(transformedData, { status: 200 });
  } catch (e: any) {
    try {
      const simple = await CoinGecko.simplePrice('bonk', 'usd,php', true);
      return NextResponse.json({ simple }, { status: 200 });
    } catch {
      console.error('Error in /api/bonk/overview:', e);
      return NextResponse.json({ error: e?.message ?? 'CoinGecko error' }, { status: 500 });
    }
  }
}


