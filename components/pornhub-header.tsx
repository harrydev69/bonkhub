"use client"

import { Search, MessageCircle, Camera, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileNavigation } from "./mobile-navigation"

export function PornhubHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [clickedDropdown, setClickedDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const navItems = [
    { name: "HOME", href: "/dashboard" },
    {
      name: "BONK",
      dropdown: true,
      dropdownItems: [
        { name: "Ecosystem", href: "/ecosystem" },
        { name: "Markets", href: "/markets" },
        { name: "Analytics", href: "/analytics" },
        { name: "News", href: "/news" },
        { name: "Holders", href: "/holders" },
      ],
    },
    { name: "LETSBONK", href: "/letsbonk" },
    { name: "META SEARCH", href: "/search" },
    { name: "SENTIMENT", href: "/sentiment" },
    { name: "MINDSHARE", href: "/mindshare" },
    { name: "ALERTS", href: "/alerts" },
    { name: "PERFORMANCE", href: "/performance" },
    { name: "CALENDAR", href: "/calendar" },
    { name: "AUDIO LIBRARY", href: "/audio" },
  ]

  const isActive = (href: string) => pathname === href
  const isDropdownActive = (dropdownItems: any[]) => dropdownItems?.some((item) => pathname === item.href)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setClickedDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle dropdown interactions
  const handleDropdownEnter = (itemName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(itemName)
  }

  const handleDropdownLeave = (itemName: string) => {
    timeoutRef.current = setTimeout(() => {
      // Only close if not clicked and mouse is not over dropdown
      if (clickedDropdown !== itemName) {
        setActiveDropdown(null)
      }
    }, 300) // 300ms delay before closing
  }

  const handleDropdownClick = (itemName: string) => {
    if (clickedDropdown === itemName) {
      setClickedDropdown(null)
      setActiveDropdown(null)
    } else {
      setClickedDropdown(itemName)
      setActiveDropdown(itemName)
    }
  }

  const isDropdownOpen = (itemName: string) => {
    return activeDropdown === itemName || clickedDropdown === itemName
  }

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <MobileNavigation />
            </div>

            <button className="hidden md:block text-orange-500 hover:text-orange-400 hover:shadow-[0_0_10px_rgba(255,107,53,0.3)] transition-all p-2 rounded">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </button>

            <Link
              href="/dashboard"
              className="flex items-center hover:opacity-80 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all p-1 rounded"
            >
              <span className="text-white text-3xl font-bold mr-1">Bonk</span>
              <span className="bg-orange-500 text-black px-2 py-1.5 rounded-md text-2xl font-bold">hub</span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search analytics, tokens, data..."
                className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_10px_rgba(255,107,53,0.3)] transition-all"
              />
            </div>
          </div>

          {/* Right side - Actions and User */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/chat">
              <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-3 sm:px-6 text-sm sm:text-base hover:shadow-[0_0_15px_rgba(255,107,53,0.4)] transition-all">
                <span className="hidden sm:inline">BONK AI</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </Link>

            <Link href="/feed" className="hidden sm:block">
              <button className="text-gray-400 hover:text-orange-500 transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.3)] p-2 rounded">
                <MessageCircle className="w-6 h-6" />
              </button>
            </Link>
            <Link href="/meme-gallery" className="hidden sm:block text-gray-400 hover:text-orange-500 hover:shadow-[0_0_10px_rgba(255,107,53,0.3)] transition-all p-2 rounded">
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-full p-1" />
            </Link>
            
            {/* Profile Icon - Now aligned with other icons */}
            <Link href="/profile" className="text-gray-400 hover:text-orange-500 hover:shadow-[0_0_10px_rgba(255,107,53,0.3)] transition-all p-2 rounded">
              <User className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-full p-1" />
            </Link>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="border-t border-gray-800 relative hidden md:block" ref={dropdownRef}>
          <div className="flex items-center justify-center space-x-8 h-12">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(item.name)}
                    onMouseLeave={() => handleDropdownLeave(item.name)}
                  >
                    <button
                      onClick={() => handleDropdownClick(item.name)}
                      className={`text-sm font-medium transition-all flex items-center space-x-1 px-2 py-1 rounded hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] ${
                        isDropdownActive(item.dropdownItems)
                          ? "text-orange-500 border-b-2 border-orange-500"
                          : "text-gray-300 hover:text-orange-500"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen(item.name) ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen(item.name) && item.dropdownItems && (
                      <div 
                        className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px] shadow-[0_0_20px_rgba(255,107,53,0.2)] animate-in fade-in-0 slide-in-from-top-2 duration-200"
                        onMouseEnter={() => handleDropdownEnter(item.name)}
                        onMouseLeave={() => handleDropdownLeave(item.name)}
                      >
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-3 text-sm text-gray-300 hover:text-orange-500 hover:bg-gray-800 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all first:rounded-t-lg last:rounded-b-lg border-b border-gray-800 last:border-b-0"
                            onClick={() => {
                              setActiveDropdown(null)
                              setClickedDropdown(null)
                            }}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={`text-sm font-medium transition-all relative px-2 py-1 rounded hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] ${
                      isActive(item.href || "")
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-gray-300 hover:text-orange-500"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
