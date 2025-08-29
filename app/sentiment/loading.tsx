import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Sentiment Analysis"
      description="Processing BONK social sentiment data..."
      icon="brain"
      variant="page"
      size="lg"
    />
  )
}
