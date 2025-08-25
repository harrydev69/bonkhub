// app/api/ecosystem/route.ts
import { NextResponse } from 'next/server';
import { CoinGecko } from '@/lib/services/coingecko';

export async function GET() {
  try {
    const d = await CoinGecko.coin('bonk');

    const md = d.market_data || {};
    const ath = md.ath || {};
    const atl = md.atl || {};
    const ath_change_pct = md.ath_change_percentage || {};
    const atl_change_pct = md.atl_change_percentage || {};
    const ath_date = md.ath_date || {};
    const atl_date = md.atl_date || {};

    const item = {
      // Identity
      id: d.id,
      symbol: (d.symbol || '').toUpperCase(),
      name: d.name,
      image: d.image?.small || d.image?.thumb || d.image?.large || '',
      cg_rank: d.coingecko_rank ?? null,
      cg_score: d.coingecko_score ?? null,

      // Prices
      price_usd: md.current_price?.usd ?? null,
      price_php: md.current_price?.php ?? null,

      // % changes
      change_1h: md.price_change_percentage_1h_in_currency?.usd ?? null,
      change_24h: md.price_change_percentage_24h ?? null,
      change_7d: md.price_change_percentage_7d_in_currency?.usd ?? null,
      change_14d: md.price_change_percentage_14d_in_currency?.usd ?? null,
      change_30d: md.price_change_percentage_30d_in_currency?.usd ?? null,
      change_60d: md.price_change_percentage_60d_in_currency?.usd ?? null,
      change_200d: md.price_change_percentage_200d_in_currency?.usd ?? null,
      change_1y: md.price_change_percentage_1y_in_currency?.usd ?? null,

      // Market stats
      market_cap: md.market_cap?.usd ?? null,
      market_cap_rank: d.market_cap_rank ?? null,
      fdv: md.fully_diluted_valuation?.usd ?? null,
      volume_24h: md.total_volume?.usd ?? null,
      circulating_supply: md.circulating_supply ?? null,
      total_supply: md.total_supply ?? null,
      max_supply: md.max_supply ?? null,

      // ATH/ATL blocks (USD)
      ath_usd: ath.usd ?? null,
      ath_change_pct_usd: ath_change_pct.usd ?? null,
      ath_date_usd: ath_date.usd ?? null,
      atl_usd: atl.usd ?? null,
      atl_change_pct_usd: atl_change_pct.usd ?? null,
      atl_date_usd: atl_date.usd ?? null,

      // Sparkline (7d)
      sparkline_7d: md.sparkline_7d?.price ?? [],

      // Contracts / Links
      sol_mint: d.platforms?.solana ?? 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      links: {
        homepage: d.links?.homepage?.[0] || null,
        whitepaper: d.links?.whitepaper || null,
        twitter: d.links?.twitter_screen_name ? `https://x.com/${d.links.twitter_screen_name}` : null,
        telegram: d.links?.telegram_channel_identifier ? `https://t.me/${d.links.telegram_channel_identifier}` : null,
        discord: d.links?.chat_url?.find((u: string) => u?.includes('discord')) || null,
        github: d.links?.repos_url?.github?.[0] || null,
      },

      // Community / Dev
      community: {
        twitter_followers: d.community_data?.twitter_followers ?? null,
        reddit_subscribers: d.community_data?.reddit_subscribers ?? null,
        telegram_channel_user_count: d.community_data?.telegram_channel_user_count ?? null,
      },
      developer: {
        stars: d.developer_data?.stars ?? null,
        forks: d.developer_data?.forks ?? null,
        subscribers: d.developer_data?.subscribers ?? null,
        total_issues: d.developer_data?.total_issues ?? null,
        closed_issues: d.developer_data?.closed_issues ?? null,
        pull_requests_merged: d.developer_data?.pull_requests_merged ?? null,
        commit_count_4_weeks: d.developer_data?.commit_count_4_weeks ?? null,
      },

      last_updated: d.last_updated ?? null,
    };

    return NextResponse.json({ items: [item], vs: 'usd' }, { status: 200 });
  } catch (e: any) {
    console.error('Error in /api/ecosystem:', e?.message || e);
    return NextResponse.json({ items: [], vs: 'usd' }, { status: 200 });
  }
}
