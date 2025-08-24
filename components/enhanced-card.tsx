import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EnhancedCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  animated?: boolean
  glowOnHover?: boolean
}

export function EnhancedCard({
  title,
  description,
  children,
  className,
  animated = true,
  glowOnHover = true,
}: EnhancedCardProps) {
  return (
    <Card
      className={cn(
        "bg-gray-900 border-gray-800 transition-all duration-300",
        animated && "slide-in-from-bottom",
        glowOnHover && "card-hover",
        className,
      )}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-white">{title}</CardTitle>}
          {description && <CardDescription className="text-gray-400">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
