import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { EnhancedMarketsDashboard } from "@/components/enhanced-markets-dashboard"

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <EnhancedMarketsDashboard />
      </main>
    </div>
  )
}
