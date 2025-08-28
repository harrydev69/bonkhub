"use client"

import { useState } from "react"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { MetaSearchDashboard } from "@/components/meta-search-dashboard-new"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader onSearch={setSearchQuery} />

      <main className="w-full mx-auto px-4 py-6">
        <MetaSearchDashboard initialQuery={searchQuery} />
      </main>
    </div>
  )
}
