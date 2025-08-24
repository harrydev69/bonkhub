"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import type { ReactNode } from "react"

interface MobileOptimizedTableProps {
  headers: string[]
  data: any[]
  renderRow: (item: any, index: number) => ReactNode
  renderMobileCard: (item: any, index: number) => ReactNode
}

export function MobileOptimizedTable({ headers, data, renderRow, renderMobileCard }: MobileOptimizedTableProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            {renderMobileCard(item, index)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            {headers.map((header, index) => (
              <th key={index} className="text-left p-4 text-gray-400 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map((item, index) => renderRow(item, index))}</tbody>
      </table>
    </div>
  )
}
