import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Holders"
      description="Analyzing BONK holder distribution and metrics..."
      icon="activity"
      variant="page"
      size="lg"
    />
  )
}
