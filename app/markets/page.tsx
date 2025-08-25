import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import EnhancedMarketsDashboard from "@/components/enhanced-markets-dashboard"
import { Suspense } from "react"

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-900 border-gray-700 rounded-lg p-6 animate-pulse">
                  <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 w-20 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        }>
          <EnhancedMarketsDashboard />
        </Suspense>
      </main>
    </div>
  )
}
