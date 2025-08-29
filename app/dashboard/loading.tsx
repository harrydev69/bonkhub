import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Dashboard"
      description="Preparing your BONK analytics dashboard..."
      icon="chart"
      variant="page"
      size="lg"
    />
  )
}
