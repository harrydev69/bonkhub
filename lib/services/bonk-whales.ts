import fs from 'fs';
import path from 'path';

export interface BonkWhale {
  rank: number;
  address: string;
  tokenAccount: string;
  bonkBalance: number;
  percentage: number;
  usdValue: number;
  category: string;
  shortAddress: string;
}

class BonkWhaleService {
  private whales: BonkWhale[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadWhaleData();
      this.initialized = true;
      console.log(`🐋 BONK Whale Service initialized with ${this.whales.length} whales`);
    } catch (error) {
      console.warn('⚠️  Failed to initialize BONK whale service:', error);
      this.initialized = true;
    }
  }

  private async loadWhaleData() {
    const csvPath = path.join(process.cwd(), 'export_token_holders_DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263_1756549860283.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('📁 BONK holders CSV not found');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header: Account,Token Account,Quantity,Percentage
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const [account, tokenAccount, quantity, percentage] = this.parseCSVLine(line);
        
        if (account && tokenAccount && quantity && percentage) {
          const bonkBalance = parseFloat(quantity.replace(/,/g, ''));
          const pct = parseFloat(percentage);
          const currentBonkPrice = 0.00002179; // Current BONK price
          const usdValue = bonkBalance * currentBonkPrice;
          
          const whale: BonkWhale = {
            rank: i, // CSV is already sorted by holdings
            address: account.trim(),
            tokenAccount: tokenAccount.trim(),
            bonkBalance: bonkBalance,
            percentage: pct,
            usdValue: usdValue,
            category: this.getWhaleCategory(usdValue),
            shortAddress: `${account.slice(0, 6)}...${account.slice(-4)}`
          };
          
          this.whales.push(whale);
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }
    
    console.log(`✅ Loaded ${this.whales.length} BONK whales from CSV`);
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

  private getWhaleCategory(usdValue: number): string {
    if (usdValue >= 10000000) return 'Ultra Whale';     // $10M+
    if (usdValue >= 1000000) return 'Mega Whale';       // $1M+
    if (usdValue >= 500000) return 'Super Whale';       // $500K+
    if (usdValue >= 250000) return 'Whale';             // $250K+
    if (usdValue >= 100000) return 'Large Holder';      // $100K+
    if (usdValue >= 50000) return 'Big Holder';         // $50K+
    return 'Holder';                                     // Below $50K
  }

  // Get all whales
  getAllWhales(): BonkWhale[] {
    return this.whales;
  }

  // Get top N whales
  getTopWhales(limit: number = 100): BonkWhale[] {
    return this.whales.slice(0, limit);
  }

  // Get whales by category
  getWhalesByCategory(category: string): BonkWhale[] {
    return this.whales.filter(whale => whale.category === category);
  }

  // Get whale by address
  getWhaleByAddress(address: string): BonkWhale | undefined {
    return this.whales.find(whale => whale.address === address);
  }

  // Get whales above threshold
  getWhalesAboveThreshold(usdThreshold: number): BonkWhale[] {
    return this.whales.filter(whale => whale.usdValue >= usdThreshold);
  }

  // Get whale stats
  getWhaleStats() {
    const categories = ['Ultra Whale', 'Mega Whale', 'Super Whale', 'Whale', 'Large Holder', 'Big Holder', 'Holder'];
    const stats = categories.map(category => ({
      category,
      count: this.whales.filter(w => w.category === category).length,
      totalValue: this.whales.filter(w => w.category === category).reduce((sum, w) => sum + w.usdValue, 0)
    }));

    return {
      totalWhales: this.whales.length,
      totalValue: this.whales.reduce((sum, w) => sum + w.usdValue, 0),
      averageHolding: this.whales.length > 0 ? this.whales.reduce((sum, w) => sum + w.usdValue, 0) / this.whales.length : 0,
      categoriesBreakdown: stats
    };
  }
}

// Singleton instance
export const bonkWhaleService = new BonkWhaleService();

// Helper functions
export async function getTopBonkWhales(limit: number = 100): Promise<BonkWhale[]> {
  await bonkWhaleService.initialize();
  return bonkWhaleService.getTopWhales(limit);
}

export async function getBonkWhaleByAddress(address: string): Promise<BonkWhale | undefined> {
  await bonkWhaleService.initialize();
  return bonkWhaleService.getWhaleByAddress(address);
}

export async function getBonkWhaleStats() {
  await bonkWhaleService.initialize();
  return bonkWhaleService.getWhaleStats();
}
