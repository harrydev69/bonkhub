import { useState, useCallback, useEffect } from 'react';

interface SearchSuggestion {
  id: string;
  name: string;
  symbol?: string;
  thumb?: string;
  market_cap_rank?: number | null;
}

interface SearchSuggestions {
  coins: SearchSuggestion[];
  categories: SearchSuggestion[];
  exchanges: SearchSuggestion[];
}

export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    coins: [],
    categories: [],
    exchanges: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions({ coins: [], categories: [], exchanges: [] });
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = useCallback((value: string) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const newTimer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
    
    setDebounceTimer(newTimer);
  }, [fetchSuggestions, debounceTimer]);

  // Close suggestions
  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // Show suggestions if we have query and results
  const openSuggestions = useCallback((query: string) => {
    if (query.trim().length >= 2 && (suggestions.coins.length > 0 || suggestions.categories.length > 0 || suggestions.exchanges.length > 0)) {
      setShowSuggestions(true);
    }
  }, [suggestions]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    suggestions,
    showSuggestions,
    loadingSuggestions,
    handleInputChange,
    closeSuggestions,
    openSuggestions,
    fetchSuggestions
  };
}
