"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  const handleEnter = () => {
    router.push("/dashboard")
  }

  const handleExit = () => {
    window.location.href = "https://google.com"
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full">
        <div className="absolute inset-0 border border-gray-700/50 rounded-lg shadow-[0_0_20px_rgba(255,107,53,0.3)] bg-gradient-to-br from-gray-900/20 to-black/40"></div>

        <div className="relative p-8 text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-0">
            <Link href="/dashboard" className="inline-block hover:opacity-80 transition-all">
              <span className="text-white text-6xl font-bold">Bonk</span>
              <span className="bg-orange-500 text-black text-6xl font-bold px-4 py-2 rounded-lg ml-2">hub</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-white text-4xl font-bold">This is an analytics platform</h1>

            <div className="text-gray-300 text-lg leading-relaxed space-y-4">
              <p>
                This platform contains advanced analytics and trading data for the BONK ecosystem. By entering, you
                affirm that you understand the risks associated with cryptocurrency trading and you consent to viewing
                financial data and market analysis.
              </p>

              <p>
                Our Terms are changing. These changes will or have come into effect on{" "}
                <span className="text-white font-semibold">30 June 2025</span>. To see the updated changes, please see
                our <span className="text-orange-500 font-semibold">New Terms of Service</span>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                onClick={handleEnter}
                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold text-lg px-12 py-4 rounded-lg w-full sm:w-auto transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.5)] hover:scale-105"
              >
                I understand - Enter
              </Button>

              <Button
                onClick={handleExit}
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold text-lg px-12 py-4 rounded-lg w-full sm:w-auto transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:scale-105"
              >
                I do not agree - Exit
              </Button>
            </div>

            {/* Footer Info */}
            <div className="pt-8 space-y-2">
              <p className="text-gray-400 text-sm">
                Our{" "}
                <span className="text-orange-500 underline cursor-pointer hover:text-orange-400 transition-colors">
                  risk disclosure page
                </span>{" "}
                explains how you can easily understand trading risks.
              </p>

              <div className="flex items-center justify-center gap-4 pt-4">
                <span className="text-gray-500 text-sm">© Bonkhub.com, 2025</span>
                <div className="bg-white text-black px-3 py-1 rounded text-sm font-bold">RTA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
