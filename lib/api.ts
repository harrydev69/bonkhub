// API utility functions for data management

export interface TokenData {
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  sentiment: string
  lastUpdated: string
}

export interface EcosystemToken {
  rank: number
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  lastUpdated?: string
}

export async function fetchTokenData(): Promise<TokenData[]> {
  try {
    const response = await fetch("/api/tokens", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch token data")
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching token data:", error)
    throw error
  }
}

export async function fetchEcosystemData(): Promise<EcosystemToken[]> {
  try {
    const response = await fetch("/api/ecosystem", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch ecosystem data")
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching ecosystem data:", error)
    throw error
  }
}

export function formatPrice(price: number): string {
  if (price < 0.000001) {
    return `$${price.toExponential(3)}`
  } else if (price < 0.01) {
    return `$${price.toFixed(8)}`
  } else if (price < 1) {
    return `$${price.toFixed(6)}`
  } else {
    return `$${price.toFixed(4)}`
  }
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(2)}B`
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`
  } else if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(2)}K`
  } else {
    return `$${marketCap.toFixed(2)}`
  }
}

export function formatVolume(volume: number): string {
  return formatMarketCap(volume)
}
