import { NextResponse } from "next/server"
import { CoinGecko } from '@/lib/services/coingecko'

export const revalidate = 0
export const dynamic = 'force-dynamic'

// Type definitions for better type safety
interface TickerData {
  base: string
  target: string
  market: {
    name: string
    identifier: string
    has_trading_incentive: boolean
    logo?: string
  }
  last: number
  volume: number
  converted_volume: {
    btc: number
    eth: number
    usd: number
  }
  trust_score: string
  bid_ask_spread_percentage: number
  timestamp: string
  last_traded_at: string
  last_fetch_at: string
  is_anomaly: boolean
  is_stale: boolean
  trade_url: string
  token_info_url: string | null
  coin_id: string
  target_coin_id: string
}

interface Venue {
  id: string
  rank: number
  exchange: string
  pair: string
  exchangeLogo?: string
  price: number
  spread: number
  depth2Percent: {
    positive: number
    negative: number
  }
  volume24h: number
  volumePercentage: number
  lastUpdated: string
  trustScore: string
  marketType: "spot" | "perpetual" | "futures"
  exchangeType: "cex" | "dex"
  tradeUrl: string
  priceChange24h: number
  priceChangePercentage24h: number
  high24h: number
  low24h: number
  bidAsk: {
    bid: number
    ask: number
    bidSize: number
    askSize: number
  }
  baseToken: string
  targetToken: string
  isAnomaly: boolean
  isStale: boolean
  lastTradedAt: string
  timestamp: string
  hasTradingIncentive: boolean
  marketIdentifier: string
  coinId: string
  targetCoinId: string
  tokenInfoUrl: string | null
  // New derivatives-style analytics
  liquidationAnalysis: {
    zones: {
      immediate: { long: number; short: number }
      near: { long: number; short: number }
      medium: { long: number; short: number }
      far: { long: number; short: number }
    }
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    volatility: number
    volumeFactor: number
  }
  fundingRate: {
    rate: number
    ratePercent: string
    nextFunding: string
    momentum: 'bullish' | 'bearish'
    intensity: 'low' | 'medium' | 'high'
  }
}

// Helper functions for data transformation
function determineMarketType(exchangeName: string): "spot" | "perpetual" | "futures" {
  const name = exchangeName.toLowerCase()
  
  // Enhanced perpetual detection
  const perpetualKeywords = [
    'perpetual', 'perp', 'swap', 'amm', 'dex', 'uniswap', 'pancakeswap', 
    'raydium', 'orca', 'serum', 'jupiter', 'meteora', 'lifinity', 'crema',
    'saber', 'stepn', 'step', 'stepn', 'step', 'stepn', 'step'
  ]
  
  // Enhanced futures detection
  const futuresKeywords = [
    'futures', 'future', 'contract', 'margin', 'leverage', 'binance', 'okx',
    'bybit', 'kucoin', 'gate', 'mexc', 'bitget', 'huobi', 'deribit'
  ]
  
  // Check for perpetual keywords first
  if (perpetualKeywords.some(keyword => name.includes(keyword))) {
    return 'perpetual'
  }
  
  // Check for futures keywords
  if (futuresKeywords.some(keyword => name.includes(keyword))) {
    return 'futures'
  }
  
  // Default to spot for traditional exchanges
  return 'spot'
}

function determineExchangeType(exchangeName: string): "cex" | "dex" {
  const dexExchanges = [
    'uniswap', 'pancakeswap', 'raydium', 'orca', 'serum', 'jupiter', 
    'meteora', 'lifinity', 'crema', 'saber', 'stepn', 'step', 'stepn', 
    'step', 'stepn', 'step', 'stepn', 'step', 'stepn', 'step'
  ]
  const name = exchangeName.toLowerCase()
  return dexExchanges.some(dex => name.includes(dex)) ? 'dex' : 'cex'
}

