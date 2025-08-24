"use client"

import { PornhubNavigation } from "../../components/pornhub-navigation"
import { PornhubHeader } from "../../components/pornhub-header"
import { AlertsDashboard } from "../../components/alerts-dashboard"
import { AuthGuard } from "../../components/auth-guard"

export default function AlertsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <AlertsDashboard />
        </main>
      </div>
    </AuthGuard>
  )
}
