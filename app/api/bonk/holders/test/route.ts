import { NextResponse } from 'next/server';
import { testApiConnection } from '@/lib/services/holderscan';

export async function GET() {
  try {
    console.log('🧪 Holders API test endpoint called');
    
    // Test API connection
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'success',
        message: 'Holderscan API connection successful',
        timestamp: new Date().toISOString(),
        apiKey: 'valid',
        connectivity: 'connected'
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Holderscan API connection failed',
        timestamp: new Date().toISOString(),
        apiKey: 'unknown',
        connectivity: 'disconnected',
        suggestion: 'Check your API key and internet connection'
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('❌ Error in test endpoint:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
