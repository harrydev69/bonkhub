"use client"

import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { LetsBonkEcosystem } from "@/components/letsbonk-ecosystem"

export default function LetsBonkPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <LetsBonkEcosystem />
      </main>
    </div>
  )
}
