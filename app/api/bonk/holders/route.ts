import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock comprehensive holders data matching the GitHub repository structure
    const holdersData = {
      overview: {
        total_holders: 976099,
        unique_wallets: 976099,
        holder_percentage: 50.93,
        last_updated: new Date().toISOString(),
      },
      breakdowns: {
        total_holders: 976099,
        holders_over_10_usd: 485000,
        holders_over_50_usd: 245000,
        holders_over_100_usd: 156000,
        holders_over_250_usd: 89000,
        holders_over_500_usd: 52000,
        holders_over_1000_usd: 28000,
        holders_over_10000_usd: 5100,
        holders_over_100k_usd: 890,
        holders_over_1m_usd: 125,
        categories: {
          shrimp: 750000,
          crab: 180000,
          fish: 35000,
          dolphin: 8500,
          whale: 2599,
        },
        market_cap_per_holder: {
          all_holders: 2450,
          over_10: 4890,
          over_100: 12500,
          over_1000: 89000,
          over_10000: 485000,
          over_100k: 2850000,
          over_1m: 18500000,
        },
      },
      deltas: {
        "1hour": -12,
        "2hours": -28,
        "4hours": -138,
        "12hours": -216,
        "1day": -1394,
        "3days": -1039,
        "7days": -129,
        "14days": 2450,
        "30days": 8920,
      },
      stats: {
        hhi: 0.158,
        gini: 0.92,
        median_holder_position: 46,
        avg_time_held: null,
        retention_rate: null,
        distribution_score: 0.29,
        top_holder_percentage: 7.53,
        top10_percentage: 29.55,
        top25_percentage: 39.68,
        top50_percentage: 48.56,
        top100_percentage: 61.62,
        top250_percentage: 77.06,
        top500_percentage: 82.2,
        top1000_percentage: 84.45,
      },
      pnlStats: {
        break_even_price: null,
        realized_pnl_total: 0,
        unrealized_pnl_total: 0,
      },
      walletCategories: {
        diamond: 125,
        gold: 890,
        silver: 5100,
        bronze: 28000,
        wood: 52000,
        new_holders: 15000,
      },
      supplyBreakdown: {
        diamond: 15.5e12,
        gold: 12.8e12,
        silver: 18.2e12,
        bronze: 20.1e12,
        wood: 10.8e12,
      },
      topHolders: {
        holder_count: 976099,
        total: 976099,
        holders: [
          {
            address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            spl_token_account: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            amount: 5.85e15,
            rank: 1,
          },
          {
            address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
            spl_token_account: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
            amount: 3.2e15,
            rank: 2,
          },
          {
            address: "36c739D3eC6E685Fd3c8BEA4dcaBF192c5c2F4b2",
            spl_token_account: "36c739D3eC6E685Fd3c8BEA4dcaBF192c5c2F4b2",
            amount: 2.8e15,
            rank: 3,
          },
          {
            address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            spl_token_account: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            amount: 2.1e15,
            rank: 4,
          },
          {
            address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            spl_token_account: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            amount: 1.8e15,
            rank: 5,
          },
        ],
      },
      cexHoldings: [
        { exchange: "Binance", amount: "12.50M", usd_value: "$2.85M", wallets: 2 },
        { exchange: "Coinbase", amount: "8.75M", usd_value: "$1.99M", wallets: 2 },
        { exchange: "Kraken", amount: "6.20M", usd_value: "$1.41M", wallets: 1 },
        { exchange: "Bybit", amount: "4.80M", usd_value: "$1.09M", wallets: 2 },
        { exchange: "OKX", amount: "3.90M", usd_value: "$888.30K", wallets: 1 },
        { exchange: "Gate.io", amount: "2.85M", usd_value: "$649.35K", wallets: 1 },
        { exchange: "KuCoin", amount: "2.10M", usd_value: "$478.80K", wallets: 1 },
        { exchange: "Huobi", amount: "1.75M", usd_value: "$398.75K", wallets: 1 },
        { exchange: "Bitget", amount: "1.25M", usd_value: "$284.38K", wallets: 1 },
        { exchange: "MEXC", amount: "950.00K", usd_value: "$216.63K", wallets: 1 },
      ],
    }

    return NextResponse.json(holdersData)
  } catch (error) {
    console.error("Error in holders API:", error)
    return NextResponse.json({ error: "Failed to fetch holders data" }, { status: 500 })
  }
}
