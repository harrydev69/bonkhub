"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, TrendingUp, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

interface SearchSuggestion {
  id: string;
  name: string;
  symbol?: string;
  thumb?: string;
  market_cap_rank?: number | null;
}

interface SearchBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({
  inputValue,
  onInputChange,
  onSearch,
  loading,
}: SearchBarProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    suggestions,
    showSuggestions,
    loadingSuggestions,
    handleInputChange: handleSuggestionsInputChange,
    closeSuggestions,
    openSuggestions
  } = useSearchSuggestions();

  // Flatten all suggestions for keyboard navigation
  const allSuggestions = [
    ...suggestions.coins.map(s => ({ ...s, type: 'coin' as const })),
    ...suggestions.categories.map(s => ({ ...s, type: 'category' as const })),
    ...suggestions.exchanges.map(s => ({ ...s, type: 'exchange' as const }))
  ];

  // Handle input change 
  const handleInputChange = useCallback((value: string) => {
    onInputChange(value);
    handleSuggestionsInputChange(value);
  }, [onInputChange, handleSuggestionsInputChange]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion & { type: string }) => {
    const searchValue = suggestion.type === 'coin' ? suggestion.id : suggestion.name;
    onInputChange(searchValue);
    closeSuggestions();
    setSelectedIndex(-1);
    onSearch(searchValue);
  }, [onInputChange, onSearch, closeSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || allSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(allSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        closeSuggestions();
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, allSuggestions, selectedIndex, handleSuggestionSelect, closeSuggestions]);

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      closeSuggestions();
      onSearch(inputValue.trim());
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSuggestions();
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeSuggestions]);

  return (
    <div className="flex justify-center">
      <div ref={searchRef} className="relative w-full max-w-2xl group/search">
        <form onSubmit={handleFormSubmit}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110 z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for tokens, topics, or trends..."
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => openSuggestions(inputValue)}
            className="pl-10 pr-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 h-7 text-sm font-medium hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-300 transform-gpu z-10 rounded-md"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.coins.length > 0 || suggestions.categories.length > 0 || suggestions.exchanges.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
            {loadingSuggestions && (
              <div className="flex items-center justify-center p-3">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-400 text-sm">Searching...</span>
              </div>
            )}
            
            {!loadingSuggestions && (
              <>
                {/* Coins */}
                {suggestions.coins.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Cryptocurrencies
                    </div>
                    {suggestions.coins.map((coin, index) => {
                      const globalIndex = index;
                      return (
                        <div
                          key={coin.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedIndex === globalIndex
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'hover:bg-gray-800 border border-transparent'
                          }`}
                          onClick={() => handleSuggestionSelect({ ...coin, type: 'coin' })}
                        >
                          {coin.thumb && (
                            <img
                              src={coin.thumb}
                              alt={coin.name}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-medium">{coin.name}</span>
                              {coin.symbol && (
                                <Badge variant="secondary" className="text-xs">
                                  {coin.symbol}
                                </Badge>
                              )}
                            </div>
                            {coin.market_cap_rank && (
                              <div className="text-gray-500 text-xs">
                                Rank #{coin.market_cap_rank}
                              </div>
                            )}
                          </div>
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Categories */}
                {suggestions.categories.length > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Categories
                    </div>
                    {suggestions.categories.map((category, index) => {
                      const globalIndex = suggestions.coins.length + index;
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedIndex === globalIndex
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'hover:bg-gray-800 border border-transparent'
                          }`}
                          onClick={() => handleSuggestionSelect({ ...category, type: 'category' })}
                        >
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Hash className="w-3 h-3 text-blue-400" />
                          </div>
                          <span className="text-white text-sm">{category.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Exchanges */}
                {suggestions.exchanges.length > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Exchanges
                    </div>
                    {suggestions.exchanges.map((exchange, index) => {
                      const globalIndex = suggestions.coins.length + suggestions.categories.length + index;
                      return (
                        <div
                          key={exchange.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedIndex === globalIndex
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'hover:bg-gray-800 border border-transparent'
                          }`}
                          onClick={() => handleSuggestionSelect({ ...exchange, type: 'exchange' })}
                        >
                          {exchange.thumb ? (
                            <img
                              src={exchange.thumb}
                              alt={exchange.name}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-3 h-3 text-purple-400" />
                            </div>
                          )}
                          <span className="text-white text-sm">{exchange.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}