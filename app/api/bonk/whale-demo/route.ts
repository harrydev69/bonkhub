import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🎭 Generating demo whale portfolio activities...');
    
    // Demo data showing what the system WOULD look like with real whale activities
    const demoWhaleActivities = [
      {
        whale: {
          address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
          shortAddress: "9WzDXw...AWWM",
          bonkBalance: 699549944464832900,
          bonkBalanceUSD: 15243193289888.709,
          whaleRank: 1,
          category: "Ultra Whale"
        },
        recentActivities: [
          {
            signature: "5xK2mN8pQ7vR9sT1uW3yZ4aB6cD8eF9gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9aB0c",
            timestamp: Date.now() / 1000 - 300, // 5 minutes ago
            timeAgo: "5m ago",
            type: "buy",
            token: {
              mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              symbol: "USDC",
              name: "USD Coin"
            },
            amount: 50000,
            formattedAmount: "50.0K",
            usdValue: 50000,
            formattedUSD: "$50.0K"
          },
          {
            signature: "7yL3nO9qR8tU2vW4xZ5aB7cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2e",
            timestamp: Date.now() / 1000 - 1800, // 30 minutes ago
            timeAgo: "30m ago",
            type: "sell",
            token: {
              mint: "So11111111111111111111111111111111111111112",
              symbol: "SOL",
              name: "Solana"
            },
            amount: 1000,
            formattedAmount: "1.0K",
            usdValue: 180000,
            formattedUSD: "$180.0K"
          }
        ]
      },
      {
        whale: {
          address: "AGkGWK1R669KDT4FCqgDgK7PgahGJPjD4J9xmVjuL9kn",
          shortAddress: "AGkGWK...L9kn",
          bonkBalance: 442610445030468000,
          bonkBalanceUSD: 9644481597213.896,
          whaleRank: 2,
          category: "Ultra Whale"
        },
        recentActivities: [
          {
            signature: "3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1pQ2rS3tU4v",
            timestamp: Date.now() / 1000 - 600, // 10 minutes ago
            timeAgo: "10m ago",
            type: "buy",
            token: {
              mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
              symbol: "mSOL",
              name: "Marinade Staked SOL"
            },
            amount: 500,
            formattedAmount: "500",
            usdValue: 95000,
            formattedUSD: "$95.0K"
          },
          {
            signature: "9hI0jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE1fG2hI3jK4lM5nO6pQ7rS8tU9vW0x",
            timestamp: Date.now() / 1000 - 3600, // 1 hour ago
            timeAgo: "1h ago",
            type: "transfer",
            token: {
              mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
              symbol: "BONK",
              name: "Bonk"
            },
            amount: 50000000000, // 50B BONK
            formattedAmount: "50.0B",
            usdValue: 1089500,
            formattedUSD: "$1.1M"
          }
        ]
      },
      {
        whale: {
          address: "9AdEE8AAm1XgJrPEs4zkTPozr3o4U5iGbgvPwkNdLDJ3",
          shortAddress: "9AdEE8...LDJ3",
          bonkBalance: 363214897766717600,
          bonkBalanceUSD: 7914452622336.775,
          whaleRank: 3,
          category: "Ultra Whale"
        },
        recentActivities: [
          {
            signature: "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2q",
            timestamp: Date.now() / 1000 - 900, // 15 minutes ago
            timeAgo: "15m ago",
            type: "sell",
            token: {
              mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
              symbol: "RAY",
              name: "Raydium"
            },
            amount: 10000,
            formattedAmount: "10.0K",
            usdValue: 25000,
            formattedUSD: "$25.0K"
          }
        ]
      }
    ];

    const summary = {
      totalActiveWhales: demoWhaleActivities.length,
      totalActivities: demoWhaleActivities.reduce((sum, whale) => sum + whale.recentActivities.length, 0),
      uniqueTokensTraded: 6, // USDC, SOL, mSOL, BONK, RAY
      lastUpdated: new Date().toISOString()
    };

    console.log(`✅ Generated demo data: ${summary.totalActiveWhales} whales, ${summary.totalActivities} activities`);
    
    return NextResponse.json({
      success: true,
      data: {
        whaleActivities: demoWhaleActivities,
        summary,
        metadata: {
          dataSource: "Demo Data (Real Implementation Ready)",
          updateFrequency: "Real-time",
          monitoringDescription: "BONK whales trading other tokens",
          whaleThreshold: "10M+ BONK tokens (~$220+ USD)",
          note: "This shows what the system looks like with real whale activities"
        }
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'X-Data-Source': 'Demo Whale Portfolio Data',
        'X-Active-Whales': summary.totalActiveWhales.toString()
      }
    });

  } catch (error: any) {
    console.error('❌ Demo whale error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate demo data',
      message: error.message
    }, { status: 500 });
  }
}
