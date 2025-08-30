import { NextResponse } from 'next/server';
import { getTokenInfo } from '@/lib/services/token-registry';
import { getTopBonkWhales } from '@/lib/services/bonk-whales';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🐋 Monitoring TOP 100 BONK WHALES...');
    
    const HELIUS_API_KEY = '580abc5a-076c-45c9-bf91-a230d62aaea6';
    const HOLDERSCAN_API_KEY = '1c90892932f60e18e09f13d3a84b485ea87304f6443b503f1c8601820582d3d1';
    const BONK_TOKEN_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    
    // Step 1: Get whales from our comprehensive CSV data
    console.log('🐋 Loading BONK whales from CSV data...');
    const csvWhales = await getTopBonkWhales(100); // Get top 100 from CSV
    
    // Convert to format expected by monitoring code
    const whales = csvWhales.map(whale => ({
      rank: whale.rank,
      address: whale.address,
      bonkBalance: whale.bonkBalance,
      usdValue: whale.usdValue,
      category: whale.category
    }));

    console.log(`🎯 Loaded ${whales.length} whales from CSV data`);
    
    // Step 3: Check transactions for batches of whales (process in chunks for performance)
    const allWhaleActivities = [];
    const batchSize = 10; // Process 10 whales at a time
    
    for (let i = 0; i < Math.min(whales.length, 20); i += batchSize) { // Monitor first 20 for testing
      const whaleBatch = whales.slice(i, i + batchSize);
      console.log(`🔍 Processing whale batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(50/batchSize)} (whales ${i+1}-${i+whaleBatch.length})`);
      
      // Process batch in parallel
      const batchPromises = whaleBatch.map(async (whale) => {
        try {
          const response = await fetch(`https://api.helius.xyz/v0/addresses/${whale.address}/transactions?api-key=${HELIUS_API_KEY}&limit=20`);
          
          if (!response.ok) {
            console.warn(`⚠️  Failed to fetch transactions for whale #${whale.rank}`);
            return null;
          }

          const transactions = await response.json();
          const whaleActivities = [];
          
          // Process recent transactions to find the LATEST activity
          console.log(`  📊 Whale #${whale.rank} (${whale.address}): ${transactions.length} transactions found`);
          let latestActivity = null;
          
          for (const tx of transactions.slice(0, 50)) { // Check last 50 transactions per whale
            try {
              // Get detailed transaction info
              const detailResponse = await fetch(`https://api.helius.xyz/v0/transactions/${tx.signature}?api-key=${HELIUS_API_KEY}`);
              
              if (!detailResponse.ok) continue;
              
              const detailData = await detailResponse.json();
              const tokenTransfers = detailData.tokenTransfers || [];
              const nativeTransfers = detailData.nativeTransfers || [];
              const transactionType = detailData.type || 'UNKNOWN';
              
              console.log(`    🔍 Transaction ${tx.signature.slice(0, 8)}: ${nativeTransfers.length} SOL transfers`);
              
              // Look for SOL transfers only
              for (const transfer of nativeTransfers) {
                if (transfer.amount < 1000000) continue; // Skip dust (< 0.001 SOL)
                
                const isReceived = transfer.toUserAccount === whale.address;
                const solAmount = transfer.amount / 1000000000; // Convert lamports to SOL
                
                console.log(`    💰 Found ${solAmount} SOL transfer`);
                
                const activity = {
                  signature: tx.signature,
                  timestamp: tx.timestamp,
                  timeAgo: formatTimeAgo(tx.timestamp),
                  action: isReceived ? 'RECEIVED' : 'SENT',
                  actionEmoji: isReceived ? '🟢' : '🔴',
                  activityType: 'SOL_TRANSFER',
                  token: {
                    mint: 'So11111111111111111111111111111111111111112',
                    symbol: 'SOL',
                    name: 'Solana',
                    logoURI: null
                  },
                  amount: solAmount,
                  formattedAmount: formatNumber(solAmount),
                  usdValue: solAmount * 150, // Rough SOL price estimate
                  formattedUSD: formatUSDValue(solAmount * 150),
                  solscanLink: `https://solscan.io/tx/${tx.signature}`
                };
                
                if (!latestActivity) {
                  latestActivity = activity;
                  console.log(`    ✅ Latest SOL activity: ${activity.action} ${activity.amount} SOL`);
                  break;
                }
              }
              
              // If we found an activity, stop checking older transactions
              if (latestActivity) break;
            } catch (error) {
              console.warn(`Error processing transaction ${tx.signature}:`, error);
            }
          }
          
          if (latestActivity) {
            return {
              whale: {
                address: whale.address,
                shortAddress: `${whale.address.slice(0, 6)}...${whale.address.slice(-4)}`,
                bonkBalance: whale.bonkBalance,
                bonkBalanceUSD: whale.usdValue,
                whaleRank: whale.rank,
                category: whale.category
              },
              latestActivity: latestActivity // Only 1 latest transaction per whale
            };
          }
          
          return null;
        } catch (error) {
          console.warn(`Error checking whale #${whale.rank}:`, error);
          return null;
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Add successful results
      batchResults.forEach(result => {
        if (result) {
          allWhaleActivities.push(result);
        }
      });
      
      // Small delay between batches to be nice to APIs
      if (i + batchSize < Math.min(whales.length, 50)) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    }
    
    // Step 4: Return results
    if (allWhaleActivities.length > 0) {
      const totalActivities = allWhaleActivities.length; // 1 activity per whale
      const allTokens = allWhaleActivities.map(whale => whale.latestActivity.token.mint);
      
      console.log(`✅ Found ${totalActivities} real whale activities from ${allWhaleActivities.length} active whales`);

      return NextResponse.json({
        success: true,
        data: {
          whaleActivities: allWhaleActivities,
          summary: {
            totalActiveWhales: allWhaleActivities.length,
            totalActivities: totalActivities,
            uniqueTokensTraded: new Set(allTokens).size,
            totalWhalesMonitored: Math.min(whales.length, 20),
            totalWhalesIdentified: whales.length,
            lastUpdated: new Date().toISOString()
          },
          metadata: {
            dataSource: 'Real Solana Blockchain Data via Helius + Holderscan',
            updateFrequency: '5 minutes',
            monitoringDescription: `Top ${Math.min(whales.length, 20)} BONK whales out of ${whales.length} identified`,
            whaleThreshold: '1.5B+ BONK tokens (~$32K+ USD)',
            note: 'Showing latest SOL transfers from top BONK whales'
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
                      totalWhalesMonitored: Math.min(whales.length, 20),
          totalWhalesIdentified: whales.length,
          lastUpdated: new Date().toISOString()
        },
        metadata: {
          dataSource: 'Real Solana Blockchain Data via Helius + Holderscan',
          whaleThreshold: '1.5B+ BONK tokens (~$32K+ USD)',
          note: 'No recent SOL transfers found from whales'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Top 100 whale monitoring error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to monitor top 100 whales',
      message: error.message
    }, { status: 500 });
  }
}

// Helper functions
function getWhaleCategory(usdValue: number): string {
  if (usdValue >= 10000000) return 'Ultra Whale';     // $10M+
  if (usdValue >= 1000000) return 'Mega Whale';       // $1M+
  if (usdValue >= 500000) return 'Super Whale';       // $500K+
  if (usdValue >= 250000) return 'Whale';             // $250K+
  if (usdValue >= 100000) return 'Large Holder';      // $100K+
  if (usdValue >= 50000) return 'Big Holder';         // $50K+
  return 'Holder';                                     // $32K+
}

function getTokenInfo(mint: string): { symbol: string; name: string } {
  const knownTokens: Record<string, { symbol: string; name: string }> = {
    'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana' },
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade SOL' },
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY', name: 'Raydium' },
    'ARCoQ9dndpg6wE2rRexzfwgJR3NoWWhpcww3xQcQLukg': { symbol: 'ARK', name: 'Ark' },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD' },
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk' },
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', name: 'Jupiter' },
    'Dogwifhat': { symbol: 'WIF', name: 'Dogwifhat' },
    'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': { symbol: 'HNT', name: 'Helium' }
  };
  
  return knownTokens[mint] || { 
    symbol: mint.slice(0, 8) + '...', 
    name: 'Unknown Token' 
  };
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatUSDValue(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}
