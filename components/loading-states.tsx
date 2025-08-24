import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardCardSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24 bg-gray-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2 bg-gray-700" />
        <Skeleton className="h-3 w-20 bg-gray-800" />
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <Skeleton className="h-6 w-32 bg-gray-800" />
        <Skeleton className="h-4 w-48 bg-gray-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full bg-gray-800" />
      </CardContent>
    </Card>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-800">
      <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24 bg-gray-800" />
        <Skeleton className="h-3 w-16 bg-gray-800" />
      </div>
      <Skeleton className="h-4 w-20 bg-gray-800" />
      <Skeleton className="h-4 w-16 bg-gray-800" />
    </div>
  )
}
