"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  { name: "HOME", href: "/dashboard" },
  {
    name: "BONK",
    href: "/ecosystem",
    hasDropdown: true,
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
  { name: "MINDSHARE", href: "/feed" },
  { name: "ALERTS", href: "/alerts" },
  { name: "NARRATIVE", href: "/narrative" },
  { name: "CALENDAR", href: "/calendar" },
  { name: "AUDIO LIBRARY", href: "/audio" },
]

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/") return true
    return pathname === href
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white hover:text-bonk-orange hover:bg-gray-800 p-2">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-white text-xl font-bold">
                Bonk<span className="text-bonk-orange">hub</span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-bonk-orange"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-bonk-orange bg-gray-800 border-l-4 border-bonk-orange"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {item.name}
                </Link>

                {item.hasDropdown && item.dropdownItems && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.dropdownItems.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        href={dropdownItem.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-2 rounded-lg text-xs transition-all duration-200 ${
                          isActive(dropdownItem.href)
                            ? "text-bonk-orange bg-gray-800"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            <Button className="w-full bg-bonk-orange hover:bg-bonk-orange-dark text-white">BONK AI</Button>
            <Button
              variant="outline"
              className="w-full border-bonk-orange text-bonk-orange hover:bg-bonk-orange hover:text-white bg-transparent"
            >
              Connect Wallet
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
