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
      <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
        <CardHeader>
          <CardTitle className="text-white transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">Loading Trading Pairs...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded animate-pulse hover:bg-gray-700 transition-all duration-500" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
        <CardHeader>
          <CardTitle className="text-white transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">Error Loading Trading Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 transition-all duration-500 group-hover:text-red-300 group-hover:drop-shadow-[0_0_2px_rgba(239,68,68,0.4)]">Failed to load trading pairs: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2 transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
            <Filter className="h-5 w-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 group-hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.6)]" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group/exchange">
              <label className="block text-sm font-medium text-gray-400 mb-2 transition-all duration-500 group-hover/exchange:text-gray-300">
                Exchange Name
              </label>
              <input
                type="text"
                placeholder="Filter by exchange..."
                value={filterExchange}
                onChange={(e) => setFilterExchange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500"
              />
            </div>
            <div className="group/pair">
              <label className="block text-sm font-medium text-gray-400 mb-2 transition-all duration-500 group-hover/pair:text-gray-300">
                Trading Pair
              </label>
              <input
                type="text"
                placeholder="Filter by pair..."
                value={filterPair}
                onChange={(e) => setFilterPair(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Pairs Table */}
      <Card className="group bg-gray-900 border-gray-800 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
        <CardHeader>
          <CardTitle className="text-white transition-all duration-500 group-hover:text-orange-400 group-hover:drop-shadow-[0_0_4px_rgba(255,107,53,0.6)]">
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
                      className="group/header flex items-center space-x-1 hover:text-white hover:text-orange-400 hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)] transition-all duration-500"
                    >
                      <span>Exchange</span>
                      <ArrowUpDown className="h-4 w-4 transition-all duration-500 group-hover/header:scale-110 group-hover/header:rotate-2 group-hover/header:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('pair')}
                      className="group/header flex items-center space-x-1 hover:text-white hover:text-orange-400 hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)] transition-all duration-500"
                    >
                      <span>Trading Pair</span>
                      <ArrowUpDown className="h-4 w-4 transition-all duration-500 group-hover/header:scale-110 group-hover/header:rotate-2 group-hover/header:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('volume')}
                      className="group/header flex items-center space-x-1 hover:text-white hover:text-orange-400 hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)] transition-all duration-500"
                    >
                      <span>24h Volume</span>
                      <ArrowUpDown className="h-4 w-4 transition-all duration-500 group-hover/header:scale-110 group-hover/header:rotate-2 group-hover/header:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium transition-all duration-500 hover:text-gray-300">
                    Trust Score
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium transition-all duration-500 hover:text-gray-300">
                    Spread %
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium transition-all duration-500 hover:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTickers.map((ticker, index) => (
                  <tr key={index} className="group/row border-b border-gray-800 hover:bg-gray-800/30 hover:scale-[1.01] hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getExchangeColor(ticker.market?.name || 'unknown')} transition-all duration-500 group-hover/row:scale-125 group-hover/row:shadow-[0_0_3px_rgba(255,107,53,0.4)]`} />
                        <span className="text-white font-medium transition-all duration-500 group-hover/row:text-orange-400 group-hover/row:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">{ticker.market?.name || 'Unknown Exchange'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-blue-400 font-mono transition-all duration-500 group-hover/row:text-blue-300 group-hover/row:drop-shadow-[0_0_2px_rgba(59,130,246,0.4)]">
                        {ticker.base && ticker.target ? 
                          `${ticker.base}/${ticker.target}` : 
                          '—'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-medium transition-all duration-500 group-hover/row:text-orange-400 group-hover/row:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">
                        {ticker.converted_volume?.usd ? 
                          formatVolume(ticker.converted_volume.usd) : 
                          '—'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getTrustScoreColor(ticker.trust_score || 'unknown')} transition-all duration-500 group-hover/row:scale-110 group-hover/row:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]`}>
                        {ticker.trust_score ? 
                          ticker.trust_score.charAt(0).toUpperCase() + ticker.trust_score.slice(1) : 
                          'Unknown'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300 transition-all duration-500 group-hover/row:text-gray-200">
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
                          className="group/link inline-flex items-center space-x-1 text-orange-400 hover:text-orange-300 hover:scale-110 hover:drop-shadow-[0_0_3px_rgba(255,107,53,0.5)] transition-all duration-500"
                        >
                          <span>Trade</span>
                          <ExternalLink className="h-4 w-4 transition-all duration-500 group-hover/link:scale-110 group-hover/link:rotate-2" />
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
            <div className="flex items-center justify-between mt-6 group/pagination">
              <div className="text-sm text-gray-400 transition-all duration-500 group-hover/pagination:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="group/prev px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform-gpu"
                >
                  <span className="transition-all duration-500 group-hover/prev:text-orange-400 group-hover/prev:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="group/next px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform-gpu"
                >
                  <span className="transition-all duration-500 group-hover/next:text-orange-400 group-hover/next:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">Next</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
