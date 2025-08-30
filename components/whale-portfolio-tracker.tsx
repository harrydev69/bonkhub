"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, ArrowRightLeft, ExternalLink, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface WhaleActivity {
  signature: string;
  timestamp: number;
  timeAgo: string;
  type: 'buy' | 'sell' | 'transfer';
  token: {
    mint: string;
    symbol: string;
    name: string;
  };
  amount: number;
  formattedAmount: string;
  usdValue: number;
  formattedUSD: string;
}

interface WhaleData {
  rank: number;
  address: string;
  shortAddress: string;
  whaleDetails?: {
    solBalance: number;
    tokenAccounts: number;
    totalTransactions: number;
    bonkBalance: number;
    bonkUsdValue: number;
    topTokenHoldings: Array<{
      mint: string;
      amount: number;
      decimals: number;
    }>;
    portfolioValue: number;
  };
  latestActivity: {
    signature: string;
    timestamp: number;
    timeAgo: string;
    type: string;
    description: string;
    solscanLink: string;
    transactionDetails?: {
      fee: number;
      tokenTransfers: number;
      nativeTransfers: number;
      accountsInvolved: number;
    };
  };
}

interface WhalePortfolioData {
  whaleActivities: WhaleData[];
  summary: {
    totalWhalesChecked: number;
    totalWhalesWithActivity: number;
    totalWhalesAvailable: number;
    lastUpdated: string;
  };
}

