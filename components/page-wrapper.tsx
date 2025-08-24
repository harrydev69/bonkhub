import type React from "react"
import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return <div className={cn("page-transition", className)}>{children}</div>
}
