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
        <div className="mb-8 transition-all duration-500 hover:scale-[1.01] transform-gpu group/header">
          <h1 className="text-3xl font-bold text-white mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.6)]">
            BONK News & Updates
          </h1>
          <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
            Latest news, announcements, and status updates
          </p>
        </div>

        <NewsDashboard />
      </main>
    </div>
  )
}
