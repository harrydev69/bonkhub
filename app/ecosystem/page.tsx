import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { ComprehensiveBONKDashboard } from "@/components/comprehensive-bonk-dashboard"

export default function EcosystemPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <ComprehensiveBONKDashboard />
        </main>
      </div>
    </AuthGuard>
  )
}
