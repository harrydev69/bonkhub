/**
 * DEXScreener API Service
 * Real-time DEX trading data and liquidity information
 */

const DEXSCREENER_BASE = process.env.DEXSCREENER_BASE || 'https://api.dexscreener.com/latest';
const BONK_MINT = process.env.BONK_MINT || 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexPair[];
}

interface WhaleActivity {
  totalVolume24h: number;
  largeTransactions: number;
  averageTransactionSize: number;
  topExchanges: Array<{
    name: string;
    volume: number;
    percentage: number;
  }>;
  liquidityDistribution: Array<{
    exchange: string;
    liquidity: number;
    percentage: number;
  }>;
}

export const DexScreener = {
  /**
   * Get all BONK trading pairs across DEXs
   */
  getBONKPairs: async (): Promise<DexScreenerResponse> => {
    try {
      const response = await fetch(`${DEXSCREENER_BASE}/dex/tokens/${BONK_MINT}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BonkHub/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`DEXScreener API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching BONK pairs from DEXScreener:', error);
      throw error;
    }
  },

  /**
   * Get specific pair data
   */
  getPairData: async (pairAddress: string): Promise<DexPair | null> => {
    try {
      const response = await fetch(`${DEXSCREENER_BASE}/dex/pairs/${pairAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BonkHub/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`DEXScreener pair API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.pairs?.[0] || null;
    } catch (error) {
      console.error(`Error fetching pair data for ${pairAddress}:`, error);
      return null;
    }
  },

  /**
   * Search for BONK pairs
   */
  searchBONKPairs: async (): Promise<DexScreenerResponse> => {
    try {
      const response = await fetch(`${DEXSCREENER_BASE}/dex/search?q=BONK`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BonkHub/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`DEXScreener search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching BONK pairs:', error);
      throw error;
    }
  },

  /**
   * Analyze whale activity across DEXs
   */
  analyzeWhaleActivity: (pairs: DexPair[]): WhaleActivity => {
    try {
      if (!pairs || pairs.length === 0) {
        return {
          totalVolume24h: 0,
          largeTransactions: 0,
          averageTransactionSize: 0,
          topExchanges: [],
          liquidityDistribution: []
        };
      }

      // Calculate total volume and transactions
      const totalVolume24h = pairs.reduce((sum, pair) => sum + (pair.volume?.h24 || 0), 0);
      const totalTransactions = pairs.reduce((sum, pair) => 
        sum + (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0), 0
      );

      const averageTransactionSize = totalTransactions > 0 ? totalVolume24h / totalTransactions : 0;

      // Estimate large transactions (whale activity)
      // Transactions significantly above average are considered whale activity
      const whaleThreshold = averageTransactionSize * 10; // 10x average = whale
      const largeTransactions = pairs.reduce((sum, pair) => {
        const pairAvgTxSize = pair.volume?.h24 && pair.txns?.h24 
          ? pair.volume.h24 / ((pair.txns.h24.buys || 0) + (pair.txns.h24.sells || 0))
          : 0;
        
        if (pairAvgTxSize > whaleThreshold) {
          return sum + (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
        }
        return sum;
      }, 0);

      // Group by exchange (dexId)
      const exchangeVolumes = new Map<string, number>();
      const exchangeLiquidity = new Map<string, number>();

      pairs.forEach(pair => {
        const dexId = pair.dexId || 'unknown';
        const volume = pair.volume?.h24 || 0;
        const liquidity = pair.liquidity?.usd || 0;

        exchangeVolumes.set(dexId, (exchangeVolumes.get(dexId) || 0) + volume);
        exchangeLiquidity.set(dexId, (exchangeLiquidity.get(dexId) || 0) + liquidity);
      });

      // Top exchanges by volume
      const topExchanges = Array.from(exchangeVolumes.entries())
        .map(([name, volume]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          volume,
          percentage: totalVolume24h > 0 ? (volume / totalVolume24h) * 100 : 0
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      // Liquidity distribution
      const totalLiquidity = Array.from(exchangeLiquidity.values()).reduce((sum, liq) => sum + liq, 0);
      const liquidityDistribution = Array.from(exchangeLiquidity.entries())
        .map(([exchange, liquidity]) => ({
          exchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
          liquidity,
          percentage: totalLiquidity > 0 ? (liquidity / totalLiquidity) * 100 : 0
        }))
        .sort((a, b) => b.liquidity - a.liquidity)
        .slice(0, 5);

      return {
        totalVolume24h,
        largeTransactions,
        averageTransactionSize,
        topExchanges,
        liquidityDistribution
      };

    } catch (error) {
      console.error('Error analyzing whale activity:', error);
      return {
        totalVolume24h: 0,
        largeTransactions: 0,
        averageTransactionSize: 0,
        topExchanges: [],
        liquidityDistribution: []
      };
    }
  },

  /**
   * Get top BONK pairs by volume
   */
  getTopPairsByVolume: (pairs: DexPair[], limit = 5): DexPair[] => {
    return pairs
      .filter(pair => pair.volume?.h24 > 0)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, limit);
  },

  /**
   * Get pairs with highest liquidity
   */
  getTopPairsByLiquidity: (pairs: DexPair[], limit = 5): DexPair[] => {
    return pairs
      .filter(pair => pair.liquidity?.usd > 0)
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
      .slice(0, limit);
  },

  /**
   * Calculate total liquidity across all pairs
   */
  calculateTotalLiquidity: (pairs: DexPair[]): number => {
    return pairs.reduce((sum, pair) => sum + (pair.liquidity?.usd || 0), 0);
  },

  /**
   * Get price impact estimation for large trades
   */
  estimatePriceImpact: (pair: DexPair, tradeSize: number): number => {
    try {
      if (!pair.liquidity?.usd || pair.liquidity.usd === 0) {
        return 0;
      }

      // Simple price impact estimation: trade size / liquidity
      // This is a rough approximation
      const impact = (tradeSize / pair.liquidity.usd) * 100;
      
      // Cap at reasonable maximum
      return Math.min(impact, 50);
    } catch (error) {
      console.error('Error estimating price impact:', error);
      return 0;
    }
  }
};

export type { DexPair, DexScreenerResponse, WhaleActivity };