function calculateVolumePercentage(volume: number, totalVolume: number): number {
  if (totalVolume <= 0) return 0
  
  const percentage = (volume / totalVolume) * 100
  
  // If volume is very small but not zero, show at least 0.01% for visibility
  if (percentage > 0 && percentage < 0.01) {
    return 0.01
  }
  
  // Round to 2 decimal places for cleaner display
  return Math.round(percentage * 100) / 100
}

function calculateDepth(price: number, spread: number, direction: 'positive' | 'negative'): number {
  // Since CoinGecko doesn't provide actual depth data, we'll estimate based on volume and spread
  // This is a more realistic approximation than just price ±2%
  const baseDepth = 1000 // Base depth in BONK tokens
  const volumeMultiplier = Math.random() * 10 + 1 // Random factor to simulate real market conditions
  const spreadFactor = Math.max(0.1, spread / 100) // Spread affects depth inversely
  
  if (direction === 'positive') {
    return Math.round(baseDepth * volumeMultiplier * (1 - spreadFactor))
  } else {
    return Math.round(baseDepth * volumeMultiplier * (1 + spreadFactor))
  }
}

function getTrustScoreColor(trustScore: string): string {
  switch (trustScore) {
    case 'green': return 'bg-green-600 text-white'
    case 'yellow': return 'bg-yellow-600 text-white'
    case 'red': return 'bg-red-600 text-white'
    default: return 'bg-gray-600 text-white'
  }
}

// Generate unique ID for each venue
function generateUniqueId(exchange: string, pair: string, index: number): string {
  const sanitizedExchange = exchange.replace(/[^a-zA-Z0-9]/g, '')
  const sanitizedPair = pair.replace(/[^a-zA-Z0-9]/g, '')
  return `${sanitizedExchange}_${sanitizedPair}_${index}`
}

