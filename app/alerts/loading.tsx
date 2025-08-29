import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Alerts"
      description="Setting up BONK price alerts and notifications..."
      icon="activity"
      variant="page"
      size="lg"
    />
  )
}