export function WhalePortfolioTracker() {
  const [whaleData, setWhaleData] = useState<WhalePortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchWhalePortfolioData = async () => {
    try {
      // Use simple whale tracker endpoint
      const response = await fetch('/api/bonk/fast-whale-tracker');
      const result = await response.json();
      
      if (result.success) {
        setWhaleData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch whale portfolio data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWhalePortfolioData();
  };

  useEffect(() => {
    fetchWhalePortfolioData();
    
    // Auto-refresh every 5 minutes (100 whales = longer interval)
    const interval = setInterval(fetchWhalePortfolioData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'transfer': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sell': return 'bg-red-100 text-red-800 border-red-200';
      case 'transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      'SWAP': '🔄',
      'TRANSFER': '📤',
      'NFT_SALE': '🖼️',
      'NFT_BID': '🎨',
      'STAKE': '🔒',
      'UNSTAKE': '🔓',
      'VOTE': '🗳️',
      'BURN': '🔥',
      'MINT': '✨',
      'TRANSACTION': '⚡',
      'UNKNOWN': '❓'
    };
    return emojiMap[type] || '🔄';
  };

  if (loading) {
    return (
      <div className="w-full bg-black border border-gray-800 rounded-lg shadow-[0_0_20px_rgba(255,107,53,0.1)]">
        <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-t-lg">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-orange-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🐋 BONK Whale Tracker
                </h2>
                <p className="text-gray-400 text-sm">
                  Loading whale activities...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gradient-to-r from-gray-900/80 to-gray-800/50 border border-gray-700 rounded-lg p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-8 bg-gray-700 rounded"></div>
                <div className="w-32 h-6 bg-gray-700 rounded"></div>
              </div>
              <div className="bg-black/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-24 h-5 bg-gray-700 rounded mb-2"></div>
                    <div className="w-48 h-4 bg-gray-700 rounded"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-orange-500" />
            <CardTitle className="text-white">BONK Whale Portfolio Tracker</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="bg-gray-800 border-gray-700">
            <AlertDescription className="flex items-center justify-between text-gray-300">
              <span>Error: {error}</span>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-orange-500" />
            <div>
              <CardTitle className="text-white">
                BONK Whale Portfolio Tracker
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time monitoring of top 100 BONK whale activities
              </CardDescription>
            </div>
          </div>

        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group/item text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-2xl font-bold text-orange-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
              {whaleData?.summary.totalWhalesChecked || 0}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Whales Checked</div>
          </div>
          
          <div className="group/item text-center p-4 bg-gradient-to-br from-green-500/10 to-green-400/5 rounded-lg border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-2xl font-bold text-green-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">
              {whaleData?.summary.totalWhalesWithActivity || 0}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">With Activity</div>
          </div>
          
          <div className="group/item text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="text-2xl font-bold text-blue-500 transition-all duration-500 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]">
              {whaleData?.summary.totalWhalesAvailable || 0}
            </div>
            <div className="text-sm text-gray-400 transition-all duration-500 group-hover/item:text-gray-300">Total Available</div>
          </div>
          

        </div>

        {/* Whale Activities */}
        {whaleData?.whaleActivities && whaleData.whaleActivities.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Whale Activities</h3>
              <div className="text-sm text-gray-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, whaleData.whaleActivities.length)}-{Math.min(currentPage * itemsPerPage, whaleData.whaleActivities.length)} of {whaleData.whaleActivities.length}
              </div>
            </div>
            
            <div className="space-y-3">
              {whaleData.whaleActivities
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((whale, whaleIndex) => (
                <div 
                  key={whale.address} 
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:bg-gray-800/70 hover:border-gray-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu group/whale cursor-pointer"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-orange-500 text-black font-bold text-lg px-3 py-1 transition-all duration-500 group-hover/whale:scale-110 group-hover/whale:shadow-[0_0_4px_rgba(255,107,53,0.6)]">
                        #{whale.rank}
                      </Badge>
                      <div>
                        <div className="font-mono text-white text-lg font-medium transition-all duration-500 group-hover/whale:text-orange-400 group-hover/whale:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">
                          {whale.shortAddress}
                        </div>
                        <div className="text-sm text-gray-400 transition-all duration-500 group-hover/whale:text-gray-300">
                          Top 100 BONK Holder
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white hover:border-orange-500 transition-all duration-500 group-hover/whale:scale-110 group-hover/whale:shadow-[0_0_4px_rgba(255,107,53,0.4)]"
                      asChild
                    >
                      <a 
                        href={whale.latestActivity.solscanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2 transition-all duration-500 group-hover/whale:rotate-2" />
                        View
                      </a>
                    </Button>
                  </div>

                  {/* Whale Details Grid */}
                  {whale.whaleDetails && (
                    <div className="space-y-4 mb-4">
                      {/* Portfolio Overview */}
                      <div className="grid grid-cols-4 gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700 transition-all duration-500 group-hover/whale:bg-gray-900/80 group-hover/whale:border-gray-600">
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
                            ${whale.whaleDetails.portfolioValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">Portfolio Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]">
                            {whale.whaleDetails.solBalance.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">SOL Balance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">
                            {whale.whaleDetails.tokenAccounts}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">Token Types</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]">
                            {whale.whaleDetails.totalTransactions}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">Recent Txs</div>
                        </div>
                      </div>

                      {/* BONK Holdings */}
                      <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-orange-900/20 to-orange-800/20 rounded-lg border border-orange-700/50 transition-all duration-500 group-hover/whale:from-orange-900/30 group-hover/whale:to-orange-800/30 group-hover/whale:border-orange-700/70">
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-300 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
                            {(whale.whaleDetails.bonkBalance / 1000000000).toFixed(2)}B
                          </div>
                          <div className="text-xs text-orange-400 transition-all duration-500 group-hover/whale:text-orange-300">BONK Holdings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-300 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
                            ${whale.whaleDetails.bonkUsdValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-orange-400 transition-all duration-500 group-hover/whale:text-orange-300">BONK USD Value</div>
                        </div>
                      </div>

                      {/* Top Token Holdings */}
                      {whale.whaleDetails.topTokenHoldings.length > 0 && (
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                          <div className="text-sm font-medium text-gray-300 mb-2">Top Token Holdings</div>
                          <div className="space-y-2">
                            {whale.whaleDetails.topTokenHoldings.map((token, idx) => (
                              <div key={token.mint} className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-mono">
                                  {token.mint.slice(0, 8)}...
                                </span>
                                <span className="text-white font-medium">
                                  {(token.amount / Math.pow(10, token.decimals)).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Latest Activity */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all duration-500 group-hover/whale:bg-gray-900/80 group-hover/whale:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`border-gray-600 transition-all duration-500 group-hover/whale:scale-110 ${
                            whale.latestActivity.type === 'NO_ACTIVITY' 
                              ? 'text-gray-500 border-gray-700' 
                              : 'text-gray-300 group-hover/whale:border-orange-500 group-hover/whale:text-orange-400'
                          }`}
                        >
                          {whale.latestActivity.type}
                        </Badge>
                        <span className={`font-bold text-lg transition-all duration-500 ${
                          whale.latestActivity.type === 'NO_ACTIVITY' 
                            ? 'text-gray-500' 
                            : 'text-white group-hover/whale:text-orange-400 group-hover/whale:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]'
                        }`}>
                          {whale.latestActivity.description}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 transition-all duration-500 group-hover/whale:text-gray-300">
                        {whale.latestActivity.timeAgo}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    {whale.latestActivity.transactionDetails && (
                      <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-700 transition-all duration-500 group-hover/whale:border-gray-600">
                        <div className="text-center">
                          <div className="text-sm font-medium text-yellow-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(255,235,59,0.6)]">
                            {whale.latestActivity.transactionDetails.fee.toFixed(6)}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">Fee (SOL)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-cyan-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
                            {whale.latestActivity.transactionDetails.tokenTransfers}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">Token Transfers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-pink-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(236,72,153,0.6)]">
                            {whale.latestActivity.transactionDetails.nativeTransfers}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">SOL Transfers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-indigo-400 transition-all duration-500 group-hover/whale:text-white group-hover/whale:drop-shadow-[0_0_4px_rgba(99,102,241,0.6)]">
                            {whale.latestActivity.transactionDetails.accountsInvolved}
                          </div>
                          <div className="text-xs text-gray-500 transition-all duration-500 group-hover/whale:text-gray-400">Accounts</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {whaleData.whaleActivities.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {Math.ceil(whaleData.whaleActivities.length / itemsPerPage)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(whaleData.whaleActivities.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === Math.ceil(whaleData.whaleActivities.length / itemsPerPage) || 
                        Math.abs(page - currentPage) <= 2
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-500 px-2">...</span>
                          )}
                          <Button
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={`w-8 h-8 p-0 ${
                              currentPage === page 
                                ? "bg-orange-500 text-black border-orange-500 hover:bg-orange-600" 
                                : "border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                            }`}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(whaleData.whaleActivities.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(whaleData.whaleActivities.length / itemsPerPage)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Whale Activities Detected
            </h3>
            <p className="text-gray-400 mb-4">
              Monitoring BONK whales for portfolio activities. Check back in a few minutes.
            </p>
            <Badge variant="outline" className="border-gray-600 text-gray-400">
              Monitoring 100 whales • 5min refresh cycle
            </Badge>
          </div>
        )}


      </CardContent>
    </Card>
  );
}
