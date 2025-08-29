"use client";

import type React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleFormSubmit}
        className="relative w-full max-w-2xl group/search"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-500 group-hover/search:text-orange-400 group-hover/search:scale-110" />
        <Input
          type="text"
          placeholder="Search for tokens, topics, or trends..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="pl-10 pr-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
        />
        <Button
          type="submit"
          disabled={loading}
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 h-7 text-sm font-medium hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-300 transform-gpu z-10 rounded-md"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
    </div>
  );
}