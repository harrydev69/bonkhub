import { AuthGuard } from "@/components/auth-guard"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { MindshareTracker } from "@/components/mindshare-tracker"

export default function MindsharePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <MindshareTracker />
        </main>
      </div>
    </AuthGuard>
  )
}
