"use client"

import { PornhubNavigation } from "../../components/pornhub-navigation"
import { PornhubHeader } from "../../components/pornhub-header"
import { NarrativeTracker } from "../../components/narrative-tracker"
import { AuthGuard } from "../../components/auth-guard"

export default function NarrativePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <NarrativeTracker />
        </main>
      </div>
    </AuthGuard>
  )
}
