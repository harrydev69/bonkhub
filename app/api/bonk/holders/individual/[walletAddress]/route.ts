import { NextResponse } from 'next/server'
import { fetchIndividualHolderStats } from '@/lib/services/holderscan'

export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params
    
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 })
    }

    console.log(`🔍 Fetching individual stats for wallet: ${walletAddress}`)
    
    const response = await fetchIndividualHolderStats(walletAddress)
    
    if (response.error) {
      console.error(`❌ Failed to fetch individual stats for ${walletAddress}:`, response.error)
      return NextResponse.json({
        success: false,
        error: response.error
      }, { status: 500 })
    }

    console.log(`✅ Individual stats fetched successfully for ${walletAddress}`)
    
    return NextResponse.json({
      success: true,
      data: response.data
    })
    
  } catch (error) {
    console.error('❌ Error in individual holder stats API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
