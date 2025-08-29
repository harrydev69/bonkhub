import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import EnhancedMarketsDashboard from "@/components/enhanced-markets-dashboard"
import { Suspense } from "react"
import { UnifiedLoading } from "@/components/loading"

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={
          <UnifiedLoading 
            title="Loading Markets"
            description="Fetching BONK market data and trading pairs..."
            icon="trending"
            variant="page"
            size="lg"
          />
        }>
          <EnhancedMarketsDashboard />
        </Suspense>
      </main>
    </div>
  )
}
