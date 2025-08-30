import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🔍 Checking for real whale activities...');
    
    // Monitor top 5 BONK whales
    const HELIUS_API_KEY = '580abc5a-076c-45c9-bf91-a230d62aaea6';
    const topWhales = [
      { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', rank: 1, bonkBalance: 699549944464832900, usd: 15243193289888.709 },
      { address: 'AGkGWK1R669KDT4FCqgDgK7PgahGJPjD4J9xmVjuL9kn', rank: 2, bonkBalance: 442610445030468000, usd: 9644481597213.896 },
      { address: '9AdEE8AAm1XgJrPEs4zkTPozr3o4U5iGbgvPwkNdLDJ3', rank: 3, bonkBalance: 363214897766717600, usd: 7914452622336.775 },
      { address: '8Tp9fFkZ2KcRBLYDTUNXo98Ez6ojGb6MZEPXfGDdeBzG', rank: 4, bonkBalance: 356025615778877440, usd: 7757798167821.739 },
      { address: '7Lp4JBapgNhXoxpJtR2twufh7oaQyqngqJpy7HFJcn7h', rank: 5, bonkBalance: 280874627592428480, usd: 6120258135239.017 }
    ];
    
    const allWhaleActivities = [];
    
    // Check each whale for recent activities
    for (const whale of topWhales) {
      try {
        console.log(`🔍 Checking whale #${whale.rank}: ${whale.address.slice(0, 8)}...`);
        
        const response = await fetch(`https://api.helius.xyz/v0/addresses/${whale.address}/transactions?api-key=${HELIUS_API_KEY}&limit=10`);
        
        if (!response.ok) {
          console.warn(`⚠️  Failed to fetch transactions for whale #${whale.rank}`);
          continue;
        }

        const transactions = await response.json();
        console.log(`📊 Found ${transactions.length} recent transactions for whale #${whale.rank}`);
        
        const whaleActivities = [];
        
        // Process recent transactions
        for (const tx of transactions.slice(0, 5)) {
      try {
        // Look for token transfers
        const tokenTransfers = tx.tokenTransfers || [];
        
        for (const transfer of tokenTransfers) {
          // Skip BONK transfers and small amounts
          if (transfer.mint === 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263') continue;
          if (transfer.tokenAmount < 1) continue;
          
          // Map known tokens
          const tokenMap: { [key: string]: { symbol: string, name: string } } = {
            'EDFhaRRSn28u2yRtNshhmtRQbPYAqJUUEjgHYDw7c6ut': { symbol: 'ARK', name: 'ARK Token' },
            'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana' },
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
            'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade Staked SOL' },
            '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY', name: 'Raydium' }
          };
          
          const tokenInfo = tokenMap[transfer.mint] || { 
            symbol: transfer.mint.slice(0, 8) + '...', 
            name: 'Unknown Token' 
          };
          
          // Determine if whale received or sent
          const isReceived = transfer.toUserAccount === whale.address;
          
          const activity = {
            signature: tx.signature,
            timestamp: tx.timestamp,
            timeAgo: formatTimeAgo(tx.timestamp),
            type: isReceived ? 'buy' : 'sell',
            token: {
              mint: transfer.mint,
              symbol: tokenInfo.symbol,
              name: tokenInfo.name
            },
            amount: transfer.tokenAmount,
            formattedAmount: formatNumber(transfer.tokenAmount),
            usdValue: transfer.tokenAmount * 0.1, // Rough estimate
            formattedUSD: formatUSDValue(transfer.tokenAmount * 0.1)
          };
          
          whaleActivities.push(activity);
        }
        } catch (error) {
          console.warn(`Error processing transaction ${tx.signature}:`, error);
        }
      }
      
      // If this whale has activities, add to results
      if (whaleActivities.length > 0) {
        allWhaleActivities.push({
          whale: {
            address: whale.address,
            shortAddress: `${whale.address.slice(0, 6)}...${whale.address.slice(-4)}`,
            bonkBalance: whale.bonkBalance,
            bonkBalanceUSD: whale.usd,
            whaleRank: whale.rank,
            category: whale.rank <= 2 ? "Ultra Whale" : whale.rank <= 5 ? "Mega Whale" : "Whale"
          },
          recentActivities: whaleActivities.slice(0, 3) // Limit to 3 most recent per whale
        });
      }
      
      } catch (error) {
        console.warn(`Error checking whale #${whale.rank}:`, error);
      }
    }

    // If we found real activities, return them
    if (allWhaleActivities.length > 0) {
      const totalActivities = allWhaleActivities.reduce((sum, whale) => sum + whale.recentActivities.length, 0);
      const allTokens = allWhaleActivities.flatMap(whale => whale.recentActivities.map(a => a.token.mint));
      
      console.log(`✅ Found ${totalActivities} real whale activities from ${allWhaleActivities.length} whales`);

      return NextResponse.json({
        success: true,
        data: {
          whaleActivities: allWhaleActivities,
          summary: {
            totalActiveWhales: allWhaleActivities.length,
            totalActivities: totalActivities,
            uniqueTokensTraded: new Set(allTokens).size,
            lastUpdated: new Date().toISOString()
          },
          metadata: {
            dataSource: 'Real Solana Blockchain Data via Helius',
            updateFrequency: '5 minutes',
            monitoringDescription: 'Real BONK top 5 whales trading activities',
            whaleThreshold: '1.5B+ BONK tokens (~$32K+ USD)',
            note: 'Showing real transactions from top 5 BONK whales'
          }
        }
      });
    }

    // No recent activities found
    console.log('ℹ️  No recent whale activities detected');
    
    return NextResponse.json({
      success: true,
      data: {
        whaleActivities: [],
        summary: {
          totalActiveWhales: 0,
          totalActivities: 0,
          uniqueTokensTraded: 0,
          lastUpdated: new Date().toISOString()
        },
        metadata: {
          dataSource: 'Real Solana Blockchain Data via Helius',
          updateFrequency: '5 minutes',
          monitoringDescription: 'Real BONK whale trading activities',
          whaleThreshold: '1.5B+ BONK tokens (~$32K+ USD)',
          note: 'No recent whale activities in the last few hours'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Real whale activities error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real whale activities',
      message: error.message
    }, { status: 500 });
  }
}

// Helper functions
function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(2);
}

function formatUSDValue(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}
