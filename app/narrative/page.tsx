"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NarrativeRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/performance")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-8"></div>
        <h1 className="text-2xl font-bold text-white mb-4">Redirecting...</h1>
        <p className="text-gray-400">Taking you to the Performance dashboard</p>
      </div>
    </div>
  )
}
