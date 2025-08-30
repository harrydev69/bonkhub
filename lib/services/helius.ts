/**
 * Helius API Service for Solana Blockchain Data
 * Real-time whale tracking and transaction monitoring
 */

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || '';
const BONK_MINT = process.env.BONK_MINT || 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

// Real whale thresholds for BONK
const WHALE_THRESHOLD = 100000000000; // 100 billion BONK (~$2.2M USD)
const LARGE_HOLDER_THRESHOLD = 10000000000; // 10 billion BONK (~$220K USD)
const MEDIUM_WHALE_THRESHOLD = 1000000000; // 1 billion BONK (~$22K USD)

interface SolanaTransaction {
  signature: string;
  slot: number;
  err: any;
  memo: string | null;
  blockTime: number;
}

interface TransactionDetails {
  blockTime: number;
  meta: {
    err: any;
    fee: number;
    innerInstructions: any[];
    logMessages: string[];
    postBalances: number[];
    postTokenBalances: any[];
    preBalances: number[];
    preTokenBalances: any[];
  };
  transaction: {
    message: {
      accountKeys: string[];
      instructions: any[];
    };
    signatures: string[];
  };
}

interface WhaleTransaction {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
  to: string;
  type: 'buy' | 'sell' | 'transfer';
  usdValue: number;
  priceImpact: number;
  exchange?: string;
}

export const Helius = {
  /**
   * Get recent transactions for BONK token
   */
  getBONKTransactions: async (limit = 100): Promise<SolanaTransaction[]> => {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [
            BONK_MINT,
            { limit }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(`Helius RPC error: ${data.error.message}`);
      }

      return data.result || [];
    } catch (error) {
      console.error('Error fetching BONK transactions:', error);
      throw error;
    }
  },

  /**
   * Get detailed transaction information
   */
  getTransaction: async (signature: string): Promise<TransactionDetails | null> => {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            signature, 
            { 
              encoding: 'json', 
              maxSupportedTransactionVersion: 0,
              commitment: 'confirmed'
            }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        console.warn(`Transaction ${signature} error:`, data.error.message);
        return null;
      }

      return data.result;
    } catch (error) {
      console.error(`Error fetching transaction ${signature}:`, error);
      return null;
    }
  },

  /**
   * Get token accounts for a wallet address
   */
  getTokenAccounts: async (walletAddress: string) => {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            { mint: BONK_MINT },
            { encoding: 'jsonParsed' }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        console.warn(`Token accounts error for ${walletAddress}:`, data.error.message);
        return { result: { value: [] } };
      }

      return data.result;
    } catch (error) {
      console.error(`Error fetching token accounts for ${walletAddress}:`, error);
      return { result: { value: [] } };
    }
  },

  /**
   * Get account information
   */
  getAccountInfo: async (address: string) => {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [
            address, 
            { encoding: 'json' }
          ]
        })
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching account info for ${address}:`, error);
      return null;
    }
  },

  /**
   * Parse transaction to extract BONK transfer information
   */
  parseWhaleTransaction: (txDetails: TransactionDetails, currentPrice: number = 0): WhaleTransaction | null => {
    try {
      if (!txDetails || !txDetails.meta || txDetails.meta.err) {
        return null;
      }

      // Look for token balance changes in BONK
      const preTokenBalances = txDetails.meta.preTokenBalances || [];
      const postTokenBalances = txDetails.meta.postTokenBalances || [];

      // Find BONK token transfers
      const bonkTransfers = [];
      
      for (const preBalance of preTokenBalances) {
        if (preBalance.mint === BONK_MINT) {
          const postBalance = postTokenBalances.find(
            (post) => post.accountIndex === preBalance.accountIndex
          );
          
          if (postBalance) {
            const amountChange = postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount;
            if (Math.abs(amountChange) > 0) {
              bonkTransfers.push({
                accountIndex: preBalance.accountIndex,
                owner: preBalance.owner,
                amount: Math.abs(amountChange),
                isIncoming: amountChange > 0
              });
            }
          }
        }
      }

      // Find the largest transfer (whale activity)
      const largestTransfer = bonkTransfers.reduce((max, transfer) => 
        transfer.amount > max.amount ? transfer : max, 
        { amount: 0, owner: '', isIncoming: false, accountIndex: 0 }
      );

      if (largestTransfer.amount < MEDIUM_WHALE_THRESHOLD) {
        return null; // Not a significant transaction
      }

      // Determine transaction type and addresses
      const accountKeys = txDetails.transaction.message.accountKeys;
      const fromAddress = accountKeys[0] || ''; // First signer is usually the initiator
      const toAddress = largestTransfer.owner || '';

      // Estimate transaction type based on context
      let transactionType: 'buy' | 'sell' | 'transfer' = 'transfer';
      
      // Check log messages for DEX activity
      const logMessages = txDetails.meta.logMessages || [];
      const hasSwapLogs = logMessages.some(log => 
        log.includes('swap') || log.includes('Swap') || 
        log.includes('raydium') || log.includes('orca')
      );

      if (hasSwapLogs) {
        transactionType = largestTransfer.isIncoming ? 'buy' : 'sell';
      }

      // Calculate USD value and price impact
      const usdValue = largestTransfer.amount * currentPrice;
      const priceImpact = Math.min(usdValue / 10000000, 10); // Rough estimate

      return {
        signature: txDetails.transaction.signatures[0],
        timestamp: txDetails.blockTime || Date.now() / 1000,
        amount: largestTransfer.amount,
        from: fromAddress,
        to: toAddress,
        type: transactionType,
        usdValue,
        priceImpact,
        exchange: hasSwapLogs ? 'DEX' : undefined
      };

    } catch (error) {
      console.error('Error parsing whale transaction:', error);
      return null;
    }
  },

  /**
   * Extract BONK balance from token accounts
   */
  extractBONKBalance: (tokenAccountsResult: any): number => {
    try {
      const accounts = tokenAccountsResult?.value || [];
      let totalBalance = 0;

      for (const account of accounts) {
        const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
        if (tokenAmount && tokenAmount.mint === BONK_MINT) {
          totalBalance += tokenAmount.uiAmount || 0;
        }
      }

      return totalBalance;
    } catch (error) {
      console.error('Error extracting BONK balance:', error);
      return 0;
    }
  }
};

export { WHALE_THRESHOLD, LARGE_HOLDER_THRESHOLD, MEDIUM_WHALE_THRESHOLD };
export type { WhaleTransaction, SolanaTransaction, TransactionDetails };
