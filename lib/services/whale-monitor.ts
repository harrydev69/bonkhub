/**
 * BONK Whale Portfolio Monitor
 * Track what BONK whales are buying/selling across all tokens
 */

import { Helius } from './helius';

const BONK_MINT = process.env.BONK_MINT || 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

// Known BONK whale wallets (we'll discover these dynamically)
const KNOWN_WHALE_WALLETS = new Set<string>();

interface WhalePortfolioActivity {
  whale: {
    address: string;
    bonkBalance: number;
    bonkBalanceUSD: number;
    whaleRank: number;
  };
  activity: {
    signature: string;
    timestamp: number;
    type: 'buy' | 'sell' | 'transfer';
    token: {
      mint: string;
      symbol: string;
      name: string;
    };
    amount: number;
    usdValue: number;
    counterparty?: string;
    exchange?: string;
  }[];
}

export const WhaleMonitor = {
  /**
   * Get top BONK whale wallets from Holderscan API
   */
  getWhaleWalletsFromHolderscan: async (): Promise<string[]> => {
    try {
      console.log('🔍 Fetching BONK whale wallets from Holderscan...');
      
      const HOLDERSCAN_API_KEY = '1c90892932f60e18e09f13d3a84b485ea87304f6443b503f1c8601820582d3d1';
      const BONK_TOKEN_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
      
      // Get top holders from Holderscan (get more whales for monitoring)
      const response = await fetch(`https://api.holderscan.com/v0/sol/tokens/${BONK_TOKEN_ADDRESS}/holders?limit=100`, {
        headers: {
          'x-api-key': HOLDERSCAN_API_KEY,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Holderscan API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Holderscan response:', data);
      
      if (!data.holders || !Array.isArray(data.holders)) {
        console.warn('No holders data found in response');
        return [];
      }

      const whaleWallets: string[] = [];
      const whaleThreshold = 1500000000; // 1.5B BONK tokens (~$32K USD)

      for (const holder of data.holders) {
        try {
          const balance = holder.amount || 0;
          if (balance > whaleThreshold) {
            const address = holder.address;
            if (address && !whaleWallets.includes(address)) {
              whaleWallets.push(address);
              KNOWN_WHALE_WALLETS.add(address);
              console.log(`🐋 Found whale: ${address.slice(0, 8)}... (${(balance / 1e9).toFixed(1)}B BONK) - Rank #${holder.rank}`);
            }
          }
        } catch (error) {
          console.warn('Error processing holder:', error);
        }
      }

      console.log(`✅ Found ${whaleWallets.length} whale wallets from Holderscan`);
      return whaleWallets;
      
    } catch (error) {
      console.error('Error fetching whale wallets from Holderscan:', error);
      return [];
    }
  },

  /**
   * Get all recent transactions for a whale wallet
   */
  getWhaleTransactions: async (walletAddress: string, limit = 50) => {
    try {
      const response = await fetch(process.env.SOLANA_RPC_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [
            walletAddress,
            { limit }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      return data.result || [];
    } catch (error) {
      console.error(`Error fetching transactions for ${walletAddress}:`, error);
      return [];
    }
  },

  /**
   * Parse real whale transactions using Helius Enhanced API
   */
  parseTokenActivity: async (signature: string) => {
    try {
      console.log(`🔍 Parsing transaction: ${signature.slice(0, 8)}...`);
      
      // Use Helius Enhanced API for transaction details
      const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '580abc5a-076c-45c9-bf91-a230d62aaea6';
      const response = await fetch(`https://api.helius.xyz/v0/transactions/${signature}?api-key=${HELIUS_API_KEY}`);
      
      if (!response.ok) {
        console.warn(`❌ Failed to fetch transaction ${signature}: ${response.status}`);
        return null;
      }

      const tx = await response.json();
      if (!tx || tx.error) {
        console.warn(`❌ Transaction error for ${signature}:`, tx.error);
        return null;
      }

      const activities = [];
      
      // Parse token transfers from Helius Enhanced API
      const tokenTransfers = tx.tokenTransfers || [];
      console.log(`📊 Found ${tokenTransfers.length} token transfers in transaction`);
      
      for (const transfer of tokenTransfers) {
        const mint = transfer.mint;
        
        // Skip BONK transfers (we track those separately) 
        if (mint === BONK_MINT) {
          console.log(`⏭️  Skipping BONK transfer`);
          continue;
        }
        
        // Only track significant amounts
        const amount = transfer.tokenAmount || 0;
        if (amount < 1) {
          console.log(`⏭️  Skipping small transfer: ${amount}`);
          continue;
        }
        
        console.log(`✅ Found significant token transfer: ${amount} of ${mint.slice(0, 8)}...`);
        
        const activity = {
          signature: tx.signature,
          timestamp: tx.timestamp || Date.now() / 1000,
          type: 'transfer' as 'buy' | 'sell' | 'transfer',
          token: {
            mint,
            symbol: await this.getTokenSymbol(mint),
            name: await this.getTokenName(mint)
          },
          amount: amount,
          usdValue: amount * 0.1, // Rough estimate for demo
          owner: transfer.toUserAccount || 'Unknown'
        };

        activities.push(activity);
      }

      console.log(`🎯 Parsed ${activities.length} activities from transaction`);
      return activities.length > 0 ? activities : null;
      
    } catch (error) {
      console.error(`❌ Error parsing transaction ${signature}:`, error);
      return null;
    }
  },

  /**
   * Get token symbol from mint address
   */
  getTokenSymbol: async (mint: string): Promise<string> => {
    // Common Solana token mappings
    const knownTokens: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
      'EDFhaRRSn28u2yRtNshhmtRQbPYAqJUUEjgHYDw7c6ut': 'ARK',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK'
    };
    
    return knownTokens[mint] || mint.slice(0, 8) + '...';
  },

  /**
   * Get token name from mint address  
   */
  getTokenName: async (mint: string): Promise<string> => {
    // Common Solana token names
    const knownTokens: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'Solana',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USD Coin',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'Tether USD',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'Marinade Staked SOL',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'Raydium',
      'EDFhaRRSn28u2yRtNshhmtRQbPYAqJUUEjgHYDw7c6ut': 'ARK Token',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'Bonk'
    };
    
    return knownTokens[mint] || 'Unknown Token';
  },

  /**
   * Monitor all whale portfolio activities
   */
  getWhalePortfolioActivities: async (): Promise<WhalePortfolioActivity[]> => {
    try {
      console.log('🔍 Monitoring whale portfolio activities...');
      
      // First, get whale wallets from Holderscan
      const whaleWallets = await this.getWhaleWalletsFromHolderscan();
      
      const activities: WhalePortfolioActivity[] = [];
      
      // Monitor each whale's recent transactions
      for (const wallet of whaleWallets.slice(0, 100)) { // Monitor top 100 whales for excellent coverage
        try {
          console.log(`🐋 Analyzing whale: ${wallet.slice(0, 8)}...`);
          
          // Get whale's BONK balance
          const tokenAccounts = await Helius.getTokenAccounts(wallet);
          const bonkBalance = Helius.extractBONKBalance(tokenAccounts);
          
          // Get recent transactions
          const transactions = await this.getWhaleTransactions(wallet, 20);
          
          const whaleActivities = [];
          
          // Parse each transaction for token activities
          for (const tx of transactions.slice(0, 10)) { // Limit per whale
            const tokenActivities = await this.parseTokenActivity(tx.signature);
            if (tokenActivities) {
              whaleActivities.push(...tokenActivities);
            }
          }

          if (whaleActivities.length > 0) {
            activities.push({
              whale: {
                address: wallet,
                bonkBalance,
                bonkBalanceUSD: bonkBalance * 0.00002179, // Current BONK price
                whaleRank: whaleWallets.indexOf(wallet) + 1
              },
              activity: whaleActivities
            });
          }
          
        } catch (error) {
          console.warn(`Error analyzing whale ${wallet}:`, error);
        }
      }

      console.log(`✅ Found ${activities.length} active whales with portfolio activities`);
      return activities;
      
    } catch (error) {
      console.error('Error monitoring whale portfolios:', error);
      return [];
    }
  }
};
