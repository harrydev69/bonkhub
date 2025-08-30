/**
 * Test script for whale tracking system
 * Run with: node scripts/test-whale-tracking.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testWhaleAPI() {
  console.log('🐋 Testing Whale Tracking API...\n');
  
  try {
    console.log('📡 Calling /api/bonk/whales...');
    const response = await fetch(`${BASE_URL}/api/bonk/whales`);
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ API Response Success!');
      console.log(`🐋 Whale Transactions: ${data.data.whaleTransactions.length}`);
      console.log(`👛 Whale Wallets: ${data.data.whaleWallets.length}`);
      console.log(`💰 Current BONK Price: $${data.data.marketData.price}`);
      console.log(`📈 Market Cap: $${(data.data.marketData.marketCap / 1e6).toFixed(2)}M`);
      console.log(`🏪 Trading Pairs: ${data.data.dexData.totalPairs}`);
      console.log(`💧 Total Liquidity: $${(data.data.dexData.totalLiquidity / 1e6).toFixed(2)}M`);
      
      console.log('\n🔍 Analytics:');
      console.log(`  • Total Whale Volume: $${(data.data.analytics.totalWhaleVolume / 1e6).toFixed(2)}M`);
      console.log(`  • Average Transaction: $${(data.data.analytics.averageWhaleTransaction / 1e3).toFixed(2)}K`);
      console.log(`  • Accumulation Phase: ${data.data.analytics.accumulationPhase ? 'Yes' : 'No'}`);
      console.log(`  • Active Whales: ${data.data.analytics.activeWhales24h}`);
      
      if (data.data.whaleTransactions.length > 0) {
        console.log('\n🔥 Latest Whale Transaction:');
        const latest = data.data.whaleTransactions[0];
        console.log(`  • Type: ${latest.type}`);
        console.log(`  • Amount: ${(latest.amount / 1e9).toFixed(2)}B BONK`);
        console.log(`  • USD Value: $${(latest.usdValue / 1e3).toFixed(2)}K`);
        console.log(`  • From: ${latest.from.slice(0, 8)}...${latest.from.slice(-6)}`);
        console.log(`  • Signature: ${latest.signature.slice(0, 16)}...`);
      }
      
      console.log(`\n📅 Data Source: ${data.data.metadata.dataSource}`);
      console.log(`🕒 Last Updated: ${new Date(data.data.metadata.lastUpdated).toLocaleString()}`);
      
    } else {
      console.log('\n❌ API Response Failed:');
      console.log(`Error: ${data.error}`);
      console.log(`Message: ${data.message}`);
    }
    
  } catch (error) {
    console.error('\n💥 Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function testServices() {
  console.log('\n🔧 Testing Individual Services...\n');
  
  // Test environment variables
  console.log('🔑 Environment Check:');
  console.log(`  • HELIUS_API_KEY: ${process.env.HELIUS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  • SOLANA_RPC_URL: ${process.env.SOLANA_RPC_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  • BONK_MINT: ${process.env.BONK_MINT ? '✅ Set' : '❌ Missing'}`);
  console.log(`  • COINGECKO_API_KEY: ${process.env.COINGECKO_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  • DEXSCREENER_BASE: ${process.env.DEXSCREENER_BASE ? '✅ Set' : '❌ Missing'}`);
}

async function main() {
  console.log('🚀 Starting Whale Tracking System Test\n');
  console.log('=' .repeat(50));
  
  await testServices();
  await testWhaleAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Test Complete!');
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWhaleAPI, testServices };
