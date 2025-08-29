"use client";

import { Search } from "lucide-react";

export function LoadingState() {
  return (
    <div className="text-center py-20 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
        <Search className="w-12 h-12 text-orange-400" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-white">Searching...</h2>
        <p className="text-gray-400 text-lg">
          Gathering comprehensive data from multiple sources...
        </p>
      </div>
      <div className="flex justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}