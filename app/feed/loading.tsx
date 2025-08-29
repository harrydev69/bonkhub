import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Social Feed"
      description="Gathering live BONK social media activity..."
      icon="activity"
      variant="page"
      size="lg"
    />
  )
}
