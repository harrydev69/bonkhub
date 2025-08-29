import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading News"
      description="Fetching latest BONK news and updates..."
      icon="activity"
      variant="page"
      size="lg"
    />
  )
}
