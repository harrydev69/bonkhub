import { NextResponse } from 'next/server';
import { getTokenInfo } from '@/lib/services/token-registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const HELIUS_API_KEY = '580abc5a-076c-45c9-bf91-a230d62aaea6';
    
    // Test with the #1 whale from our CSV
    const testWhale = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    
    console.log(`🧪 Testing whale: ${testWhale}`);
    
    // Get recent transactions
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${testWhale}/transactions?api-key=${HELIUS_API_KEY}&limit=10`);
    
    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }
    
    const transactions = await response.json();
    console.log(`📊 Found ${transactions.length} transactions`);
    
    const results = [];
    
    for (const tx of transactions.slice(0, 5)) {
      console.log(`🔍 Checking transaction: ${tx.signature}`);
      
      try {
        // Get detailed transaction info
        const detailResponse = await fetch(`https://api.helius.xyz/v0/transactions/${tx.signature}?api-key=${HELIUS_API_KEY}`);
        
        if (!detailResponse.ok) {
          console.log(`❌ Failed to get details for ${tx.signature}`);
          continue;
        }
        
        const detailData = await detailResponse.json();
        const tokenTransfers = detailData.tokenTransfers || [];
        const nativeTransfers = detailData.nativeTransfers || [];
        
        console.log(`  📋 ${tokenTransfers.length} token transfers, ${nativeTransfers.length} native transfers found`);
        console.log(`  📋 Transaction type: ${detailData.type || 'unknown'}`);
        
        // Check token transfers
        for (const transfer of tokenTransfers) {
          const tokenInfo = await getTokenInfo(transfer.mint);
          console.log(`  🪙 ${transfer.tokenAmount} ${tokenInfo.symbol} (${transfer.mint.slice(0, 8)}...)`);
          
          results.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            token: tokenInfo.symbol,
            amount: transfer.tokenAmount,
            mint: transfer.mint,
            from: transfer.fromUserAccount,
            to: transfer.toUserAccount,
            isReceived: transfer.toUserAccount === testWhale,
            type: 'token'
          });
        }
        
        // Also check native SOL transfers
        for (const transfer of nativeTransfers) {
          console.log(`  💰 ${transfer.amount / 1000000000} SOL transfer`);
          
          results.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            token: 'SOL',
            amount: transfer.amount / 1000000000, // Convert lamports to SOL
            mint: 'So11111111111111111111111111111111111111112',
            from: transfer.fromUserAccount,
            to: transfer.toUserAccount,
            isReceived: transfer.toUserAccount === testWhale,
            type: 'native'
          });
        }
      } catch (error) {
        console.log(`❌ Error processing ${tx.signature}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      testWhale: testWhale,
      totalTransactions: transactions.length,
      processedTransactions: results.length,
      results: results
    });
    
  } catch (error: any) {
    console.error('❌ Test whale error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
