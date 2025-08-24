"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import type { ReactNode } from "react"

interface ResponsiveLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
}

export function ResponsiveLayout({ children, sidebar, className = "" }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className={`min-h-screen bg-gray-950 ${className}`}>
        <div className="w-full">{children}</div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-gray-950 ${className}`}>
      {sidebar && <div className="w-80 flex-shrink-0 border-r border-gray-800 overflow-y-auto">{sidebar}</div>}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
