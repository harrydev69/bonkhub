import fs from 'fs';
import path from 'path';

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals?: number;
  logoURI?: string;
  tags?: string[];
}

class TokenRegistry {
  private tokens: Map<string, TokenInfo> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Load from CSV file
      await this.loadFromCSV();
      
      // Add fallback known tokens
      this.addKnownTokens();
      
      this.initialized = true;
      console.log(`🪙 Token Registry initialized with ${this.tokens.size} tokens`);
    } catch (error) {
      console.warn('⚠️  Failed to initialize token registry:', error);
      // Still add known tokens as fallback
      this.addKnownTokens();
      this.initialized = true;
    }
  }

  private async loadFromCSV() {
    // Note: The current CSV is BONK holders, not a token list
    // We'll load comprehensive Solana token data from Jupiter's token list
    await this.loadJupiterTokenList();
  }

  private async loadJupiterTokenList() {
    try {
      console.log('🚀 Loading Jupiter token list...');
      
      // Jupiter's comprehensive Solana token list
      const response = await fetch('https://token.jup.ag/all');
      const tokens = await response.json();
      
      console.log(`📊 Found ${tokens.length} tokens from Jupiter`);
      
      tokens.forEach((token: any) => {
        if (token.address && token.symbol && token.name) {
          const tokenInfo: TokenInfo = {
            mint: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals || 9,
            logoURI: token.logoURI,
            tags: token.tags || []
          };
          
          this.tokens.set(token.address, tokenInfo);
        }
      });
      
      console.log(`✅ Loaded ${this.tokens.size} tokens from Jupiter API`);
    } catch (error) {
      console.warn('⚠️  Failed to load Jupiter token list:', error);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, ''));
  }

  private addKnownTokens() {
    const knownTokens: TokenInfo[] = [
      { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', decimals: 9 },
      { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade SOL', decimals: 9 },
      { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY', name: 'Raydium', decimals: 6 },
      { mint: 'ARCoQ9dndpg6wE2rRexzfwgJR3NoWWhpcww3xQcQLukg', symbol: 'ARK', name: 'Ark', decimals: 9 },
      { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', decimals: 5 },
      { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', name: 'Jupiter', decimals: 6 },
      { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF', name: 'Dogwifhat', decimals: 6 },
      { mint: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux', symbol: 'HNT', name: 'Helium', decimals: 8 },
      { mint: 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', symbol: 'bSOL', name: 'BlazeStake SOL', decimals: 9 },
      { mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', symbol: 'ETHER', name: 'Wormhole Ethereum', decimals: 8 },
      { mint: 'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM', symbol: 'USDCet', name: 'USD Coin (Wormhole)', decimals: 6 },
      { mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', symbol: 'SRM', name: 'Serum', decimals: 6 },
      { mint: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6', symbol: 'KIN', name: 'Kin', decimals: 5 }
    ];

    knownTokens.forEach(token => {
      this.tokens.set(token.mint, token);
    });
  }

  getToken(mint: string): TokenInfo {
    if (!this.initialized) {
      // Return basic fallback
      return {
        mint,
        symbol: mint.slice(0, 8) + '...',
        name: 'Unknown Token'
      };
    }

    return this.tokens.get(mint) || {
      mint,
      symbol: mint.slice(0, 8) + '...',
      name: 'Unknown Token'
    };
  }

  getAllTokens(): TokenInfo[] {
    return Array.from(this.tokens.values());
  }

  getTokenCount(): number {
    return this.tokens.size;
  }

  // Search tokens by symbol or name
  searchTokens(query: string): TokenInfo[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tokens.values()).filter(token =>
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
    );
  }
}

// Singleton instance
export const tokenRegistry = new TokenRegistry();

// Helper function for easy access
export async function getTokenInfo(mint: string): Promise<TokenInfo> {
  await tokenRegistry.initialize();
  return tokenRegistry.getToken(mint);
}

export async function searchTokens(query: string): Promise<TokenInfo[]> {
  await tokenRegistry.initialize();
  return tokenRegistry.searchTokens(query);
}