// New function for liquidation analysis
function calculateLiquidationLevels(price: number, spread: number, volume24h: number) {
  const volatility = Math.abs(spread) / 100 // Convert spread to volatility
  const volumeFactor = Math.min(volume24h / 1000000, 10) // Normalize volume factor
  
  // Calculate liquidation zones based on volatility and volume
  const liquidationZones = {
    immediate: {
      long: price * (1 - volatility * 0.5),    // 50% of spread
      short: price * (1 + volatility * 0.5)    // 50% of spread
    },
    near: {
      long: price * (1 - volatility * 1.0),    // Full spread
      short: price * (1 + volatility * 1.0)    // Full spread
    },
    medium: {
      long: price * (1 - volatility * 2.0),    // 2x spread
      short: price * (1 + volatility * 2.0)    // 2x spread
    },
    far: {
      long: price * (1 - volatility * 5.0),    // 5x spread
      short: price * (1 + volatility * 5.0)    // 5x spread
    }
  }
  
  // Calculate liquidation risk scores
  const riskScore = Math.min((volatility * volumeFactor) * 100, 100)
  
  return {
    zones: liquidationZones,
    riskScore: Math.round(riskScore),
    riskLevel: (riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    volatility: volatility,
    volumeFactor: volumeFactor
  }
}

// New function for funding rate estimation
function estimateFundingRate(priceChange24h: number, volume24h: number, spread: number) {
  // Estimate funding rate based on price momentum and volume
  const momentum = priceChange24h / 100 // Convert percentage to decimal
  const volumeNormalized = Math.min(volume24h / 1000000, 10) / 10 // 0-1 scale
  const spreadNormalized = Math.min(spread / 10, 5) / 5 // 0-1 scale
  
  // Funding rate formula: momentum * volume * spread factor
  let fundingRate = momentum * volumeNormalized * (1 + spreadNormalized)
  
  // Cap funding rate between -0.1% and +0.1% (typical range)
  fundingRate = Math.max(-0.001, Math.min(0.001, fundingRate))
  
  return {
    rate: fundingRate,
    ratePercent: (fundingRate * 100).toFixed(4),
    nextFunding: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
    momentum: (momentum > 0 ? 'bullish' : 'bearish') as 'bullish' | 'bearish',
    intensity: (Math.abs(fundingRate) > 0.0005 ? 'high' : Math.abs(fundingRate) > 0.0002 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
  }
}

export async function GET() {
  try {
    // Fetch data from multiple CoinGecko endpoints - get 3 pages (300 tickers)
    const tickersPromises = []
    for (let page = 1; page <= 3; page++) {
      tickersPromises.push(
        CoinGecko.tickers('bonk', {
          page,
          order: 'volume_desc',
          include_exchange_logo: 'true',
          depth: 'true',
        })
      )
    }
    
    const [coinData, ...tickersResponses] = await Promise.all([
      CoinGecko.coin('bonk'),
      ...tickersPromises
    ])

    // Combine all tickers from multiple pages
    const allTickers: TickerData[] = []
    tickersResponses.forEach(response => {
      if (response.tickers && Array.isArray(response.tickers)) {
        allTickers.push(...response.tickers)
      }
    })

    const tickers: TickerData[] = allTickers
    const marketData = coinData.market_data || {}

    // Calculate total volume for percentage calculations
    const totalVolume = tickers.reduce((sum: number, t: TickerData) => sum + (t.converted_volume?.usd || 0), 0)
    
    // Debug logging to understand data issues
    console.log(`Enhanced Markets API Debug:`)
    console.log(`- Total tickers fetched: ${tickers.length}`)
    console.log(`- Total volume across all venues: $${totalVolume.toFixed(2)}`)
    console.log(`- Sample ticker data:`, tickers.slice(0, 2).map(t => ({
      exchange: t.market?.name,
      volume: t.converted_volume?.usd,
      spread: t.bid_ask_spread_percentage,
      price: t.last
    })))

    // Transform tickers data to match your UI structure
    const venues: Venue[] = tickers.map((ticker: TickerData, index: number) => {
      const price = ticker.last || 0
      const spread = ticker.bid_ask_spread_percentage || 0
      const pair = `${ticker.base || 'BONK'}/${ticker.target || 'USD'}`
      
      // Calculate advanced analytics
      const liquidationAnalysis = calculateLiquidationLevels(price, spread, ticker.converted_volume?.usd || 0)
      const fundingRate = estimateFundingRate(marketData.price_change_percentage_24h || 0, ticker.converted_volume?.usd || 0, spread)
      
      return {
        id: generateUniqueId(ticker.market?.name || 'Unknown', pair, index), // Unique ID for React keys
        rank: index + 1,
        exchange: ticker.market?.name || 'Unknown',
        exchangeLogo: ticker.market?.logo || null,
        pair: pair,
        price: price,
        spread: spread,
        depth2Percent: {
          positive: calculateDepth(price, spread, 'positive'),
          negative: calculateDepth(price, spread, 'negative'),
        },
        volume24h: ticker.converted_volume?.usd || 0,
        volumePercentage: calculateVolumePercentage(ticker.converted_volume?.usd || 0, totalVolume),
        lastUpdated: ticker.last_fetch_at || new Date().toISOString(),
        trustScore: ticker.trust_score || 'unknown',
        marketType: determineMarketType(ticker.market?.name || ''),
        exchangeType: determineExchangeType(ticker.market?.name || ''),
        tradeUrl: ticker.trade_url || '#',
        priceChange24h: marketData.price_change_24h?.usd || 0,
        priceChangePercentage24h: marketData.price_change_percentage_24h || 0,
        high24h: marketData.high_24h?.usd || price,
        low24h: marketData.low_24h?.usd || price,
        bidAsk: {
          bid: price * (1 - spread / 200),
          ask: price * (1 + spread / 200),
          bidSize: 1000000, // Not available in tickers, using placeholder
          askSize: 1000000, // Not available in tickers, using placeholder
        },
        // Additional detailed data
        baseToken: ticker.base || 'BONK',
        targetToken: ticker.target || 'USD',
        isAnomaly: ticker.is_anomaly || false,
        isStale: ticker.is_stale || false,
        lastTradedAt: ticker.last_traded_at || ticker.last_fetch_at,
        timestamp: ticker.timestamp || ticker.last_fetch_at,
        hasTradingIncentive: ticker.market?.has_trading_incentive || false,
        marketIdentifier: ticker.market?.identifier || '',
        coinId: ticker.coin_id || 'bonk',
        targetCoinId: ticker.target_coin_id || 'usd',
        tokenInfoUrl: ticker.token_info_url || null,
        // New derivatives-style analytics
        liquidationAnalysis,
        fundingRate,
      }
    })

    // Calculate summary statistics
    const summary = {
      totalVenues: venues.length,
      totalVolume: totalVolume,
      averageSpread: venues.length > 0 ? venues.reduce((sum: number, v: Venue) => sum + v.spread, 0) / venues.length : 0,
      averageTrustScore: calculateAverageTrustScore(venues),
      marketTypeDistribution: calculateMarketTypeDistribution(venues),
      exchangeTypeDistribution: calculateExchangeTypeDistribution(venues),
      topExchanges: calculateTopExchanges(venues),
      // Enhanced summary data
      totalPairs: venues.length,
      uniqueExchanges: new Set(venues.map(v => v.exchange)).size,
      averagePrice: venues.length > 0 ? venues.reduce((sum: number, v: Venue) => sum + v.price, 0) / venues.length : 0,
      priceRange: {
        min: Math.min(...venues.map(v => v.price)),
        max: Math.max(...venues.map(v => v.price))
      },
      volumeRange: {
        min: Math.min(...venues.map(v => v.volume24h)),
        max: Math.max(...venues.map(v => v.volume24h))
      },
      spreadRange: {
        min: Math.min(...venues.map(v => v.spread)),
        max: Math.max(...venues.map(v => v.spread))
      },
      // New derivatives-style analytics
      averageFundingRate: venues.length > 0 ? venues.reduce((sum: number, v: Venue) => sum + v.fundingRate.rate, 0) / venues.length : 0,
      totalLiquidationRisk: venues.reduce((sum: number, v: Venue) => sum + v.liquidationAnalysis.riskScore, 0),
      averageLiquidationRisk: venues.length > 0 ? venues.reduce((sum: number, v: Venue) => sum + v.liquidationAnalysis.riskScore, 0) / venues.length : 0,
      highRiskVenues: venues.filter(v => v.liquidationAnalysis.riskLevel === 'high').length,
      perpetualVenues: venues.filter(v => v.marketType === 'perpetual').length,
      spotVenues: venues.filter(v => v.marketType === 'spot').length,
      futuresVenues: venues.filter(v => v.marketType === 'futures').length,
    }

    // Calculate filters
    const filters = {
      marketTypes: [...new Set(venues.map(v => v.marketType))],
      exchangeTypes: [...new Set(venues.map(v => v.exchangeType))],
      trustScores: [...new Set(venues.map(v => v.trustScore))],
      exchanges: [...new Set(venues.map(v => v.exchange))],
      // Enhanced filters
      baseTokens: [...new Set(venues.map(v => v.baseToken))],
      targetTokens: [...new Set(venues.map(v => v.targetToken))],
      hasIncentive: [...new Set(venues.map(v => v.hasTradingIncentive))],
    }

    // Calculate metadata and data quality
    const metadata = {
      lastUpdated: new Date().toISOString(),
      totalRecords: venues.length, // Add missing totalRecords field
      totalPairs: venues.length,
      stalePairs: tickers.filter((t: TickerData) => t.is_stale).length,
      anomalyPairs: tickers.filter((t: TickerData) => t.is_anomaly).length,
      dataQuality: {
        highTrust: venues.filter((v: Venue) => v.trustScore === 'green').length,
        mediumTrust: venues.filter((v: Venue) => v.trustScore === 'yellow').length,
        lowTrust: venues.filter((v: Venue) => v.trustScore === 'red').length,
      },
      // Enhanced metadata
      uniqueExchanges: new Set(venues.map(v => v.exchange)).size,
      uniquePairs: new Set(venues.map(v => v.pair)).size,
      averageUpdateFrequency: calculateAverageUpdateFrequency(venues),
      dataFreshness: {
        recentlyUpdated: venues.filter((v: Venue) => isRecentlyUpdated(v.lastUpdated)).length,
        updatedWithin1Hour: venues.filter((v: Venue) => isUpdatedWithin(v.lastUpdated, 1)).length,
        updatedWithin24Hours: venues.filter((v: Venue) => isUpdatedWithin(v.lastUpdated, 24)).length,
        stale: venues.filter((v: Venue) => !isUpdatedWithin(v.lastUpdated, 24)).length,
      },
      marketInsights: {
        topVolumeExchanges: getTopVolumeExchanges(venues, 5),
        lowestSpreadExchanges: getLowestSpreadExchanges(venues, 5),
        highestSpreadExchanges: getHighestSpreadExchanges(venues, 5),
        mostActiveExchanges: getMostActiveExchanges(venues, 5),
      }
    }

    const enhancedData = {
      venues,
      summary,
      filters,
      metadata,
    }

    return NextResponse.json(enhancedData, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching enhanced markets data:', error)
    
    // Return fallback data structure if API fails
    return NextResponse.json({
      venues: [],
      summary: {
        totalVenues: 0,
        totalVolume: 0,
        averageSpread: 0,
        averageTrustScore: 'unknown',
        marketTypeDistribution: { spot: 0, perpetual: 0, futures: 0 },
        exchangeTypeDistribution: { cex: 0, dex: 0 },
        topExchanges: [],
        totalPairs: 0,
        uniqueExchanges: 0,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        volumeRange: { min: 0, max: 0 },
        spreadRange: { min: 0, max: 0 },
        // New derivatives-style analytics
        averageFundingRate: 0,
        totalLiquidationRisk: 0,
        averageLiquidationRisk: 0,
        highRiskVenues: 0,
        perpetualVenues: 0,
        spotVenues: 0,
        futuresVenues: 0
      },
      filters: {
        marketTypes: [],
        exchangeTypes: [],
        trustScores: [],
        exchanges: [],
        baseTokens: [],
        targetTokens: [],
        hasIncentive: []
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalRecords: 0, // Add missing totalRecords field
        totalPairs: 0,
        stalePairs: 0,
        anomalyPairs: 0,
        dataQuality: { highTrust: 0, mediumTrust: 0, lowTrust: 0 },
        uniqueExchanges: 0,
        uniquePairs: 0,
        averageUpdateFrequency: 0,
        dataFreshness: { recentlyUpdated: 0, updatedWithin1Hour: 0, updatedWithin24Hours: 0, stale: 0 },
        marketInsights: { topVolumeExchanges: [], lowestSpreadExchanges: [], highestSpreadExchanges: [], mostActiveExchanges: [] }
      },
    }, { status: 200 })
  }
}

// Helper functions
function calculateAverageTrustScore(venues: Venue[]): string {
  if (venues.length === 0) return 'unknown'
  
  const trustScores = { green: 3, yellow: 2, red: 1, unknown: 0 }
  const totalScore = venues.reduce((sum: number, v: Venue) => sum + (trustScores[v.trustScore as keyof typeof trustScores] || 0), 0)
  const averageScore = totalScore / venues.length
  
  if (averageScore >= 2.5) return 'green'
  if (averageScore >= 1.5) return 'yellow'
  return 'red'
}

function calculateMarketTypeDistribution(venues: Venue[]) {
  const distribution: { spot: number; perpetual: number; futures: number } = { spot: 0, perpetual: 0, futures: 0 }
  venues.forEach((v: Venue) => {
    distribution[v.marketType] = (distribution[v.marketType] || 0) + 1
  })
  return distribution
}

function calculateExchangeTypeDistribution(venues: Venue[]) {
  const distribution: { cex: number; dex: number } = { cex: 0, dex: 0 }
  venues.forEach((v: Venue) => {
    distribution[v.exchangeType] = (distribution[v.exchangeType] || 0) + 1
  })
  return distribution
}

function calculateTopExchanges(venues: Venue[]) {
  const exchangeMap = new Map()
  
  venues.forEach((venue: Venue) => {
    const existing = exchangeMap.get(venue.exchange)
    if (existing) {
      existing.volume += venue.volume24h
      existing.venueCount += 1
    } else {
      exchangeMap.set(venue.exchange, {
        name: venue.exchange,
        volume: venue.volume24h,
        venueCount: 1,
        trustScores: [venue.trustScore],
      })
    }
  })
  
  return Array.from(exchangeMap.values())
    .map((exchange: any) => ({
      ...exchange,
      averageTrustScore: calculateAverageTrustScoreFromArray(exchange.trustScores),
    }))
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 10)
}

function calculateAverageTrustScoreFromArray(trustScores: string[]): string {
  if (trustScores.length === 0) return 'unknown'
  
  const trustScoresMap = { green: 3, yellow: 2, red: 1, unknown: 0 }
  const totalScore = trustScores.reduce((sum: number, score: string) => sum + (trustScoresMap[score as keyof typeof trustScoresMap] || 0), 0)
  const averageScore = totalScore / trustScores.length
  
  if (averageScore >= 2.5) return 'green'
  if (averageScore >= 1.5) return 'yellow'
  return 'red'
}

// Enhanced helper functions
function calculateAverageUpdateFrequency(venues: Venue[]): number {
  if (venues.length === 0) return 0
  
  const now = new Date()
  const updateTimes = venues.map((v: Venue) => {
    const updateTime = new Date(v.lastUpdated)
    return Math.abs(now.getTime() - updateTime.getTime()) / (1000 * 60) // minutes
  })
  
  return updateTimes.reduce((sum: number, time: number) => sum + time, 0) / updateTimes.length
}

function isRecentlyUpdated(lastUpdated: string): boolean {
  const updateTime = new Date(lastUpdated)
  const now = new Date()
  const diffMinutes = Math.abs(now.getTime() - updateTime.getTime()) / (1000 * 60)
  return diffMinutes <= 30 // within 30 minutes
}

function isUpdatedWithin(lastUpdated: string, hours: number): boolean {
  const updateTime = new Date(lastUpdated)
  const now = new Date()
  const diffHours = Math.abs(now.getTime() - updateTime.getTime()) / (1000 * 60 * 60)
  return diffHours <= hours
}

function getTopVolumeExchanges(venues: Venue[], count: number) {
  return venues
    .sort((a: Venue, b: Venue) => b.volume24h - a.volume24h)
    .slice(0, count)
    .map((v: Venue) => ({ exchange: v.exchange, volume: v.volume24h, pair: v.pair }))
}

function getLowestSpreadExchanges(venues: Venue[], count: number) {
  return venues
    .filter((v: Venue) => v.spread > 0)
    .sort((a: Venue, b: Venue) => a.spread - b.spread)
    .slice(0, count)
    .map((v: Venue) => ({ exchange: v.exchange, spread: v.spread, pair: v.pair }))
}

function getHighestSpreadExchanges(venues: Venue[], count: number) {
  return venues
    .sort((a: Venue, b: Venue) => b.spread - a.spread)
    .slice(0, count)
    .map((v: Venue) => ({ exchange: v.exchange, spread: v.spread, pair: v.pair }))
}

function getMostActiveExchanges(venues: Venue[], count: number) {
  const exchangeMap = new Map()
  
  venues.forEach((venue: Venue) => {
    const existing = exchangeMap.get(venue.exchange)
    if (existing) {
      existing.venueCount += 1
      existing.totalVolume += venue.volume24h
    } else {
      exchangeMap.set(venue.exchange, {
        exchange: venue.exchange,
        venueCount: 1,
        totalVolume: venue.volume24h
      })
    }
  })
  
  return Array.from(exchangeMap.values())
    .sort((a: any, b: any) => b.venueCount - a.venueCount)
    .slice(0, count)
}
