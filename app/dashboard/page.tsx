import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { AnalyticsGrid } from "@/components/analytics-grid"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Main heading */}
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-4 flex items-center">
              Hot analytics data Internationally 🔥
            </h1>

            {/* Category tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                "bonk price",
                "market cap",
                "volume analysis",
                "sentiment data",
                "ecosystem tokens",
                "trading pairs",
                "liquidity pools",
                "defi metrics",
                "social trends",
                "whale activity",
              ].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm transition-all duration-500 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] hover:scale-[1.02] hover:rotate-[0.5deg] transform-gpu group"
                >
                  <span className="transition-all duration-500">
                    {tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Grid */}
          <AnalyticsGrid />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </AuthGuard>
  )
}
