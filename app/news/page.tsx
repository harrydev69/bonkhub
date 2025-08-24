"use client"

import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { NewsDashboard } from "@/components/news-dashboard"

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">BONK News & Updates</h1>
          <p className="text-gray-400">Latest news, announcements, and status updates</p>
        </div>

        <NewsDashboard />
      </main>
    </div>
  )
}
