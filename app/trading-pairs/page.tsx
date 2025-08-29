import { Suspense } from 'react';
import { TradingPairsTable } from '@/components/trading-pairs/trading-pairs-table';
import { PageHeader } from '@/components/page-header';
import { UnifiedLoading } from '@/components/loading';

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
          <UnifiedLoading 
            title="Loading Trading Pairs"
            description="Fetching BONK trading pairs from all exchanges..."
            icon="trending"
            variant="chart"
            size="md"
          />
        }>
          <TradingPairsTable />
        </Suspense>
      </div>
    </div>
  );
}
