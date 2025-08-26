import { Suspense } from 'react';
import { TradingPairsTable } from '@/components/trading-pairs/trading-pairs-table';
import { PageHeader } from '@/components/page-header';

export default function TradingPairsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="group/header transition-all duration-500 hover:scale-[1.01] transform-gpu">
        <PageHeader 
          title="BONK Trading Pairs"
          subtitle="All available trading pairs across centralized and decentralized exchanges"
          backUrl="/ecosystem"
        />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="group/loading text-center text-gray-400 bg-gray-900 border border-gray-800 rounded-lg p-8 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin transition-all duration-500 group-hover/loading:scale-110 group-hover/loading:shadow-[0_0_3px_rgba(255,107,53,0.4)]"></div>
              <span className="transition-all duration-500 group-hover/loading:text-orange-400 group-hover/loading:drop-shadow-[0_0_2px_rgba(255,107,53,0.4)]">Loading trading pairs...</span>
            </div>
          </div>
        }>
          <TradingPairsTable />
        </Suspense>
      </div>
    </div>
  );
}
