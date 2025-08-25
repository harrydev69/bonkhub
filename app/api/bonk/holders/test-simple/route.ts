import { NextResponse } from 'next/server'

const HOLDERSCAN_API_KEY = '1c90892932f60e18e09f13d3a84b485ea87304f6443b503f1c8601820582d3d1'
const BASE_URL = 'https://api.holderscan.com/v0'
const BONK_TOKEN_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'

export async function GET() {
  try {
    console.log('🧪 Testing simple API connection...')
    
    // Test the most basic endpoint
    const testUrl = `${BASE_URL}/sol/tokens/${BONK_TOKEN_ADDRESS}/holders/breakdowns`
    console.log(`🌐 Testing URL: ${testUrl}`)
    
    const response = await fetch(testUrl, {
      headers: {
        'x-api-key': HOLDERSCAN_API_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })
    
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Success! Data:`, data)
      return NextResponse.json({
        success: true,
        status: response.status,
        data: data,
        message: 'API connection successful'
      })
    } else {
      const errorText = await response.text()
      console.log(`❌ Error response:`, errorText)
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        message: `API call failed with status ${response.status}`
      }, { status: response.status })
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test failed'
    }, { status: 500 })
  }
}
