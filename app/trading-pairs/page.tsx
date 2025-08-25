import { Suspense } from 'react';
import { TradingPairsTable } from '@/components/trading-pairs/trading-pairs-table';
import { PageHeader } from '@/components/page-header';

export default function TradingPairsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <PageHeader 
        title="BONK Trading Pairs"
        subtitle="All available trading pairs across centralized and decentralized exchanges"
        backUrl="/ecosystem"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center text-gray-400">Loading trading pairs...</div>}>
          <TradingPairsTable />
        </Suspense>
      </div>
    </div>
  );
}
