"use client"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { ChatInterface } from "@/components/chat-interface"
import { AuthGuard } from "@/components/auth-guard"

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="group/header mb-8 transition-all duration-500 hover:scale-[1.01] transform-gpu">
            <h1 className="text-3xl font-bold text-white mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
              BONK AI Assistant
            </h1>
            <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
              Real-time BONK ecosystem insights and analysis powered by AI
            </p>
          </div>

          <ChatInterface />
        </main>
      </div>
    </AuthGuard>
  )
}
