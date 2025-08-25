const HOLDERSCAN_BASE_URL = 'https://api.holderscan.com/v0';
const HOLDERSCAN_API_KEY = process.env.HOLDERSCAN_API_KEY;

if (!HOLDERSCAN_API_KEY) {
  throw new Error('HOLDERSCAN_API_KEY is required in environment variables');
}

interface HolderDeltas {
  '1hour': number;
  '2hours': number;
  '4hours': number;
  '12hours': number;
  '1day': number;
  '3days': number;
  '7days': number;
  '14days': number;
  '30days': number;
}

interface HolderBreakdowns {
  total_holders: number;
  holders_over_10_usd: number;
  holders_over_100_usd: number;
  holders_over_1000_usd: number;
  holders_over_10000_usd: number;
  holders_over_100k_usd: number;
  holders_over_1m_usd: number;
  categories: {
    shrimp: number;
    crab: number;
    fish: number;
    dolphin: number;
    whale: number;
  };
}

export const HolderScan = {
  // Get holder changes over different time periods
  getHolderDeltas: async (contractAddress: string): Promise<HolderDeltas> => {
    const response = await fetch(
      `${HOLDERSCAN_BASE_URL}/sol/tokens/${contractAddress}/holders/deltas`,
      {
        headers: {
          'x-api-key': HOLDERSCAN_API_KEY,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`HolderScan API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Get holder statistics categorized by holding value
  getHolderBreakdowns: async (contractAddress: string): Promise<HolderBreakdowns> => {
    const response = await fetch(
      `${HOLDERSCAN_BASE_URL}/sol/tokens/${contractAddress}/holders/breakdowns`,
      {
        headers: {
          'x-api-key': HOLDERSCAN_API_KEY,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`HolderScan API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};
