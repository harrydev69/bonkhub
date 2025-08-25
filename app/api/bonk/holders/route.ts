import { NextResponse } from 'next/server';
import { fetchComprehensiveHoldersData, RateLimiter, testApiConnection } from '@/lib/services/holderscan';

// Initialize rate limiter
const rateLimiter = new RateLimiter();

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔄 Holders API route called');
    
    // Check rate limit
    if (!(await rateLimiter.checkRateLimit())) {
      console.log('⚠️ Rate limit exceeded');
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          remainingRequests: rateLimiter.getRemainingRequests(),
          timeUntilReset: rateLimiter.getTimeUntilReset()
        },
        { status: 429 }
      );
    }

    // Test API connection first
    console.log('🔍 Testing Holderscan API connection...');
    const isConnected = await testApiConnection();
    
    if (!isConnected) {
      console.log('❌ Holderscan API connection failed');
      return NextResponse.json(
        { 
          error: 'Unable to connect to Holderscan API. Please check your internet connection and API key.',
          suggestion: 'Try refreshing the page or check if the Holderscan service is available.'
        },
        { status: 503 }
      );
    }

    console.log('✅ Holderscan API connection successful, fetching data...');

    // Fetch data from Holderscan API
    const response = await fetchComprehensiveHoldersData();
    
    if (response.error) {
      console.error('❌ Holderscan API error:', response.error);
      return NextResponse.json(
        { 
          error: response.error,
          suggestion: 'The API request failed. This might be due to network issues or API service problems.'
        },
        { status: 500 }
      );
    }

    if (!response.data) {
      console.error('❌ No data received from Holderscan API');
      return NextResponse.json(
        { 
          error: 'No data received from Holderscan API',
          suggestion: 'The API returned an empty response. Please try again later.'
        },
        { status: 500 }
      );
    }

    console.log('✅ Successfully fetched comprehensive holders data');
    
    // Return the comprehensive data
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('❌ Error in holders API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please try again later or contact support if the problem persists.'
      },
      { status: 500 }
    );
  }
}
