'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBonkTickers } from '@/hooks/useBonkTickers';
import { ExternalLink, ArrowUpDown, Filter } from 'lucide-react';

export function TradingPairsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'volume' | 'exchange' | 'pair'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterExchange, setFilterExchange] = useState('');
  const [filterPair, setFilterPair] = useState('');
  
  const { data: tickersData, loading, error } = useBonkTickers(currentPage, 'volume_desc');
  
  const itemsPerPage = 20;
  const totalPages = Math.ceil((tickersData?.tickers?.length || 0) / itemsPerPage);

  // Filter and sort data
  const filteredTickers = tickersData?.tickers?.filter(ticker => {
    const matchesExchange = !filterExchange || 
      ticker.market.name.toLowerCase().includes(filterExchange.toLowerCase());
    const matchesPair = !filterPair || 
      `${ticker.base}/${ticker.target}`.toLowerCase().includes(filterPair.toLowerCase());
    return matchesExchange && matchesPair;
  }) || [];

  const sortedTickers = [...filteredTickers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'volume':
        aValue = a.converted_volume.usd;
        bValue = b.converted_volume.usd;
        break;
      case 'exchange':
        aValue = a.market.name;
        bValue = b.market.name;
        break;
      case 'pair':
        aValue = `${a.base}/${a.target}`;
        bValue = `${b.base}/${b.target}`;
        break;
      default:
        aValue = a.converted_volume.usd;
        bValue = b.converted_volume.usd;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: 'volume' | 'exchange' | 'pair') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getExchangeColor = (exchangeName: string) => {
    if (!exchangeName || exchangeName === 'unknown') return 'bg-gray-500';
    
    const name = exchangeName.toLowerCase();
    if (name.includes('binance')) return 'bg-green-500';
    if (name.includes('coinbase')) return 'bg-blue-500';
    if (name.includes('okx')) return 'bg-purple-500';
    if (name.includes('gate')) return 'bg-orange-500';
    if (name.includes('htx')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      case 'unknown': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Loading Trading Pairs...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Error Loading Trading Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">Failed to load trading pairs: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Exchange Name
              </label>
              <input
                type="text"
                placeholder="Filter by exchange..."
                value={filterExchange}
                onChange={(e) => setFilterExchange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Trading Pair
              </label>
              <input
                type="text"
                placeholder="Filter by pair..."
                value={filterPair}
                onChange={(e) => setFilterPair(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Pairs Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            Trading Pairs ({filteredTickers.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('exchange')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Exchange</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('pair')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Trading Pair</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('volume')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>24h Volume</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Trust Score
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Spread %
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTickers.map((ticker, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                         <td className="py-3 px-4">
                       <div className="flex items-center space-x-3">
                         <div className={`w-3 h-3 rounded-full ${getExchangeColor(ticker.market?.name || 'unknown')}`} />
                         <span className="text-white font-medium">{ticker.market?.name || 'Unknown Exchange'}</span>
                       </div>
                     </td>
                     <td className="py-3 px-4">
                       <span className="text-blue-400 font-mono">
                         {ticker.base && ticker.target ? 
                           `${ticker.base}/${ticker.target}` : 
                           '—'
                         }
                       </span>
                     </td>
                                         <td className="py-3 px-4">
                       <span className="text-white font-medium">
                         {ticker.converted_volume?.usd ? 
                           formatVolume(ticker.converted_volume.usd) : 
                           '—'
                         }
                       </span>
                     </td>
                                         <td className="py-3 px-4">
                       <span className={`font-medium ${getTrustScoreColor(ticker.trust_score || 'unknown')}`}>
                         {ticker.trust_score ? 
                           ticker.trust_score.charAt(0).toUpperCase() + ticker.trust_score.slice(1) : 
                           'Unknown'
                         }
                       </span>
                     </td>
                                         <td className="py-3 px-4">
                       <span className="text-gray-300">
                         {ticker.bid_ask_spread_percentage ? 
                           ticker.bid_ask_spread_percentage.toFixed(3) + '%' : 
                           '—'
                         }
                       </span>
                     </td>
                    <td className="py-3 px-4">
                      {ticker.trade_url ? (
                        <a
                          href={ticker.trade_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          <span>Trade</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-500">No link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
