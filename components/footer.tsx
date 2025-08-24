import Link from "next/link"
import { Send, Gamepad2, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Section - Matching landing page design */}
        <div className="relative">
          {/* Glowing border container - same as landing page */}
          <div className="absolute inset-0 border border-gray-700/50 rounded-lg shadow-[0_0_20px_rgba(255,107,53,0.3)] bg-gradient-to-br from-gray-900/20 to-black/40"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-start justify-between">
              {/* Left Side - Logo & Tagline */}
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff6b35] hover:shadow-[0_0_15px_rgba(255,107,53,0.4)] transition-all duration-300">
                    <span className="text-lg font-bold text-black">BH</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    <span className="text-[#ff6b35]">BONK</span>hub
                  </span>
                </div>
                <p className="text-gray-400 text-sm max-w-xs">
                  The ultimate analytics intelligence platform for the modern crypto ecosystem.
                </p>
              </div>

              {/* Right Side - Social Media Icons */}
              <div className="flex space-x-4">
                <Link 
                  href="https://t.me/BonkNetwork_TG" 
                  className="p-3 bg-gray-800 rounded-lg text-white hover:bg-[#ff6b35] hover:shadow-[0_0_15px_rgba(255,107,53,0.4)] transition-all duration-300 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </Link>
                
                <Link 
                  href="https://discord.gg/BMnzNu3VQp" 
                  className="p-3 bg-gray-800 rounded-lg text-white hover:bg-[#ff6b35] hover:shadow-[0_0_15px_rgba(255,107,53,0.4)] transition-all duration-300 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </Link>
                
                <Link 
                  href="https://x.com/bonk_network" 
                  className="p-3 bg-gray-800 rounded-lg text-white hover:bg-[#ff6b35] hover:shadow-[0_0_15px_rgba(255,107,53,0.4)] transition-all duration-300 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright & Legal */}
        <div className="mt-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 text-sm">
            <div className="text-gray-400">
              © 2025 BonkHub powered by Bonk Network. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link 
                href="/privacy" 
                className="text-blue-400 hover:text-[#ff6b35] hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-300 underline"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-blue-400 hover:text-[#ff6b35] hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-300 underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
